import type { IndexedCatalog, RankedVideo } from "@/lib/catalog";
import type { Progress, Topic, UserState } from "@/lib/types";

export type Recommendation = { video: RankedVideo; reason: string };

export function continueWatching(catalog: IndexedCatalog, state: UserState, limit = 6) {
  return Object.values(state.progress)
    .filter((p) => !p.completed && p.position > 10)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map((p) => ({ progress: p, video: catalog.video(p.videoId) }))
    .filter((x): x is { progress: Progress; video: RankedVideo } => Boolean(x.video))
    .slice(0, limit);
}

export function history(catalog: IndexedCatalog, state: UserState) {
  return Object.values(state.progress)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map((p) => ({ progress: p, video: catalog.video(p.videoId) }))
    .filter((x): x is { progress: Progress; video: RankedVideo } => Boolean(x.video));
}

export function topicStatus(catalog: IndexedCatalog, state: UserState, topicId: string) {
  const vids = catalog.videosForTopic(topicId);
  const done = vids.some((v) => state.progress[v.id]?.completed);
  const started = vids.some((v) => state.progress[v.id]);
  return done ? "done" : started ? "started" : "new";
}

/** The next topic in a course to study: the first one after your furthest touched topic that isn't done. */
export function nextTopicInCourse(catalog: IndexedCatalog, state: UserState, courseId: string): Topic | undefined {
  const topics = catalog.topicsForCourse(courseId);
  let furthest = -1;
  topics.forEach((t, i) => {
    if (topicStatus(catalog, state, t.id) !== "new") furthest = i;
  });
  const after = topics.slice(furthest + 1).find((t) => topicStatus(catalog, state, t.id) !== "done");
  return after ?? topics.find((t) => topicStatus(catalog, state, t.id) !== "done");
}

export function courseProgress(catalog: IndexedCatalog, state: UserState, courseId: string) {
  const topics = catalog.topicsForCourse(courseId);
  const done = topics.filter((t) => topicStatus(catalog, state, t.id) === "done").length;
  return { done, total: topics.length };
}

export function recommend(catalog: IndexedCatalog, state: UserState, limit = 8): Recommendation[] {
  const seen = new Set(Object.keys(state.progress));
  const picked = new Map<string, Recommendation & { weight: number }>();
  const add = (video: RankedVideo | undefined, reason: string, weight: number) => {
    if (!video || seen.has(video.id)) return;
    const existing = picked.get(video.id);
    if (!existing || existing.weight < weight) picked.set(video.id, { video, reason, weight: weight + video.rank.score / 100 });
  };

  const courseIds = state.profile.courseIds.length ? state.profile.courseIds : catalog.courses.slice(0, 3).map((c) => c.id);

  // 1. The next topic in each course you're studying.
  for (const courseId of courseIds) {
    const next = nextTopicInCourse(catalog, state, courseId);
    const course = catalog.course(courseId);
    if (next && course) add(catalog.videosForTopic(next.id)[0], `Next in ${course.shortTitle}`, 3);
  }

  // 2. Build on what you finished: a different teaching style on the same topic, then the neighbouring topic.
  const recent = Object.values(state.progress)
    .filter((p) => p.completed)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 5);
  for (const p of recent) {
    const v = catalog.video(p.videoId);
    const topic = v && catalog.topic(v.topicId);
    if (!v || !topic) continue;
    const other = catalog.videosForTopic(topic.id).find((x) => x.style !== v.style && !seen.has(x.id));
    if (other) add(other, `${other.style} for ${topic.title}`, 2.2);
    const siblings = catalog.topicsForConcept(topic.conceptId);
    const idx = siblings.findIndex((t) => t.id === topic.id);
    const neighbour = siblings[idx + 1];
    if (neighbour) add(catalog.videosForTopic(neighbour.id)[0], `Because you finished ${topic.title}`, 2.5);
  }

  // 3. Educators you've saved or found helpful.
  const likedEducators = new Set(
    [...Object.keys(state.saves), ...Object.entries(state.votes).filter(([, v]) => v === 1).map(([id]) => id)]
      .map((id) => catalog.video(id)?.educatorId)
      .filter(Boolean) as string[],
  );
  for (const edId of likedEducators) {
    const ed = catalog.educator(edId);
    const best = catalog
      .videosForEducator(edId)
      .find((v) => !seen.has(v.id) && courseIds.includes(catalog.topic(v.topicId)?.courseId ?? ""));
    if (ed && best) add(best, `More from ${ed.name}`, 1.6);
  }

  // 4. Highest-ranked lessons in your courses.
  for (const v of catalog.videos) {
    if (picked.size >= limit * 2) break;
    const topic = catalog.topic(v.topicId);
    if (topic && courseIds.includes(topic.courseId)) add(v, `Top rated in ${catalog.course(topic.courseId)?.shortTitle}`, 1);
  }

  return [...picked.values()]
    .sort((a, b) => b.weight - a.weight)
    .slice(0, limit)
    .map(({ video, reason }) => ({ video, reason }));
}
