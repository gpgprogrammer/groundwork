"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createGuideCheckoutUrl } from "@/lib/billing/stripe";
import { getCatalog } from "@/lib/catalog";
import { getStore } from "@/lib/data/store";
import { paymentsMode } from "@/lib/env";
import {
  GUIDE_FILE_TYPES,
  GUIDES,
  guideObjectSize,
  guideUploadsEnabled,
  getGuide,
  getPurchase,
  MAX_GUIDE_BYTES,
  MAX_PRICE,
  PURCHASES,
  purchaseId,
  recordPurchase,
  saveGuide,
  signedGuideUpload,
  type GuidePurchase,
  type MarketGuide,
} from "@/lib/market";
import { getViewer } from "@/lib/viewer";

export type GuideFormState = { error?: string };

/** Step 1 of attaching a file: a one-time upload URL in the seller's own folder. */
export async function startGuideUpload(input: { type: string; size: number; name: string }): Promise<{ ok: true; uploadUrl: string; path: string } | { ok: false; error: string }> {
  const viewer = await getViewer();
  if (!viewer) return { ok: false, error: "Sign in first." };
  if (!guideUploadsEnabled) return { ok: false, error: "File uploads need the database connected. You can still write the guide below." };
  const ext = GUIDE_FILE_TYPES[input.type];
  if (!ext) return { ok: false, error: "Upload a PDF, PNG, or JPG." };
  if (!(input.size > 0) || input.size > MAX_GUIDE_BYTES) return { ok: false, error: `Files can be up to ${MAX_GUIDE_BYTES / 1024 / 1024} MB.` };
  const path = `${viewer.user.id}/${randomUUID()}.${ext}`;
  try {
    return { ok: true, uploadUrl: await signedGuideUpload(path), path };
  } catch (err) {
    console.error("[market] upload start failed", err);
    return { ok: false, error: "Couldn't start the upload. Try again in a moment." };
  }
}

const schema = z.object({
  title: z.string().trim().min(6, "Give your guide a clear title.").max(120),
  description: z.string().trim().min(20, "Describe what's in the guide in a sentence or two.").max(1500),
  courseId: z.string().min(1, "Pick the class it's for."),
  topicId: z.string().optional(),
  price: z.coerce.number().min(0).max(MAX_PRICE, `Price can be up to $${MAX_PRICE}.`),
  body: z.string().max(60000).default(""),
  filePath: z.string().max(200).optional(),
  fileName: z.string().max(200).optional(),
  fileType: z.string().max(60).optional(),
  rights: z.literal("on", { message: "Confirm that you made this guide and it isn't copied." }),
});

export async function publishGuide(_: GuideFormState, form: FormData): Promise<GuideFormState> {
  const viewer = await getViewer();
  if (!viewer) redirect("/login?next=%2Fstudy-guides%2Fnew");
  const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  const catalog = await getCatalog();
  if (!catalog.course(d.courseId)) return { error: "Pick the class it's for." };
  const price = d.price > 0 && d.price < 1 ? 1 : Math.round(d.price * 100) / 100;
  let file: MarketGuide["file"] = null;
  if (d.filePath) {
    if (!d.filePath.startsWith(`${viewer.user.id}/`)) return { error: "That upload isn't yours." };
    const bytes = await guideObjectSize(d.filePath).catch(() => null);
    if (!bytes) return { error: "The file upload didn't finish. Attach it again." };
    file = { path: d.filePath, name: (d.fileName || "study-guide").slice(0, 120), bytes, type: d.fileType && GUIDE_FILE_TYPES[d.fileType] ? d.fileType : "application/pdf" };
  }
  if (!file && d.body.trim().length < 200) return { error: "Attach a file, or write at least a paragraph of the guide (200+ characters)." };
  const now = new Date().toISOString();
  const g: MarketGuide = {
    id: `sg_${randomUUID().slice(0, 12)}`,
    sellerId: viewer.user.id,
    sellerName: viewer.user.name,
    title: d.title,
    description: d.description,
    courseId: d.courseId,
    topicId: d.topicId && catalog.topic(d.topicId)?.courseId === d.courseId ? d.topicId : null,
    price,
    body: d.body.trim(),
    file,
    status: "published",
    createdAt: now,
    updatedAt: now,
    downloads: 0,
    sales: 0,
    revenue: 0,
    ratingSum: 0,
    ratingCount: 0,
  };
  try {
    await saveGuide(g);
  } catch {
    return { error: "Couldn't save your guide. Try again in a moment." };
  }
  revalidatePath("/study-guides");
  redirect(`/study-guides/${g.id}?new=1`);
}

/** Free guide: add it to your library. Paid guide: check out (or, on test builds, unlock for free). */
export async function getStudyGuide(id: string): Promise<{ error?: string }> {
  const viewer = await getViewer();
  if (!viewer) redirect(`/login?next=${encodeURIComponent(`/study-guides/${id}`)}`);
  const g = await getGuide(id);
  if (!g) return { error: "That guide isn't available anymore." };
  if (g.sellerId === viewer.user.id || (await getPurchase(g.id, viewer.user.id))) redirect(`/study-guides/${id}`);
  if (g.price === 0) {
    await recordPurchase(g, viewer.user.id, 0, "free");
  } else if (paymentsMode === "live") {
    const h = await headers();
    const origin = `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;
    redirect(await createGuideCheckoutUrl(g, { id: viewer.user.id, email: viewer.user.email }, origin));
  } else if (paymentsMode === "test") {
    await recordPurchase(g, viewer.user.id, g.price, "test");
  } else {
    return { error: "Buying paid guides opens soon. Free guides work now." };
  }
  revalidatePath(`/study-guides/${id}`);
  redirect(`/study-guides/${id}?got=1`);
}

export async function rateStudyGuide(id: string, stars: number) {
  const viewer = await getViewer();
  if (!viewer || !Number.isInteger(stars) || stars < 1 || stars > 5) return;
  const p = await getPurchase(id, viewer.user.id);
  const g = await getGuide(id);
  if (!p || !g) return;
  const store = await getStore();
  const prev = p.rating ?? 0;
  await store.putDoc<GuidePurchase>(PURCHASES, purchaseId(id, viewer.user.id), { ...p, rating: stars }, viewer.user.id);
  await saveGuide({ ...g, ratingSum: g.ratingSum - prev + stars, ratingCount: g.ratingCount + (prev ? 0 : 1) });
  revalidatePath(`/study-guides/${id}`);
}

/** Seller: change the price, or take the listing down. */
export async function updateMyGuide(id: string, form: FormData) {
  const viewer = await getViewer();
  if (!viewer) return;
  const store = await getStore();
  const g = await store.getDoc<MarketGuide>(GUIDES, id);
  if (!g || (g.sellerId !== viewer.user.id && !viewer.isAdmin)) return;
  if (form.get("remove")) {
    await saveGuide({ ...g, status: "removed", updatedAt: new Date().toISOString() });
  } else {
    const price = Number(form.get("price"));
    if (Number.isFinite(price) && price >= 0 && price <= MAX_PRICE) await saveGuide({ ...g, price: price > 0 && price < 1 ? 1 : Math.round(price * 100) / 100, updatedAt: new Date().toISOString() });
  }
  revalidatePath("/study-guides/mine");
  revalidatePath("/study-guides");
  revalidatePath(`/study-guides/${id}`);
}
