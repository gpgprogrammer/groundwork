"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getStore } from "@/lib/data/store";
import { isSupabaseEnabled } from "@/lib/env";
import { REPORT_REASONS } from "@/lib/report-reasons";
import { removeObjects } from "@/lib/uploads";
import type { Contribution, Educator, Report, ReportKind } from "@/lib/types";
import { getViewer } from "@/lib/viewer";

async function admin() {
  const viewer = await getViewer();
  return viewer?.isAdmin ? viewer : null;
}

// ── Review queue for uploaded videos ─────────────────────────────────────────

export async function approveUpload(id: string) {
  if (!(await admin())) return;
  const store = await getStore();
  const c = await store.getDoc<Contribution>("contributions", id);
  if (!c || c.kind !== "upload" || c.status !== "pending") return;
  // Counted as new from the moment students can see it.
  await store.putDoc("contributions", id, { ...c, status: "published", createdAt: new Date().toISOString() });
  revalidatePath("/", "layout");
}

export async function rejectUpload(id: string) {
  if (!(await admin())) return;
  const store = await getStore();
  const c = await store.getDoc<Contribution>("contributions", id);
  if (!c || c.kind !== "upload") return;
  await store.putDoc("contributions", id, { ...c, status: "removed" });
  if (c.media) await removeObjects([c.media.path, c.media.path.replace(/\.\w+$/, ".jpg")]).catch(() => {});
  revalidatePath("/", "layout");
}

// ── Reports ──────────────────────────────────────────────────────────────────

const reportSchema = z.object({
  kind: z.enum(["upload", "tutor", "educator", "guide"]),
  targetId: z.string().min(1).max(80),
  reason: z.enum(REPORT_REASONS),
  details: z.string().trim().max(1000),
});

async function describe(kind: ReportKind, id: string): Promise<{ href: string; title: string } | null> {
  const store = await getStore();
  if (kind === "tutor") {
    const t = (await store.listTutors()).find((x) => x.id === id);
    return t ? { href: `/tutors/${t.id}`, title: `Tutor: ${t.name}` } : null;
  }
  if (kind === "educator") {
    const e = await store.getDoc<Educator>("educators", id);
    return e ? { href: `/educators/${e.id}`, title: `Teacher: ${e.name}` } : null;
  }
  const c = await store.getDoc<Contribution>("contributions", id);
  if (!c || c.status === "removed") return null;
  return kind === "upload" ? { href: `/videos/${c.id}`, title: `Video: ${c.title}` } : { href: `/guides/${c.id}`, title: `Guide: ${c.title}` };
}

export async function reportContent(input: z.infer<typeof reportSchema>): Promise<{ ok: boolean; error?: string }> {
  const parsed = reportSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Choose a reason." };
  const target = await describe(parsed.data.kind, parsed.data.targetId);
  if (!target) return { ok: false, error: "That page no longer exists." };
  const viewer = await getViewer();
  const store = await getStore();
  // One open report per person per thing is enough.
  if (viewer) {
    const mine = (await store.listDocs<Report>("reports")).find((r) => r.reporterId === viewer.user.id && r.targetId === parsed.data.targetId && r.status === "open");
    if (mine) return { ok: true };
  }
  const report: Report = {
    id: `rep_${randomUUID().slice(0, 12)}`,
    ...parsed.data,
    ...target,
    reporterId: viewer?.user.id ?? null,
    reporterEmail: viewer?.user.email ?? null,
    createdAt: new Date().toISOString(),
    status: "open",
  };
  await store.putDoc("reports", report.id, report);
  revalidatePath("/admin");
  return { ok: true };
}

/** Admin: close a report, optionally taking the reported thing down. */
export async function resolveReport(id: string, action: "remove" | "dismiss") {
  if (!(await admin())) return;
  const store = await getStore();
  const r = await store.getDoc<Report>("reports", id);
  if (!r) return;
  if (action === "remove") {
    if (r.kind === "upload") await rejectUpload(r.targetId);
    else if (r.kind === "guide") {
      const c = await store.getDoc<Contribution>("contributions", r.targetId);
      if (c) await store.putDoc("contributions", c.id, { ...c, status: "removed" });
    } else if (r.kind === "educator") {
      await store.deleteDoc("educators", r.targetId);
    } else if (r.kind === "tutor" && isSupabaseEnabled) {
      const { createAdminClient } = await import("@/lib/supabase/server");
      const db = createAdminClient();
      const { data } = await db.from("tutors").select("user_id").eq("id", r.targetId).maybeSingle();
      await db.from("tutors").delete().eq("id", r.targetId);
      if (data?.user_id) await db.from("profiles").update({ role: "student" }).eq("id", data.user_id);
    }
  }
  // Close every open report about the same thing.
  const all = await store.listDocs<Report>("reports");
  for (const x of all.filter((x) => x.targetId === r.targetId && x.status === "open")) {
    await store.putDoc("reports", x.id, { ...x, status: action === "remove" ? "resolved" : "dismissed", resolvedAt: new Date().toISOString() });
  }
  revalidatePath("/", "layout");
}
