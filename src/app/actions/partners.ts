"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getStore } from "@/lib/data/store";
import type { PartnerApp } from "@/lib/partners";
import { SERVICE_KINDS } from "@/lib/tutoring";
import type { TutorMeta } from "@/lib/types";
import { getViewer } from "@/lib/viewer";

export type PartnerState = { error?: string };

const schema = z.object({
  businessName: z.string().trim().min(2, "Add your business name.").max(80),
  website: z
    .string()
    .trim()
    .url("Add your full website address (https://…).")
    .refine((u) => u.startsWith("https://"), "Your website must start with https://"),
  contactName: z.string().trim().min(2, "Add a contact name.").max(80),
  email: z.string().trim().toLowerCase().email("Add a contact email."),
  kind: z.enum(SERVICE_KINDS),
  blurb: z.string().trim().min(30, "Describe your service in a sentence or two.").max(300),
});

export async function applyAsPartner(_: PartnerState, form: FormData): Promise<PartnerState> {
  const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (form.get("agree") !== "on") return { error: "Please accept the partner terms." };
  const viewer = await getViewer();
  const app: PartnerApp = {
    id: randomUUID().slice(0, 10),
    ...parsed.data,
    courseIds: form.getAll("courseIds").map(String).slice(0, 50),
    agreedAt: new Date().toISOString(),
    status: "pending",
    createdAt: new Date().toISOString(),
    submittedBy: viewer?.user.id ?? null,
  };
  await (await getStore()).putDoc("partnerApps", app.id, app);
  redirect("/tutors/partners?sent=1");
}

async function requireAdmin() {
  const viewer = await getViewer();
  if (!viewer?.isAdmin) throw new Error("Admins only.");
  return viewer;
}

export async function reviewPartner(id: string, status: "approved" | "rejected") {
  await requireAdmin();
  const store = await getStore();
  const app = await store.getDoc<PartnerApp>("partnerApps", id);
  if (!app) return;
  await store.putDoc("partnerApps", id, { ...app, status });
  revalidatePath("/admin");
  revalidatePath("/tutors");
}

export async function setTutorVetted(tutorId: string, vetted: boolean) {
  await requireAdmin();
  const store = await getStore();
  const meta = await store.getDoc<TutorMeta>("tutorMeta", tutorId);
  const { defaultMeta } = await import("@/lib/bookings");
  await store.putDoc("tutorMeta", tutorId, { ...defaultMeta(tutorId), ...meta, vetted });
  revalidatePath("/admin");
  revalidatePath("/tutors");
}
