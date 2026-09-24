import "server-only";

/** Pulls a YouTube video's public details from its link, without an API key. */

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
  try {
    const html = await (await get(`https://www.youtube.com/watch?v=${id}&hl=en`)).text();
    const pick = (re: RegExp) => html.match(re)?.[1];
    meta.durationSec = Number(pick(/"lengthSeconds":"(\d+)"/) ?? 0);
    meta.views = Number(pick(/"viewCount":"(\d+)"/) ?? 0);
    meta.channelId = pick(/"channelId":"(UC[\w-]{22})"/) ?? "";
    const date = pick(/"(?:publishDate|uploadDate)":"([^"]+)"/);
    if (date && !Number.isNaN(Date.parse(date))) meta.publishedAt = new Date(date).toISOString();
    const desc = pick(/"shortDescription":"((?:[^"\\]|\\.)*)"/);
    if (desc) meta.description = JSON.parse(`"${desc}"`).slice(0, 1500);
    meta.isShort = meta.durationSec > 0 && meta.durationSec <= 60 && /"isShortsEligible":true|\/shorts\//.test(html);
  } catch {
    // oEmbed alone is enough to publish; counts fill in later.
  }
  if (!meta.channelId) meta.channelId = `yt:${meta.channelTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return meta;
}
