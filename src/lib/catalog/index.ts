import "server-only";
import { cache } from "react";
import { getStore } from "@/lib/data/store";
import { rankVideo, type RankBreakdown } from "@/lib/ranking";
import type { Catalog, Concept, Course, Educator, Topic, Unit, Video } from "@/lib/types";

export type RankedVideo = Video & { rank: RankBreakdown };

export type IndexedCatalog = Catalog & {
  videos: RankedVideo[];
  course: (idOrSlug: string) => Course | undefined;
  unit: (id: string) => Unit | undefined;
  concept: (id: string) => Concept | undefined;
  topic: (idOrSlug: string) => Topic | undefined;
  video: (id: string) => RankedVideo | undefined;
  educator: (id: string) => Educator | undefined;
  educatorByHandle: (handle: string) => Educator | undefined;
  /** Published lessons for a topic, best first. */
  videosForTopic: (topicId: string) => RankedVideo[];
  videosForEducator: (educatorId: string) => RankedVideo[];
  topicsForCourse: (courseId: string) => Topic[];
  unitsForCourse: (courseId: string) => Unit[];
  conceptsForUnit: (unitId: string) => Concept[];
  topicsForConcept: (conceptId: string) => Topic[];
};

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

export function indexCatalog(raw: Catalog): IndexedCatalog {
  const videos: RankedVideo[] = raw.videos
    .filter((v) => v.status === "published")
    .map((v) => ({ ...v, rank: rankVideo(v.stats) }))
    .sort((a, b) => b.rank.score - a.rank.score);

  const byId = <T extends { id: string }>(xs: T[]) => new Map(xs.map((x) => [x.id, x]));
  const courses = byId(raw.courses);
  const courseSlugs = new Map(raw.courses.map((c) => [c.slug, c]));
  const units = byId(raw.units);
  const concepts = byId(raw.concepts);
  const topics = byId(raw.topics);
  const topicSlugs = new Map(raw.topics.map((t) => [t.slug, t]));
  const vids = byId(videos);
  const educators = byId(raw.educators);
  const handles = new Map(raw.educators.map((e) => [e.handle, e]));
  const byTopic = group(videos, (v) => v.topicId);
  const byEducator = group(videos, (v) => v.educatorId);
  const topicsByCourse = group([...raw.topics].sort((a, b) => a.order - b.order), (t) => t.courseId);
  const unitsByCourse = group([...raw.units].sort((a, b) => a.order - b.order), (u) => u.courseId);
  const conceptsByUnit = group([...raw.concepts].sort((a, b) => a.order - b.order), (c) => c.unitId);
  const topicsByConcept = group([...raw.topics].sort((a, b) => a.order - b.order), (t) => t.conceptId);

  return {
    ...raw,
    videos,
    course: (k) => courses.get(k) ?? courseSlugs.get(k),
    unit: (id) => units.get(id),
    concept: (id) => concepts.get(id),
    topic: (k) => topics.get(k) ?? topicSlugs.get(k),
    video: (id) => vids.get(id),
    educator: (id) => educators.get(id),
    educatorByHandle: (h) => handles.get(h),
    videosForTopic: (id) => byTopic.get(id) ?? [],
    videosForEducator: (id) => byEducator.get(id) ?? [],
    topicsForCourse: (id) => topicsByCourse.get(id) ?? [],
    unitsForCourse: (id) => unitsByCourse.get(id) ?? [],
    conceptsForUnit: (id) => conceptsByUnit.get(id) ?? [],
    topicsForConcept: (id) => topicsByConcept.get(id) ?? [],
  };
}

export const getCatalog = cache(async () => indexCatalog(await (await getStore()).loadCatalog()));

