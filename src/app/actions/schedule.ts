"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { calendarAccess } from "@/lib/billing/access";
import { getStore } from "@/lib/data/store";
import { candidatesFromCsv, candidatesFromPdf, candidatesFromText, candidatesWithAi, type Candidate } from "@/lib/extract-events";
import { buildEvents, fetchCalendar, ScheduleError } from "@/lib/schedule";
import { normalizeSchedule } from "@/lib/schedule-model";
import { validTimeZone, zonedToUtc } from "@/lib/tz";
import type { Schedule, ScheduleEvent, ScheduleSource } from "@/lib/types";
import { getViewer, type Viewer } from "@/lib/viewer";

export type ScheduleResult = { ok: true; added: number; tests: number; label: string } | { ok: false; error: string };
export type PreviewResult = { ok: true; candidates: Candidate[]; label: string; kind: "document" | "text"; usedAi: boolean } | { ok: false; error: string };

const LOCKED = "Calendar sync comes with Merit Plus or Exam Sprint.";

async function access(): Promise<{ viewer: Viewer } | { error: string }> {
  const viewer = await getViewer();
  if (!viewer) return { error: "Sign in to connect a calendar." };
  if (!calendarAccess(viewer)) return { error: LOCKED };
  return { viewer };
}

function empty(): Schedule {
  return { sources: [], events: [], hidden: [], syncedAt: new Date().toISOString() };
}

/** Replaces one source's events, keeping every other calendar's. */
async function saveSource(viewer: Viewer, source: ScheduleSource, events: ScheduleEvent[]) {
  // Read fresh: several sources can be saved in one request.
  const store = await getStore();
  const current = normalizeSchedule((await store.getUserState(viewer.user.id))?.schedule ?? null) ?? empty();
  const others = current.events.filter((e) => e.sourceId !== source.id);
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

const labelFor = (url: URL) =>
  /myschoolapp|blackbaud/.test(url.hostname)
    ? "Blackbaud"
    : /google\.com/.test(url.hostname)
      ? "Google Calendar"
      : /instructure|canvas/.test(url.hostname)
        ? "Canvas"
        : /schoology/.test(url.hostname)
          ? "Schoology"
          : /veracross/.test(url.hostname)
            ? "Veracross"
            : /powerschool/.test(url.hostname)
              ? "PowerSchool"
              : /icloud|apple/.test(url.hostname)
                ? "Apple Calendar"
                : /outlook|office|live\.com/.test(url.hostname)
                  ? "Outlook"
                  : url.hostname.replace(/^www\./, "");

export async function connectCalendarUrl(rawUrl: string): Promise<ScheduleResult> {
  const a = await access();
  if ("error" in a) return { ok: false, error: a.error };
  try {
    const url = new URL(rawUrl.trim().replace(/^webcal:\/\//i, "https://"));
    const ics = await fetchCalendar(url.toString());
    if (!/BEGIN:VCALENDAR/.test(ics)) return { ok: false, error: "That link didn't return a calendar. Copy the iCal / feed link, not the page address." };
    const existing = normalizeSchedule(a.viewer.state.schedule)?.sources.find((s) => s.url === url.toString());
    const source: ScheduleSource = { id: existing?.id ?? `src_${randomUUID().slice(0, 8)}`, kind: "ics-url", url: url.toString(), label: labelFor(url), syncedAt: new Date().toISOString(), count: 0 };
    const added = await saveSource(a.viewer, source, buildEvents(ics, a.viewer.state.profile.courseIds));
    return { ok: true, added: added.length, tests: added.filter((e) => e.kind === "test").length, label: source.label };
  } catch (e) {
    if (e instanceof ScheduleError) return { ok: false, error: e.message };
    if (e instanceof TypeError) return { ok: false, error: "That doesn't look like a calendar link." };
    console.error("[schedule] sync failed", e);
    return { ok: false, error: "We couldn't import that calendar. Try again, or upload a file instead." };
  }
}

export async function importIcsFile(form: FormData): Promise<ScheduleResult> {
  const a = await access();
  if ("error" in a) return { ok: false, error: a.error };
  const file = form.get("file");
  if (!(file instanceof File) || !file.size) return { ok: false, error: "Choose a file." };
  if (file.size > 3 * 1024 * 1024) return { ok: false, error: "That file is over 3 MB." };
  const text = await file.text();
  if (!text.includes("BEGIN:VCALENDAR")) return { ok: false, error: "That isn't an iCalendar (.ics) file." };
  const source: ScheduleSource = { id: `src_${randomUUID().slice(0, 8)}`, kind: "ics-file", url: null, label: file.name.replace(/\.ics$/i, "") || "Uploaded calendar", syncedAt: new Date().toISOString(), count: 0 };
  const added = await saveSource(a.viewer, source, buildEvents(text, a.viewer.state.profile.courseIds));
  return { ok: true, added: added.length, tests: added.filter((e) => e.kind === "test").length, label: source.label };
}

/** Reads a PDF, CSV, or pasted text into a list for the student to review. Nothing is saved yet. */
export async function previewImport(form: FormData): Promise<PreviewResult> {
  const a = await access();
  if ("error" in a) return { ok: false, error: a.error };
  const hints = a.viewer.state.profile.courseIds;
  const file = form.get("file");
  const pasted = String(form.get("text") ?? "").slice(0, 60000);
  let candidates: Candidate[] = [];
  let text = pasted;
  let label = "Pasted calendar";
  let kind: "document" | "text" = "text";
  try {
    if (file instanceof File && file.size) {
      if (file.size > 8 * 1024 * 1024) return { ok: false, error: "That file is over 8 MB." };
      kind = "document";
      label = file.name.replace(/\.(pdf|csv|txt)$/i, "") || "Imported calendar";
      const buf = new Uint8Array(await file.arrayBuffer());
      if (/\.pdf$/i.test(file.name) || file.type === "application/pdf") {
        const r = await candidatesFromPdf(buf, hints);
        candidates = r.candidates;
        text = r.text;
      } else if (/\.ics$/i.test(file.name)) {
        return { ok: false, error: "For .ics files, use Upload .ics instead." };
      } else {
        text = new TextDecoder().decode(buf);
        candidates = /\.csv$/i.test(file.name) ? candidatesFromCsv(text, hints) : candidatesFromText(text, hints);
      }
    } else {
      candidates = candidatesFromText(pasted, hints);
    }
  } catch (err) {
    console.error("[import] read failed", err);
    return { ok: false, error: "We couldn't read that file. Try exporting it again, or paste the text instead." };
  }
  const ai = await candidatesWithAi(text, hints);
  const usedAi = Boolean(ai && ai.length >= candidates.length * 0.6 && ai.length);
  if (usedAi) candidates = ai!;
  if (!candidates.length) return { ok: false, error: "We didn't find any dated items in that. Make sure dates are included (for example “Sep 24” or “9/24”)." };
  return { ok: true, candidates: candidates.slice(0, 400), label, kind, usedAi };
}

export async function saveImport(input: { label: string; kind: "document" | "text"; timezone: string; items: Candidate[] }): Promise<ScheduleResult> {
  const a = await access();
  if ("error" in a) return { ok: false, error: a.error };
  const tz = validTimeZone(input.timezone) ? input.timezone : "America/New_York";
  const events: ScheduleEvent[] = input.items.slice(0, 400).flatMap((c) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(c.date)) return [];
    const [y, m, d] = c.date.split("-").map(Number);
    const start = c.time && /^\d{2}:\d{2}$/.test(c.time) ? new Date(zonedToUtc(c.date, c.time, tz)) : new Date(Date.UTC(y, m - 1, d, 12));
    return [
      {
        uid: `imp_${c.date}_${c.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60)}`,
        title: String(c.title).slice(0, 160),
        start: start.toISOString(),
        end: null,
        allDay: !c.time,
        kind: c.kind === "test" || c.kind === "assignment" ? c.kind : "other",
        courseId: c.courseId,
        topicIds: Array.isArray(c.topicIds) ? c.topicIds.slice(0, 3) : [],
      },
    ];
  });
  const source: ScheduleSource = { id: `src_${randomUUID().slice(0, 8)}`, kind: input.kind, url: null, label: input.label.slice(0, 60) || "Imported calendar", syncedAt: new Date().toISOString(), count: 0 };
  const added = await saveSource(a.viewer, source, events);
  return { ok: true, added: added.length, tests: added.filter((e) => e.kind === "test").length, label: source.label };
}

export async function removeSource(id: string) {
  const viewer = await getViewer();
  if (!viewer) return;
  const s = normalizeSchedule(viewer.state.schedule);
  if (!s) return;
  const next: Schedule = { ...s, sources: s.sources.filter((x) => x.id !== id), events: s.events.filter((e) => e.sourceId !== id) };
  await (await getStore()).setSchedule(viewer.user.id, next.sources.length ? next : null);
  revalidatePath("/", "layout");
}

/** Pulls fresh copies of every linked calendar. */
export async function resyncCalendars(): Promise<ScheduleResult> {
  const a = await access();
  if ("error" in a) return { ok: false, error: a.error };
  const s = normalizeSchedule(a.viewer.state.schedule);
  const links = s?.sources.filter((x) => x.kind === "ics-url" && x.url) ?? [];
  if (!links.length) return { ok: false, error: "Uploaded calendars can't refresh by themselves. Upload the newer file." };
  let added = 0;
  for (const src of links) {
    try {
      const ics = await fetchCalendar(src.url!);
      const viewer = a.viewer;
      added += (await saveSource(viewer, { ...src, syncedAt: new Date().toISOString() }, buildEvents(ics, viewer.state.profile.courseIds))).length;
    } catch (err) {
      console.warn("[schedule] resync failed for", src.label, err);
    }
  }
  return { ok: true, added, tests: 0, label: "All calendars" };
}

export async function hideEvent(uid: string, hide = true) {
  const viewer = await getViewer();
  if (!viewer) return;
  const s = normalizeSchedule(viewer.state.schedule);
  if (!s) return;
  const hidden = hide ? [...new Set([...s.hidden, uid])] : s.hidden.filter((h) => h !== uid);
  await (await getStore()).setSchedule(viewer.user.id, { ...s, hidden: hidden.slice(-2000) });
  revalidatePath("/", "layout");
}

/** "That's not the right topic": keeps the event, drops the guessed class and topics. */
export async function clearMatch(uid: string) {
  const viewer = await getViewer();
  if (!viewer) return;
  const s = normalizeSchedule(viewer.state.schedule);
  if (!s) return;
  await (await getStore()).setSchedule(viewer.user.id, { ...s, events: s.events.map((e) => (e.uid === uid ? { ...e, courseId: null, topicIds: [] } : e)) });
  revalidatePath("/", "layout");
}
