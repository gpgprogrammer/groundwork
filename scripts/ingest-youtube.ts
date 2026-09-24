/**
 * Builds the Merit video library from the YouTube Data API v3.
 *
 *   npm run ingest                 # search every topic, then crawl top channels
 *   npm run ingest -- --refresh    # only refresh views/likes/comments (cheap)
 *   npm run ingest -- --budget 4000
 *
 * Needs YOUTUBE_API_KEY (in .env.local or the environment). Every API response
 * is cached in .cache/youtube, so reruns and resumed runs don't spend quota
 * twice. The free quota is 10,000 units/day: search = 100 units, list calls = 1.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { buildCurriculum } from "../src/lib/catalog/build";
import { matchTopics, type TopicMatcher } from "../src/lib/catalog/match";
import type { Channel, YtVideo } from "../src/lib/types";

// ── config ────────────────────────────────────────────────────────────────────
function loadEnvFile(file: string) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
loadEnvFile(path.join(process.cwd(), ".env.local"));
loadEnvFile(path.join(process.cwd(), ".env"));

const KEY = process.env.YOUTUBE_API_KEY;
if (!KEY) {
  console.error("Missing YOUTUBE_API_KEY. Add it to .env.local and rerun.");
  process.exit(1);
}
const args = process.argv.slice(2);
const flag = (name: string) => args.includes(`--${name}`);
const opt = (name: string, fallback: number) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? Number(args[i + 1]) : fallback;
};
const BUDGET = opt("budget", 9500);
const PAGES_PER_TOPIC = opt("pages", 1);
const CHANNELS_TO_CRAWL = opt("channels", 40);
const UPLOADS_PER_CHANNEL = opt("uploads", 400);

const OUT = path.join(process.cwd(), "src", "data", "youtube.json");
const CACHE = path.join(process.cwd(), ".cache", "youtube");
mkdirSync(CACHE, { recursive: true });
mkdirSync(path.dirname(OUT), { recursive: true });

// ── API client with quota accounting + disk cache ────────────────────────────
let spent = 0;
const COST: Record<string, number> = { search: 100, videos: 1, channels: 1, playlistItems: 1 };

class QuotaError extends Error {}

async function yt<T>(endpoint: string, params: Record<string, string | number>, { cache = true } = {}): Promise<T> {
  const qs = new URLSearchParams({ ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])) });
  const cacheKey = createHash("sha1").update(`${endpoint}?${qs}`).digest("hex");
  const cacheFile = path.join(CACHE, `${endpoint}-${cacheKey}.json`);
  if (cache && existsSync(cacheFile)) return JSON.parse(readFileSync(cacheFile, "utf8")) as T;

  const cost = COST[endpoint] ?? 1;
  if (spent + cost > BUDGET) throw new QuotaError(`Budget of ${BUDGET} units reached`);
  qs.set("key", KEY!);
  const res = await fetch(`https://www.googleapis.com/youtube/v3/${endpoint}?${qs}`);
  spent += cost;
  if (!res.ok) {
    const body = await res.text();
    if (res.status === 403 && /quota/i.test(body)) throw new QuotaError("YouTube daily quota exhausted; rerun tomorrow to continue.");
    throw new Error(`YouTube ${endpoint} ${res.status}: ${body.slice(0, 300)}`);
  }
  const json = (await res.json()) as T;
  if (cache) writeFileSync(cacheFile, JSON.stringify(json));
  return json;
}

// ── helpers ───────────────────────────────────────────────────────────────────
export function parseIsoDuration(iso: string) {
  const m = iso.match(/P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return (+(m[1] ?? 0) * 24 + +(m[2] ?? 0)) * 3600 + +(m[3] ?? 0) * 60 + +(m[4] ?? 0);
}

const decode = (s: string) =>
  s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

type SearchItem = { id: { videoId?: string }; snippet: { channelId: string } };
type VideoItem = {
  id: string;
  snippet: {
    title: string;
    description: string;
    channelId: string;
    channelTitle: string;
    publishedAt: string;
    thumbnails: Record<string, { url: string }>;
    liveBroadcastContent?: string;
    defaultAudioLanguage?: string;
    defaultLanguage?: string;
  };
  contentDetails: { duration: string };
  statistics: { viewCount?: string; likeCount?: string; commentCount?: string };
  status?: { embeddable?: boolean; privacyStatus?: string };
};
type ChannelItem = {
  id: string;
  snippet: { title: string; customUrl?: string; description: string; thumbnails: Record<string, { url: string }> };
  statistics: { subscriberCount?: string; videoCount?: string; hiddenSubscriberCount?: boolean };
  contentDetails: { relatedPlaylists: { uploads: string } };
};

const COURSE_QUERY: Record<string, string> = {
  "ap-calculus-bc": "AP Calculus",
  "ap-world-history": "AP World History",
  "sat-math": "SAT Math",
  "ap-biology": "AP Biology",
  "ap-chemistry": "AP Chemistry",
  "sat-reading-writing": "SAT Reading and Writing",
};

const COURSE_BROAD_QUERIES: Record<string, string[]> = {
  "ap-calculus-bc": ["AP Calculus BC review", "AP Calculus BC FRQ", "AP Calculus BC series review"],
  "ap-world-history": ["AP World History review", "AP World History DBQ", "AP World History LEQ"],
  "sat-math": ["digital SAT math", "SAT math Desmos", "SAT math hardest questions"],
  "ap-biology": ["AP Biology review", "AP Biology FRQ"],
  "ap-chemistry": ["AP Chemistry review", "AP Chemistry FRQ"],
  "sat-reading-writing": ["digital SAT reading and writing", "SAT grammar rules"],
};

// ── pipeline ──────────────────────────────────────────────────────────────────
async function main() {
  const curriculum = buildCurriculum();
  const matcher: TopicMatcher = { courses: curriculum.courses, topics: curriculum.topics };
  const existing: { videos: YtVideo[]; channels: Channel[] } = existsSync(OUT)
    ? JSON.parse(readFileSync(OUT, "utf8"))
    : { videos: [], channels: [] };

  // candidateId -> hints about where we found it
  const found = new Map<string, { topicId?: string; courseId?: string; source: "search" | "channel" }>();
  for (const v of existing.videos) found.set(v.id, { topicId: v.topicId ?? undefined, courseId: v.courseId, source: "search" });

  const refreshOnly = flag("refresh");
  let stoppedEarly = "";

  try {
    if (!refreshOnly) {
      // 1. Every topic: "<topic> <course>".
      for (const topic of curriculum.topics) {
        let pageToken = "";
        for (let page = 0; page < PAGES_PER_TOPIC; page++) {
          const q = `${topic.title} ${COURSE_QUERY[topic.courseId]}`;
          const res = await yt<{ items: SearchItem[]; nextPageToken?: string }>("search", {
            part: "snippet",
            type: "video",
            q,
            maxResults: 50,
            relevanceLanguage: "en",
            safeSearch: "strict",
            ...(pageToken ? { pageToken } : {}),
          });
          for (const it of res.items) {
            if (it.id.videoId && !found.has(it.id.videoId)) found.set(it.id.videoId, { topicId: topic.id, courseId: topic.courseId, source: "search" });
          }
          if (!res.nextPageToken) break;
          pageToken = res.nextPageToken;
        }
        process.stdout.write(`\rtopics searched: ${curriculum.topics.indexOf(topic) + 1}/${curriculum.topics.length} · candidates ${found.size} · units ${spent}   `);
      }
      console.log();

      // 2. Broad course queries (reviews, FRQs).
      for (const [courseId, queries] of Object.entries(COURSE_BROAD_QUERIES)) {
        for (const q of queries) {
          const res = await yt<{ items: SearchItem[] }>("search", {
            part: "snippet", type: "video", q, maxResults: 50, relevanceLanguage: "en", safeSearch: "strict",
          });
          for (const it of res.items) if (it.id.videoId && !found.has(it.id.videoId)) found.set(it.id.videoId, { courseId, source: "search" });
        }
      }
    }
  } catch (e) {
    if (!(e instanceof QuotaError)) throw e;
    stoppedEarly = e.message;
  }

  // 3. Details for every candidate (1 unit per 50 videos).
  const details = new Map<string, VideoItem>();
  const fetchDetails = async (ids: string[]) => {
    for (let i = 0; i < ids.length; i += 50) {
      const batch = ids.slice(i, i + 50);
      const res = await yt<{ items: VideoItem[] }>(
        "videos",
        { part: "snippet,contentDetails,statistics,status", id: batch.join(","), maxResults: 50 },
        { cache: !refreshOnly },
      );
      for (const it of res.items) details.set(it.id, it);
    }
  };
  try {
    await fetchDetails([...found.keys()]);
  } catch (e) {
    if (!(e instanceof QuotaError)) throw e;
    stoppedEarly ||= e.message;
  }

  // 4. Crawl uploads of the channels students meet most often.
  const channelHits = new Map<string, Map<string, number>>();
  for (const [id, hint] of found) {
    const d = details.get(id);
    if (!d || !hint.courseId) continue;
    const m = channelHits.get(d.snippet.channelId) ?? new Map<string, number>();
    m.set(hint.courseId, (m.get(hint.courseId) ?? 0) + 1);
    channelHits.set(d.snippet.channelId, m);
  }
  const topChannels = [...channelHits.entries()]
    .map(([id, byCourse]) => ({ id, total: [...byCourse.values()].reduce((a, b) => a + b, 0), byCourse }))
    .filter((c) => c.total >= 4)
    .sort((a, b) => b.total - a.total)
    .slice(0, CHANNELS_TO_CRAWL);

  const channelInfo = new Map<string, ChannelItem>();
  const allChannelIds = [...new Set([...details.values()].map((d) => d.snippet.channelId))];
  try {
    for (let i = 0; i < allChannelIds.length; i += 50) {
      const res = await yt<{ items: ChannelItem[] }>(
        "channels",
        { part: "snippet,statistics,contentDetails", id: allChannelIds.slice(i, i + 50).join(","), maxResults: 50 },
        { cache: !refreshOnly },
      );
      for (const c of res.items) channelInfo.set(c.id, c);
    }

    if (!refreshOnly) {
      const crawled: string[] = [];
      for (const ch of topChannels) {
        const info = channelInfo.get(ch.id);
        if (!info) continue;
        // Only classify uploads into courses this channel demonstrably covers.
        const courses = [...ch.byCourse.entries()].filter(([, n]) => n >= 2).map(([c]) => c);
        let pageToken = "";
        let pulled = 0;
        const newIds: string[] = [];
        while (pulled < UPLOADS_PER_CHANNEL) {
          const res = await yt<{ items: { contentDetails: { videoId: string } }[]; nextPageToken?: string }>("playlistItems", {
            part: "contentDetails",
            playlistId: info.contentDetails.relatedPlaylists.uploads,
            maxResults: 50,
            ...(pageToken ? { pageToken } : {}),
          });
          for (const it of res.items) {
            const vid = it.contentDetails.videoId;
            if (!found.has(vid)) {
              found.set(vid, { courseId: courses.length === 1 ? courses[0] : undefined, source: "channel" });
              channelCourses.set(vid, courses);
              newIds.push(vid);
            }
          }
          pulled += res.items.length;
          if (!res.nextPageToken) break;
          pageToken = res.nextPageToken;
        }
        await fetchDetails(newIds);
        crawled.push(info.snippet.title);
        process.stdout.write(`\rchannels crawled: ${crawled.length}/${topChannels.length} · candidates ${found.size} · units ${spent}   `);
      }
      console.log();
    }
  } catch (e) {
    if (!(e instanceof QuotaError)) throw e;
    stoppedEarly ||= e.message;
  }

  // 5. Classify, filter, and write.
  const videos: YtVideo[] = [];
  for (const [id, hint] of found) {
    const d = details.get(id);
    if (!d) {
      const prev = existing.videos.find((v) => v.id === id);
      if (prev) videos.push(prev); // keep last-known data if we couldn't refresh
      continue;
    }
    if (d.snippet.liveBroadcastContent && d.snippet.liveBroadcastContent !== "none") continue;
    if (d.status?.privacyStatus && d.status.privacyStatus !== "public") continue;
    const lang = d.snippet.defaultAudioLanguage ?? d.snippet.defaultLanguage;
    if (lang && !lang.startsWith("en")) continue;
    const durationSec = parseIsoDuration(d.contentDetails.duration);
    if (!durationSec || durationSec > 4 * 3600) continue;

    const title = decode(d.snippet.title);
    const description = decode(d.snippet.description ?? "");
    const allowedCourses = hint.source === "channel" ? channelCourses.get(id) ?? [] : hint.courseId ? [hint.courseId] : [];
    const matches = matchTopics(matcher, `${title}\n${description.slice(0, 400)}`, { courseIds: allowedCourses });
    const best = matches[0];

    let topicId: string | null = null;
    let courseId = hint.courseId ?? null;
    let relevance = 0;
    if (hint.source === "search" && hint.topicId) {
      // Search hits must still mention their topic; otherwise keep them only at course level.
      const own = matches.find((m) => m.topicId === hint.topicId);
      if (own && own.score >= 0.5) {
        topicId = own.topicId;
        relevance = own.score;
      } else if (best && best.score >= 0.75) {
        topicId = best.topicId;
        relevance = best.score;
      }
      courseId = topicId ? curriculum.topics.find((t) => t.id === topicId)!.courseId : courseId;
      if (!topicId && !mentionsCourse(title, description, courseId)) continue;
    } else if (best && best.score >= 0.75) {
      topicId = best.topicId;
      relevance = best.score;
      courseId = curriculum.topics.find((t) => t.id === topicId)!.courseId;
    } else if (hint.source === "search" && courseId && mentionsCourse(title, description, courseId)) {
      relevance = 0.3;
    } else {
      continue; // an upload we can't place confidently
    }
    if (!courseId) continue;

    const th = d.snippet.thumbnails;
    videos.push({
      id,
      title,
      description: description.slice(0, 280),
      channelId: d.snippet.channelId,
      channelTitle: decode(d.snippet.channelTitle),
      publishedAt: d.snippet.publishedAt,
      durationSec,
      views: Number(d.statistics.viewCount ?? 0),
      likes: d.statistics.likeCount != null ? Number(d.statistics.likeCount) : null,
      comments: d.statistics.commentCount != null ? Number(d.statistics.commentCount) : null,
      thumbnail: (th.maxres ?? th.high ?? th.medium ?? th.default).url,
      courseId,
      topicId,
      relevance: Number(relevance.toFixed(2)),
      isShort: durationSec <= 60,
    });
  }

  const usedChannels = new Set(videos.map((v) => v.channelId));
  const channels: Channel[] = [...usedChannels].map((cid) => {
    const c = channelInfo.get(cid);
    const prev = existing.channels.find((x) => x.id === cid);
    if (!c) return prev ?? { id: cid, title: videos.find((v) => v.channelId === cid)!.channelTitle, handle: null, thumbnail: null, subscribers: null, videoCount: null };
    return {
      id: cid,
      title: decode(c.snippet.title),
      handle: c.snippet.customUrl ?? null,
      thumbnail: (c.snippet.thumbnails.medium ?? c.snippet.thumbnails.default)?.url ?? null,
      subscribers: c.statistics.hiddenSubscriberCount ? null : Number(c.statistics.subscriberCount ?? 0),
      videoCount: Number(c.statistics.videoCount ?? 0),
    };
  });

  videos.sort((a, b) => b.views - a.views);
  writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), channels, videos }));
  const byCourse = Object.fromEntries(curriculum.courses.map((c) => [c.shortTitle, videos.filter((v) => v.courseId === c.id).length]));
  const topicsCovered = new Set(videos.map((v) => v.topicId).filter(Boolean)).size;
  console.log(`\nWrote ${videos.length} videos from ${channels.length} channels (${topicsCovered}/${curriculum.topics.length} topics covered).`);
  console.log(byCourse);
  console.log(`Quota used this run: ~${spent} units.${stoppedEarly ? `\nStopped early: ${stoppedEarly}` : ""}`);
}

const channelCourses = new Map<string, string[]>();

const COURSE_WORDS: Record<string, RegExp> = {
  "ap-calculus-bc": /\b(calc(ulus)?|derivative|integral|limit|series)\b/i,
  "ap-world-history": /\b(world history|apwh|ap world|dbq|leq)\b/i,
  "sat-math": /\bsat\b.*\bmath\b|\bmath\b.*\bsat\b|\bdesmos\b/i,
  "ap-biology": /\b(ap bio|biology)\b/i,
  "ap-chemistry": /\b(ap chem|chemistry)\b/i,
  "sat-reading-writing": /\bsat\b.*\b(reading|writing|grammar|english|verbal)\b/i,
};
function mentionsCourse(title: string, description: string, courseId: string | null) {
  if (!courseId) return false;
  return COURSE_WORDS[courseId]?.test(`${title} ${description.slice(0, 200)}`) ?? false;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
