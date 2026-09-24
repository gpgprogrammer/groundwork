/**
 * Builds the video library WITHOUT a YouTube API key.
 *
 *   npm run ingest:keyless              # discover + classify, write library
 *   npm run ingest:keyless -- --likes   # then fill in like counts (slow, resumable)
 *
 * Discovery reads YouTube's public search and channel pages (the same JSON the
 * website renders from). Like counts come from the public Return YouTube
 * Dislike API. Everything is cached in .cache/keyless and requests are
 * throttled. Prefer `npm run ingest` (official Data API) once you have a key:
 * automated page access isn't covered by YouTube's API terms, and page
 * formats can change without notice.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { buildCurriculum } from "../src/lib/catalog/build";
import { matchTopics, mentionsCourse as mentions } from "../src/lib/catalog/match";
import type { Channel, Library, YtVideo } from "../src/lib/types";

const args = process.argv.slice(2);
const opt = (name: string, fallback: number) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? Number(args[i + 1]) : fallback;
};
const LIKES_ONLY = args.includes("--likes");
const PAGES_PER_TOPIC = opt("pages", 2);
const CHANNELS = opt("channels", 45);
const UPLOADS = opt("uploads", 300);
const DELAY_MS = opt("delay", 350);

const OUT = path.join(process.cwd(), "src", "data", "youtube.json");
const CACHE = path.join(process.cwd(), ".cache", "keyless");
mkdirSync(CACHE, { recursive: true });

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
let lastYt = 0;

async function cached<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const file = path.join(CACHE, `${createHash("sha1").update(key).digest("hex")}.json`);
  if (existsSync(file)) return JSON.parse(readFileSync(file, "utf8")) as T;
  const value = await fn();
  writeFileSync(file, JSON.stringify(value));
  return value;
}

async function ytFetch(url: string, init?: RequestInit, tries = 3): Promise<Response> {
  for (let i = 0; ; i++) {
    const wait = lastYt + DELAY_MS - Date.now();
    if (wait > 0) await sleep(wait);
    lastYt = Date.now();
    const res = await fetch(url, {
      ...init,
      headers: { "User-Agent": UA, "Accept-Language": "en-US,en;q=0.9", Cookie: "CONSENT=YES+1; PREF=hl=en&gl=US", ...(init?.headers ?? {}) },
    }).catch((e) => (i < tries ? null : Promise.reject(e)));
    if (res && res.ok) return res;
    if (i >= tries) throw new Error(`YouTube ${res?.status} for ${url}`);
    await sleep(2000 * (i + 1));
  }
}

// ── innertube config (read once from a page) ────────────────────────────────
let innertube: { key: string; version: string } | null = null;
function readInnertube(html: string) {
  const key = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/)?.[1];
  const version = html.match(/"INNERTUBE_CLIENT_VERSION":"([^"]+)"/)?.[1];
  if (key && version) innertube = { key, version };
}
const context = () => ({ client: { clientName: "WEB", clientVersion: innertube!.version, hl: "en", gl: "US" } });

function initialData(html: string): unknown {
  const m = html.match(/var ytInitialData = (\{[\s\S]*?\});<\/script>/) ?? html.match(/window\["ytInitialData"\] = (\{[\s\S]*?\});/);
  if (!m) throw new Error("ytInitialData not found (YouTube changed its page format?)");
  return JSON.parse(m[1]);
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function collect(o: any, key: string, out: any[] = []): any[] {
  if (!o || typeof o !== "object") return out;
  if (o[key]) out.push(o[key]);
  for (const k in o) if (k !== key) collect(o[k], key, out);
  return out;
}
function continuation(o: any): string | null {
  return collect(o, "continuationCommand")[0]?.token ?? null;
}

type Raw = {
  id: string;
  title: string;
  channelId: string;
  channelTitle: string;
  channelThumb: string | null;
  views: number;
  durationSec: number;
  publishedAgo: string | null;
  thumbnail: string;
  snippet: string;
};

const text = (t: any): string => (t?.simpleText ?? t?.runs?.map((r: any) => r.text).join("") ?? "").trim();

function parseDuration(s: string) {
  if (!s) return 0;
  return s.split(":").map(Number).reduce((acc, n) => acc * 60 + n, 0);
}
function parseViews(s: string) {
  if (/no views/i.test(s)) return 0;
  const m = s.replace(/,/g, "").match(/([\d.]+)\s*([KMB])?/i);
  if (!m) return 0;
  const mult = { K: 1e3, M: 1e6, B: 1e9 }[(m[2] ?? "").toUpperCase() as "K" | "M" | "B"] ?? 1;
  return Math.round(Number(m[1]) * mult);
}
function agoToIso(s: string | null) {
  const m = s?.match(/(\d+)\s+(second|minute|hour|day|week|month|year)/);
  if (!m) return ""; // unknown; the UI omits the date
  const secs = { second: 1, minute: 60, hour: 3600, day: 86400, week: 604800, month: 2629800, year: 31557600 }[m[2] as "day"];
  return new Date(Date.now() - Number(m[1]) * secs * 1000).toISOString();
}

function fromRenderer(v: any, channel?: { id: string; title: string; thumb: string | null }): Raw | null {
  if (!v?.videoId || !v.lengthText) return null; // skips live streams and upcoming premieres
  const owner = v.ownerText?.runs?.[0] ?? v.shortBylineText?.runs?.[0];
  const channelId = owner?.navigationEndpoint?.browseEndpoint?.browseId ?? channel?.id;
  if (!channelId) return null;
  const thumbs = v.thumbnail?.thumbnails ?? [];
  return {
    id: v.videoId,
    title: text(v.title),
    channelId,
    channelTitle: owner?.text ?? channel?.title ?? "",
    channelThumb: v.channelThumbnailSupportedRenderers?.channelThumbnailWithLinkRenderer?.thumbnail?.thumbnails?.[0]?.url ?? channel?.thumb ?? null,
    views: parseViews(text(v.viewCountText)),
    durationSec: parseDuration(text(v.lengthText)),
    publishedAgo: text(v.publishedTimeText) || null,
    thumbnail: `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`,
    snippet: (v.detailedMetadataSnippets?.[0] ? text(v.detailedMetadataSnippets[0].snippetText) : text(v.descriptionSnippet)).slice(0, 280),
    ...(thumbs.length ? {} : {}),
  };
}

/** YouTube's newer "lockup" cards (channel pages). */
function fromLockup(l: any, channel: { id: string; title: string; thumb: string | null }): Raw | null {
  if (!l?.contentId || l.contentType !== "LOCKUP_CONTENT_TYPE_VIDEO") return null;
  const meta = l.metadata?.lockupMetadataViewModel;
  const parts: any[] = meta?.metadata?.contentMetadataViewModel?.metadataRows?.flatMap((r: any) => r.metadataParts ?? []) ?? [];
  const viewsPart = parts.find((p) => /views?/i.test(p.accessibilityLabel ?? ""));
  const agoPart = parts.find((p) => /ago/i.test(p.accessibilityLabel ?? p.text?.content ?? ""));
  const badge = collect(l.contentImage, "thumbnailBadgeViewModel").map((b: any) => b.text).find((t: string) => /^\d+(:\d+)+$/.test(t ?? ""));
  if (!badge) return null; // live, upcoming, or members-only
  return {
    id: l.contentId,
    title: meta?.title?.content ?? "",
    channelId: channel.id,
    channelTitle: channel.title,
    channelThumb: channel.thumb,
    views: parseViews(viewsPart?.text?.content ?? "0"),
    durationSec: parseDuration(badge),
    publishedAgo: agoPart?.accessibilityLabel ?? null,
    thumbnail: `https://i.ytimg.com/vi/${l.contentId}/hqdefault.jpg`,
    snippet: "",
  };
}

async function search(q: string, pages: number): Promise<Raw[]> {
  return cached(`search:${q}:${pages}`, async () => {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}&sp=EgIQAQ%253D%253D&hl=en&gl=US`;
    const html = await (await ytFetch(url)).text();
    readInnertube(html);
    const data = initialData(html);
    const out = collect(data, "videoRenderer").map((v) => fromRenderer(v)).filter(Boolean) as Raw[];
    let token = continuation(data);
    for (let p = 1; p < pages && token && innertube; p++) {
      const res = await ytFetch(`https://www.youtube.com/youtubei/v1/search?key=${innertube.key}&prettyPrint=false`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context: context(), continuation: token }),
      });
      const json = await res.json();
      out.push(...(collect(json, "videoRenderer").map((v) => fromRenderer(v)).filter(Boolean) as Raw[]));
      token = continuation(json);
    }
    return out;
  });
}

type ChannelPage = { videos: Raw[]; handle: string | null; subscribers: number | null; thumb: string | null; title: string };

async function channelUploads(id: string, limit: number): Promise<ChannelPage> {
  return cached(`channel:${id}:${limit}`, async () => {
    const html = await (await ytFetch(`https://www.youtube.com/channel/${id}/videos?hl=en&gl=US`)).text();
    readInnertube(html);
    const data: any = initialData(html);
    const meta = data?.metadata?.channelMetadataRenderer ?? {};
    const headerText = JSON.stringify(data?.header ?? {});
    const subs = headerText.match(/"([\d.,]+[KMB]?) subscribers"/)?.[1] ?? null;
    const handle = headerText.match(/"(@[A-Za-z0-9._-]+)"/)?.[1] ?? null;
    const channel = { id, title: meta.title ?? "", thumb: meta.avatar?.thumbnails?.[0]?.url ?? null };
    const grab = (o: unknown) =>
      [...collect(o, "videoRenderer").map((v) => fromRenderer(v, channel)), ...collect(o, "lockupViewModel").map((l) => fromLockup(l, channel))].filter(Boolean) as Raw[];
    const videos = grab(data);
    let token = continuation(data);
    while (token && videos.length < limit && innertube) {
      const res = await ytFetch(`https://www.youtube.com/youtubei/v1/browse?key=${innertube.key}&prettyPrint=false`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context: context(), continuation: token }),
      });
      const json = await res.json();
      const more = grab(json);
      if (!more.length) break;
      videos.push(...more);
      token = continuation(json);
    }
    return { videos, handle, subscribers: subs ? parseViews(subs) : null, thumb: channel.thumb, title: channel.title };
  });
}

const mostlyLatin = (s: string) => (s.match(/[A-Za-z]/g)?.length ?? 0) >= s.replace(/\s/g, "").length * 0.6;

async function discover() {
  const full = buildCurriculum();
  // Cross-listed topics (Calc AB) share another course's videos; don't search or classify them.
  const cur = { ...full, topics: full.topics.filter((t) => !t.sameAs) };
  const courseOf = new Map(cur.courses.map((c) => [c.id, c]));
  const mentionsCourse = (text: string, courseId: string | null) => mentions(cur, text, courseId);
  const only = args.includes("--courses") ? new Set(args[args.indexOf("--courses") + 1].split(",")) : null;
  const found = new Map<string, { raw: Raw; topicId?: string; courseId?: string; source: "search" | "channel"; channelCourses?: string[] }>();
  const add = (raw: Raw, hint: { topicId?: string; courseId?: string; source: "search" | "channel"; channelCourses?: string[] }) => {
    if (!found.has(raw.id)) found.set(raw.id, { raw, ...hint });
  };

  let n = 0;
  const searchTopics = cur.topics.filter((t) => !only || only.has(t.courseId));
  for (const topic of searchTopics) {
    try {
      for (const r of await search(`${topic.title} ${courseOf.get(topic.courseId)!.query}`, PAGES_PER_TOPIC)) add(r, { topicId: topic.id, courseId: topic.courseId, source: "search" });
    } catch (e) {
      console.warn(`\n  search failed for ${topic.title}: ${(e as Error).message}`);
    }
    process.stdout.write(`\rtopics searched ${++n}/${searchTopics.length} · candidates ${found.size}   `);
  }
  for (const c of cur.courses.filter((c) => !only || only.has(c.id))) {
    if (full.topics.some((t) => t.courseId === c.id && t.sameAs)) continue;
    const courseId = c.id;
    for (const q of [`${c.query} review`, `${c.query} exam review`]) {
      try {
        for (const r of await search(q, PAGES_PER_TOPIC)) add(r, { courseId, source: "search" });
      } catch (e) {
        console.warn(`\n  search failed for ${q}: ${(e as Error).message}`);
      }
    }
  }
  console.log(`\nsearch candidates: ${found.size}`);

  // Channels students meet most often, crawled for their full uploads.
  const hits = new Map<string, Map<string, number>>();
  for (const { raw, courseId } of found.values()) {
    if (!courseId) continue;
    const m = hits.get(raw.channelId) ?? new Map<string, number>();
    m.set(courseId, (m.get(courseId) ?? 0) + 1);
    hits.set(raw.channelId, m);
  }
  const top = [...hits.entries()]
    .map(([id, by]) => ({ id, total: [...by.values()].reduce((a, b) => a + b, 0), by }))
    .filter((c) => c.total >= 4)
    .sort((a, b) => b.total - a.total)
    .slice(0, CHANNELS);

  const channelMeta = new Map<string, Omit<ChannelPage, "videos">>();
  let c = 0;
  for (const ch of top) {
    try {
      const page = await channelUploads(ch.id, UPLOADS);
      channelMeta.set(ch.id, { handle: page.handle, subscribers: page.subscribers, thumb: page.thumb, title: page.title });
      const courses = [...ch.by.entries()].filter(([, k]) => k >= 2).map(([id]) => id);
      for (const r of page.videos) add(r, { source: "channel", channelCourses: courses, courseId: courses.length === 1 ? courses[0] : undefined });
    } catch (e) {
      console.warn(`\n  channel ${ch.id} failed: ${(e as Error).message}`);
    }
    process.stdout.write(`\rchannels crawled ${++c}/${top.length} · candidates ${found.size}   `);
  }
  console.log();

  // Classify, exactly like the API ingester.
  const videos: YtVideo[] = [];
  for (const { raw, topicId: hintTopic, courseId: hintCourse, source, channelCourses } of found.values()) {
    const langCourse = hintCourse ? courseOf.get(hintCourse)?.category === "World Languages & Cultures" : false;
    if (!raw.durationSec || raw.durationSec > 4 * 3600 || !raw.title || (!langCourse && !mostlyLatin(raw.title))) continue;
    const allowed = source === "channel" ? (channelCourses ?? []) : hintCourse ? [hintCourse] : [];
    if (source === "channel" && !allowed.length) continue;
    const matches = matchTopics(cur, `${raw.title}\n${raw.snippet}`, { courseIds: allowed });
    const best = matches[0];
    let topicId: string | null = null;
    let courseId = hintCourse ?? null;
    let relevance = 0;
    if (source === "search" && hintTopic) {
      const own = matches.find((m) => m.topicId === hintTopic);
      if (own && own.score >= 0.5) [topicId, relevance] = [own.topicId, own.score];
      else if (best && best.score >= 0.75) [topicId, relevance] = [best.topicId, best.score];
      if (topicId) courseId = cur.topics.find((t) => t.id === topicId)!.courseId;
      else if (!mentionsCourse(`${raw.title} ${raw.snippet}`, courseId)) continue;
    } else if (best && best.score >= 0.75) {
      [topicId, relevance] = [best.topicId, best.score];
      courseId = cur.topics.find((t) => t.id === topicId)!.courseId;
    } else if (source === "search" && courseId && mentionsCourse(`${raw.title} ${raw.snippet}`, courseId)) {
      relevance = 0.3;
    } else continue;
    if (!courseId) continue;
    videos.push({
      id: raw.id,
      title: raw.title,
      description: raw.snippet,
      channelId: raw.channelId,
      channelTitle: raw.channelTitle,
      publishedAt: agoToIso(raw.publishedAgo),
      durationSec: raw.durationSec,
      views: raw.views,
      likes: null,
      comments: null,
      thumbnail: raw.thumbnail,
      courseId,
      topicId,
      relevance: Number(relevance.toFixed(2)),
      isShort: raw.durationSec <= 60,
    });
  }

  const byChannel = new Map<string, Raw>();
  for (const { raw } of found.values()) if (!byChannel.has(raw.channelId) || (!byChannel.get(raw.channelId)!.channelThumb && raw.channelThumb)) byChannel.set(raw.channelId, raw);
  const channels: Channel[] = [...new Set(videos.map((v) => v.channelId))].map((id) => {
    const meta = channelMeta.get(id);
    const r = byChannel.get(id)!;
    return {
      id,
      title: meta?.title || r.channelTitle,
      handle: meta?.handle ?? null,
      thumbnail: (meta?.thumb ?? r.channelThumb)?.replace(/=s\d+-/, "=s176-") ?? null,
      subscribers: meta?.subscribers ?? null,
      videoCount: null,
    };
  });

  // Keep likes already fetched on previous runs.
  const prev: Library = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : { generatedAt: null, channels: [], videos: [] };
  const prevLikes = new Map(prev.videos.map((v) => [v.id, v.likes]));
  for (const v of videos) v.likes = prevLikes.get(v.id) ?? null;

  videos.sort((a, b) => b.views - a.views);
  writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), channels, videos }));
  const topics = new Set(videos.map((v) => v.topicId).filter(Boolean)).size;
  console.log(`Wrote ${videos.length} videos from ${channels.length} channels (${topics}/${cur.topics.length} topics covered).`);
  console.log(Object.fromEntries(cur.courses.map((c) => [c.shortTitle, videos.filter((v) => v.courseId === c.id).length])));
}

/** Fills like counts from the Return YouTube Dislike API (public, rate-limited). */
async function fillLikes() {
  const lib: Library = JSON.parse(readFileSync(OUT, "utf8"));
  const todo = lib.videos.filter((v) => v.likes == null);
  console.log(`likes to fetch: ${todo.length}`);
  let done = 0;
  let saved = Date.now();
  const worker = async () => {
    for (;;) {
      const v = todo.shift();
      if (!v) return;
      try {
        const r = await cached(`ryd:${v.id}`, async () => {
          for (let i = 0; i < 6; i++) {
            const res = await fetch(`https://returnyoutubedislikeapi.com/votes?videoId=${v.id}`);
            if (res.status === 429) {
              await sleep(15000);
              continue;
            }
            if (!res.ok) return null;
            return (await res.json()) as { likes: number; viewCount: number };
          }
          return null;
        });
        if (r) {
          v.likes = r.likes;
          if (r.viewCount > v.views) v.views = r.viewCount;
        }
      } catch {
        /* leave null; ranking falls back to its prior */
      }
      done++;
      if (Date.now() - saved > 20000) {
        writeFileSync(OUT, JSON.stringify(lib));
        saved = Date.now();
        process.stdout.write(`\rlikes ${done} fetched   `);
      }
      await sleep(250);
    }
  };
  await Promise.all([worker(), worker(), worker()]);
  writeFileSync(OUT, JSON.stringify(lib));
  console.log(`\nlikes done: ${lib.videos.filter((v) => v.likes != null).length}/${lib.videos.length}`);
}

(LIKES_ONLY ? fillLikes() : discover()).catch((e) => {
  console.error(e);
  process.exit(1);
});
