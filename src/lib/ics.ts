import { detectCourse, matchTopics, type TopicMatcher } from "@/lib/catalog/match";
import type { ScheduleEvent } from "@/lib/types";

/** Pure iCalendar parsing and topic matching (no I/O). */

const WINDOW_PAST_DAYS = 14;
const WINDOW_FUTURE_DAYS = 150;

type RawEvent = { uid: string; summary: string; description: string; start: string; end: string | null; allDay: boolean; rrule: string | null };

function unfold(ics: string) {
  return ics.replace(/\r\n/g, "\n").replace(/\n[ \t]/g, "");
}

function unescape(v: string) {
  return v.replace(/\\n/gi, " ").replace(/\\,/g, ",").replace(/\\;/g, ";").replace(/\\\\/g, "\\").trim();
}

function parseDate(value: string, params: string): { iso: string; allDay: boolean } | null {
  const m = value.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/);
  if (!m) return null;
  const [, y, mo, d, h, mi, s, z] = m;
  if (!h || /VALUE=DATE(?!-)/.test(params)) return { iso: `${y}-${mo}-${d}T12:00:00.000Z`, allDay: true };
  // Floating/TZID times are treated as local-ish; hour precision is enough for study planning.
  const iso = z ? `${y}-${mo}-${d}T${h}:${mi}:${s ?? "00"}.000Z` : new Date(`${y}-${mo}-${d}T${h}:${mi}:${s ?? "00"}`).toISOString();
  return { iso, allDay: false };
}

export function parseIcs(ics: string): RawEvent[] {
  const events: RawEvent[] = [];
  let cur: Partial<RawEvent> & { params?: Record<string, string> } | null = null;
  for (const line of unfold(ics).split("\n")) {
    if (line === "BEGIN:VEVENT") cur = { description: "", rrule: null };
    else if (line === "END:VEVENT" && cur) {
      if (cur.summary && cur.start) events.push({ uid: cur.uid ?? `${cur.summary}-${cur.start}`, summary: cur.summary, description: cur.description ?? "", start: cur.start, end: cur.end ?? null, allDay: cur.allDay ?? false, rrule: cur.rrule ?? null });
      cur = null;
    } else if (cur) {
      const idx = line.indexOf(":");
      if (idx < 0) continue;
      const [name, ...paramParts] = line.slice(0, idx).split(";");
      const value = line.slice(idx + 1);
      const params = paramParts.join(";");
      switch (name.toUpperCase()) {
        case "UID":
          cur.uid = value.trim();
          break;
        case "SUMMARY":
          cur.summary = unescape(value).slice(0, 200);
          break;
        case "DESCRIPTION":
          cur.description = unescape(value).slice(0, 500);
          break;
        case "DTSTART": {
          const d = parseDate(value.trim(), params);
          if (d) {
            cur.start = d.iso;
            cur.allDay = d.allDay;
          }
          break;
        }
        case "DTEND": {
          const d = parseDate(value.trim(), params);
          if (d) cur.end = d.iso;
          break;
        }
        case "RRULE":
          cur.rrule = value;
          break;
      }
    }
  }
  return events;
}

const TEST = /\b(test|exam|quiz|midterm|final|assessment|mcq|frq|dbq|leq|mock)\b/i;
const ASSIGNMENT = /\b(hw|homework|assignment|problem set|pset|due|worksheet|project|essay|lab report)\b/i;
const CLASS = /\b(class|period|lecture|lesson|block|section)\b/i;

/** Expands simple weekly recurrences (typical class periods) into the window. */
function expand(e: RawEvent, from: number, to: number): RawEvent[] {
  if (!e.rrule || !/FREQ=WEEKLY/.test(e.rrule)) return [e];
  const until = e.rrule.match(/UNTIL=(\d{8}(?:T\d{6}Z?)?)/)?.[1];
  const untilMs = until ? new Date(parseDate(until, "")?.iso ?? to).getTime() : to;
  const count = Number(e.rrule.match(/COUNT=(\d+)/)?.[1] ?? 60);
  const out: RawEvent[] = [];
  let t = new Date(e.start).getTime();
  for (let i = 0; i < count && t <= Math.min(to, untilMs); i++, t += 7 * 86400000) {
    if (t >= from) out.push({ ...e, uid: `${e.uid}#${i}`, start: new Date(t).toISOString(), end: null, rrule: null });
  }
  return out;
}

export function eventsFromIcs(ics: string, curriculum: TopicMatcher, courseHints: string[], now = Date.now()): ScheduleEvent[] {
  const from = now - WINDOW_PAST_DAYS * 86400000;
  const to = now + WINDOW_FUTURE_DAYS * 86400000;
  const raw = parseIcs(ics).flatMap((e) => expand(e, from, to));
  const out: ScheduleEvent[] = [];
  const seen = new Set<string>();
  for (const e of raw) {
    const t = new Date(e.start).getTime();
    if (Number.isNaN(t) || t < from || t > to) continue;
    const text = `${e.summary}\n${e.description}`;
    const courseId = detectCourse(curriculum, text, courseHints);
    const topics = matchTopics(curriculum, text, { courseIds: courseId ? [courseId] : courseHints, limit: 3 }).filter((m) => m.score >= 0.7);
    const resolvedCourse = courseId ?? (topics[0] ? curriculum.topics.find((x) => x.id === topics[0].topicId)!.courseId : null);
    const kind: ScheduleEvent["kind"] = TEST.test(text) ? "test" : ASSIGNMENT.test(text) ? "assignment" : CLASS.test(text) || e.uid.includes("#") ? "class" : "other";
    // Keep what's useful for studying: anything tied to a course or topic, plus tests.
    if (!resolvedCourse && !topics.length && kind !== "test") continue;
    const key = `${e.summary}|${e.start}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ uid: e.uid, title: e.summary, start: e.start, end: e.end, allDay: e.allDay, kind, courseId: resolvedCourse, topicIds: topics.map((m) => m.topicId) });
  }
  return out.sort((a, b) => a.start.localeCompare(b.start)).slice(0, 400);
}
