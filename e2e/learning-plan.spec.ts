import { expect, test } from "@playwright/test";
import type { IndexedCatalog, RankedVideo } from "../src/lib/catalog";
import { fromClasses, learningPlan, planVideoCount } from "../src/lib/learning-plan";
import type { Course, Topic, UserState } from "../src/lib/types";

// A tiny catalog: one course, four topics, three lessons each (plus a short that should never be picked).
const course = { id: "calc", slug: "calc", title: "AP Calc", shortTitle: "Calc" } as Course;
const topics = ["limits", "derivatives", "chain", "integrals"].map((id, order) => ({ id, slug: id, title: id, courseId: "calc", unitId: "u1", order, keyPoints: [], aliases: [], summary: "" }) as unknown as Topic);
const video = (topicId: string, k: number, isShort = false) => ({ id: `${topicId}-${k}${isShort ? "s" : ""}`, title: `${topicId} ${k}`, topicId, courseId: "calc", isShort }) as unknown as RankedVideo;
const videos = topics.flatMap((t) => [video(t.id, 1), video(t.id, 2), video(t.id, 3), video(t.id, 0, true)]);
const catalog = {
  course: (id: string) => (id === "calc" ? course : undefined),
  topic: (id: string) => topics.find((t) => t.id === id),
  topicsForCourse: () => topics,
  videosForTopic: (id: string) => videos.filter((v) => v.topicId === id),
} as unknown as IndexedCatalog;

const NOW = Date.parse("2026-10-05T12:00:00Z");
const state = (over: { focus?: string[]; tests?: { topicIds: string[]; inDays: number }[]; history?: string[]; mastered?: string[] } = {}) =>
  ({
    profile: { courseIds: ["calc"], focusTopicIds: over.focus ?? [] },
    history: Object.fromEntries((over.history ?? []).map((id) => [id, { videoId: id, openedAt: "", opens: 1 }])),
    mastered: Object.fromEntries((over.mastered ?? []).map((id) => [id, true])),
    saves: {},
    votes: {},
    schedule: over.tests
      ? {
          sources: [],
          hidden: [],
          syncedAt: "",
          events: over.tests.map((e, i) => ({ uid: `e${i}`, title: `Calc quiz ${i + 1}`, start: new Date(NOW + e.inDays * 86400000).toISOString(), end: null, allDay: true, kind: "test", courseId: "calc", topicIds: e.topicIds })),
        }
      : null,
  }) as unknown as UserState;

test.describe("learning plan", () => {
  test("calendar tests come first, then what's covered in class", () => {
    const plan = learningPlan(catalog, state({ focus: ["derivatives"], tests: [{ topicIds: ["chain"], inDays: 2 }] }), 12, NOW);
    expect(plan.map((g) => [g.source, g.topic.id])).toEqual([
      ["test", "chain"],
      ["class", "derivatives"],
      // Room left in the plan is topped up with the next topic in the course.
      ["next", "limits"],
    ]);
    expect(plan[0].reason).toMatch(/^Calc quiz 1 · /);
    expect(plan[0].videos).toHaveLength(3);
    expect(fromClasses(plan)).toBe(true);
  });

  test("never suggests shorts, and lessons you haven't opened come first", () => {
    const plan = learningPlan(catalog, state({ focus: ["limits"], history: ["limits-1"] }), 12, NOW);
    const ids = plan[0].videos.map((v) => v.id);
    expect(ids).toEqual(["limits-2", "limits-3", "limits-1"]);
    expect(plan.flatMap((g) => g.videos).some((v) => v.isShort)).toBe(false);
  });

  test("with nothing from class, it starts from the next topic in the course", () => {
    const plan = learningPlan(catalog, state({ mastered: ["limits"] }), 12, NOW);
    expect(plan.map((g) => [g.source, g.topic.id])).toEqual([["next", "derivatives"]]);
    expect(fromClasses(plan)).toBe(false);
  });

  test("respects the size limit and doesn't repeat a topic", () => {
    const plan = learningPlan(catalog, state({ focus: ["chain", "integrals", "limits"], tests: [{ topicIds: ["chain"], inDays: 1 }] }), 5, NOW);
    expect(planVideoCount(plan)).toBe(5);
    expect(new Set(plan.map((g) => g.topic.id)).size).toBe(plan.length);
  });
});
