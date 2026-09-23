import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import { cache } from "react";
import { getStore } from "@/lib/data/store";
import { EMPTY_SITE_STATS, rankVideo, type RankBreakdown } from "@/lib/ranking";
import type { Channel, Concept, Course, Curriculum, Library, SiteStats, Topic, Unit, YtVideo } from "@/lib/types";
import { buildCurriculum } from "./build";

export type RankedVideo = YtVideo & { rank: RankBreakdown; site: SiteStats };

export type IndexedCatalog = Curriculum & {
  generatedAt: string | null;
  channels: Channel[];
  /** Every video, best first. */
  videos: RankedVideo[];
  course: (idOrSlug: string) => Course | undefined;
  unit: (id: string) => Unit | undefined;
  concept: (id: string) => Concept | undefined;
  topic: (idOrSlug: string) => Topic | undefined;
  video: (id: string) => RankedVideo | undefined;
  channel: (id: string) => Channel | undefined;
  videosForTopic: (topicId: string) => RankedVideo[];
  videosForCourse: (courseId: string) => RankedVideo[];
  videosForChannel: (channelId: string) => RankedVideo[];
  topicsForCourse: (courseId: string) => Topic[];
  unitsForCourse: (courseId: string) => Unit[];
  conceptsForUnit: (unitId: string) => Concept[];
  topicsForConcept: (conceptId: string) => Topic[];
  topicsForUnit: (unitId: string) => Topic[];
};

const curriculum = buildCurriculum();

let library: Library | null = null;
function loadLibrary(): Library {
  if (library && process.env.NODE_ENV === "production") return library;
  try {
    library = JSON.parse(readFileSync(path.join(process.cwd(), "src", "data", "youtube.json"), "utf8")) as Library;
  } catch {
    library = { generatedAt: null, channels: [], videos: [] };
  }
  return library;
}

function group<T, K>(items: T[], key: (t: T) => K) {
  const m = new Map<K, T[]>();
  for (const it of items) {
    const k = key(it);
    const list = m.get(k);
    if (list) list.push(it);
    else m.set(k, [it]);
  }
  return m;
}

export function indexCatalog(lib: Library, stats: Record<string, SiteStats>): IndexedCatalog {
  const { courses, units, concepts, topics } = curriculum;
  const videos: RankedVideo[] = lib.videos
    .map((v) => {
      const site = stats[v.id] ?? EMPTY_SITE_STATS;
      return { ...v, site, rank: rankVideo(v, site) };
    })
    .sort((a, b) => b.rank.score - a.rank.score);

  const byId = <T extends { id: string }>(xs: T[]) => new Map(xs.map((x) => [x.id, x]));
  const courseMap = byId(courses);
  const courseSlugs = new Map(courses.map((c) => [c.slug, c]));
  const unitMap = byId(units);
  const conceptMap = byId(concepts);
  const topicMap = byId(topics);
  const topicSlugs = new Map(topics.map((t) => [t.slug, t]));
  const videoMap = byId(videos);
  const channelMap = byId(lib.channels);
  const byTopic = group(videos, (v) => v.topicId);
  const byCourse = group(videos, (v) => v.courseId);
  const byChannel = group(videos, (v) => v.channelId);
  const sorted = <T extends { order: number }>(xs: T[]) => [...xs].sort((a, b) => a.order - b.order);
  const topicsByCourse = group(sorted(topics), (t) => t.courseId);
  const unitsByCourse = group(sorted(units), (u) => u.courseId);
  const conceptsByUnit = group(sorted(concepts), (c) => c.unitId);
  const topicsByConcept = group(sorted(topics), (t) => t.conceptId);
  const topicsByUnit = group(sorted(topics), (t) => t.unitId);

  return {
    courses,
    units,
    concepts,
    topics,
    generatedAt: lib.generatedAt,
    channels: lib.channels,
    videos,
    course: (k) => courseMap.get(k) ?? courseSlugs.get(k),
    unit: (id) => unitMap.get(id),
    concept: (id) => conceptMap.get(id),
    topic: (k) => topicMap.get(k) ?? topicSlugs.get(k),
    video: (id) => videoMap.get(id),
    channel: (id) => channelMap.get(id),
    videosForTopic: (id) => byTopic.get(id) ?? [],
    videosForCourse: (id) => byCourse.get(id) ?? [],
    videosForChannel: (id) => byChannel.get(id) ?? [],
    topicsForCourse: (id) => topicsByCourse.get(id) ?? [],
    unitsForCourse: (id) => unitsByCourse.get(id) ?? [],
    conceptsForUnit: (id) => conceptsByUnit.get(id) ?? [],
    topicsForConcept: (id) => topicsByConcept.get(id) ?? [],
    topicsForUnit: (id) => topicsByUnit.get(id) ?? [],
  };
}

/** The catalog for this request, with live Groundwork engagement merged in. */
export const getCatalog = cache(async () => {
  let stats: Record<string, SiteStats> = {};
  try {
    stats = await (await getStore()).siteStats();
  } catch (err) {
    console.error("[catalog] site stats unavailable", err);
  }
  return indexCatalog(loadLibrary(), stats);
});

export { curriculum };
