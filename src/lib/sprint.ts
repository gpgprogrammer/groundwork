import type { IndexedCatalog, RankedVideo } from "@/lib/catalog";
import type { Course, Sprint, Topic, Unit } from "@/lib/types";

/**
 * Exam Sprint engine: readiness from the diagnostic and practice, an estimated
 * score, and a day-by-day plan that adapts as answers come in.
 */

const DAY = 86400000;
const dayKey = (t: number) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const startOfDay = (t: number) => new Date(new Date(t).toDateString()).getTime();

export type UnitReadiness = { unit: Unit; weight: number; score: number; answered: number; correct: number; confidence: number | null };

/** Units weighted by how much of the course they cover (topic count). */
export function unitWeights(catalog: IndexedCatalog, courseId: string, unitIds?: string[]) {
  const all = catalog.unitsForCourse(courseId);
  const units = unitIds?.length ? all.filter((u) => unitIds.includes(u.id)) : all;
  const counts = units.map((u) => catalog.topicsForUnit(u.id).length || 1);
  const total = counts.reduce((a, b) => a + b, 0);
  return units.map((u, i) => ({ unit: u, weight: counts[i] / total }));
}

/** Per-topic accuracy with recent answers counting more. */
export function topicAccuracy(sprint: Sprint) {
  const out = new Map<string, { correct: number; total: number; lastWrong: string | null }>();
  const answers = [...sprint.answers].sort((a, b) => a.at.localeCompare(b.at));
  for (const a of answers) {
    const r = out.get(a.topicId) ?? { correct: 0, total: 0, lastWrong: null };
    // Exponential decay so recent practice outweighs the diagnostic.
    r.correct = r.correct * 0.85 + (a.correct ? 1 : 0);
    r.total = r.total * 0.85 + 1;
    if (!a.correct) r.lastWrong = a.at;
    out.set(a.topicId, r);
  }
  return out;
}

export function readiness(catalog: IndexedCatalog, sprint: Sprint): UnitReadiness[] {
  const acc = topicAccuracy(sprint);
  return unitWeights(catalog, sprint.courseId, sprint.unitIds).map(({ unit, weight }) => {
    const topics = catalog.topicsForUnit(unit.id);
    let c = 0;
    let n = 0;
    let rawCorrect = 0;
    let rawTotal = 0;
    for (const t of topics) {
      const r = acc.get(t.id);
      if (!r) continue;
      c += r.correct;
      n += r.total;
    }
    for (const a of sprint.answers) {
      if (topics.some((t) => t.id === a.topicId)) {
        rawTotal++;
        if (a.correct) rawCorrect++;
      }
    }
    const conf = sprint.confidence[unit.id] ?? null;
    // Prior from self-rated confidence (1–5), worth three answers.
    const prior = conf ? 0.2 + (conf - 1) * 0.15 : 0.4;
    const score = (c + prior * 3) / (n + 3);
    return { unit, weight, score, answered: rawTotal, correct: rawCorrect, confidence: conf };
  });
}

export function overall(r: UnitReadiness[]) {
  return r.reduce((s, u) => s + u.score * u.weight, 0);
}

/** An honest estimate: only a guide, based on accuracy on exam-style questions. */
export function estimatedScore(course: Course, r: UnitReadiness[]) {
  const x = overall(r);
  const answered = r.reduce((s, u) => s + u.answered, 0);
  if (course.exam === "SAT") {
    const v = Math.round((200 + 600 * Math.min(1, Math.max(0, (x - 0.15) / 0.8))) / 10) * 10;
    return { label: `${v}`, scale: "out of 800", confidence: answered >= 30 ? "good" : answered >= 10 ? "rough" : "early" };
  }
  const ap = x < 0.3 ? 1 : x < 0.45 ? 2 : x < 0.6 ? 3 : x < 0.75 ? 4 : 5;
  return { label: `${ap}`, scale: "AP score", confidence: answered >= 30 ? "good" : answered >= 10 ? "rough" : "early" };
}

export type SprintTask =
  | { id: string; kind: "learn"; topic: Topic; unit: Unit; videos: RankedVideo[]; minutes: number; why: string }
  | { id: string; kind: "practice"; topicIds: string[]; count: number; minutes: number; why: string }
  | { id: string; kind: "checkpoint"; count: number; minutes: number; why: string }
  | { id: string; kind: "cram"; unit: Unit; minutes: number; why: string }
  | { id: string; kind: "frq"; unit: Unit; minutes: number; why: string }
  | { id: string; kind: "rest"; minutes: number; why: string };

export type SprintDay = { date: string; index: number; daysLeft: number; tasks: SprintTask[]; minutes: number; phase: "build" | "review" | "final" };

function bestLessons(catalog: IndexedCatalog, topicId: string, budget: number) {
  const pool = catalog.videosForTopic(topicId).filter((v) => !v.isShort && v.durationSec > 90 && v.durationSec <= Math.max(budget, 12) * 60);
  return pool.slice(0, 1);
}

export function daysLeft(sprint: Pick<Sprint, "examDate">, now = Date.now()) {
  return Math.max(0, Math.round((startOfDay(new Date(`${sprint.examDate}T12:00:00`).getTime()) - startOfDay(now)) / DAY));
}

/**
 * The plan from today to exam day (up to 45 days shown). Weakest, heaviest units
 * first; every 7th day is a checkpoint; the last days switch to review.
 */
export function sprintPlan(catalog: IndexedCatalog, sprint: Sprint, now = Date.now(), maxDays = 45): SprintDay[] {
  const left = daysLeft(sprint, now);
  const n = Math.min(maxDays, Math.max(1, left));
  const r = readiness(catalog, sprint);
  const acc = topicAccuracy(sprint);
  const covered = new Set<string>();
  for (const [id, a] of acc) if (a.total >= 2 && a.correct / a.total >= 0.8) covered.add(id);

  // Topic queue: weakest units first (weighted by exam share), topics in course order within a unit.
  const queue: { topic: Topic; unit: Unit }[] = [];
  const units = [...r].sort((a, b) => (1 - b.score) * b.weight - (1 - a.score) * a.weight);
  for (const u of units) {
    for (const t of catalog.topicsForUnit(u.unit.id)) {
      if (!covered.has(t.id) && catalog.videosForTopic(t.id).length) queue.push({ topic: t, unit: u.unit });
    }
  }
  const missed = [...acc.entries()].filter(([, a]) => a.lastWrong).sort((a, b) => (b[1].lastWrong ?? "").localeCompare(a[1].lastWrong ?? "")).map(([id]) => id);

  const minutes = sprint.minutesPerDay;
  const days: SprintDay[] = [];
  let qi = 0;
  const start = startOfDay(now);
  for (let i = 0; i < n; i++) {
    const t = start + i * DAY;
    const date = dayKey(t);
    const dl = left - i;
    // Long runways end with a review phase; short ones (a class test this week) keep learning until the night before.
    const reviewCut = left >= 10 ? Math.max(3, Math.round(left * 0.15)) : 1;
    const phase: SprintDay["phase"] = dl <= 1 ? "final" : dl <= reviewCut ? "review" : "build";
    const what = sprint.kind === "test" ? "Test" : "Exam";
    const tasks: SprintTask[] = [];

    if (dl <= 0) {
      tasks.push({ id: `${date}:rest`, kind: "rest", minutes: 0, why: `${what} day. Eat breakfast, trust your prep.` });
    } else if (dl === 1) {
      const weakest = units[0]?.unit;
      if (weakest) tasks.push({ id: `${date}:cram:${weakest.id}`, kind: "cram", unit: weakest, minutes: 15, why: "Skim your weakest unit's cram sheet once. Then stop and sleep." });
      tasks.push({ id: `${date}:rest`, kind: "rest", minutes: 0, why: "Light night. A rested brain scores higher than a crammed one." });
    } else if (phase === "review") {
      const u = units[(n - i) % Math.max(1, Math.min(units.length, 4))]?.unit;
      if (u) tasks.push({ id: `${date}:cram:${u.id}`, kind: "cram", unit: u, minutes: 15, why: "Review the one-page summary for a high-weight unit" });
      tasks.push({ id: `${date}:checkpoint`, kind: "checkpoint", count: 10, minutes: Math.max(15, minutes - 15), why: sprint.kind === "test" ? "Mixed questions from every unit on the test" : "Mixed questions across the whole course, like the real exam" });
    } else if (i > 0 && i % 7 === 6) {
      tasks.push({ id: `${date}:checkpoint`, kind: "checkpoint", count: 12, minutes: Math.max(20, minutes - 10), why: "Weekly checkpoint: is the plan working?" });
      const u = units[0]?.unit;
      if (u && sprint.courseId && i % 14 === 13) tasks.push({ id: `${date}:frq:${u.id}`, kind: "frq", unit: u, minutes: 20, why: "Practice a free-response question and get feedback" });
    } else {
      // Build phase: learn one or two topics, then practice them plus a missed one.
      let budget = Math.round(minutes * 0.6);
      const today: string[] = [];
      // About one new topic per 45 minutes of study, and never fewer than two.
      while (qi < queue.length && budget >= 8 && today.length < Math.max(2, Math.floor(minutes / 45))) {
        const { topic, unit } = queue[qi++];
        const videos = bestLessons(catalog, topic.id, budget);
        const m = Math.max(8, Math.ceil(videos.reduce((s, v) => s + v.durationSec, 0) / 60) + 3);
        const ru = r.find((x) => x.unit.id === unit.id);
        tasks.push({
          id: `${date}:learn:${topic.id}`,
          kind: "learn",
          topic,
          unit,
          videos,
          minutes: m,
          why: ru && ru.score < 0.5 ? `Unit ${unit.order} is one of your weakest` : `Unit ${unit.order} is worth ${Math.round((ru?.weight ?? 0) * 100)}% of the course`,
        });
        today.push(topic.id);
        budget -= m;
      }
      const review = missed.filter((id) => !today.includes(id)).slice(i % 3, (i % 3) + 1);
      const topicIds = [...today, ...review];
      if (topicIds.length) {
        tasks.push({ id: `${date}:practice`, kind: "practice", topicIds, count: 6, minutes: 12, why: review.length ? "Today's topics plus one you missed before" : "Lock in today's topics" });
      } else if (!tasks.length) {
        tasks.push({ id: `${date}:checkpoint`, kind: "checkpoint", count: 10, minutes: 20, why: "You've covered every topic. Mixed practice keeps it sharp." });
      }
    }
    days.push({ date, index: i, daysLeft: dl, tasks, minutes: tasks.reduce((s, x) => s + x.minutes, 0), phase });
  }
  return days;
}

/** Topics to draw diagnostic questions from: one per unit (two for big units), spread out. */
export function diagnosticTopics(catalog: IndexedCatalog, courseId: string, max = 12, unitIds?: string[]) {
  const out: Topic[] = [];
  const units = unitWeights(catalog, courseId, unitIds).sort((a, b) => b.weight - a.weight);
  const scoped = Boolean(unitIds?.length);
  for (const { unit, weight } of units) {
    const ts = catalog.topicsForUnit(unit.id);
    if (!ts.length) continue;
    if (scoped) {
      // A class test covers few units: sample more topics from each.
      const step = Math.max(1, Math.floor(ts.length / 4));
      for (let k = 0; k < ts.length; k += step) out.push(ts[k]);
      continue;
    }
    out.push(ts[Math.floor(ts.length / 2)]);
    if (weight > 0.18 && ts.length > 2) out.push(ts[ts.length - 1]);
  }
  return out.slice(0, max);
}
