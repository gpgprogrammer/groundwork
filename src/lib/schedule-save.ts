import "server-only";
import { revalidatePath } from "next/cache";
import { trackServer } from "@/lib/analytics";
import { getStore } from "@/lib/data/store";
import { normalizeSchedule } from "@/lib/schedule-model";
import type { Schedule, ScheduleEvent, ScheduleSource } from "@/lib/types";
import type { Viewer } from "@/lib/viewer";

export function emptySchedule(): Schedule {
  return { sources: [], events: [], hidden: [], syncedAt: new Date().toISOString() };
}

/** Replaces one source's events, keeping every other calendar's. */
export async function saveSource(viewer: Viewer, source: ScheduleSource, events: ScheduleEvent[]) {
  // Read fresh: several sources can be saved in one request.
  const store = await getStore();
  const current = normalizeSchedule((await store.getUserState(viewer.user.id))?.schedule ?? null) ?? emptySchedule();
  const others = current.events.filter((e) => e.sourceId !== source.id);
  if (!current.sources.some((s) => s.id === source.id)) await trackServer("calendar_connect", { u: viewer.user.id, x: source.kind === "ics-url" && source.url ? `link:${new URL(source.url).hostname}` : source.kind });
  const keys = new Set(others.map((e) => `${e.title.toLowerCase()}|${e.start.slice(0, 10)}`));
  const fresh = events.map((e) => ({ ...e, sourceId: source.id })).filter((e) => !keys.has(`${e.title.toLowerCase()}|${e.start.slice(0, 10)}`));
  const next: Schedule = {
    sources: [...current.sources.filter((s) => s.id !== source.id), { ...source, count: fresh.length }],
    events: [...others, ...fresh].sort((a, b) => a.start.localeCompare(b.start)).slice(0, 1500),
    hidden: current.hidden,
    syncedAt: new Date().toISOString(),
  };
  await store.setSchedule(viewer.user.id, next);
  revalidatePath("/", "layout");
  return fresh;
}
