import type { IndexedCatalog, RankedVideo } from "@/lib/catalog";
import type { HistoryEntry, ScheduleEvent, Topic, UserState } from "@/lib/types";

export type Recommendation = { video: RankedVideo; reason: string };

export function history(catalog: IndexedCatalog, state: UserState) {
  return Object.values(state.history)
    .sort((a, b) => b.openedAt.localeCompare(a.openedAt))
    .map((h) => ({ entry: h, video: catalog.video(h.videoId) }))
    .filter((x): x is { entry: HistoryEntry; video: RankedVideo } => Boolean(x.video));
}

export function topicStatus(catalog: IndexedCatalog, state: UserState, topicId: string): "done" | "started" | "new" {
  if (state.mastered[topicId]) return "done";
  return catalog.videosForTopic(topicId).some((v) => state.history[v.id]) ? "started" : "new";
}

export function courseProgress(catalog: IndexedCatalog, state: UserState, courseId: string) {
  const topics = catalog.topicsForCourse(courseId);
  return { done: topics.filter((t) => state.mastered[t.id]).length, total: topics.length };
}

/** The next topic to study in a course: after the furthest one you've touched, skipping mastered ones. */
export function nextTopicInCourse(catalog: IndexedCatalog, state: UserState, courseId: string): Topic | undefined {
  const topics = catalog.topicsForCourse(courseId).filter((t) => catalog.videosForTopic(t.id).length);
  let furthest = -1;
  topics.forEach((t, i) => {
    if (topicStatus(catalog, state, t.id) !== "new") furthest = i;
  });
  return topics.slice(furthest + 1).find((t) => !state.mastered[t.id]) ?? topics.find((t) => !state.mastered[t.id]);
}

const DAY = 86400000;

export function upcomingEvents(state: UserState, days = 21, now = Date.now()): ScheduleEvent[] {
  if (!state.schedule) return [];
  return state.schedule.events.filter((e) => {
    const t = new Date(e.start).getTime();
    return t >= now - DAY / 2 && t <= now + days * DAY && (e.topicIds.length || e.courseId);
  });
}

/** Events from today onward (keeps today's even if they've started). */
export function futureEvents(events: ScheduleEvent[], now = Date.now()) {
  return events.filter((e) => new Date(e.start).getTime() >= now - DAY / 2);
}

export function whenLabel(iso: string, now = Date.now()) {
  const d = new Date(iso);
  const days = Math.round((new Date(d.toDateString()).getTime() - new Date(new Date(now).toDateString()).getTime()) / DAY);
  if (days <= 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days < 7) return d.toLocaleDateString("en-US", { weekday: "long" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const lessonsOnly = (v: RankedVideo) => !v.isShort;

/** Videos for the topics on your calendar, soonest first. */
export function scheduleShelf(catalog: IndexedCatalog, state: UserState, limit = 12): Recommendation[] {
  const out: Recommendation[] = [];
  const seen = new Set<string>();
  for (const e of upcomingEvents(state)) {
    const label = `${e.kind === "test" ? "Before your" : "For"} ${e.title.length > 38 ? `${e.title.slice(0, 36)}…` : e.title} · ${whenLabel(e.start)}`;
    const pools = e.topicIds.length
      ? e.topicIds.map((id) => catalog.videosForTopic(id).filter(lessonsOnly).slice(0, e.kind === "test" ? 3 : 2))
      : [catalog.videosForCourse(e.courseId!).filter(lessonsOnly).filter((v) => !state.history[v.id]).slice(0, 2)];
    for (const v of pools.flat()) {
      if (seen.has(v.id)) continue;
      seen.add(v.id);
      out.push({ video: v, reason: label });
      if (out.length >= limit) return out;
    }
  }
  return out;
}

export function recommend(catalog: IndexedCatalog, state: UserState, limit = 24): Recommendation[] {
  const opened = new Set(Object.keys(state.history));
  const picked = new Map<string, Recommendation & { weight: number }>();
  const add = (video: RankedVideo | undefined, reason: string, weight: number) => {
    if (!video || video.isShort || opened.has(video.id)) return;
    const w = weight + video.rank.score / 100;
    const existing = picked.get(video.id);
    if (!existing || existing.weight < w) picked.set(video.id, { video, reason, weight: w });
  };

  const courseIds = state.profile.courseIds.length ? state.profile.courseIds : catalog.courses.map((c) => c.id);

  for (const r of scheduleShelf(catalog, state, 12)) add(r.video, r.reason, 5);

  for (const topicId of state.profile.focusTopicIds) {
    const topic = catalog.topic(topicId);
    if (topic) catalog.videosForTopic(topicId).slice(0, 3).forEach((v) => add(v, `In class now: ${topic.title}`, 4));
  }

  for (const courseId of courseIds) {
    const next = nextTopicInCourse(catalog, state, courseId);
    const course = catalog.course(courseId);
    if (next && course) catalog.videosForTopic(next.id).slice(0, 2).forEach((v) => add(v, `Next in ${course.shortTitle}: ${next.title}`, 3));
  }

  // Channels you've saved from or found helpful.
  const liked = new Set(
    [...Object.keys(state.saves), ...Object.entries(state.votes).filter(([, v]) => v === 1).map(([id]) => id)]
      .map((id) => catalog.video(id)?.channelId)
      .filter(Boolean) as string[],
  );
  for (const channelId of liked) {
    catalog
      .videosForChannel(channelId)
      .filter((v) => courseIds.includes(v.courseId))
      .slice(0, 3)
      .forEach((v) => add(v, `More from ${v.channelTitle}`, 2));
  }

  for (const v of catalog.videos) {
    if (picked.size >= limit * 3) break;
    if (courseIds.includes(v.courseId) && v.topicId) add(v, `Top rated in ${catalog.course(v.courseId)?.shortTitle}`, 1);
  }

  return [...picked.values()].sort((a, b) => b.weight - a.weight).slice(0, limit).map(({ video, reason }) => ({ video, reason }));
}
