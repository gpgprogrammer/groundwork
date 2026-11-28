import type { IndexedCatalog } from "@/lib/catalog";
import { hasPractice } from "@/lib/mathgen";
import { recentAccuracy, type PracticeStats } from "@/lib/practice-stats";

/**
 * SAT Prep: a day-by-day plan from today to the student's SAT, built from where they are now
 * (section scores, questions right, or a domain breakdown from their score report) and the score
 * they want. Each day mixes Merit lessons and practice with the official free tools (Bluebook
 * practice tests, the College Board question bank, Khan Academy, Desmos). The plan rebuilds itself
 * whenever a new score is logged.
 */

export const SAT_COLLECTION = "satPrep";
const DAY = 86_400_000;

export type SatSection = "math" | "rw";
export type SatDomainId =
  | "algebra"
  | "advanced-math"
  | "problem-solving-data"
  | "geometry-trig"
  | "information-and-ideas"
  | "craft-and-structure"
  | "expression-of-ideas"
  | "standard-english-conventions";

/** The eight SAT domains with their share of each section (College Board test specifications). */
export const SAT_DOMAINS: { id: SatDomainId; section: SatSection; title: string; short: string; share: number; questions: string; courseId: string; qbank: string }[] = [
  { id: "algebra", section: "math", title: "Algebra", short: "Algebra", share: 0.35, questions: "13–15", courseId: "sat-math", qbank: "Algebra" },
  { id: "advanced-math", section: "math", title: "Advanced Math", short: "Advanced Math", share: 0.35, questions: "13–15", courseId: "sat-math", qbank: "Advanced Math" },
  { id: "problem-solving-data", section: "math", title: "Problem-Solving and Data Analysis", short: "Data Analysis", share: 0.15, questions: "5–7", courseId: "sat-math", qbank: "Problem-Solving and Data Analysis" },
  { id: "geometry-trig", section: "math", title: "Geometry and Trigonometry", short: "Geometry and Trig", share: 0.15, questions: "5–7", courseId: "sat-math", qbank: "Geometry and Trigonometry" },
  { id: "information-and-ideas", section: "rw", title: "Information and Ideas", short: "Information and Ideas", share: 0.26, questions: "12–14", courseId: "sat-reading-writing", qbank: "Information and Ideas" },
  { id: "craft-and-structure", section: "rw", title: "Craft and Structure", short: "Craft and Structure", share: 0.28, questions: "13–15", courseId: "sat-reading-writing", qbank: "Craft and Structure" },
  { id: "expression-of-ideas", section: "rw", title: "Expression of Ideas", short: "Expression of Ideas", share: 0.2, questions: "8–12", courseId: "sat-reading-writing", qbank: "Expression of Ideas" },
  { id: "standard-english-conventions", section: "rw", title: "Standard English Conventions", short: "Grammar (Conventions)", share: 0.26, questions: "11–15", courseId: "sat-reading-writing", qbank: "Standard English Conventions" },
];
export const domainById = (id: string) => SAT_DOMAINS.find((d) => d.id === id);

export const SECTION_QUESTIONS: Record<SatSection, number> = { math: 44, rw: 54 };
export const SECTION_NAME: Record<SatSection, string> = { math: "Math", rw: "Reading and Writing" };

/** Upcoming SAT dates for 2026–27 from the College Board (confirm on their site before registering). */
export const SAT_DATES: { date: string; register: string; late: string }[] = [
  { date: "2026-12-05", register: "2026-11-20", late: "2026-11-24" },
  { date: "2027-03-06", register: "2027-02-19", late: "2027-02-23" },
  { date: "2027-05-01", register: "2027-04-16", late: "2027-04-20" },
  { date: "2027-06-05", register: "2027-05-21", late: "2027-05-25" },
];

export const LINKS = {
  bluebook: "https://bluebook.collegeboard.org/",
  qbank: "https://satsuitequestionbank.collegeboard.org/",
  myPractice: "https://mypractice.collegeboard.org/",
  khan: "https://www.khanacademy.org/digital-sat",
  desmos: "https://www.desmos.com/calculator",
  dates: "https://satsuite.collegeboard.org/sat/dates-deadlines",
  practiceTests: "https://satsuite.collegeboard.org/practice/practice-tests",
  scores: "https://studentscores.collegeboard.org/",
  whatsOnTest: "https://satsuite.collegeboard.org/sat/whats-on-the-test",
};

export type ScoreEntry = {
  at: string;
  /** When the test was taken (YYYY-MM-DD), if different from when it was logged. */
  takenOn?: string;
  math: number | null;
  rw: number | null;
  source: "official" | "practice" | "estimate";
  /** Domain results from this test: mastery 0..1. */
  domains?: Partial<Record<SatDomainId, number>>;
};

export type SatPrep = {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  testDate: string;
  target: number;
  minutesPerDay: number;
  /** Study days per week (3–7); the others are rest days. */
  daysPerWeek: number;
  /** Newest last. The latest entry is where the student is now. */
  scores: ScoreEntry[];
  /** Domain mastery 0..1 the student entered or uploaded (latest wins per domain). */
  domains: Partial<Record<SatDomainId, number>>;
  done: Record<string, string>;
};

/* ------------------------------------------------------------- scores */

const clampScore = (n: number) => Math.min(800, Math.max(200, Math.round(n / 10) * 10));

// Approximate digital SAT conversion: share of questions right → section score.
const CURVE: [number, number][] = [
  [0, 200], [0.1, 250], [0.2, 310], [0.3, 370], [0.4, 430], [0.5, 480], [0.6, 530], [0.7, 590], [0.8, 650], [0.9, 720], [0.95, 760], [1, 800],
];
export function scoreFromPercent(p: number) {
  const x = Math.min(1, Math.max(0, p));
  for (let i = 1; i < CURVE.length; i++) {
    const [p1, s1] = CURVE[i];
    const [p0, s0] = CURVE[i - 1];
    if (x <= p1) return clampScore(s0 + ((x - p0) / (p1 - p0)) * (s1 - s0));
  }
  return 800;
}
export function percentFromScore(s: number) {
  const x = Math.min(800, Math.max(200, s));
  for (let i = 1; i < CURVE.length; i++) {
    const [p1, s1] = CURVE[i];
    const [p0, s0] = CURVE[i - 1];
    if (x <= s1) return p0 + ((x - s0) / (s1 - s0)) * (p1 - p0);
  }
  return 1;
}
/** A score report's 7-box performance band → mastery 0..1. */
export const bandToMastery = (band: number) => percentFromScore(200 + ((Math.min(7, Math.max(1, band)) - 0.5) * 600) / 7);

export function latestScore(p: Pick<SatPrep, "scores">) {
  const s = p.scores.at(-1);
  return { math: s?.math ?? null, rw: s?.rw ?? null, total: s?.math != null && s?.rw != null ? s.math + s.rw : null, entry: s ?? null };
}

/** Section targets: the points still needed, split toward the section with more room to grow. */
export function sectionTargets(p: SatPrep) {
  const { math, rw } = latestScore(p);
  const m = math ?? 500;
  const r = rw ?? 500;
  const gap = Math.max(0, p.target - (m + r));
  const roomM = 800 - m;
  const roomR = 800 - r;
  const wM = roomM + roomR > 0 ? roomM / (roomM + roomR) : 0.5;
  return { math: clampScore(m + gap * wM), rw: clampScore(r + gap * (1 - wM)), gap };
}

/**
 * How solid each domain is (0..1). Domain results the student gave win; otherwise the section score
 * stands in. Recent Merit practice on SAT Math topics nudges the math domains.
 */
export function domainMastery(p: SatPrep, catalog: IndexedCatalog | null, practice: PracticeStats | null) {
  const { math, rw } = latestScore(p);
  const out = {} as Record<SatDomainId, { mastery: number; from: "you" | "section" | "default"; practiced: number }>;
  for (const d of SAT_DOMAINS) {
    const section = d.section === "math" ? math : rw;
    const given = p.domains[d.id];
    let mastery = given ?? (section != null ? percentFromScore(section) : 0.5);
    let practiced = 0;
    if (catalog && practice) {
      const topics = catalog.topicsForUnit(`${d.courseId}/${d.id}`);
      let right = 0;
      let n = 0;
      for (const t of topics) {
        const tp = practice.topics[t.id];
        if (!tp?.recent.length) continue;
        right += recentAccuracy(tp) * tp.recent.length;
        n += tp.recent.length;
      }
      practiced = n;
      if (n >= 5) mastery = mastery * 0.65 + (right / n) * 0.35;
    }
    out[d.id] = { mastery, from: given != null ? "you" : section != null ? "section" : "default", practiced };
  }
  return out;
}

/* ------------------------------------------------------------- the plan */

export type SatTask = {
  id: string;
  kind: "learn" | "practice" | "qbank" | "drill" | "test" | "review" | "log" | "khan" | "desmos" | "checklist" | "rest" | "light";
  title: string;
  detail: string;
  minutes: number;
  href?: string;
  /** Who runs the page the task links to. */
  source: "Merit" | "College Board" | "Khan Academy" | "Desmos";
  domain?: SatDomainId;
};

export type SatDay = { date: string; daysLeft: number; tasks: SatTask[]; minutes: number; phase: "foundation" | "build" | "sharpen" | "final" | "rest" };

const isoDay = (t: number) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const startOfDay = (t: number) => new Date(new Date(t).toDateString()).getTime();
export const satDaysLeft = (testDate: string, now = Date.now()) => Math.max(0, Math.round((startOfDay(new Date(`${testDate}T12:00:00`).getTime()) - startOfDay(now)) / DAY));

/** Which weekdays are study days: rest days spread out, Sunday first. */
function restWeekdays(daysPerWeek: number) {
  const n = 7 - Math.min(7, Math.max(3, daysPerWeek));
  return new Set([0, 3, 5, 2].slice(0, n));
}

export function satPlan(p: SatPrep, catalog: IndexedCatalog, practice: PracticeStats | null, now = Date.now()): SatDay[] {
  const left = satDaysLeft(p.testDate, now);
  const total = Math.min(366, left + 1);
  const mastery = domainMastery(p, catalog, practice);
  const targets = sectionTargets(p);
  const { math, rw } = latestScore(p);
  const needM = Math.max(0, targets.math - (math ?? 500));
  const needR = Math.max(0, targets.rw - (rw ?? 500));
  // Each domain's priority: how much of the test it is × how much room is left × how far its section is from target.
  const priority = SAT_DOMAINS.map((d) => {
    const need = d.section === "math" ? needM : needR;
    return { d, w: d.share * (1 - mastery[d.id].mastery + 0.08) * (0.35 + need / 200) };
  }).sort((a, b) => b.w - a.w);
  const sumW = priority.reduce((s, x) => s + x.w, 0) || 1;

  // Topic queues per domain, in course order, skipping topics with no lessons.
  const queues = new Map<SatDomainId, { id: string; slug: string; title: string; courseSlug: string; videoId: string | null; videoTitle: string | null }[]>();
  for (const d of SAT_DOMAINS) {
    const course = catalog.course(d.courseId);
    if (!course) {
      queues.set(d.id, []);
      continue;
    }
    queues.set(
      d.id,
      catalog.topicsForUnit(`${d.courseId}/${d.id}`).map((t) => {
        const v = catalog.videosForTopic(t.id).find((x) => !x.isShort && x.durationSec > 120 && x.durationSec < 25 * 60) ?? null;
        return { id: t.id, slug: t.slug, title: t.title, courseSlug: course.slug, videoId: v?.id ?? null, videoTitle: v?.title ?? null };
      }),
    );
  }
  const cursor = new Map<SatDomainId, number>();
  const credit = new Map<SatDomainId, number>(SAT_DOMAINS.map((d) => [d.id, 0]));
  /** Weighted round robin: the domain owed the most study time goes next. */
  const nextDomain = (section?: SatSection) => {
    for (const { d, w } of priority) credit.set(d.id, credit.get(d.id)! + w / sumW);
    const pool = priority.filter((x) => !section || x.d.section === section);
    const best = pool.reduce((a, b) => (credit.get(b.d.id)! > credit.get(a.d.id)! ? b : a));
    credit.set(best.d.id, credit.get(best.d.id)! - 1);
    return best.d;
  };
  const nextTopic = (id: SatDomainId) => {
    const q = queues.get(id) ?? [];
    if (!q.length) return null;
    const i = cursor.get(id) ?? 0;
    cursor.set(id, i + 1);
    return q[i % q.length];
  };

  const rest = restWeekdays(p.daysPerWeek);
  const minutes = p.minutesPerDay;
  const hasBaseline = math != null && rw != null;
  const lastTestAt = p.scores.filter((s) => s.source !== "estimate").at(-1)?.takenOn ?? p.scores.filter((s) => s.source !== "estimate").at(-1)?.at.slice(0, 10) ?? null;
  const daysSinceTest = lastTestAt ? Math.round((startOfDay(now) - startOfDay(new Date(`${lastTestAt}T12:00:00`).getTime())) / DAY) : Infinity;
  // Full-length practice tests: one up front if there's no recent score, then every two weeks, weekly in the last month.
  const testDays = new Set<number>();
  if (left >= 4) {
    let i = !hasBaseline || daysSinceTest > 21 ? 0 : Math.max(0, 14 - daysSinceTest);
    // Full tests take 2+ hours, so they land on Saturdays (except a first test with no score yet, which is today).
    const toSaturday = (k: number) => {
      const wd = new Date(startOfDay(now) + k * DAY).getDay();
      return k + ((6 - wd + 7) % 7);
    };
    if (i > 0) i = toSaturday(i);
    while (i <= left - 3) {
      testDays.add(i);
      const step = left - i <= 30 ? 7 : 14;
      i = toSaturday(i + step);
    }
  }
  const sharpenFrom = left > 21 ? left - 14 : Math.max(0, left - Math.max(2, Math.round(left * 0.3)));
  const foundationUntil = left > 60 ? Math.round(left * 0.3) : 0;

  const days: SatDay[] = [];
  const start = startOfDay(now);
  let mathDrillToggle = 0;
  for (let i = 0; i < total; i++) {
    const t = start + i * DAY;
    const date = isoDay(t);
    const dl = left - i;
    const tasks: SatTask[] = [];
    const id = (k: string) => `${date}:${k}`;
    let phase: SatDay["phase"] = i < foundationUntil ? "foundation" : i >= sharpenFrom ? "sharpen" : "build";

    if (dl === 0) {
      phase = "final";
      tasks.push({ id: id("checklist"), kind: "checklist", title: "Test day", detail: "Eat breakfast, arrive 30+ minutes early, and open Bluebook to check in. Bring: admission ticket, photo ID, your charged device (and charger), an approved calculator if you want one, pencils. Breathe. You prepared for this.", minutes: 0, source: "Merit" });
    } else if (dl === 1) {
      phase = "final";
      tasks.push({ id: id("light"), kind: "light", title: "Light review only", detail: "Skim your list of mistakes and the formulas you missed. No new topics and no full test tonight.", minutes: 20, source: "Merit" });
      tasks.push({ id: id("checklist"), kind: "checklist", title: "Get ready for tomorrow", detail: "Open Bluebook, install any update, and complete exam setup so your admission ticket is ready. Charge your device, pack your photo ID and ticket, set two alarms, and go to bed early.", minutes: 15, href: LINKS.bluebook, source: "College Board" });
    } else if (dl === 2) {
      phase = "final";
      const d = nextDomain();
      tasks.push(...domainTasks(d, Math.min(minutes, 40), id, nextTopic, true));
      tasks.push({ id: id("desmos"), kind: "desmos", title: "Desmos warm-up", detail: "Graph two lines and find their intersection, then a parabola and its vertex. Knowing Desmos cold saves minutes on test day.", minutes: 10, href: LINKS.desmos, source: "Desmos" });
    } else if (testDays.has(i)) {
      tasks.push({
        id: id("test"),
        kind: "test",
        title: i === 0 && !hasBaseline ? "Take a full-length practice test (your starting point)" : "Full-length practice test",
        detail: "Take a full practice SAT in Bluebook in one sitting, timed, like the real thing: about 2 hours 14 minutes plus a 10-minute break. Use Desmos on the math. Then log your scores in Merit so your plan adjusts.",
        minutes: 145,
        href: LINKS.bluebook,
        source: "College Board",
      });
      tasks.push({ id: id("log"), kind: "log", title: "Log your scores here", detail: "Enter your Math and Reading and Writing scores, plus your results by domain from My Practice. Your plan rebuilds around them.", minutes: 5, href: "/sprint/sat#scores", source: "Merit" });
    } else if (testDays.has(i - 1)) {
      tasks.push({ id: id("review"), kind: "review", title: "Review every miss from your practice test", detail: "Open the test in My Practice. For each wrong or guessed question, write down why you missed it (didn't know it, misread, ran out of time). Your plan targets those domains next.", minutes: Math.min(Math.max(30, minutes), 60), href: LINKS.myPractice, source: "College Board" });
      if (minutes > 60) {
        const d = nextDomain();
        tasks.push(...domainTasks(d, minutes - 60, id, nextTopic, false));
      }
    } else if (rest.has(new Date(t).getDay()) && dl > 3) {
      phase = "rest";
      tasks.push({ id: id("rest"), kind: "rest", title: "Rest day", detail: "No SAT today. Rest is part of the plan: it's when practice sticks.", minutes: 0, source: "Merit" });
    } else {
      let budget = minutes;
      // Every study day touches the most-needed domain; longer days add a second, from the other section.
      const first = nextDomain();
      const firstBudget = budget >= 50 ? Math.round(budget * 0.6) : budget;
      tasks.push(...domainTasks(first, firstBudget, id, nextTopic, phase === "sharpen"));
      budget -= firstBudget;
      if (budget >= 15) {
        const other: SatSection = first.section === "math" ? "rw" : "math";
        const second = nextDomain(other);
        tasks.push(...domainTasks(second, budget, id, nextTopic, phase === "sharpen", "b"));
      }
      // Weekly in the sharpen phase: a timed mixed set, alternating sections.
      if (phase === "sharpen" && i % 4 === 0) {
        const section: SatSection = mathDrillToggle++ % 2 ? "rw" : "math";
        tasks.push(timedDrill(section, id, catalog));
      }
      if (phase === "foundation" && i % 9 === 4) {
        tasks.push({ id: id("khan"), kind: "khan", title: "Khan Academy: official Digital SAT course", detail: "Free official SAT practice from Khan Academy and the College Board. Work through a unit in your weakest domain.", minutes: 20, href: LINKS.khan, source: "Khan Academy" });
      }
    }
    days.push({ date, daysLeft: dl, tasks, minutes: tasks.reduce((s, x) => s + x.minutes, 0), phase });
  }
  return days;
}

type TopicRef = { id: string; slug: string; title: string; courseSlug: string; videoId: string | null; videoTitle: string | null };

/** A domain's tasks for one day: learn a topic on Merit, then practice it (Merit problems for math, the question bank for both). */
function domainTasks(d: (typeof SAT_DOMAINS)[number], budget: number, id: (k: string) => string, nextTopic: (id: SatDomainId) => TopicRef | null, sharpen: boolean, slot = "a"): SatTask[] {
  const out: SatTask[] = [];
  const topic = nextTopic(d.id);
  let left = budget;
  if (topic && !sharpen && left >= 25) {
    const m = 12;
    out.push({
      id: id(`learn-${slot}:${topic.id}`),
      kind: "learn",
      title: `Learn: ${topic.title}`,
      detail: topic.videoTitle ? `${d.title}. Watch "${topic.videoTitle}" and the topic notes on Merit.` : `${d.title}. Watch the top-ranked lesson and the topic notes on Merit.`,
      minutes: m,
      href: `/courses/${topic.courseSlug}/${topic.slug}`,
      source: "Merit",
      domain: d.id,
    });
    left -= m;
  }
  if (topic && d.section === "math" && hasPractice(topic.id) && left >= 10) {
    const m = Math.min(left, sharpen ? 20 : 15);
    out.push({ id: id(`practice-${slot}:${topic.id}`), kind: "practice", title: `Practice: ${topic.title}`, detail: "A round of 10 fresh problems with step-by-step solutions. Aim for 8 of 10 before moving on.", minutes: m, href: `/practice/sat-math/${topic.slug}`, source: "Merit", domain: d.id });
    left -= m;
  }
  if (left >= 10) {
    const n = Math.max(5, Math.min(20, Math.round(left / (d.section === "math" ? 1.6 : 1.2))));
    out.push({
      id: id(`qbank-${slot}:${d.id}`),
      kind: "qbank",
      title: `Official questions: ${d.short}`,
      detail: `In the SAT Suite Question Bank choose SAT → ${SECTION_NAME[d.section]} → ${d.qbank}${topic ? ` (skill: ${topic.title})` : ""}. Do ${n} ${sharpen ? "Hard" : "Medium and Hard"} questions and read the explanation for every miss.`,
      minutes: left,
      href: LINKS.qbank,
      source: "College Board",
      domain: d.id,
    });
  }
  return out;
}

function timedDrill(section: SatSection, id: (k: string) => string, catalog: IndexedCatalog): SatTask {
  if (section === "math") {
    const topics = SAT_DOMAINS.filter((d) => d.section === "math")
      .flatMap((d) => catalog.topicsForUnit(`sat-math/${d.id}`).filter((t) => hasPractice(t.id)).slice(0, 2))
      .map((t) => t.id)
      .slice(0, 8);
    return { id: id("drill:math"), kind: "drill", title: "Timed mixed Math drill", detail: "10 mixed SAT Math problems against the clock. The real pace is about 1 minute 35 seconds a question.", minutes: 20, href: `/practice/sat-math/mixed?topics=${topics.join(",")}&timed=1`, source: "Merit" };
  }
  return { id: id("drill:rw"), kind: "drill", title: "Timed Reading and Writing set", detail: "In the Question Bank, pick all four Reading and Writing domains and do 27 questions in 32 minutes, the length of one real module.", minutes: 35, href: LINKS.qbank, source: "College Board" };
}

/* ------------------------------------------------------------- score report parsing */

export type ParsedReport = { math: number | null; rw: number | null; total: number | null; domains: Partial<Record<SatDomainId, { right: number; of: number }>>; found: string[] };

/**
 * Pulls scores out of the text of a score report or results page (pasted, or extracted from a PDF).
 * Finds the section scores and, where present, "x of y" or "x/y" results for each domain.
 */
export function parseScoreText(raw: string): ParsedReport {
  const text = raw.replace(/\s+/g, " ");
  const found: string[] = [];
  const num = (re: RegExp) => {
    const m = text.match(re);
    if (!m) return null;
    const n = Number(m[1]);
    return n >= 200 && n <= 800 && n % 10 === 0 ? n : null;
  };
  const rw = num(/reading\s*(?:and|&)\s*writing(?:\s*(?:section\s*)?score)?\s*[:\-–]?\s*(\d{3})\b/i) ?? num(/\bR\s*&\s*W\s*[:\-–]?\s*(\d{3})\b/i) ?? num(/\bERW\s*[:\-–]?\s*(\d{3})\b/i);
  const math = num(/\bmath(?:\s*(?:section\s*)?score)?\s*[:\-–]?\s*(\d{3})\b/i);
  const totalM = text.match(/total\s*(?:sat\s*)?score\s*[:\-–]?\s*(\d{3,4})\b/i);
  const total = totalM && Number(totalM[1]) >= 400 && Number(totalM[1]) <= 1600 ? Number(totalM[1]) : math != null && rw != null ? math + rw : null;
  if (math != null) found.push(`Math ${math}`);
  if (rw != null) found.push(`Reading and Writing ${rw}`);
  if (total != null && (math == null || rw == null)) found.push(`Total ${total}`);
  const domains: ParsedReport["domains"] = {};
  for (const d of SAT_DOMAINS) {
    const name = d.title.replace(/ and /g, "\\s*(?:and|&)\\s*");
    const m = text.match(new RegExp(`${name}[^0-9]{0,60}?(\\d{1,2})\\s*(?:/|of|out of)\\s*(\\d{1,2})\\b`, "i"));
    if (m) {
      const right = Number(m[1]);
      const of = Number(m[2]);
      if (of > 0 && right <= of && of <= 30) {
        domains[d.id] = { right, of };
        found.push(`${d.title} ${right}/${of}`);
      }
    }
  }
  return { math, rw, total, domains, found };
}
