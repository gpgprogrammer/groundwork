import "server-only";
import { videosList, youtubeApiKey } from "@/lib/youtube-api";

/** A YouTube video's public details: oEmbed, plus the official Data API when a key is set. */

export function youtubeId(input: string): string | null {
  const s = input.trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  try {
    const u = new URL(s);
    const host = u.hostname.replace(/^(www|m|music)\./, "");
    if (host === "youtu.be") return u.pathname.slice(1, 12) || null;
    if (host !== "youtube.com" && host !== "youtube-nocookie.com") return null;
    if (u.searchParams.get("v")) return u.searchParams.get("v")!.slice(0, 11);
    const m = u.pathname.match(/^\/(?:shorts|embed|live|v)\/([\w-]{11})/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

export type YoutubeMeta = {
  id: string;
  title: string;
  description: string;
  channelId: string;
  channelTitle: string;
  thumbnail: string;
  durationSec: number;
  views: number;
  publishedAt: string;
  isShort: boolean;
};

async function get(url: string) {
  const res = await fetch(url, {
    headers: { "Accept-Language": "en-US,en;q=0.9", "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36" },
    signal: AbortSignal.timeout(8000),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res;
}

export async function fetchYoutubeMeta(id: string): Promise<YoutubeMeta | null> {
  let oembed: { title?: string; author_name?: string } = {};
  try {
    oembed = await (await get(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}`)).json();
  } catch {
    return null; // private, removed, or not a real video
  }
  const meta: YoutubeMeta = {
    id,
    title: oembed.title ?? "Untitled",
    description: "",
    channelId: "",
    channelTitle: oembed.author_name ?? "",
    thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    durationSec: 0,
    views: 0,
    publishedAt: new Date().toISOString(),
    isShort: false,
  };
  // Details beyond oEmbed come only from the official Data API (never from scraping YouTube pages).
  if (youtubeApiKey()) {
    try {
      const [v] = await videosList([id]);
      if (!v) return null;
      Object.assign(meta, { ...v, isShort: v.durationSec > 0 && v.durationSec <= 60 });
    } catch (err) {
      console.error("[youtube] api lookup failed", err);
    }
  }
  if (!meta.channelId) meta.channelId = `yt:${meta.channelTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return meta;
}
