import "server-only";
import { getStore } from "@/lib/data/store";
import { isSupabaseEnabled } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * The study guide marketplace: anyone can list a math study guide they made, free or for a price.
 * Files live in a private storage bucket; a buyer (or anyone, for free guides) gets a short-lived link.
 */

export const GUIDES = "marketGuides";
export const PURCHASES = "guidePurchases";
export const GUIDE_BUCKET = "merit-guides";
export const MAX_GUIDE_BYTES = 20 * 1024 * 1024;
export const MAX_PRICE = 50;
/** Merit's share of each paid sale (same as tutoring). */
export const GUIDE_COMMISSION = 0.1;
export const GUIDE_FILE_TYPES: Record<string, string> = { "application/pdf": "pdf", "image/png": "png", "image/jpeg": "jpg" };
export const guideUploadsEnabled = isSupabaseEnabled;

export type MarketGuide = {
  id: string;
  sellerId: string;
  sellerName: string;
  title: string;
  description: string;
  courseId: string;
  topicId: string | null;
  /** USD. 0 means free. */
  price: number;
  /** Written content (Markdown-ish plain text). Paid guides show only the first part before purchase. */
  body: string;
  file: { path: string; name: string; bytes: number; type: string } | null;
  status: "published" | "removed";
  createdAt: string;
  updatedAt: string;
  downloads: number;
  sales: number;
  /** Gross sales in USD. */
  revenue: number;
  ratingSum: number;
  ratingCount: number;
};

export type GuidePurchase = { id: string; guideId: string; userId: string; sellerId: string; amount: number; fee: number; source: "free" | "stripe" | "test"; at: string; rating?: number };

export const purchaseId = (guideId: string, userId: string) => `${guideId}__${userId}`;
export const rating = (g: MarketGuide) => (g.ratingCount ? g.ratingSum / g.ratingCount : null);

export async function listGuides() {
  return (await (await getStore()).listDocs<MarketGuide>(GUIDES)).filter((g) => g.status === "published");
}

export async function getGuide(id: string) {
  const g = await (await getStore()).getDoc<MarketGuide>(GUIDES, id);
  return g && g.status === "published" ? g : null;
}

export async function saveGuide(g: MarketGuide) {
  await (await getStore()).putDoc(GUIDES, g.id, g, g.sellerId);
}

export async function getPurchase(guideId: string, userId: string) {
  return (await getStore()).getDoc<GuidePurchase>(PURCHASES, purchaseId(guideId, userId));
}

/** Records that a student got a guide (free or paid), once, and bumps the guide's counters. */
export async function recordPurchase(guide: MarketGuide, userId: string, amount: number, source: GuidePurchase["source"]) {
  const store = await getStore();
  const id = purchaseId(guide.id, userId);
  if (await store.getDoc<GuidePurchase>(PURCHASES, id)) return;
  const fee = Math.round(amount * GUIDE_COMMISSION * 100) / 100;
  await store.putDoc<GuidePurchase>(PURCHASES, id, { id, guideId: guide.id, userId, sellerId: guide.sellerId, amount, fee, source, at: new Date().toISOString() }, userId);
  const fresh = (await store.getDoc<MarketGuide>(GUIDES, guide.id)) ?? guide;
  await saveGuide({ ...fresh, downloads: fresh.downloads + 1, sales: fresh.sales + (amount > 0 ? 1 : 0), revenue: Math.round((fresh.revenue + amount) * 100) / 100 });
}

/** Paid guides show this much of their written content before purchase. */
export function previewOf(body: string) {
  const cut = Math.max(240, Math.floor(body.length * 0.25));
  return body.length <= cut ? body : `${body.slice(0, cut).replace(/\s+\S*$/, "")}…`;
}

// ── Storage ──────────────────────────────────────────────────────────────────

let bucketReady: Promise<void> | null = null;
/** Creates the private bucket the first time it's needed. */
function ensureBucket() {
  bucketReady ??= (async () => {
    const storage = createAdminClient().storage;
    const { data } = await storage.getBucket(GUIDE_BUCKET);
    if (data) return;
    const { error } = await storage.createBucket(GUIDE_BUCKET, { public: false, fileSizeLimit: MAX_GUIDE_BYTES, allowedMimeTypes: Object.keys(GUIDE_FILE_TYPES) });
    if (error && !/exist/i.test(error.message)) throw new Error(error.message);
  })().catch((err) => {
    bucketReady = null;
    throw err;
  });
  return bucketReady;
}

export async function signedGuideUpload(path: string) {
  await ensureBucket();
  const { data, error } = await createAdminClient().storage.from(GUIDE_BUCKET).createSignedUploadUrl(path);
  if (error || !data) throw new Error(error?.message ?? "Could not start the upload.");
  return data.signedUrl;
}

export async function guideObjectSize(path: string) {
  const dir = path.split("/").slice(0, -1).join("/");
  const name = path.split("/").pop()!;
  const { data } = await createAdminClient().storage.from(GUIDE_BUCKET).list(dir, { search: name });
  const f = data?.find((x) => x.name === name);
  return f ? Number((f.metadata as { size?: number } | null)?.size ?? 0) : null;
}

/** A link to the file that works for 5 minutes. */
export async function guideDownloadUrl(g: MarketGuide) {
  if (!g.file) return null;
  const { data, error } = await createAdminClient().storage.from(GUIDE_BUCKET).createSignedUrl(g.file.path, 300, { download: g.file.name });
  if (error || !data) throw new Error(error?.message ?? "Couldn't open the file.");
  return data.signedUrl;
}
