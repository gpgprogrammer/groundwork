import "server-only";
import { getStore } from "@/lib/data/store";
import type { Library } from "@/lib/types";
import { videosList, youtubeApiKey } from "@/lib/youtube-api";

/**
 * YouTube's API policies require stored API data to be refreshed (or deleted)
 * at least every 30 days. A daily job refreshes one seventh of the library, so
 * every video is re-checked weekly: titles, thumbnails, and view counts update,
 * and videos that became private or were deleted are removed from Merit.
 */

export const PARTS = 7;
type Part = { at: string; updates: Record<string, { title: string; thumbnail: string; views: number; durationSec: number }>; removed: string[] };

export async function refreshPart(lib: Library, part: number) {
  if (!youtubeApiKey()) return { ok: false as const, error: "YOUTUBE_API_KEY is not set" };
  const ids = lib.videos.filter((_, i) => i % PARTS === part).map((v) => v.id);
  const out: Part = { at: new Date().toISOString(), updates: {}, removed: [] };
  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50);
    const found = await videosList(batch);
    const byId = new Map(found.map((v) => [v.id, v]));
    for (const id of batch) {
      const v = byId.get(id);
      if (!v) out.removed.push(id);
      else out.updates[id] = { title: v.title, thumbnail: v.thumbnail, views: v.views, durationSec: v.durationSec };
    }
  }
  await (await getStore()).putDoc("ytRefresh", `part-${part}`, out);
  return { ok: true as const, part, checked: ids.length, removed: out.removed.length };
}

let memo: { at: number; parts: Part[] } | null = null;

/** Applies the latest refreshed data over the built library. Cached for an hour per server instance. */
export async function withRefreshed(lib: Library): Promise<Library> {
  if (!memo || Date.now() - memo.at > 3_600_000) {
    try {
      memo = { at: Date.now(), parts: await (await getStore()).listDocs<Part>("ytRefresh") };
    } catch {
      memo = { at: Date.now(), parts: [] };
    }
  }
  if (!memo.parts.length) return lib;
  const removed = new Set(memo.parts.flatMap((p) => p.removed));
  const updates = Object.assign({}, ...memo.parts.map((p) => p.updates)) as Part["updates"];
  return {
    ...lib,
    videos: lib.videos.filter((v) => !removed.has(v.id)).map((v) => (updates[v.id] ? { ...v, ...updates[v.id] } : v)),
  };
}

/** When each part was last refreshed (for the admin page). */
export async function refreshStatus() {
  const parts = await (await getStore()).listDocs<Part>("ytRefresh").catch(() => [] as Part[]);
  const oldest = parts.length === PARTS ? parts.map((p) => p.at).sort()[0] : null;
  return { keySet: Boolean(youtubeApiKey()), parts: parts.length, oldest, removed: parts.reduce((n, p) => n + p.removed.length, 0) };
}
