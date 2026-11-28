import type { AnalyticsEvent } from "@/lib/analytics";
import { ANALYTICS_TZ, dayKey, dayKeys, sourceOf } from "@/lib/analytics-report";

/**
 * One person's activity on Merit, for /admin/users/[id]: every visit (session) with the pages they
 * opened, how long they spent on each, and what they did there, plus totals and a daily chart.
 * Includes what they did before signing in on the same browser (linked by the visitor cookie).
 */

const SESSION_GAP = 30 * 60_000;

export type Action = { at: string; kind: string; text: string };
export type Step = { at: string; path: string; seconds: number; actions: Action[]; signedIn: boolean };
export type Session = { start: string; end: string; seconds: number; device: string | null; source: string; country: string | null; steps: Step[]; signedIn: boolean };
export type UserActivity = ReturnType<typeof buildUserActivity>;

type Describe = { video?: (id: string) => string | null };

/** A sentence for an event that isn't a page view. */
export function describe(e: AnalyticsEvent, opts: Describe = {}): string | null {
  switch (e.t) {
    case "act": {
      const d = e.d ?? "";
      switch (e.x) {
        case "click":
          return `Clicked “${d}”`;
        case "practice_round":
          return `Finished a practice round: ${d}`;
        case "quick_check":
          return `Quick check: ${d}`;
        case "sprint_created":
          return `Started an Exam Sprint: ${d}`;
        case "sprint_session":
          return `Finished a Sprint session (${d})`;
        case "sat_prep_created":
          return `Built an SAT plan: ${d}`;
        case "sat_prep_updated":
          return `Changed their SAT plan: ${d}`;
        case "sat_score_logged":
          return `Logged an SAT score: ${d}`;
        case "sat_task_done":
          return `Checked off an SAT task: ${d}`;
        case "sat_task_undone":
          return `Unchecked an SAT task: ${d}`;
        default:
          return `${(e.x ?? "action").replace(/_/g, " ")}${d ? `: ${d}` : ""}`;
      }
    }
    case "video_open": {
      const title = e.x ? opts.video?.(e.x) : null;
      return title ? `Opened lesson “${title}”` : "Opened a lesson";
    }
    case "upload_play":
      return "Played a Merit video";
    case "ai_question":
      return "Asked Merit AI a question";
    case "calendar_connect":
      return `Connected a calendar${e.x ? ` (${e.x})` : ""}`;
    case "checkout":
      return `Opened checkout${e.x ? ` for ${e.x}` : ""}`;
    case "cta":
      return `Clicked ${e.x ?? "a button"}`;
    default:
      return null;
  }
}

/** The kind of thing an action is, for the "what they used" tally. */
export function featureOf(e: AnalyticsEvent): string | null {
  if (e.t === "video_open") return "Lessons opened";
  if (e.t === "ai_question") return "Merit AI questions";
  if (e.t === "calendar_connect") return "Calendars connected";
  if (e.t === "upload_play") return "Merit videos played";
  if (e.t !== "act") return null;
  switch (e.x) {
    case "practice_round":
      return "Practice rounds";
    case "quick_check":
      return "Quick checks";
    case "sprint_created":
      return "Exam Sprints started";
    case "sprint_session":
      return "Sprint sessions";
    case "sat_prep_created":
    case "sat_prep_updated":
      return "SAT plan changes";
    case "sat_score_logged":
      return "SAT scores logged";
    case "sat_task_done":
      return "SAT tasks done";
    case "click":
      return "Clicks";
    default:
      return null;
  }
}

export function buildUserActivity(events: AnalyticsEvent[], opts: Describe & { now?: number; days?: number; tz?: string } = {}) {
  const now = opts.now ?? Date.now();
  const tz = opts.tz ?? ANALYTICS_TZ;
  const evs = [...events].sort((a, b) => a.at.localeCompare(b.at));

  const sessions: Session[] = [];
  let cur: Session | null = null;
  let lastAt = 0;
  for (const e of evs) {
    const t = Date.parse(e.at);
    if (!cur || t - lastAt > SESSION_GAP) {
      cur = { start: e.at, end: e.at, seconds: 0, device: e.dev ?? null, source: "Direct", country: e.c ?? null, steps: [], signedIn: false };
      sessions.push(cur);
    }
    lastAt = t;
    cur.end = e.at;
    if (e.u) cur.signedIn = true;
    if (e.t === "view") {
      if (!cur.steps.length) cur.source = sourceOf(e);
      cur.steps.push({ at: e.at, path: e.path ?? "/", seconds: 0, actions: [], signedIn: Boolean(e.u) });
      continue;
    }
    if (e.t === "engage") continue;
    // Time and actions belong to the most recent visit to that page in this session (or the latest page).
    const step = [...cur.steps].reverse().find((s) => !e.path || s.path === e.path) ?? cur.steps.at(-1);
    if (e.t === "time") {
      const s = e.s ?? 0;
      cur.seconds += s;
      if (step) step.seconds += s;
      continue;
    }
    const text = describe(e, opts);
    if (!text) continue;
    const action = { at: e.at, kind: e.x ?? e.t, text };
    if (step) step.actions.push(action);
    else cur.steps.push({ at: e.at, path: e.path ?? "(server)", seconds: 0, actions: [action], signedIn: Boolean(e.u) });
  }

  const views = evs.filter((e) => e.t === "view");
  const seconds = sessions.reduce((s, x) => s + x.seconds, 0);
  const activeDaySet = new Set(evs.filter((e) => e.t !== "view" || e.u).map((e) => dayKey(Date.parse(e.at), tz)));

  // Daily chart: active minutes and page views for the last N days.
  const n = opts.days ?? 30;
  const keys = dayKeys(now, n, 0, tz);
  const perDay = new Map(keys.map((k) => [k, { day: k, seconds: 0, views: 0 }]));
  for (const e of evs) {
    const row = perDay.get(dayKey(Date.parse(e.at), tz));
    if (!row) continue;
    if (e.t === "time") row.seconds += e.s ?? 0;
    if (e.t === "view") row.views++;
  }

  // Pages: where their time went.
  const pages = new Map<string, { path: string; views: number; seconds: number; last: string }>();
  for (const s of sessions)
    for (const st of s.steps) {
      if (st.path === "(server)") continue;
      const p = pages.get(st.path) ?? { path: st.path, views: 0, seconds: 0, last: st.at };
      p.views++;
      p.seconds += st.seconds;
      if (st.at > p.last) p.last = st.at;
      pages.set(st.path, p);
    }

  const features = new Map<string, number>();
  for (const e of evs) {
    const f = featureOf(e);
    if (f) features.set(f, (features.get(f) ?? 0) + 1);
  }
  const devices = new Map<string, number>();
  for (const s of sessions) if (s.device) devices.set(s.device, (devices.get(s.device) ?? 0) + 1);
  const firstSignedIn = evs.find((e) => e.u)?.at ?? null;

  return {
    firstSeen: evs[0]?.at ?? null,
    lastSeen: evs.at(-1)?.at ?? null,
    firstSignedIn,
    firstSource: sessions[0]?.source ?? null,
    seconds,
    pageViews: views.length,
    activeDays: activeDaySet.size,
    sessionCount: sessions.length,
    avgSessionSeconds: sessions.length ? Math.round(seconds / sessions.length) : 0,
    daily: [...perDay.values()],
    pages: [...pages.values()].sort((a, b) => b.seconds - a.seconds || b.views - a.views),
    features: [...features.entries()].map(([key, n]) => ({ key, n })).sort((a, b) => b.n - a.n),
    devices: [...devices.entries()].map(([key, n]) => ({ key, n })).sort((a, b) => b.n - a.n),
    /** Newest first. */
    sessions: sessions.reverse(),
  };
}

/** Quick totals per account for the Users table: last active, active time, days active, page views. */
export function summarizeByUser(events: AnalyticsEvent[], tz = ANALYTICS_TZ) {
  // Visits made before signing in on the same browser count for the person who later signed in.
  const owner = new Map<string, string>();
  for (const e of events) if (e.u && e.v && !e.v.startsWith("user:")) owner.set(e.v, e.u);
  const out = new Map<string, { lastActive: string; seconds: number; days: Set<string>; views: number }>();
  for (const e of events) {
    const u = e.u ?? owner.get(e.v);
    if (!u) continue;
    const row = out.get(u) ?? { lastActive: e.at, seconds: 0, days: new Set<string>(), views: 0 };
    if (e.at > row.lastActive) row.lastActive = e.at;
    if (e.t === "time") row.seconds += e.s ?? 0;
    if (e.t === "view") row.views++;
    if (e.t !== "view" || e.u) row.days.add(dayKey(Date.parse(e.at), tz));
    out.set(u, row);
  }
  return new Map([...out].map(([u, r]) => [u, { lastActive: r.lastActive, seconds: r.seconds, days: r.days.size, views: r.views }]));
}

/** "1 hr 5 min", "12 min", "40 sec". */
export function duration(seconds: number) {
  const s = Math.round(seconds);
  if (s < 60) return `${s} sec`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  return `${h} hr${m % 60 ? ` ${m % 60} min` : ""}`;
}
