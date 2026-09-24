"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { trackServer } from "@/lib/analytics";
import { blackbaudExists, detectSchoolPortal, portalFor, rememberSchoolPortal, type SchoolPortal } from "@/lib/school-detect";
import { calendarAccess } from "@/lib/billing/access";
import { getStore } from "@/lib/data/store";
import { candidatesFromCsv, candidatesFromImages, candidatesFromPdf, candidatesFromText, candidatesWithAi, type Candidate } from "@/lib/extract-events";
import { buildEvents, fetchCalendar, ScheduleError } from "@/lib/schedule";
import type { ParseStats } from "@/lib/ics";
import { normalizeSchedule } from "@/lib/schedule-model";
import { validTimeZone, zonedToUtc } from "@/lib/tz";
import type { Schedule, ScheduleEvent, ScheduleSource } from "@/lib/types";
import { getViewer, type Viewer } from "@/lib/viewer";

export type ScheduleResult = { ok: true; added: number; tests: number; label: string; read?: number; upcoming?: number } | { ok: false; error: string };

/** Explains an import that found nothing to add, instead of silently adding zero. */
function emptyResult(label: string, stats: ParseStats): ScheduleResult {
  console.warn("[schedule] import kept nothing", { label, ...stats });
  if (!stats.read) return { ok: false, error: `${label} connected, but the feed had no events in the last two weeks or next six months. In Blackbaud, turn on Assignments and your classes in the calendar filters before copying the feed link.` };
  return { ok: false, error: `We read ${stats.read} events from ${label}, but none looked like tests or assignments. If this calendar is all schoolwork, check “Everything on this calendar is schoolwork” and connect again.` };
}
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

export async function connectCalendarUrl(rawUrl: string, school = false): Promise<ScheduleResult> {
  const a = await access();
  if ("error" in a) return { ok: false, error: a.error };
  try {
    const url = new URL(rawUrl.trim().replace(/^webcal:\/\//i, "https://"));
    const ics = await fetchCalendar(url.toString());
    if (!/BEGIN:VCALENDAR/.test(ics)) return { ok: false, error: "That link didn't return a calendar. Copy the iCal / feed link, not the page address." };
    const existing = normalizeSchedule(a.viewer.state.schedule)?.sources.find((s) => s.url === url.toString());
    const source: ScheduleSource = { id: existing?.id ?? `src_${randomUUID().slice(0, 8)}`, kind: "ics-url", url: url.toString(), label: labelFor(url), syncedAt: new Date().toISOString(), count: 0 };
    const stats: ParseStats = { read: 0, kept: 0, upcoming: 0 };
    const events = buildEvents(ics, a.viewer.state.profile.courseIds, { url: url.toString(), stats, school });
    console.info("[schedule] link", { host: url.hostname, bytes: ics.length, school, ...stats, prodid: ics.match(/PRODID:([^\r\n]{0,80})/)?.[1] ?? null });
    if (!events.length) return emptyResult(source.label, stats);
    const added = await saveSource(a.viewer, source, events);
    await rememberSchoolPortal(a.viewer.user.email, url.toString());
    return { ok: true, added: added.length, tests: added.filter((e) => e.kind === "test").length, label: source.label, read: stats.read, upcoming: stats.upcoming };
  } catch (e) {
    console.warn("[schedule] link failed", e instanceof Error ? e.message : e);
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
  if (file.size > 15 * 1024 * 1024) return { ok: false, error: "That file is over 15 MB." };
  const text = await file.text();
  if (text.startsWith("%PDF")) return { ok: false, error: "That file is actually a PDF (it was saved with an .ics name). Use the “PDF, CSV, or screenshots” tab instead." };
  if (!text.includes("BEGIN:VCALENDAR")) return { ok: false, error: "That isn't an iCalendar (.ics) file." };
  if (!text.includes("BEGIN:VEVENT")) return { ok: false, error: "That calendar file is empty: it has no events in it. Blackbaud's Export often leaves assignments out. Use your calendar's feed link, or print the month view to PDF and use the “PDF, CSV, or screenshots” tab." };
  const source: ScheduleSource = { id: `src_${randomUUID().slice(0, 8)}`, kind: "ics-file", url: null, label: file.name.replace(/\.ics$/i, "") || "Uploaded calendar", syncedAt: new Date().toISOString(), count: 0 };
  const stats: ParseStats = { read: 0, kept: 0, upcoming: 0 };
  const events = buildEvents(text, a.viewer.state.profile.courseIds, { stats, school: form.get("school") === "on" });
  console.info("[schedule] ics file", { bytes: text.length, ...stats, prodid: text.match(/PRODID:([^\r\n]{0,80})/)?.[1] ?? null });
  if (!events.length) return emptyResult(source.label, stats);
  const added = await saveSource(a.viewer, source, events);
  return { ok: true, added: added.length, tests: added.filter((e) => e.kind === "test").length, label: source.label, read: stats.read, upcoming: stats.upcoming };
}

/** Reads a PDF, CSV, or pasted text into a list for the student to review. Nothing is saved yet. */
export async function previewImport(form: FormData): Promise<PreviewResult> {
  const a = await access();
  if ("error" in a) return { ok: false, error: a.error };
  const hints = a.viewer.state.profile.courseIds;
  const files = form.getAll("file").filter((f): f is File => f instanceof File && f.size > 0);
  const images = files.filter((f) => f.type.startsWith("image/") || /\.(png|jpe?g|heic|webp)$/i.test(f.name));
  if (images.length) {
    if (images.length > 12 || images.some((f) => f.size > 8 * 1024 * 1024)) return { ok: false, error: "Upload up to 12 screenshots, each under 8 MB." };
    const found = await candidatesFromImages(await Promise.all(images.map(async (f) => ({ data: new Uint8Array(await f.arrayBuffer()), type: f.type || "image/png" }))), hints);
    if (found === null) return { ok: false, error: "Reading screenshots needs Merit AI, which isn't switched on yet. Use your calendar's feed link, a .ics file, or copy and paste the list instead." };
    if (!found.length) return { ok: false, error: "We couldn't read any assignments in those screenshots." };
    return { ok: true, candidates: found.slice(0, 400), label: "Calendar screenshots", kind: "document", usedAi: true };
  }
  const file = files[0] ?? null;
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
  console.info("[schedule] preview", { kind, file: file ? { type: file.type, bytes: file.size } : null, textChars: text.length, lines: text.split("\n").length, found: candidates.length });
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
      added += (await saveSource(viewer, { ...src, syncedAt: new Date().toISOString() }, buildEvents(ics, viewer.state.profile.courseIds, { url: src.url }))).length;
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

/** The student's school portal, found from their email domain, if we can. */
export async function findMySchool(): Promise<SchoolPortal | null> {
  const viewer = await getViewer();
  if (!viewer) return null;
  const linked = normalizeSchedule(viewer.state.schedule)?.sources.find((s) => s.kind === "ics-url" && s.url && portalFor(new URL(s.url).hostname));
  if (linked?.url) return portalFor(new URL(linked.url).hostname);
  return detectSchoolPortal(viewer.user.email);
}

/** Finds a Blackbaud site from just the first part of its address ("weberschool"). */
export async function findBlackbaud(prefix: string): Promise<SchoolPortal | null> {
  const p = prefix.trim().toLowerCase().replace(/^https?:\/\//, "").split(".")[0];
  return p ? blackbaudExists(p) : null;
}
