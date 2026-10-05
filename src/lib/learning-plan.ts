import type { IndexedCatalog, RankedVideo } from "@/lib/catalog";
import { paceLabel } from "@/lib/pace";
import { nextTopicInCourse, startedCourse, upcomingEvents, whenLabel } from "@/lib/recommend";
import type { Course, Topic, UserState } from "@/lib/types";

/**
 * The learning plan (Merit Plus): videos picked from what the student is covering in class.
 * Signals, strongest first: quizzes and tests on their class calendar, the topics they say
 * they're covering now, then the next topic in each course.
 */

export type PlanSource = "test" | "class" | "next";

export type PlanGroup = {
  key: string;
  source: PlanSource;
  topic: Topic;
  course: Course;
  /** Why this topic is in the plan, e.g. "Unit 3 test · Friday" or "In class now". */
  reason: string;
  videos: RankedVideo[];
};

/** Videos in a full plan. */
export const PLAN_SIZE = 12;

export function learningPlan(catalog: IndexedCatalog, state: UserState, limit = PLAN_SIZE, now = Date.now()): PlanGroup[] {
  const groups: PlanGroup[] = [];
  const seenTopics = new Set<string>();
  const seenVideos = new Set<string>();
  let count = 0;

  const add = (topicId: string, source: PlanSource, reason: string, per: number) => {
    if (count >= limit || seenTopics.has(topicId)) return;
    const topic = catalog.topic(topicId);
    const course = topic ? catalog.course(topic.courseId) : undefined;
    if (!topic || !course) return;
    // Lessons you haven't opened come first; watched ones still count if that's all there is.
    const pool = catalog.videosForTopic(topic.id).filter((v) => !v.isShort && !seenVideos.has(v.id));
    const videos = [...pool.filter((v) => !state.history[v.id]), ...pool.filter((v) => state.history[v.id])].slice(0, Math.min(per, limit - count));
    if (!videos.length) return;
    seenTopics.add(topicId);
    videos.forEach((v) => seenVideos.add(v.id));
    count += videos.length;
    groups.push({ key: `${source}:${topicId}`, source, topic, course, reason, videos });
  };

  for (const e of upcomingEvents(state, 21, now)) {
    const reason = `${e.title.length > 40 ? `${e.title.slice(0, 38)}…` : e.title} · ${whenLabel(e.start, now)}`;
    for (const id of e.topicIds) add(id, "test", reason, e.kind === "test" ? 3 : 2);
  }
  for (const id of state.profile.focusTopicIds) add(id, "class", "In class now", 3);
  if (count < limit) {
    for (const courseId of state.profile.courseIds) {
      const next = nextTopicInCourse(catalog, state, courseId, now);
      const name = catalog.course(courseId)?.shortTitle ?? "your course";
      const reason = startedCourse(catalog, state, courseId) ? `Next in ${name}` : `Where most ${name} classes are in ${paceLabel(now)}`;
      if (!next || state.mastered[next.id]) continue;
      add(next.id, "next", reason, 2);
      // And the topic right after it, so the plan looks a little ahead.
      const after = catalog.topicsForCourse(courseId).find((t) => t.order > next.order && !state.mastered[t.id] && catalog.videosForTopic(t.id).length);
      if (after) add(after.id, "next", reason, 2);
    }
  }
  return groups;
}

/** Whether the plan is built from the student's classes (calendar or picked topics), not just course order. */
export const fromClasses = (groups: PlanGroup[]) => groups.some((g) => g.source !== "next");

export const planVideoCount = (groups: PlanGroup[]) => groups.reduce((n, g) => n + g.videos.length, 0);
