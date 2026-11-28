import { expect, test } from "@playwright/test";
import { buildCurriculum } from "../src/lib/catalog/build";
import { detectCourse, matchTopics } from "../src/lib/catalog/match";
import { candidatesFromText } from "../src/lib/extract-text";
import { eventsFromIcs } from "../src/lib/ics";
import { canUploadVideos } from "../src/lib/auth/permissions";
import { rankVideo, wilsonLowerBound } from "../src/lib/ranking";
import type { YtVideo } from "../src/lib/types";
import type { IndexedCatalog } from "../src/lib/catalog";
import type { AnalyticsEvent } from "../src/lib/analytics";
import { buildUserActivity, duration, summarizeByUser } from "../src/lib/user-activity";
import { parseScoreText, percentFromScore, SAT_DOMAINS, satPlan, scoreFromPercent, sectionTargets, type SatPrep } from "../src/lib/sat-prep";

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

test.describe("video upload permissions", () => {
  test("allow teacher accounts and admins, but never regular students", () => {
    expect(canUploadVideos(null)).toBe(false);
    expect(canUploadVideos({ user: { accountType: "student" }, isAdmin: false })).toBe(false);
    expect(canUploadVideos({ user: { accountType: "teacher" }, isAdmin: false })).toBe(true);
    expect(canUploadVideos({ user: { accountType: "student" }, isAdmin: true })).toBe(true);
  });
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

  test("YouTube numbers never change the score", () => {
    const a = rankVideo(video({ views: 30, likes: 30, comments: 0 }));
    const b = rankVideo(video({ views: 5e7, likes: 2e6, comments: 9e4 }));
    expect(a.score).toBe(b.score);
  });

  test("% helpful is hidden until enough Merit students vote", () => {
    expect(rankVideo(video({})).helpfulPct).toBeNull();
    expect(rankVideo(video({}), { opens: 10, saves: 0, helpful: 4, notHelpful: 1 }).helpfulPct).toBe(80);
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
    // "Chem" alone fits regular and AP Chemistry; the student's own courses decide.
    expect(detectCourse(c, "Chem lab report due", ["ap-chemistry"])).toBe("ap-chemistry");
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

test.describe("school portal calendars (Blackbaud)", () => {
  const cur = buildCurriculum();
  const now = new Date("2026-09-09T15:00:00Z").getTime();
  const ev = (uid: string, summary: string, desc: string, start: string, end?: string) =>
    ["BEGIN:VEVENT", `UID:${uid}`, `DTSTART;TZID=Eastern Standard Time:${start}`, ...(end ? [`DTEND;TZID=Eastern Standard Time:${end}`] : []), `SUMMARY:${summary}`, `DESCRIPTION:${desc}`, "END:VEVENT"];
  const ics = [
    "BEGIN:VCALENDAR",
    "PRODID:-//Blackbaud Inc//myschoolapp//EN",
    ...ev("a1", "BC 2.4 wkst", "AP Calculus BC - 4\\n10 pts. | Online submission | Homework", "20260910T133500"),
    ...ev("a2", "HChem Lab 2", "Chemistry H - 1\\n18 pts. | Lab/Quiz | Assignment", "20260923T083000"),
    ...ev("a3", "Practice 5: Dimensional Anaylsis", "Chemistry H - 1", "20260914T083000"),
    ...ev("a4", "BC quiz 2.1-2.6", "AP Calculus BC - 4\\nQuiz", "20260911T125000"),
    ...ev("a5", "HEcon Test - Basic Economic Concepts", "Economics H\\nSummative", "20260910T144500"),
    ...ev("a6", "ENG CW: Vocab quiz", "World Lit H - 3", "20260909T122000"),
    ...ev("a7", "Sem Mock IRR", "AP Seminar - 2", "20260925T094500"),
    // Assigned Sep 12, due Sep 16 at 11:59 PM.
    ...ev("a8", "BC 3.1 worksheet", "AP Calculus BC - 4", "20260912T080000", "20260916T235900"),
    // Class meetings, one per day.
    ...[14, 15, 16, 17, 18].flatMap((d) => ev(`m${d}`, "AP Calculus BC - 4", "", `202609${d}T132500`, `202609${d}T141000`)),
    ...ev("s1", "Soccer Game vs. Central", "", "20260912T150000"),
    "END:VCALENDAR",
  ].join("\r\n");

  test("keeps every piece of coursework, including school shorthand", () => {
    const events = eventsFromIcs(ics, cur, ["ap-calculus-bc", "ap-seminar"], now);
    const t = Object.fromEntries(events.map((e) => [e.title, e]));
    for (const title of ["BC 2.4 wkst", "HChem Lab 2", "Practice 5: Dimensional Anaylsis", "BC quiz 2.1-2.6", "HEcon Test - Basic Economic Concepts", "ENG CW: Vocab quiz", "Sem Mock IRR", "BC 3.1 worksheet"]) {
      expect(t[title], title).toBeTruthy();
    }
    expect(t["BC quiz 2.1-2.6"].kind).toBe("test");
    expect(t["HEcon Test - Basic Economic Concepts"].kind).toBe("test");
    expect(t["BC 2.4 wkst"].kind).toBe("assignment");
    // Class meetings and sports are not coursework.
    expect(events.filter((e) => e.title === "AP Calculus BC - 4")).toHaveLength(0);
    expect(t["Soccer Game vs. Central"]).toBeUndefined();
  });

  test("uses the due date, honors the school's time zone, and never mistakes honors classes for AP", () => {
    const events = eventsFromIcs(ics, cur, ["ap-calculus-bc", "ap-chemistry"], now);
    const t = Object.fromEntries(events.map((e) => [e.title, e]));
    expect(t["BC 3.1 worksheet"].start.slice(0, 10)).toBe("2026-09-17"); // 11:59 PM Eastern = next day UTC
    expect(new Date(t["BC 2.4 wkst"].start).toISOString()).toBe("2026-09-10T17:35:00.000Z");
    expect(t["BC 2.4 wkst"].courseId).toBe("ap-calculus-bc");
    expect(t["HChem Lab 2"].courseId).toBeNull();
    expect(t["Practice 5: Dimensional Anaylsis"].courseId).toBeNull();
    expect(t["Sem Mock IRR"].courseId).toBe("ap-seminar");
  });

  test("reads a month view copied from Blackbaud", () => {
    const pasted = [
      "Today", "September 2026", "Month", "SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT",
      "30", "31", "8:30 AM", "H Chem Skill Check 4", "Chemistry H - 1", "6 pts. | Lab/Quiz |", "Assignment", "Graded",
      "Sep 1", "9:40 AM", "AP World - 1.1-1.2 Summative Test", "AP World", "25 pts. |", "Summative |", "Assignment", "Graded",
      "1:25 PM", "BC 2.1-2.2 worksheet", "AP Calculus", "10 pts. | Online submission |", "Graded",
      "2", "1:35 PM", "BC 2.4 wkst", "AP Calculus BC - 4", "10 pts. | Online submission | Homework |", "Graded",
      "4", "12:50 PM", "BC quiz 2.1-2.6", "AP Calculus BC - 4", "Graded",
    ].join("\n");
    const c = candidatesFromText(pasted, ["ap-calculus-bc", "ap-world-history"], new Date("2026-09-24T12:00:00"));
    const byTitle = Object.fromEntries(c.map((x) => [x.title, x]));
    expect(byTitle["H Chem Skill Check 4"].date).toBe("2026-08-31");
    expect(byTitle["AP World - 1.1-1.2 Summative Test"]).toMatchObject({ date: "2026-09-01", time: "09:40", kind: "test", courseId: "ap-world-history" });
    expect(byTitle["BC 2.4 wkst"]).toMatchObject({ date: "2026-09-02", time: "13:35", courseId: "ap-calculus-bc" });
    expect(byTitle["BC quiz 2.1-2.6"]).toMatchObject({ date: "2026-09-04", kind: "test" });
    expect(c.find((x) => /pts\.|Graded|SUN|Chemistry H - 1/.test(x.title))).toBeUndefined();
    expect(c).toHaveLength(5);
  });
});

test.describe("analytics", () => {
  test("counts people, not bots or the team, by Eastern-time day", async () => {
    const { buildReport } = await import("../src/lib/analytics-report");
    // Nov 28 2026, 12:00 Eastern.
    const now = Date.parse("2026-11-28T17:00:00Z");
    const at = (minAgo: number) => new Date(now - minAgo * 60_000).toISOString();
    const D = 24 * 60;
    type E = Parameters<typeof buildReport>[0][number];
    const ev: E[] = [
      // a: a person (two pages, then signs up), came from Instagram
      { t: "view", at: at(300), v: "a", u: null, path: "/", ref: "l.instagram.com" },
      { t: "view", at: at(298), v: "a", u: null, path: "/courses/ap-calculus-bc" },
      { t: "view", at: at(2), v: "a", u: "member-1234567", path: "/tutors/t_1" },
      // b: one page but interacted, then spent 40s
      { t: "view", at: at(60), v: "b", u: null, path: "/", ref: "google.com" },
      { t: "engage", at: at(60), v: "b", u: null, path: "/" },
      { t: "time", at: at(59), v: "b", u: null, path: "/", s: 40 },
      { t: "video_open", at: at(59), v: "b", u: null, x: "vid" },
      // bot: one page, no interaction
      { t: "view", at: at(30), v: "bot1", u: null, path: "/sprint", nv: 1 },
      { t: "view", at: at(31), v: "bot2", u: null, path: "/sprint", nv: 1 },
      // team: signed in once as an admin, so their signed-out visits don't count either
      { t: "view", at: at(10), v: "team", u: null, path: "/" },
      { t: "view", at: at(9), v: "team", u: "admin-1234567", path: "/admin" },
      // previous period: one person
      { t: "view", at: at(D * 8), v: "c", u: null, path: "/" },
      { t: "engage", at: at(D * 8), v: "c", u: null, path: "/" },
      // 11:30pm Eastern on Nov 27 is still Nov 27 even though it is Nov 28 in UTC
      { t: "view", at: "2026-11-28T04:30:00Z", v: "late", u: null, path: "/" },
      { t: "engage", at: "2026-11-28T04:30:00Z", v: "late", u: null, path: "/" },
    ];
    const members = [{ id: "member-1234567", at: at(3), email: "s@x.org", type: "student" as const }, { id: "admin-1234567", at: at(D), email: "a@x.org", type: null }];
    const r = buildReport(ev, { days: 7, now, team: new Set(["admin-1234567"]), members });
    expect(r.now.visitors).toBe(3); // a, b, late
    expect(r.before.visitors).toBe(1);
    expect(r.now.signups).toBe(1);
    expect(r.now.activeMembers).toBe(1);
    expect(r.now.avgTime).toBe(40);
    expect(r.filtered.botVisitors).toBe(2);
    expect(r.filtered.teamViews).toBe(2);
    expect(r.use.lessons).toEqual({ times: 1, people: 1 });
    expect(r.sources.find((s) => s.key === "Instagram")).toEqual({ key: "Instagram", visitors: 1, signups: 1 });
    expect(r.series.find((s) => s.key === "2026-11-27")?.visitors).toBe(1);
    expect(r.live).toBe(1);
    expect(r.tutorViews.get("t_1")).toBe(1);

    const today = buildReport(ev, { days: 1, now, team: new Set(["admin-1234567"]), members });
    expect(today.now.visitors).toBe(2); // a and b; "late" was yesterday in Eastern time
    expect(buildReport(ev, { days: 7, now, team: new Set(["admin-1234567"]), members, includeTeam: true }).now.visitors).toBe(4);
  });
});

test.describe("SAT prep", () => {
  // A small stand-in catalog: every SAT unit has two topics with one lesson each.
  const units = SAT_DOMAINS.map((d) => ({ id: `${d.courseId}/${d.id}`, courseId: d.courseId }));
  const topicsFor = (unitId: string) => {
    const [courseId, unit] = unitId.split("/");
    const slugs = unit === "algebra" ? ["linear-equations-in-one-variable", "systems-of-equations"] : [`${unit}-a`, `${unit}-b`];
    return slugs.map((slug) => ({ id: `${courseId}/${slug}`, slug, title: slug, courseId, unitId }));
  };
  const catalog = {
    course: (id: string) => (id === "sat-math" || id === "sat-reading-writing" ? { id, slug: id } : undefined),
    topicsForUnit: (id: string) => (units.some((u) => u.id === id) ? topicsFor(id) : []),
    videosForTopic: (id: string) => [{ id: `v-${id}`, title: `Lesson ${id}`, isShort: false, durationSec: 600 }],
  } as unknown as IndexedCatalog;
  const now = new Date("2026-11-28T10:00:00").getTime();
  const base = (over: Partial<SatPrep> = {}): SatPrep => ({
    id: "u1",
    userId: "u1",
    createdAt: "2026-11-28T10:00:00Z",
    updatedAt: "2026-11-28T10:00:00Z",
    testDate: "2027-03-06",
    target: 1400,
    minutesPerDay: 60,
    daysPerWeek: 6,
    scores: [{ at: "2026-11-28T10:00:00Z", math: 560, rw: 640, source: "practice" }],
    domains: {},
    done: {},
    ...over,
  });

  test("reads scores and domain counts from score report text", () => {
    const r = parseScoreText("Total Score 1180  Reading and Writing 600  Math 580  Algebra 9 of 14  Advanced Math 7/14  Standard English Conventions 6 out of 13");
    expect(r.math).toBe(580);
    expect(r.rw).toBe(600);
    expect(r.total).toBe(1180);
    expect(r.domains.algebra).toEqual({ right: 9, of: 14 });
    expect(r.domains["advanced-math"]).toEqual({ right: 7, of: 14 });
    expect(r.domains["standard-english-conventions"]).toEqual({ right: 6, of: 13 });
    expect(parseScoreText("nothing useful here").found).toEqual([]);
  });

  test("score conversion is monotonic and round-trips", () => {
    expect(scoreFromPercent(0)).toBe(200);
    expect(scoreFromPercent(1)).toBe(800);
    for (const s of [300, 450, 600, 720]) expect(Math.abs(scoreFromPercent(percentFromScore(s)) - s)).toBeLessThanOrEqual(10);
  });

  test("targets put more of the gap on the section with more room", () => {
    const t = sectionTargets(base());
    expect(t.math + t.rw).toBeGreaterThanOrEqual(1390);
    expect(t.math - 560).toBeGreaterThan(t.rw - 640);
  });

  test("the plan runs to test day, rests, schedules Saturday practice tests, and favors weak domains", () => {
    const plan = satPlan(base({ domains: { "geometry-trig": 0.2 } }), catalog, null, now);
    expect(plan[0].date).toBe("2026-11-28");
    expect(plan.at(-1)!.date).toBe("2027-03-06");
    expect(plan.at(-1)!.tasks[0].kind).toBe("checklist");
    expect(plan.some((d) => d.phase === "rest")).toBe(true);
    const tests = plan.filter((d) => d.tasks.some((t) => t.kind === "test"));
    expect(tests.length).toBeGreaterThanOrEqual(5);
    for (const d of tests) expect(new Date(`${d.date}T12:00:00`).getDay()).toBe(6);
    const ids = plan.flatMap((d) => d.tasks.map((t) => t.id));
    expect(new Set(ids).size).toBe(ids.length);
    const time = (id: string) => plan.flatMap((d) => d.tasks).filter((t) => t.domain === id).reduce((s, t) => s + t.minutes, 0);
    expect(time("geometry-trig")).toBeGreaterThan(time("craft-and-structure"));
  });

  test("with no score yet, day 1 is a full practice test", () => {
    const plan = satPlan(base({ scores: [] }), catalog, null, now);
    expect(plan[0].tasks[0].kind).toBe("test");
  });
});

test.describe("per-user activity", () => {
  const ev = (over: Partial<AnalyticsEvent>): AnalyticsEvent => ({ t: "view", at: "2026-11-27T15:00:00.000Z", v: "vid-1", u: "user-1", dev: "desktop", ...over });
  const events: AnalyticsEvent[] = [
    // Visited before signing up (same browser, no account yet).
    ev({ t: "view", at: "2026-11-25T14:00:00.000Z", u: null, path: "/", ref: "instagram.com" }),
    ev({ t: "time", at: "2026-11-25T14:02:00.000Z", u: null, path: "/", s: 120 }),
    // A signed-in visit: two pages with time and actions.
    ev({ t: "view", at: "2026-11-27T15:00:00.000Z", path: "/practice" }),
    ev({ t: "act", at: "2026-11-27T15:00:30.000Z", path: "/practice", x: "click", d: "Mixed review → /practice/algebra-1/mixed" }),
    ev({ t: "time", at: "2026-11-27T15:01:00.000Z", path: "/practice", s: 60 }),
    ev({ t: "view", at: "2026-11-27T15:01:01.000Z", path: "/practice/algebra-1/mixed" }),
    ev({ t: "time", at: "2026-11-27T15:02:01.000Z", path: "/practice/algebra-1/mixed", s: 60 }),
    ev({ t: "act", at: "2026-11-27T15:09:00.000Z", path: "/practice/algebra-1/mixed", x: "practice_round", d: "Slope: 8/10 right" }),
    ev({ t: "time", at: "2026-11-27T15:10:00.000Z", path: "/practice/algebra-1/mixed", s: 480 }),
    // Another account on another browser: not theirs.
    ev({ t: "view", at: "2026-11-27T16:00:00.000Z", v: "vid-2", u: "user-2", path: "/" }),
  ];

  test("splits visits, attributes time and actions to pages, and links pre-signup visits", () => {
    const mine = events.filter((e) => e.u === "user-1" || (!e.u && e.v === "vid-1"));
    const a = buildUserActivity(mine, { now: Date.parse("2026-11-28T12:00:00Z") });
    expect(a.sessionCount).toBe(2);
    expect(a.seconds).toBe(720);
    expect(a.pageViews).toBe(3);
    expect(a.firstSource).toBe("Instagram");
    const latest = a.sessions[0];
    expect(latest.signedIn).toBe(true);
    expect(latest.steps.map((s) => [s.path, s.seconds])).toEqual([
      ["/practice", 60],
      ["/practice/algebra-1/mixed", 540],
    ]);
    expect(latest.steps[0].actions[0].text).toContain("Mixed review");
    expect(latest.steps[1].actions[0].text).toBe("Finished a practice round: Slope: 8/10 right");
    expect(a.sessions[1].signedIn).toBe(false);
    expect(a.features.find((f) => f.key === "Practice rounds")?.n).toBe(1);
    expect(a.daily.at(-2)!.seconds).toBe(600);
  });

  test("summarizes each account, counting browsing from before they signed in", () => {
    const sum = summarizeByUser(events);
    expect(sum.get("user-1")).toMatchObject({ seconds: 720, views: 3, lastActive: "2026-11-27T15:10:00.000Z" });
    expect(sum.get("user-2")?.views).toBe(1);
    expect(duration(45)).toBe("45 sec");
    expect(duration(3900)).toBe("1 hr 5 min");
  });
});
