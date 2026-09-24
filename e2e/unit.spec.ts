import { expect, test } from "@playwright/test";
import { buildCurriculum } from "../src/lib/catalog/build";
import { detectCourse, matchTopics } from "../src/lib/catalog/match";
import { eventsFromIcs } from "../src/lib/ics";
import { rankVideo, wilsonLowerBound } from "../src/lib/ranking";
import type { YtVideo } from "../src/lib/types";

const video = (over: Partial<YtVideo>): YtVideo => ({
  id: "abc123xyz00",
  title: "Chain Rule explained",
  description: "",
  channelId: "UC1",
  channelTitle: "Teacher",
  publishedAt: "2024-01-01T00:00:00Z",
  durationSec: 600,
  views: 100_000,
  likes: 4000,
  comments: 200,
  thumbnail: "",
  courseId: "ap-calculus-bc",
  topicId: "ap-calculus-bc/chain-rule",
  relevance: 1,
  isShort: false,
  ...over,
});

test.describe("ranking", () => {
  test("a well-liked, on-topic lesson beats a viral but poorly liked one", () => {
    const good = rankVideo(video({ views: 80_000, likes: 4800 }));
    const viral = rankVideo(video({ views: 5_000_000, likes: 20_000, relevance: 0.55 }));
    expect(good.score).toBeGreaterThan(viral.score);
  });

  test("student helpful votes move the score", () => {
    const base = rankVideo(video({}));
    const helped = rankVideo(video({}), { opens: 200, saves: 30, helpful: 120, notHelpful: 4 });
    const panned = rankVideo(video({}), { opens: 200, saves: 0, helpful: 5, notHelpful: 90 });
    expect(helped.score).toBeGreaterThan(base.score);
    expect(panned.score).toBeLessThan(base.score);
  });

  test("tiny videos are smoothed toward the prior", () => {
    const lucky = rankVideo(video({ views: 30, likes: 30 }));
    expect(lucky.likeRate).toBeLessThan(0.8);
  });

  test("scores stay within 0–100", () => {
    for (const v of [video({ views: 0, likes: 0, comments: 0 }), video({ views: 1e9, likes: 1e8, comments: 1e7 }), video({ likes: null, topicId: null })]) {
      const r = rankVideo(v);
      expect(r.score).toBeGreaterThanOrEqual(0);
      expect(r.score).toBeLessThanOrEqual(100);
    }
  });

  test("Wilson bound rewards confidence", () => {
    expect(wilsonLowerBound(900, 1000)).toBeGreaterThan(wilsonLowerBound(9, 10));
  });
});

test.describe("topic matching", () => {
  const c = buildCurriculum();
  test("titles and calendar events find their topics", () => {
    expect(matchTopics(c, "The Chain Rule - Calculus in 10 minutes", { courseIds: ["ap-calculus-bc"] })[0]?.topicId).toBe("ap-calculus-bc/chain-rule");
    expect(matchTopics(c, "Champa Rice and the Song Dynasty [AP World Review]")[0]?.topicId).toBe("ap-world-history/champa-rice");
    expect(matchTopics(c, "Unit 6 quiz: Le Chatelier's principle", { courseIds: ["ap-chemistry"] })[0]?.topicId).toBe("ap-chemistry/le-chatelier");
    expect(matchTopics(c, "Hardy Weinberg practice problems")[0]?.topicId).toBe("ap-biology/hardy-weinberg");
    expect(matchTopics(c, "Operant conditioning and reinforcement schedules", { courseIds: ["ap-psychology"] })[0]?.topicId).toBe("ap-psychology/operant-conditioning-and-social-learning");
  });
  test("ambiguous one-word aliases don't over-match", () => {
    const m = matchTopics(c, "food chain and energy pyramids");
    expect(m.find((x) => x.topicId.endsWith("/chain-rule") && x.score >= 0.75)).toBeUndefined();
  });
  test("course detection from event titles", () => {
    expect(detectCourse(c, "AP Calc BC - Unit 3 test")).toBe("ap-calculus-bc");
    expect(detectCourse(c, "Calc quiz Friday", ["ap-calculus-ab"])).toBe("ap-calculus-ab");
    expect(detectCourse(c, "Calc quiz Friday", ["ap-calculus-bc"])).toBe("ap-calculus-bc");
    expect(detectCourse(c, "APWH DBQ practice")).toBe("ap-world-history");
    expect(detectCourse(c, "Chem lab report due")).toBe("ap-chemistry");
    expect(detectCourse(c, "APUSH period 3 test")).toBe("ap-us-history");
    expect(detectCourse(c, "AP Psych unit 2 quiz")).toBe("ap-psychology");
    expect(detectCourse(c, "Physics C E&M exam")).toBe("ap-physics-c-electricity-and-magnetism");
    expect(detectCourse(c, "Soccer practice")).toBeNull();
  });
});


test.describe("calendar sync", () => {
  const c = buildCurriculum();
  const now = Date.parse("2026-10-05T12:00:00Z");
  // Shapes taken from real Google Calendar and Canvas exports (folded lines, escapes, all-day dates, weekly class).
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Google Inc//Google Calendar 70.9054//EN",
    "BEGIN:VEVENT",
    "DTSTART;VALUE=DATE:20261009",
    "DTEND;VALUE=DATE:20261010",
    "UID:quiz-1@google.com",
    "SUMMARY:AP Calc BC Quiz - Chain Rule & Implicit Differentiation",
    "END:VEVENT",
    "BEGIN:VEVENT",
    "DTSTART:20261014T140000Z",
    "UID:canvas-assignment-9",
    "SUMMARY:APWH: DBQ on Champa rice and the Song economy",
    "DESCRIPTION:Use at least four documents\\, cite\\n evidence.",
    "END:VEVENT",
    "BEGIN:VEVENT",
    "DTSTART;TZID=America/New_York:20261001T081500",
    "RRULE:FREQ=WEEKLY;COUNT=10",
    "UID:class-chem",
    "SUMMARY:AP Chemistry",
    "END:VEVENT",
    "BEGIN:VEVENT",
    "DTSTART;VALUE=DATE:20261011",
    "UID:bday",
    "SUMMARY:Grandma's birthday",
    "END:VEVENT",
    "BEGIN:VEVENT",
    "DTSTART;VALUE=DATE:20240101",
    "UID:old",
    "SUMMARY:AP Calc test (last year)",
    "END:VEVENT",
    "BEGIN:VEVENT",
    "DTSTART;VALUE=DATE:20261020",
    "UID:folded",
    "SUMMARY:Unit 6 test: Le Chatelier's princ",
    " iple and ICE tables",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  test("parses, filters, and matches school events", () => {
    const events = eventsFromIcs(ics, c, [], now);
    const titles = events.map((e) => e.title);
    expect(titles).not.toContain("Grandma's birthday");
    expect(titles.some((t) => t.includes("last year"))).toBe(false);

    const quiz = events.find((e) => e.uid === "quiz-1@google.com")!;
    expect(quiz.kind).toBe("test");
    expect(quiz.allDay).toBe(true);
    expect(quiz.courseId).toBe("ap-calculus-bc");
    expect(quiz.topicIds).toEqual(expect.arrayContaining(["ap-calculus-bc/chain-rule", "ap-calculus-bc/implicit-differentiation"]));

    const dbq = events.find((e) => e.uid === "canvas-assignment-9")!;
    expect(dbq.courseId).toBe("ap-world-history");
    expect(dbq.topicIds).toContain("ap-world-history/champa-rice");

    // Class periods are not schoolwork; they never appear on the schedule.
    expect(events.filter((e) => e.uid.startsWith("class-chem"))).toHaveLength(0);

    const folded = events.find((e) => e.uid === "folded")!;
    expect(folded.title).toBe("Unit 6 test: Le Chatelier's principle and ICE tables");
    // It doesn't name a class, so no class or topic is guessed for it.
    expect(folded.courseId).toBeNull();
    expect(folded.topicIds).toEqual([]);
  });
});

test("every course has units, topics, search keywords, and unique ids", () => {
  const c = buildCurriculum();
  expect(c.courses.length).toBeGreaterThanOrEqual(40);
  expect(new Set(c.topics.map((t) => t.id)).size).toBe(c.topics.length);
  for (const course of c.courses) {
    expect(course.keywords.length, course.slug).toBeGreaterThan(0);
    expect(c.topics.filter((t) => t.courseId === course.id).length, course.slug).toBeGreaterThan(3);
  }
  for (const t of c.topics.filter((t) => t.sameAs)) expect(c.topics.some((x) => x.id === t.sameAs), t.id).toBe(true);
});
