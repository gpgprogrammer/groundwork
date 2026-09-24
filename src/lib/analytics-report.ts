import type { AnalyticsEvent } from "@/lib/analytics";

const DAY = 86_400_000;
const SESSION_GAP = 30 * 60_000;

export type Count = { key: string; n: number };

function top(values: (string | undefined | null)[], limit = 10): Count[] {
  const m = new Map<string, number>();
  for (const v of values) if (v) m.set(v, (m.get(v) ?? 0) + 1);
  return [...m.entries()].map(([key, n]) => ({ key, n })).sort((a, b) => b.n - a.n).slice(0, limit);
}

export type TrafficReport = ReturnType<typeof trafficReport>;

/** Traffic numbers for a window of events (all computed here, not during render). */
export function trafficReport(events: AnalyticsEvent[], days: number, now = Date.now()) {
  const since = now - days * DAY;
  const inRange = events.filter((e) => Date.parse(e.at) >= since);
  const views = inRange.filter((e) => e.t === "view");
  const live = new Set(events.filter((e) => e.t === "view" && Date.parse(e.at) >= now - 5 * 60_000).map((e) => e.v));
  const visitors = new Set(views.map((e) => e.v));
  const signedIn = new Set(views.filter((e) => e.u).map((e) => e.u));

  // Sessions: a visitor's views with no gap over 30 minutes.
  const byVisitor = new Map<string, number[]>();
  for (const e of views) byVisitor.set(e.v, [...(byVisitor.get(e.v) ?? []), Date.parse(e.at)]);
  let sessions = 0;
  let bounces = 0;
  for (const times of byVisitor.values()) {
    times.sort((a, b) => a - b);
    let len = 0;
    times.forEach((t, i) => {
      if (i === 0 || t - times[i - 1] > SESSION_GAP) {
        if (i > 0) bounces += len === 1 ? 1 : 0;
        sessions++;
        len = 0;
      }
      len++;
    });
    if (len === 1) bounces++;
  }

  // Daily series (hourly for a one-day window).
  const hourly = days <= 1;
  const step = hourly ? DAY / 24 : DAY;
  const buckets = hourly ? 24 : days;
  const start = hourly ? Math.floor(now / step) * step - (buckets - 1) * step : Date.UTC(new Date(now).getUTCFullYear(), new Date(now).getUTCMonth(), new Date(now).getUTCDate()) - (buckets - 1) * DAY;
  const series = Array.from({ length: buckets }, (_, i) => ({ at: new Date(start + i * step).toISOString(), views: 0, visitors: new Set<string>() }));
  for (const e of views) {
    const i = Math.floor((Date.parse(e.at) - start) / step);
    if (i >= 0 && i < buckets) {
      series[i].views++;
      series[i].visitors.add(e.v);
    }
  }

  const of = (t: AnalyticsEvent["t"]) => inRange.filter((e) => e.t === t);
  const pathPart = (p: string | undefined, re: RegExp) => p?.match(re)?.[1];
  return {
    live: live.size,
    visitors: visitors.size,
    views: views.length,
    sessions,
    bounceRate: sessions ? bounces / sessions : 0,
    pagesPerSession: sessions ? views.length / sessions : 0,
    signedInVisitors: signedIn.size,
    series: series.map((s) => ({ at: s.at, views: s.views, visitors: s.visitors.size })),
    hourly,
    topPages: top(views.map((e) => e.path), 15),
    referrers: top(views.map((e) => e.ref), 10),
    countries: top(views.map((e) => e.c), 10),
    devices: top([...new Map(views.map((e) => [e.v, e.dev])).values()], 3),
    courses: top(views.map((e) => pathPart(e.path, /^\/courses\/([^/]+)/)), 10),
    tutorViews: top(views.map((e) => pathPart(e.path, /^\/tutors\/(?!join|partners)([^/]+)/)), 50),
    videoOpens: of("video_open").length,
    topVideos: top(of("video_open").map((e) => e.x), 10),
    uploadPlays: of("upload_play").length,
    topUploads: top(of("upload_play").map((e) => e.x), 10),
    aiQuestions: of("ai_question").length,
    aiAskers: new Set(of("ai_question").map((e) => e.u ?? e.v)).size,
    calendarConnects: of("calendar_connect").length,
    calendarMethods: top(of("calendar_connect").map((e) => (e.x?.startsWith("link:") ? `Link · ${e.x.slice(5)}` : e.x)), 10),
    checkouts: top(of("checkout").map((e) => e.x), 5),
  };
}

export const inWindow = (iso: string | null | undefined, days: number, now = Date.now()) => Boolean(iso && Date.parse(iso) >= now - days * DAY && Date.parse(iso) <= now + DAY);
