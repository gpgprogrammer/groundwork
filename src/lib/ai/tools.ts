import "server-only";
import { tool } from "ai";
import { z } from "zod";
import { hasPlus } from "@/lib/billing/access";
import type { IndexedCatalog, RankedVideo } from "@/lib/catalog";
import { buildPlan } from "@/lib/plan";
import { getPlanPrefs } from "@/lib/plan-store";
import { search } from "@/lib/search";
import { SERVICES, topCreators } from "@/lib/tutoring";
import type { Topic } from "@/lib/types";
import type { Viewer } from "@/lib/viewer";

/** What a lesson looks like to the chat UI. */
export type LessonCard = {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  minutes: number;
  views: number;
  helpfulPct: number;
  topic: string | null;
  topicHref: string | null;
};

export type QuizCard = { title: string; questions: { stem: string; choices: string[]; answer: number; explanation: string }[] };

export function lessonCard(catalog: IndexedCatalog, v: RankedVideo): LessonCard {
  const t = v.topicId ? catalog.topic(v.topicId) : undefined;
  const c = catalog.course(v.courseId);
  return {
    id: v.id,
    title: v.title,
    channel: v.channelTitle,
    thumbnail: v.thumbnail,
    minutes: Math.max(1, Math.round(v.durationSec / 60)),
    views: v.views,
    helpfulPct: Math.round(v.rank.helpful * 100),
    topic: t?.title ?? null,
    topicHref: t && c ? `/courses/${c.slug}/${t.slug}` : null,
  };
}

const topicHref = (catalog: IndexedCatalog, t: Topic) => `/courses/${catalog.course(t.courseId)!.slug}/${t.slug}`;

function resolveTopic(catalog: IndexedCatalog, query: string, courseId?: string) {
  const hit = search(catalog, query, { courseId: courseId && catalog.course(courseId) ? courseId : undefined, kinds: ["topic"] }, 1)[0];
  return hit?.kind === "topic" ? hit.topic : undefined;
}

export function buildTools(catalog: IndexedCatalog, viewer: Viewer | null) {
  const courseIds = catalog.courses.map((c) => c.id) as [string, ...string[]];
  return {
    findLessons: tool({
      description:
        "Search Merit's ranked lesson library for the best videos on a topic. Use whenever the student wants a video, a lesson, an explanation to watch, or help with a specific topic. Returns lessons best-first.",
      inputSchema: z.object({
        query: z.string().describe("The topic or concept, e.g. 'chain rule' or 'Treaty of Versailles'"),
        courseId: z.enum(courseIds).optional().describe("Limit to one course when you know it"),
        maxMinutes: z.number().int().min(1).max(180).optional().describe("Only lessons shorter than this"),
      }),
      execute: async ({ query, courseId, maxMinutes }) => {
        const topic = resolveTopic(catalog, query, courseId);
        let pool = topic ? catalog.videosForTopic(topic.id) : [];
        if (pool.length < 3) {
          const hits = search(catalog, query, { courseId, kinds: ["video"] }, 20);
          pool = [...pool, ...hits.flatMap((h) => (h.kind === "video" ? [h.video] : []))];
        }
        const lessons = [...new Map(pool.filter((v) => !v.isShort && (!maxMinutes || v.durationSec <= maxMinutes * 60)).map((v) => [v.id, v])).values()]
          .slice(0, 4)
          .map((v) => lessonCard(catalog, v));
        return {
          topic: topic ? { title: topic.title, href: topicHref(catalog, topic), course: catalog.course(topic.courseId)!.title } : null,
          lessons,
        };
      },
    }),

    topicInfo: tool({
      description: "Look up a curriculum topic: its summary, key points, the unit and course it belongs to, and its page on Merit. Use to ground explanations in the AP/SAT curriculum.",
      inputSchema: z.object({ query: z.string(), courseId: z.enum(courseIds).optional() }),
      execute: async ({ query, courseId }) => {
        const t = resolveTopic(catalog, query, courseId);
        if (!t) return { found: false as const };
        const unit = catalog.unit(t.unitId)!;
        const course = catalog.course(t.courseId)!;
        return {
          found: true as const,
          title: t.title,
          summary: t.summary,
          keyPoints: t.keyPoints,
          alsoCalled: t.aliases,
          course: course.title,
          unit: `Unit ${unit.order}: ${unit.title}`,
          href: topicHref(catalog, t),
          lessons: catalog.videosForTopic(t.id).filter((v) => !v.isShort).length,
        };
      },
    }),

    courseOutline: tool({
      description: "Get the units and topics of a course, in order. Use for 'what's on the AP Bio exam', planning, or finding where a topic sits.",
      inputSchema: z.object({ courseId: z.enum(courseIds) }),
      execute: async ({ courseId }) => {
        const c = catalog.course(courseId)!;
        return {
          course: c.title,
          href: `/courses/${c.slug}`,
          examMonth: c.examMonth,
          units: catalog.unitsForCourse(c.id).map((u) => ({ unit: `Unit ${u.order}: ${u.title}`, topics: catalog.topicsForUnit(u.id).map((t) => t.title) })),
        };
      },
    }),

    findTutors: tool({
      description: "Find help beyond lessons: top free teachers for a course and tutoring services. Use when the student asks for a tutor or more help.",
      inputSchema: z.object({ courseId: z.enum(courseIds).optional() }),
      execute: async ({ courseId }) => ({
        tutorsPage: courseId ? `/tutors?course=${courseId}` : "/tutors",
        topTeachers: topCreators(catalog, courseId ? { courseId } : {}, 5).map((c) => ({ name: c.channel.title, lessons: c.lessons, href: `/channel/${c.channel.id}` })),
        services: SERVICES.slice(0, 6).map((s) => ({ name: s.name, kind: s.kind })),
      }),
    }),

    tonightsPlan: tool({
      description: "The student's own study plan for tonight (Merit Plus). Use when they ask what to study, what's next, or how to prepare for an upcoming test.",
      inputSchema: z.object({}),
      execute: async () => {
        if (!viewer) return { available: false as const, reason: "Not signed in. Signing up gives a free year of Merit Plus, which includes the plan." };
        if (!hasPlus(viewer.plus)) return { available: false as const, reason: "The study plan is part of Merit Plus." };
        const prefs = await getPlanPrefs(viewer.user.id);
        const [today, tomorrow] = buildPlan(catalog, viewer.state, prefs, 2);
        const fmt = (d: typeof today) => d.tasks.map((t) => ({ topic: t.topic.title, course: t.course.shortTitle, why: t.reason, minutes: t.minutes, href: topicHref(catalog, t.topic) }));
        return {
          available: true as const,
          tonight: fmt(today),
          tomorrow: fmt(tomorrow),
          upcomingTests: (viewer.state.schedule?.events ?? [])
            .filter((e) => e.kind === "test" && new Date(e.start).getTime() > Date.now())
            .slice(0, 5)
            .map((e) => ({ title: e.title, date: e.start.slice(0, 10) })),
          planPage: "/plan",
        };
      },
    }),

    quiz: tool({
      description:
        "Show the student an interactive multiple-choice quiz. Use when they ask to be quizzed or tested, or after explaining something to check understanding. Write exam-style questions (AP/SAT level), 4 choices each, one correct, with a short explanation.",
      inputSchema: z.object({
        title: z.string().describe("e.g. 'Chain rule: quick check'"),
        questions: z
          .array(
            z.object({
              stem: z.string(),
              choices: z.array(z.string()).length(4),
              answer: z.number().int().min(0).max(3).describe("Index of the correct choice"),
              explanation: z.string().describe("Why the answer is right and the most tempting wrong answer is wrong"),
            }),
          )
          .min(1)
          .max(8),
      }),
      execute: async (quiz): Promise<QuizCard> => quiz,
    }),
  };
}

export type MeritTools = ReturnType<typeof buildTools>;
