import "server-only";
import { getStore } from "@/lib/data/store";
import { syncGoogle } from "@/lib/google-calendar";
import { buildEvents, fetchCalendar } from "@/lib/schedule";
import { normalizeSchedule } from "@/lib/schedule-model";
import type { Schedule } from "@/lib/types";
import type { Viewer } from "@/lib/viewer";

const STALE_MS = 6 * 3600000;

/** Re-downloads linked calendars older than six hours, so canceled or moved tests disappear on their own. */
export async function refreshStaleSources(viewer: Viewer): Promise<Schedule | null> {
  const s = normalizeSchedule(viewer.state.schedule);
  if (!s) return null;
  const stale = s.sources.filter((x) => (x.kind === "google" || (x.kind === "ics-url" && x.url)) && Date.now() - new Date(x.syncedAt).getTime() > STALE_MS);
  if (!stale.length) return s;
  let next = s;
  for (const src of stale.slice(0, 4)) {
    try {
      const fetched = src.kind === "google" ? (await syncGoogle(viewer.user.id, viewer.state.profile.courseIds)).events : buildEvents(await fetchCalendar(src.url!), viewer.state.profile.courseIds, { url: src.url });
      const events = fetched.map((e) => ({ ...e, sourceId: src.id }));
      next = {
        ...next,
        sources: next.sources.map((x) => (x.id === src.id ? { ...x, syncedAt: new Date().toISOString(), count: events.length } : x)),
        events: [...next.events.filter((e) => e.sourceId !== src.id), ...events].sort((a, b) => a.start.localeCompare(b.start)),
      };
    } catch (err) {
      console.warn("[schedule] background refresh failed for", src.label, err);
    }
  }
  if (next !== s) await (await getStore()).setSchedule(viewer.user.id, next);
  return next;
}
