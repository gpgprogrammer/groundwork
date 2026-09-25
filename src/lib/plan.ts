import type { IndexedCatalog, RankedVideo } from "@/lib/catalog";
import { nextTopicInCourse, upcomingEvents } from "@/lib/recommend";
import type { Course, ScheduleEvent, Topic, UserState } from "@/lib/types";

/** Plus: the adaptive study plan. Turns calendar, exam date, and mastery into what to do each day. */

export type PlanPrefs = {
  minutesPerDay: number;
  /** Hour (0–23, local time) for calendar reminders. */
  reminderHour: number;
  /** Days of the week to plan (0 = Sunday). */
  studyDays: number[];
  /** Secret for the private reminders calendar feed. */
  feedToken: string;
};

export const DEFAULT_PREFS: Omit<PlanPrefs, "feedToken"> = { minutesPerDay: 45, reminderHour: 19, studyDays: [0, 1, 2, 3, 4, 5, 6] };

export type TaskKind = "test" | "class" | "next" | "review";

export type PlanTask = {
  id: string;
  kind: TaskKind;
  topic: Topic;
  course: Course;
  reason: string;
  videos: RankedVideo[];
  minutes: number;
};

export type PlanDay = { date: string; tasks: PlanTask[]; minutes: number; events: ScheduleEvent[]; rest: boolean };

const DAY = 86400000;
const dayKey = (t: number) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const startOfDay = (t: number) => new Date(new Date(t).toDateString()).getTime();

/** Picks the best one or two lessons for a topic that fit the time left. */
function lessonsFor(catalog: IndexedCatalog, state: UserState, topicId: string, budget: number, deep: boolean) {
  const pool = catalog.videosForTopic(topicId).filter((v) => !v.isShort && v.durationSec > 60);
  const unseen = pool.filter((v) => !state.history[v.id]);
  const ordered = [...unseen, ...pool.filter((v) => state.history[v.id])];
  const picked: RankedVideo[] = [];
  let used = 0;
  for (const v of ordered) {
    const m = Math.ceil(v.durationSec / 60);
    if (m > Math.max(budget, 25) && picked.length) continue;
    if (m > 45) continue;
    picked.push(v);
    used += m;
    if (picked.length >= (deep ? 2 : 1) || used >= budget) break;
  }
  return { videos: picked, minutes: Math.max(10, used + 5) }; // +5 for notes and a quick self-check
}

export function buildPlan(catalog: IndexedCatalog, state: UserState, prefs: Pick<PlanPrefs, "minutesPerDay" | "studyDays">, days = 7, now = Date.now()): PlanDay[] {
  const today = startOfDay(now);
  const courseIds = state.profile.courseIds.filter((id) => catalog.course(id));
  const events = upcomingEvents(state, days + 14, now);
  const lastPlanned = new Map<string, number>(); // topicId -> day index
  const nextPointer = new Map<string, Topic | undefined>();
  const planned = new Set<string>();
  const out: PlanDay[] = [];

  // Spaced review: topics understood 6+ days ago, oldest first.
  const reviewQueue = Object.entries(state.mastered)
    .filter(([, at]) => now - new Date(at).getTime() > 6 * DAY)
    .sort((a, b) => a[1].localeCompare(b[1]))
    .map(([id]) => catalog.topic(id))
    .filter((t): t is Topic => Boolean(t && catalog.videosForTopic(t.id).length));

  for (let i = 0; i < days; i++) {
    const dayStart = today + i * DAY;
    const date = dayKey(dayStart);
    const dayEvents = events.filter((e) => dayKey(new Date(e.start).getTime()) === date);
    const rest = !prefs.studyDays.includes(new Date(dayStart).getDay());
    const tasks: PlanTask[] = [];
    let budget = rest ? 0 : prefs.minutesPerDay;

    type Cand = { topic: Topic; kind: TaskKind; reason: string; priority: number; deep: boolean };
    const cands: Cand[] = [];

    // 1. Tests and assignments in the next few days.
    for (const e of events) {
      const until = Math.round((startOfDay(new Date(e.start).getTime()) - dayStart) / DAY);
      if (until < 0 || until > (e.kind === "test" ? 4 : 2)) continue;
      const topicIds = e.topicIds.length ? e.topicIds : [];
      const label = e.title.length > 40 ? `${e.title.slice(0, 38)}…` : e.title;
      for (const id of topicIds) {
        const t = catalog.topic(id);
        if (!t || state.mastered[id]) continue;
        const when = until === 0 ? "today" : until === 1 ? "tomorrow" : `in ${until} days`;
        cands.push({ topic: t, kind: "test", reason: `${e.kind === "test" ? "Test" : "Due"} ${when}: ${label}`, priority: 100 - until * 10, deep: e.kind === "test" });
      }
    }
    // 2. What the student says they're covering in class.
    for (const id of state.profile.focusTopicIds) {
      const t = catalog.topic(id);
      if (t && !state.mastered[id]) cands.push({ topic: t, kind: "class", reason: "You're covering this in class", priority: 60, deep: false });
    }
    // 3. The next topic in each course, advancing through the course as days fill.
    for (const courseId of courseIds) {
      if (!nextPointer.has(courseId)) nextPointer.set(courseId, nextTopicInCourse(catalog, state, courseId));
      const t = nextPointer.get(courseId);
      if (t) cands.push({ topic: t, kind: "next", reason: `Next in ${catalog.course(courseId)!.shortTitle}`, priority: 40, deep: false });
    }
    // 4. One spaced review per day.
    const review = reviewQueue.find((t) => !planned.has(`review:${t.id}`));
    if (review) cands.push({ topic: review, kind: "review", reason: "Quick review so it sticks", priority: 25, deep: false });

    cands.sort((a, b) => b.priority - a.priority);
    for (const c of cands) {
      if (budget < 8) break;
      const last = lastPlanned.get(c.topic.id);
      if (last !== undefined && i - last < (c.kind === "test" ? 1 : 3)) continue;
      if (tasks.some((t) => t.topic.id === c.topic.id)) continue;
      const course = catalog.course(c.topic.courseId);
      if (!course) continue;
      const { videos, minutes } = lessonsFor(catalog, state, c.topic.id, budget, c.deep);
      if (!videos.length) continue;
      tasks.push({ id: `${date}:${c.topic.id}`, kind: c.kind, topic: c.topic, course, reason: c.reason, videos, minutes });
      budget -= minutes;
      lastPlanned.set(c.topic.id, i);
      if (c.kind === "review") planned.add(`review:${c.topic.id}`);
      if (c.kind === "next") {
        // Advance this course to the topic after this one.
        const list = catalog.topicsForCourse(c.topic.courseId).filter((t) => catalog.videosForTopic(t.id).length && !state.mastered[t.id]);
        nextPointer.set(c.topic.courseId, list[list.findIndex((t) => t.id === c.topic.id) + 1]);
      }
    }
    // Lots of time left? Keep moving through each course until it's used.
    for (let round = 0; round < 8 && budget >= 8; round++) {
      let added = false;
      for (const courseId of courseIds) {
        if (budget < 8) break;
        const t = nextPointer.get(courseId);
        if (!t || tasks.some((x) => x.topic.id === t.id)) continue;
        const course = catalog.course(courseId)!;
        const { videos, minutes } = lessonsFor(catalog, state, t.id, budget, false);
        const list = catalog.topicsForCourse(courseId).filter((x) => catalog.videosForTopic(x.id).length && !state.mastered[x.id]);
        nextPointer.set(courseId, list[list.findIndex((x) => x.id === t.id) + 1]);
        if (!videos.length) continue;
        tasks.push({ id: `${date}:${t.id}`, kind: "next", topic: t, course, reason: `Next in ${course.shortTitle}`, videos, minutes });
        budget -= minutes;
        lastPlanned.set(t.id, i);
        added = true;
      }
      if (!added) break;
    }
    out.push({ date, tasks, minutes: tasks.reduce((s, t) => s + t.minutes, 0), events: dayEvents, rest });
  }
  return out;
}

export function dayLabel(date: string, now = Date.now()) {
  const d = new Date(`${date}T12:00:00`);
  const diff = Math.round((startOfDay(d.getTime()) - startOfDay(now)) / DAY);
  if (diff === 0) return "Tonight";
  if (diff === 1) return "Tomorrow";
  return d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
}

/** A private iCalendar feed of study sessions and test-eve reminders. */
export function planToIcs(plan: PlanDay[], prefs: PlanPrefs, appUrl: string) {
  const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Merit Learning//Study plan//EN", "CALSCALE:GREGORIAN", "X-WR-CALNAME:Merit study plan", "REFRESH-INTERVAL;VALUE=DURATION:PT6H"];
  for (const d of plan) {
    if (!d.tasks.length) continue;
    const ymd = d.date.replace(/-/g, "");
    const hm = (mins: number) => `${String(Math.floor(mins / 60)).padStart(2, "0")}${String(mins % 60).padStart(2, "0")}00`;
    const start = prefs.reminderHour * 60;
    const end = Math.min(23 * 60 + 59, start + d.minutes);
    const summary = `Study: ${d.tasks.map((t) => t.topic.title).slice(0, 3).join(", ")}${d.tasks.length > 3 ? "…" : ""}`;
    const body = d.tasks.map((t) => `• ${t.course.shortTitle}: ${t.topic.title} (${t.minutes} min) — ${t.reason}`).join("\n");
    lines.push(
      "BEGIN:VEVENT",
      `UID:merit-plan-${ymd}@merit`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${ymd}T${hm(start)}`,
      `DTEND:${ymd}T${hm(end)}`,
      `SUMMARY:${esc(summary)}`,
      `DESCRIPTION:${esc(`${body}\n\nOpen your plan: ${appUrl}/plan`)}`,
      `URL:${appUrl}/plan`,
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:${esc(summary)}`,
      "TRIGGER:-PT10M",
      "END:VALARM",
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.map((l) => (l.length > 74 ? l.match(/.{1,74}/g)!.join("\r\n ") : l)).join("\r\n");
}
