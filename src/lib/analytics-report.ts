import type { AnalyticsEvent } from "@/lib/analytics";

/**
 * Turns raw first-party events into the numbers on /admin/analytics.
 *
 * Three rules keep the numbers honest:
 * 1. Only people count. A visitor is a person when they interacted with a page ("engage"), were
 *    signed in, or came back for a second page with the same cookie. Bots that load one page and
 *    leave (most of the junk traffic) are reported separately under "Filtered out".
 * 2. The team doesn't count. Every event from a visitor cookie that was ever signed in as a team
 *    account is left out, including the visits made while signed out.
 * 3. Days are calendar days in the site's time zone, and each number is compared with the
 *    period of the same length just before it.
 */

const DAY = 86_400_000;
const SESSION_GAP = 30 * 60_000;
export const ANALYTICS_TZ = "America/New_York";

export type Count = { key: string; n: number };
export type Member = { id: string; at: string; email: string | null; type: "student" | "teacher" | null };

type Options = { days: number; now?: number; team: Set<string>; members: Member[]; includeTeam?: boolean; tz?: string };

const dayFmt = (tz: string) => new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" });
const hourFmt = (tz: string) => new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", hourCycle: "h23" });

/** "2026-11-28" for a timestamp, in the time zone. */
export function dayKey(ms: number, tz = ANALYTICS_TZ) {
  return dayFmt(tz).format(new Date(ms));
}

/** The `n` calendar days ending `offset` days before today, oldest first. */
export function dayKeys(now: number, n: number, offset = 0, tz = ANALYTICS_TZ) {
  const [y, m, d] = dayKey(now, tz).split("-").map(Number);
  return Array.from({ length: n }, (_, i) => new Date(Date.UTC(y, m - 1, d - offset - (n - 1 - i))).toISOString().slice(0, 10));
}

function tally(values: Iterable<string | undefined | null>) {
  const m = new Map<string, number>();
  for (const v of values) if (v) m.set(v, (m.get(v) ?? 0) + 1);
  return m;
}
const ranked = (m: Map<string, number>, limit = 10): Count[] => [...m.entries()].map(([key, n]) => ({ key, n })).sort((a, b) => b.n - a.n || a.key.localeCompare(b.key)).slice(0, limit);

/** How a visit was found: a campaign tag beats the referring site; nothing means direct (typed, bookmarked, or an app that hides it). */
export function sourceOf(e: AnalyticsEvent | undefined) {
  if (!e) return "Direct";
  if (e.src) return friendlySource(e.src);
  if (e.ref) return friendlySource(e.ref);
  return "Direct";
}

const SOURCES: [RegExp, string][] = [
  [/(^|\.)instagram\.com$|^ig$|^instagram$/, "Instagram"],
  [/(^|\.)tiktok\.com$|^tiktok$/, "TikTok"],
  [/(^|\.)(facebook|fb)\.com$|^facebook$|^fb$/, "Facebook"],
  [/(^|\.)reddit\.com$|^reddit$/, "Reddit"],
  [/(^|\.)(youtube\.com|youtu\.be)$|^youtube$/, "YouTube"],
  [/(^|\.)(t\.co|twitter\.com|x\.com)$|^twitter$|^x$/, "X / Twitter"],
  [/(^|\.)google\.[a-z.]+$|^google$/, "Google"],
  [/(^|\.)bing\.com$|^bing$/, "Bing"],
  [/(^|\.)duckduckgo\.com$/, "DuckDuckGo"],
  [/(^|\.)yahoo\.com$/, "Yahoo"],
  [/(^|\.)linkedin\.com$|^lnkd\.in$|^linkedin$/, "LinkedIn"],
  [/(^|\.)snapchat\.com$|^snapchat$/, "Snapchat"],
  [/(^|\.)discord(app)?\.com$|^discord$/, "Discord"],
  [/chatgpt\.com$|openai\.com$|perplexity\.ai$|claude\.ai$|gemini\.google\.com$/, "AI assistants"],
  [/(^|\.)(classroom\.google\.com|schoology\.com|instructure\.com|canvas)/, "School LMS"],
];
export function friendlySource(raw: string) {
  const s = raw.toLowerCase();
  for (const [re, name] of SOURCES) if (re.test(s)) return name;
  return s;
}

export type Report = ReturnType<typeof buildReport>;

export function buildReport(events: AnalyticsEvent[], o: Options) {
  const now = o.now ?? Date.now();
  const tz = o.tz ?? ANALYTICS_TZ;
  const day = (iso: string) => dayKey(Date.parse(iso), tz);
  const curKeys = dayKeys(now, o.days, 0, tz);
  const prevKeys = dayKeys(now, o.days, o.days, tz);
  const cur = new Set(curKeys);
  const prev = new Set(prevKeys);

  // ---- who is who, judged over everything loaded (both periods)
  const byVisitor = new Map<string, AnalyticsEvent[]>();
  for (const e of events) {
    if (!e.v || e.v === "server") continue;
    let list = byVisitor.get(e.v);
    if (!list) byVisitor.set(e.v, (list = []));
    list.push(e);
  }
  const teamVisitors = new Set<string>();
  const people = new Set<string>();
  const userOf = new Map<string, string>(); // visitor → member id
  for (const [v, list] of byVisitor) {
    let views = 0;
    let human = false;
    for (const e of list) {
      if (e.u) {
        userOf.set(v, e.u);
        human = true;
        if (o.team.has(e.u)) teamVisitors.add(v);
      }
      if (e.t === "engage" || e.t === "time") human = true;
      if (e.t === "view") views++;
      // Server-side events (lesson opens, AI questions) only exist when the browser kept our cookie.
      if (e.t !== "view" && e.t !== "engage" && e.t !== "time" && e.t !== "cta" && e.t !== "upload_play") human = true;
    }
    if (views >= 2) human = true;
    if (human) people.add(v);
  }
  const countable = (e: AnalyticsEvent) => people.has(e.v) && (o.includeTeam || (!teamVisitors.has(e.v) && !(e.u && o.team.has(e.u))));

  const inCur = events.filter((e) => cur.has(day(e.at)));
  const inPrev = events.filter((e) => prev.has(day(e.at)));
  const good = inCur.filter(countable);
  const goodPrev = inPrev.filter(countable);

  const members = o.members.filter((m) => o.includeTeam || !o.team.has(m.id));
  const joined = members.filter((m) => cur.has(day(m.at)));
  const joinedPrev = members.filter((m) => prev.has(day(m.at)));

  const core = (list: AnalyticsEvent[], signups: number) => {
    const views = list.filter((e) => e.t === "view");
    const visitors = new Set(views.map((e) => e.v));
    for (const e of list) if (e.t === "engage") visitors.add(e.v);
    const visitDays = new Map<string, Set<string>>();
    for (const e of views) {
      let s = visitDays.get(e.v);
      if (!s) visitDays.set(e.v, (s = new Set()));
      s.add(day(e.at));
    }
    const returning = [...visitDays.values()].filter((s) => s.size >= 2).length;
    const sessions = sessionize(views);
    const timeByVisitor = new Map<string, number>();
    for (const e of list) if (e.t === "time" && e.s) timeByVisitor.set(e.v, (timeByVisitor.get(e.v) ?? 0) + e.s);
    const timed = [...timeByVisitor.values()];
    const members = new Set(list.filter((e) => e.u).map((e) => e.u!));
    return {
      visitors: visitors.size,
      views: views.length,
      sessions: sessions.length,
      bounceRate: sessions.length ? sessions.filter((s) => s.views.length === 1).length / sessions.length : 0,
      pagesPerSession: sessions.length ? views.length / sessions.length : 0,
      returning,
      activeMembers: members.size,
      signups,
      signupRate: visitors.size ? signups / visitors.size : 0,
      avgTime: timed.length ? timed.reduce((a, b) => a + b, 0) / timed.length : null,
      timedVisitors: timed.length,
    };
  };
  const now_ = core(good, joined.length);
  const before = core(goodPrev, joinedPrev.length);

  // ---- chart: visitors, page views and sign-ups per day (per hour for "Today")
  const hourly = o.days === 1;
  const buckets = hourly ? Array.from({ length: 24 }, (_, h) => String(h)) : curKeys;
  const hourOf = (iso: string) => String(Number(hourFmt(tz).format(new Date(iso))) % 24);
  const keyOf = (iso: string) => (hourly ? hourOf(iso) : day(iso));
  const seriesMap = new Map(buckets.map((k) => [k, { key: k, visitors: new Set<string>(), views: 0, signups: 0 }]));
  for (const e of good) {
    const b = seriesMap.get(keyOf(e.at));
    if (!b) continue;
    if (e.t === "view") b.views++;
    if (e.t === "view" || e.t === "engage") b.visitors.add(e.v);
  }
  for (const m of joined) {
    const b = seriesMap.get(keyOf(m.at));
    if (b) b.signups++;
  }
  const series = [...seriesMap.values()].map((b) => ({ key: b.key, visitors: b.visitors.size, views: b.views, signups: b.signups }));

  // ---- acquisition: where each visitor's first visit in the period came from
  const goodViews = good.filter((e) => e.t === "view");
  const sessions = sessionize(goodViews);
  const firstOfVisitor = new Map<string, AnalyticsEvent>();
  for (const s of sessions) if (!firstOfVisitor.has(s.v)) firstOfVisitor.set(s.v, s.views[0]);
  // A member's first-ever recorded visit (any loaded period), to credit their sign-up.
  const firstEver = new Map<string, AnalyticsEvent>();
  for (const [v, list] of byVisitor) {
    const u = userOf.get(v);
    if (!u) continue;
    const first = list.find((e) => e.t === "view");
    if (first && (!firstEver.has(u) || first.at < firstEver.get(u)!.at)) firstEver.set(u, first);
  }
  const srcVisitors = tally([...firstOfVisitor.values()].map(sourceOf));
  const srcSignups = tally(joined.map((m) => (firstEver.has(m.id) ? sourceOf(firstEver.get(m.id)) : "Unknown")));
  const sourceKeys = new Set([...srcVisitors.keys(), ...srcSignups.keys()]);
  const sources = [...sourceKeys]
    .map((key) => ({ key, visitors: srcVisitors.get(key) ?? 0, signups: srcSignups.get(key) ?? 0 }))
    .sort((a, b) => b.visitors - a.visitors || b.signups - a.signups)
    .slice(0, 12);

  const landing = new Map<string, { sessions: number; bounces: number }>();
  for (const s of sessions) {
    const p = s.views[0].path ?? "?";
    const x = landing.get(p) ?? { sessions: 0, bounces: 0 };
    x.sessions++;
    if (s.views.length === 1) x.bounces++;
    landing.set(p, x);
  }
  const landingPages = [...landing.entries()].map(([key, x]) => ({ key, ...x })).sort((a, b) => b.sessions - a.sessions).slice(0, 12);

  // ---- pages: unique people and average time
  const pageVisitors = new Map<string, Set<string>>();
  const pageViews = tally(goodViews.map((e) => e.path));
  for (const e of goodViews) {
    if (!e.path) continue;
    let s = pageVisitors.get(e.path);
    if (!s) pageVisitors.set(e.path, (s = new Set()));
    s.add(e.v);
  }
  const pageTime = new Map<string, number[]>();
  for (const e of good) if (e.t === "time" && e.path && e.s) pageTime.set(e.path, [...(pageTime.get(e.path) ?? []), e.s]);
  const pages = [...pageVisitors.entries()]
    .map(([key, s]) => {
      const t = pageTime.get(key);
      return { key, visitors: s.size, views: pageViews.get(key) ?? 0, avgTime: t?.length ? t.reduce((a, b) => a + b, 0) / t.length : null };
    })
    .sort((a, b) => b.visitors - a.visitors || b.views - a.views)
    .slice(0, 20);

  const perVisitor = <K extends keyof AnalyticsEvent>(k: K) => ranked(tally([...new Map(goodViews.map((e) => [e.v, e[k] as string | undefined])).values()]), 10);

  // ---- feature use: people and times
  const usage = (t: AnalyticsEvent["t"]) => {
    const list = good.filter((e) => e.t === t);
    return { times: list.length, people: new Set(list.map((e) => e.u ?? e.v)).size };
  };

  // ---- filtered out (shown so nothing is hidden)
  const curAll = inCur.filter((e) => e.v && e.v !== "server");
  const botEvents = curAll.filter((e) => !people.has(e.v));
  const teamEvents = curAll.filter((e) => people.has(e.v) && (teamVisitors.has(e.v) || (e.u && o.team.has(e.u))));

  // ---- live: people active in the last 5 minutes (a brand-new visitor counts for their first minute)
  const live = new Set(
    events
      .filter((e) => Date.parse(e.at) >= now - 5 * 60_000 && e.v && e.v !== "server" && (o.includeTeam || !teamVisitors.has(e.v)))
      .filter((e) => people.has(e.v) || Date.parse(e.at) >= now - 60_000)
      .map((e) => e.v),
  ).size;

  const tutorPeople = new Map<string, Set<string>>();
  for (const e of goodViews) {
    const id = e.path?.match(/^\/tutors\/(?!join$|partners$|book$|on-call$)([^/]+)$/)?.[1];
    if (!id) continue;
    let s = tutorPeople.get(id);
    if (!s) tutorPeople.set(id, (s = new Set()));
    s.add(e.v);
  }

  return {
    days: o.days,
    tz,
    hourly,
    range: { from: curKeys[0], to: curKeys[curKeys.length - 1], prevFrom: prevKeys[0], prevTo: prevKeys[prevKeys.length - 1] },
    now: now_,
    before,
    live,
    series,
    sources,
    landingPages,
    pages,
    countries: perVisitor("c"),
    devices: perVisitor("dev"),
    joined: joined.sort((a, b) => b.at.localeCompare(a.at)),
    firstEver,
    use: {
      lessons: usage("video_open"),
      ai: usage("ai_question"),
      calendar: usage("calendar_connect"),
      checkout: usage("checkout"),
      uploads: usage("upload_play"),
    },
    calendarMethods: ranked(tally(good.filter((e) => e.t === "calendar_connect").map((e) => (e.x?.startsWith("link:") ? `Link · ${e.x.slice(5)}` : e.x))), 8),
    topVideos: ranked(tally(good.filter((e) => e.t === "video_open").map((e) => e.x)), 10),
    topUploads: ranked(tally(good.filter((e) => e.t === "upload_play").map((e) => e.x)), 10),
    courses: ranked(tally([...new Set(goodViews.map((e) => `${e.v}|${e.path?.match(/^\/(?:courses|master|practice)\/([^/]+)/)?.[1] ?? ""}`))].map((k) => k.split("|")[1])), 10),
    ctaClicks: ranked(tally(good.filter((e) => e.t === "cta").map((e) => e.x)), 12),
    landingVisitors: new Set(goodViews.filter((e) => e.path === "/").map((e) => e.v)).size,
    landingClickers: new Set(good.filter((e) => e.t === "cta").map((e) => e.v)).size,
    tutorViews: new Map([...tutorPeople.entries()].map(([k, s]) => [k, s.size])),
    activity: (memberId: string) => {
      const list = events.filter((e) => e.u === memberId || userOf.get(e.v) === memberId);
      return {
        days: new Set(list.filter((e) => e.t === "view").map((e) => day(e.at))).size,
        lastSeen: list.reduce<string | null>((m, e) => (!m || e.at > m ? e.at : m), null),
        views: list.filter((e) => e.t === "view").length,
        ai: list.filter((e) => e.t === "ai_question").length,
        lessons: list.filter((e) => e.t === "video_open").length,
      };
    },
    filtered: {
      botViews: botEvents.filter((e) => e.t === "view").length,
      botVisitors: new Set(botEvents.map((e) => e.v)).size,
      teamViews: teamEvents.filter((e) => e.t === "view").length,
    },
  };
}

/** A visitor's page views with no gap over 30 minutes. Views must be sorted oldest first. */
function sessionize(views: AnalyticsEvent[]) {
  const last = new Map<string, { v: string; views: AnalyticsEvent[]; end: number }>();
  const out: { v: string; views: AnalyticsEvent[] }[] = [];
  for (const e of views) {
    const t = Date.parse(e.at);
    const s = last.get(e.v);
    if (s && t - s.end <= SESSION_GAP) {
      s.views.push(e);
      s.end = t;
    } else {
      const n = { v: e.v, views: [e], end: t };
      last.set(e.v, n);
      out.push(n);
    }
  }
  return out;
}

/** Percent change from `b` to `a`, or null when there's nothing to compare with. */
export const change = (a: number, b: number) => (b > 0 ? (a - b) / b : null);

export const inWindow = (iso: string | null | undefined, days: number, now = Date.now()) => Boolean(iso && Date.parse(iso) >= now - days * DAY && Date.parse(iso) <= now + DAY);
