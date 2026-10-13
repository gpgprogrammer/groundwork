"use server";

import { getCatalog } from "@/lib/catalog";
import { getStore } from "@/lib/data/store";
import type { Question } from "@/lib/types";
import { buildEvents, fetchCalendar, ScheduleError } from "@/lib/schedule";

/**
 * "Try it before you sign up": things a visitor can do without an account. Nothing here is saved.
 */

export type CalendarPreviewItem = {
  title: string;
  start: string;
  kind: "test" | "assignment" | "other";
  course: string | null;
  topic: { title: string; href: string } | null;
  lesson: { id: string; title: string; channelTitle: string; thumbnail: string; durationSec: number } | null;
};

export type CalendarPreview = { ok: true; items: CalendarPreviewItem[]; total: number } | { ok: false; error: string };

/** Reads a calendar link and shows which upcoming quizzes and tests Merit would prep, and with which lesson. */
export async function previewCalendarLink(rawUrl: string): Promise<CalendarPreview> {
  if (typeof rawUrl !== "string" || rawUrl.length > 2000) return { ok: false, error: "That doesn't look like a calendar link." };
  try {
    const ics = await fetchCalendar(rawUrl);
    const events = buildEvents(ics, [], { url: rawUrl, school: true });
    const catalog = await getCatalog();
    const upcoming = events.filter((e) => new Date(e.start).getTime() >= Date.now() - 86400000).sort((a, b) => a.start.localeCompare(b.start));
    const ranked = [...upcoming.filter((e) => e.kind === "test"), ...upcoming.filter((e) => e.kind !== "test")];
    const items = ranked.slice(0, 8).map((e): CalendarPreviewItem => {
      const topic = e.topicIds[0] ? catalog.topic(e.topicIds[0]) : undefined;
      const course = catalog.course(topic?.courseId ?? e.courseId ?? "");
      const lesson = topic ? catalog.videosForTopic(topic.id).find((v) => !v.isShort) : undefined;
      return {
        title: e.title,
        start: e.start,
        kind: e.kind === "test" ? "test" : e.kind === "assignment" ? "assignment" : "other",
        course: course?.shortTitle ?? null,
        topic: topic && course ? { title: topic.title, href: `/courses/${course.slug}/${topic.slug}` } : null,
        lesson: lesson ? { id: lesson.id, title: lesson.title, channelTitle: lesson.channelTitle, thumbnail: lesson.thumbnail, durationSec: lesson.durationSec } : null,
      };
    });
    if (!items.length) return { ok: false, error: "That calendar has no upcoming events Merit could read. Make sure it's your class calendar's feed link." };
    return { ok: true, items, total: upcoming.length };
  } catch (e) {
    if (e instanceof ScheduleError) return { ok: false, error: e.message };
    return { ok: false, error: "That doesn't look like a calendar link." };
  }
}

export type TryQuestions = { ok: true; course: string; questions: (Question & { topicTitle: string })[] } | { ok: false; error: string };

/**
 * Three practice questions from across a course, for visitors deciding whether to start a Sprint.
 * Only questions already in Merit's bank are used, so visitors never trigger new AI generation.
 */
export async function tryQuestions(courseId: string): Promise<TryQuestions> {
  const catalog = await getCatalog();
  const course = catalog.course(courseId);
  if (!course) return { ok: false, error: "Choose a course first." };
  const topics = catalog.topicsForCourse(course.id);
  const store = await getStore();
  // Walk the course from several starting points so the three questions cover different units.
  const order = [0.15, 0.5, 0.85, 0.3, 0.7, 0.05, 0.95].map((f) => Math.floor(f * topics.length));
  const out: (Question & { topicTitle: string })[] = [];
  const tried = new Set<number>();
  for (const start of order) {
    for (let i = start; i < topics.length && out.length < 3; i++) {
      if (tried.has(i)) continue;
      tried.add(i);
      const t = topics[i];
      const bank = (await store.getDoc<{ questions: Question[] }>("qbank", t.id)) ?? (t.sameAs ? await store.getDoc<{ questions: Question[] }>("qbank", t.sameAs) : null);
      const q = bank?.questions.find((x) => x.difficulty !== "hard") ?? bank?.questions[0];
      if (q) {
        out.push({ ...q, topicTitle: t.title });
        break;
      }
      if (tried.size > 40) break;
    }
    if (out.length >= 3) break;
  }
  if (out.length < 3) return { ok: false, error: `Sample questions for ${course.shortTitle} aren't ready yet. Make a free account to take the full diagnostic.` };
  return { ok: true, course: course.shortTitle, questions: out };
}
