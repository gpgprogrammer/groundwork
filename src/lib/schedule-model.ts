import type { Schedule, ScheduleEvent } from "@/lib/types";

/** Upgrades schedules saved before multiple calendars were supported. */
export function normalizeSchedule(raw: unknown): Schedule | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Partial<Schedule> & { source?: "ics-url" | "ics-file"; url?: string | null; label?: string; events?: ScheduleEvent[] };
  if (Array.isArray(s.sources)) return { sources: s.sources, events: s.events ?? [], hidden: s.hidden ?? [], syncedAt: s.syncedAt ?? new Date().toISOString() };
  const syncedAt = s.syncedAt ?? new Date().toISOString();
  return {
    sources: [{ id: "s0", kind: s.source ?? "ics-url", url: s.url ?? null, label: s.label ?? "Calendar", syncedAt, count: s.events?.length ?? 0 }],
    events: (s.events ?? []).map((e) => ({ ...e, sourceId: "s0" })),
    hidden: [],
    syncedAt,
  };
}

/** Events the student should see: not hidden. */
export const visibleEvents = (s: Schedule | null) => (s ? s.events.filter((e) => !s.hidden.includes(e.uid)) : []);

/** Upcoming tests (including today's), soonest first. */
export function upcomingTests(s: Schedule | null, limit = 9, now = Date.now()) {
  return visibleEvents(s)
    .filter((e) => e.kind === "test" && new Date(e.start).getTime() > now - 86400000)
    .slice(0, limit);
}
