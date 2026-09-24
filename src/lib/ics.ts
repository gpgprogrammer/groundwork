import { matchTopics, type TopicMatcher } from "@/lib/catalog/match";
import { validTimeZone, wallToUtc } from "@/lib/tz";
import type { ScheduleEvent } from "@/lib/types";

/**
 * Pure iCalendar parsing and matching (no I/O).
 *
 * Accuracy rules, so the schedule never shows things that aren't happening:
 * - Canceled events (STATUS:CANCELLED), removed dates (EXDATE), and moved or
 *   canceled single occurrences (RECURRENCE-ID) are honored.
 * - Times are converted from the event's own time zone (TZID / X-WR-TIMEZONE).
 * - Only tests, quizzes, and assignments are kept. Class periods and personal
 *   events are dropped.
 * - A course or topic is attached only when the event's own text names it.
 */

const WINDOW_PAST_DAYS = 14;
const WINDOW_FUTURE_DAYS = 180;
const DAY = 86400000;

export type RawEvent = {
  uid: string;
  summary: string;
  description: string;
  start: number;
  end: number | null;
  allDay: boolean;
  rrule: string | null;
  exdates: number[];
  recurrenceId: number | null;
  cancelled: boolean;
};

function unfold(ics: string) {
  return ics.replace(/\r\n?/g, "\n").replace(/\n[ \t]/g, "");
}

function unescape(v: string) {
  return v.replace(/\\n/gi, " ").replace(/\\,/g, ",").replace(/\\;/g, ";").replace(/\\\\/g, "\\").replace(/\s+/g, " ").trim();
}

function param(params: string, key: string) {
  const m = params.match(new RegExp(`(?:^|;)${key}=("?)([^";]+)\\1`, "i"));
  return m ? m[2] : null;
}

/** Parses an iCal date or date-time into a UTC instant. */
function parseDate(value: string, params: string, calTz: string | null): { t: number; allDay: boolean } | null {
  const m = value.trim().match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/);
  if (!m) return null;
  const [, y, mo, d, h, mi, s, z] = m;
  // All-day: pin to noon UTC so the calendar date is the same in every US time zone.
  if (!h || /VALUE=DATE(?!-)/i.test(params)) return { t: Date.UTC(+y, +mo - 1, +d, 12), allDay: true };
  if (z) return { t: Date.UTC(+y, +mo - 1, +d, +h, +mi, +(s ?? 0)), allDay: false };
  const tz = param(params, "TZID") ?? calTz;
  const zone = validTimeZone(tz) ? tz : "America/New_York";
  return { t: wallToUtc(+y, +mo, +d, +h, +mi, +(s ?? 0), zone), allDay: false };
}

export function parseIcs(ics: string): RawEvent[] {
  const text = unfold(ics);
  const calTz = text.match(/^X-WR-TIMEZONE:(.+)$/m)?.[1]?.trim() ?? null;
  const events: RawEvent[] = [];
  let cur: (Partial<RawEvent> & { exdates: number[] }) | null = null;
  let depth = 0; // skip nested VALARM blocks
  for (const line of text.split("\n")) {
    if (line === "BEGIN:VEVENT") {
      cur = { description: "", rrule: null, exdates: [], recurrenceId: null, cancelled: false };
      depth = 0;
      continue;
    }
    if (!cur) continue;
    if (line.startsWith("BEGIN:")) {
      depth++;
      continue;
    }
    if (line.startsWith("END:") && line !== "END:VEVENT") {
      depth = Math.max(0, depth - 1);
      continue;
    }
    if (line === "END:VEVENT") {
      if (cur.summary && cur.start != null) {
        events.push({
          uid: cur.uid ?? `${cur.summary}-${cur.start}`,
          summary: cur.summary,
          description: cur.description ?? "",
          start: cur.start,
          end: cur.end ?? null,
          allDay: cur.allDay ?? false,
          rrule: cur.rrule ?? null,
          exdates: cur.exdates,
          recurrenceId: cur.recurrenceId ?? null,
          cancelled: cur.cancelled ?? false,
        });
      }
      cur = null;
      continue;
    }
    if (depth > 0) continue;
    const idx = line.indexOf(":");
    if (idx < 0) continue;
    const [rawName, ...paramParts] = line.slice(0, idx).split(";");
    const name = rawName.toUpperCase();
    const value = line.slice(idx + 1);
    const params = paramParts.join(";");
    switch (name) {
      case "UID":
        cur.uid = value.trim();
        break;
      case "SUMMARY":
        cur.summary = unescape(value).slice(0, 200);
        break;
      case "DESCRIPTION":
        cur.description = unescape(value).slice(0, 500);
        break;
      case "STATUS":
        if (/CANCELLED/i.test(value)) cur.cancelled = true;
        break;
      case "DTSTART": {
        const d = parseDate(value, params, calTz);
        if (d) {
          cur.start = d.t;
          cur.allDay = d.allDay;
        }
        break;
      }
      case "DTEND": {
        const d = parseDate(value, params, calTz);
        if (d) cur.end = d.t;
        break;
      }
      case "RRULE":
        cur.rrule = value.trim();
        break;
      case "EXDATE":
        for (const v of value.split(",")) {
          const d = parseDate(v, params, calTz);
          if (d) cur.exdates.push(d.t);
        }
        break;
      case "RECURRENCE-ID": {
        const d = parseDate(value, params, calTz);
        if (d) cur.recurrenceId = d.t;
        break;
      }
    }
  }
  return events;
}

const DAYS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

/** Expands DAILY / WEEKLY (with BYDAY) / MONTHLY recurrences into the window, minus EXDATEs. */
function expand(e: RawEvent, from: number, to: number): RawEvent[] {
  if (!e.rrule) return [e];
  const rule = Object.fromEntries(e.rrule.split(";").map((p) => p.split("=") as [string, string]));
  const freq = rule.FREQ;
  if (!["DAILY", "WEEKLY", "MONTHLY"].includes(freq)) return [e];
  const interval = Math.max(1, Number(rule.INTERVAL ?? 1));
  const count = rule.COUNT ? Number(rule.COUNT) : Infinity;
  const untilParsed = rule.UNTIL ? parseDate(rule.UNTIL, "", null) : null;
  const until = Math.min(to, untilParsed ? untilParsed.t + (untilParsed.allDay ? DAY : 0) : to);
  let byday = rule.BYDAY ? rule.BYDAY.split(",").map((d) => DAYS.indexOf(d.slice(-2))).filter((d) => d >= 0) : null;
  // BYDAY is in local time; an evening event in the Americas lands on the next UTC day.
  if (byday?.length && !byday.includes(new Date(e.start).getUTCDay())) byday = byday.map((d) => (d + 1) % 7);
  const skip = new Set(e.exdates.map((t) => Math.round(t / 60000)));
  const out: RawEvent[] = [];
  let n = 0;
  const push = (t: number) => {
    n++;
    if (t >= from && t <= until && !skip.has(Math.round(t / 60000))) out.push({ ...e, uid: `${e.uid}#${t}`, start: t, end: e.end != null ? t + (e.end - e.start) : null, rrule: null });
  };
  const start = e.start;
  if (freq === "WEEKLY" && byday?.length) {
    // Walk week by week from the week containing DTSTART.
    const weekStart = start - new Date(start).getUTCDay() * DAY;
    for (let w = 0; n < count && weekStart + w * 7 * DAY <= until && w < 520; w += interval) {
      for (const d of [...byday].sort()) {
        const t = weekStart + w * 7 * DAY + d * DAY;
        if (t < start) continue;
        if (n >= count || t > until) break;
        push(t);
      }
    }
  } else {
    for (let i = 0; n < count && i < 2000; i++) {
      let t: number;
      if (freq === "MONTHLY") {
        const d = new Date(start);
        t = Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + i * interval, d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes());
      } else t = start + i * (freq === "DAILY" ? 1 : 7) * interval * DAY;
      if (t > until) break;
      push(t);
    }
  }
  return out;
}

const TEST = /\b(tests?|exams?|quiz|quizzes|midterms?|finals?|assessments?|summative|mcq|frq|dbq|leq|saq|mock|skill check|unit check|checkpoint)\b/i;
const ASSIGNMENT =
  /\b(hw|homework|assignments?|problem sets?|psets?|due|worksheets?|wksts?|wks|packets?|projects?|essays?|labs?|lab reports?|reading|read|notes|paper|presentations?|submit|turn in|cw|classwork|exit tickets?|warm ?ups?|quickwrites?|vocab|vocabulary|practice|review|graded|formative|log|journal|draft|outline|annotations?|questions|activity|check)\b/i;
const NOT_SCHOOLWORK =
  /\b(no school|holiday|vacation|(winter|spring|fall|thanksgiving|mid-?winter) break|half day|early dismissal|(soccer|football|basketball|baseball|softball|volleyball|lacrosse|tennis|swim|swimming|track|cross country|hockey|golf|wrestling|cheer|band|orchestra|choir|dance|team) (practice|game|meet|match|tryouts?)|rehearsal|club meeting|advisory|assembly|lunch|office hours|pep rally|parent conferences?|picture day|birthday)\b/i;
/** Class periods from a schedule, e.g. "Period 3 English" or "Block A: Chemistry". */
const CLASS_PERIOD = /^\s*(period|per\.?|block|mod|hour)\s*[a-h0-9]{1,2}\b|\b(homeroom|free period|study hall)\b/i;

export const isNotSchoolwork = (title: string) => NOT_SCHOOLWORK.test(title) || CLASS_PERIOD.test(title);

export function classify(text: string): ScheduleEvent["kind"] {
  if (TEST.test(text)) return "test";
  if (ASSIGNMENT.test(text)) return "assignment";
  return "other";
}

/** Distinctive course keywords are enough; generic ones ("chemistry", "calculus") also need "AP" in the text, so honors and regular classes aren't mistaken for AP courses. */
const GENERIC = /^(calculus|calc|precalculus|precalc|pre calc|statistics|stats|java|biology|bio|chemistry|chem|environmental science|enviro sci|physics 1|physics 2|us history|american history|world history|european history|us government|government and politics|comparative government|comp gov|human geography|human geo|macroeconomics|macro econ|microeconomics|micro econ|psychology|psych|african american studies|latin|art history|music theory|electricity and magnetism|e&m|computer science principles|calculus ab|calculus bc|physics c mechanics|physics c mech|physics c em|physics c e&m)$/;

export function detectSchoolCourse(curriculum: TopicMatcher, text: string, courseHints: string[]) {
  const t = ` ${text.toLowerCase().replace(/[^a-z0-9&]+/g, " ")} `;
  const saysAp = /\sap\s|\sapush\s|\sapes\s/.test(t);
  const honors = /\s(h|hon|honors|cp|reg|regular)\s/.test(t) && !saysAp;
  let best: { id: string; len: number; pref: boolean } | null = null;
  for (const c of curriculum.courses) {
    for (const k of c.keywords) {
      const kw = k.toLowerCase().replace(/[^a-z0-9&]+/g, " ").trim();
      if (!kw || !t.includes(` ${kw} `)) continue;
      if (GENERIC.test(kw) && (!saysAp || honors)) continue;
      const cand = { id: c.id, len: kw.length, pref: courseHints.includes(c.id) };
      if (!best || cand.len > best.len || (cand.len === best.len && cand.pref && !best.pref)) best = cand;
    }
  }
  if (best) return best.id;
  // Teachers' shorthand at the start of a title, only for courses the student takes.
  const lead = t.trim().split(" ")[0];
  for (const id of courseHints) if (PREFIXES[id]?.includes(lead)) return id;
  return null;
}

const PREFIXES: Record<string, string[]> = {
  "ap-calculus-bc": ["bc"],
  "ap-calculus-ab": ["ab"],
  "ap-seminar": ["sem"],
  "ap-research": ["research"],
  "ap-world-history": ["world", "apwh", "whap"],
  "ap-us-history": ["apush", "ush"],
  "ap-european-history": ["euro"],
  "ap-statistics": ["stats"],
  "ap-psychology": ["psych"],
  "ap-english-language": ["lang"],
  "ap-english-literature": ["lit"],
};

/** Course and topics named in the event's own text (never guessed from the student's course list alone). */
export function matchEvent(curriculum: TopicMatcher, text: string, courseHints: string[]) {
  const courseId = detectSchoolCourse(curriculum, text, courseHints);
  const topics = courseId ? matchTopics(curriculum, text, { courseIds: [courseId], limit: 3 }).filter((m) => m.score >= 0.85) : [];
  return { courseId, topicIds: topics.map((m) => m.topicId) };
}

/** Feeds from school systems list only coursework, so everything in them counts (minus sports and holidays). */
export function isSchoolFeed(ics: string, url?: string | null) {
  const head = ics.slice(0, 4000);
  const host = url ? (() => { try { return new URL(url).hostname; } catch { return ""; } })() : "";
  return (
    /myschoolapp|blackbaud|instructure|canvas|schoology|veracross|powerschool|brightspace|d2l|moodle|classroom\.google|finalsite|rediker|aspen/i.test(host) ||
    /PRODID:.*(Blackbaud|myschoolapp|Instructure|Canvas|Schoology|Veracross|PowerSchool|Brightspace|D2L|Moodle)/i.test(head) ||
    /X-WR-CALNAME:.*(assignments|classes|homework|coursework)/i.test(head)
  );
}

export type ParseStats = { read: number; kept: number; upcoming: number };

export function eventsFromIcs(ics: string, curriculum: TopicMatcher, courseHints: string[], now = Date.now(), opts: { url?: string | null; stats?: ParseStats; school?: boolean } = {}): ScheduleEvent[] {
  const school = opts.school || isSchoolFeed(ics, opts.url);
  const from = now - WINDOW_PAST_DAYS * DAY;
  const to = now + WINDOW_FUTURE_DAYS * DAY;
  const parsed = parseIcs(ics);
  // Overrides for single occurrences (moved or canceled) of recurring events.
  const overrides = new Map<string, RawEvent>();
  for (const e of parsed) if (e.recurrenceId != null) overrides.set(`${e.uid}|${Math.round(e.recurrenceId / 60000)}`, e);
  const base = parsed.filter((e) => e.recurrenceId == null && !e.cancelled);
  const raw: RawEvent[] = [];
  for (const e of base) {
    for (const occ of expand(e, from, to)) {
      const key = `${e.uid}|${Math.round(occ.start / 60000)}`;
      const o = overrides.get(key);
      if (o) {
        overrides.delete(key);
        if (!o.cancelled) raw.push({ ...o, uid: `${e.uid}#${o.start}` });
      } else raw.push(occ);
    }
  }
  // Overrides whose original instance fell outside the window but were moved into it.
  for (const o of overrides.values()) if (!o.cancelled) raw.push({ ...o, uid: `${o.uid}#${o.start}` });

  const out: ScheduleEvent[] = [];
  const seen = new Set<string>();
  if (opts.stats) opts.stats.read = raw.length;
  // Titles that repeat on several days with no coursework words are class meetings ("AP Calculus BC - 4").
  const titleCount = new Map<string, number>();
  for (const e of raw) titleCount.set(e.summary.toLowerCase(), (titleCount.get(e.summary.toLowerCase()) ?? 0) + 1);
  for (const e0 of raw) {
    // Assignment feeds often run from the day it was assigned to the day it's due: use the due date.
    let e = e0;
    if (school && e0.end != null && e0.end - e0.start > 20 * 3600000) {
      const due = e0.allDay ? e0.end - DAY : e0.end;
      e = { ...e0, start: due, end: null };
    }
    if (e.start < from || e.start > to) continue;
    const text = `${e.summary}\n${e.description}`;
    let kind = classify(e.summary) === "other" ? classify(text) : classify(e.summary);
    if (NOT_SCHOOLWORK.test(e.summary) || CLASS_PERIOD.test(e.summary)) continue;
    // Repeating events are class periods, not coursework, unless they say "quiz" or "test".
    if (e.uid.includes("#") && kind !== "test") continue;
    if (kind === "other") {
      // School systems only list coursework; from a personal calendar, an unlabeled event is skipped.
      if (!school) continue;
      if ((titleCount.get(e.summary.toLowerCase()) ?? 0) >= 3 || /\s[-–]\s*\d{1,2}\s*$/.test(e.summary)) continue;
      kind = "assignment";
    }
    const key = `${e.summary.toLowerCase()}|${Math.round(e.start / 60000)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const { courseId, topicIds } = matchEvent(curriculum, text, courseHints);
    out.push({
      uid: e.uid,
      title: e.summary,
      start: new Date(e.start).toISOString(),
      end: e.end != null ? new Date(e.end).toISOString() : null,
      allDay: e.allDay,
      kind,
      courseId,
      topicIds,
    });
  }
  if (opts.stats) {
    opts.stats.kept = out.length;
    opts.stats.upcoming = out.filter((e) => new Date(e.start).getTime() >= now - DAY / 2).length;
  }
  return out.sort((a, b) => a.start.localeCompare(b.start)).slice(0, 500);
}
