import { buildCurriculum } from "@/lib/catalog/build";
import { classify, isNotSchoolwork, matchEvent } from "@/lib/ics";
import type { ScheduleEvent } from "@/lib/types";

/**
 * Pure parsing for calendars the student can't subscribe to: text copied from a
 * school portal, CSV exports, and month-grid layouts. Nothing here saves data.
 */

let cur: ReturnType<typeof buildCurriculum> | null = null;
const curriculum = () => (cur ??= buildCurriculum());

export type Candidate = { title: string; date: string; time: string | null; kind: ScheduleEvent["kind"]; courseId: string | null; topicIds: string[]; suggested: boolean };

export const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
export const MON = MONTHS.map((m) => m.slice(0, 3));
export const monthIndex = (s: string) => {
  const k = s.toLowerCase().slice(0, 3);
  return MON.indexOf(k === "sep" ? "sep" : k);
};

/** Picks the year that puts month/day nearest to now (school calendars rarely print years). */
function inferYear(month: number, day: number, now: Date) {
  const y = now.getFullYear();
  const candidates = [y - 1, y, y + 1].map((yy) => ({ yy, t: Date.UTC(yy, month, day) }));
  const target = now.getTime() + 60 * 86400000; // bias toward the coming months
  return candidates.sort((a, b) => Math.abs(a.t - target) - Math.abs(b.t - target))[0].yy;
}

export const iso = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

type Found = { date: string; rest: string; time: string | null };

const RE_ISO = /\b(20\d{2})-(\d{1,2})-(\d{1,2})\b/;
const RE_SLASH = /\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/;
const RE_WORD = new RegExp(`\\b(${MONTHS.join("|")}|${MON.join("|")}|sept)\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:,?\\s+(20\\d{2}))?\\b`, "i");
const RE_WORD_REV = new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(${MONTHS.join("|")}|${MON.join("|")})\\.?(?:,?\\s+(20\\d{2}))?\\b`, "i");
const RE_TIME = /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)/i;
const RE_WEEKDAY = /\b(mon|tue|tues|wed|thu|thur|thurs|fri|sat|sun)(day|nesday|sday|urday)?\.?,?\s*/gi;

function findDate(line: string, now: Date): Found | null {
  let m: RegExpMatchArray | null;
  let date: string | null = null;
  let matched = "";
  if ((m = line.match(RE_ISO))) {
    date = iso(+m[1], +m[2] - 1, +m[3]);
    matched = m[0];
  } else if ((m = line.match(RE_WORD))) {
    const mo = monthIndex(m[1]);
    date = iso(m[3] ? +m[3] : inferYear(mo, +m[2], now), mo, +m[2]);
    matched = m[0];
  } else if ((m = line.match(RE_WORD_REV))) {
    const mo = monthIndex(m[2]);
    date = iso(m[3] ? +m[3] : inferYear(mo, +m[1], now), mo, +m[1]);
    matched = m[0];
  } else if ((m = line.match(RE_SLASH)) && +m[1] >= 1 && +m[1] <= 12 && +m[2] >= 1 && +m[2] <= 31) {
    const y = m[3] ? (m[3].length === 2 ? 2000 + +m[3] : +m[3]) : inferYear(+m[1] - 1, +m[2], now);
    date = iso(y, +m[1] - 1, +m[2]);
    matched = m[0];
  }
  if (!date) return null;
  const t = line.match(RE_TIME);
  let time: string | null = null;
  if (t) {
    let h = +t[1] % 12;
    if (/p/i.test(t[3])) h += 12;
    time = `${String(h).padStart(2, "0")}:${t[2] ?? "00"}`;
  }
  const rest = line
    .replace(matched, " ")
    .replace(RE_TIME, " ")
    .replace(RE_WEEKDAY, " ")
    .replace(/\b(due|assigned)\s*:?\s*$/i, " ")
    .replace(/[|•·\t]+/g, " ")
    .replace(/^[\s\-–—:,.]+|[\s\-–—:,.]+$/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  return { date, rest, time };
}

export function toCandidate(title: string, date: string, time: string | null, courseHints: string[], context = ""): Candidate {
  const kind = classify(title) === "other" ? classify(`${title} ${context}`) : classify(title);
  const { courseId, topicIds } = matchEvent(curriculum(), `${title} ${context}`, courseHints);
  return { title: title.slice(0, 160), date, time, kind, courseId, topicIds, suggested: (kind === "test" || kind === "assignment") && !isNotSchoolwork(title) };
}

/** Calendar chrome copied along with the events. */
const UI_WORDS = /^(sun|mon|tue|wed|thu|fri|sat)(day|sday|nesday|rsday|urday)?$|^(today|month|week|day|list|agenda|previous|next|print|filter|filters)$/i;
const TIME_ONLY = /^\s*\d{1,2}(:\d{2})?\s*(am|pm|a\.m\.|p\.m\.)\s*$/i;
/** Lines a school portal prints under each item: points, grading details, and status. */
const META = /(\bpts?\.?(\s|$)|\bpoints\b|\|)|^(graded|completed|overdue|to do|missing|late|excused|not started|in progress|submitted|incomplete|exempt|new|due today|due tomorrow)$|^(assignments?|homework|classwork|homework\/classwork|formative|summative|quiz|writing|vocabulary|creative( projects)?|lab\/quiz|test\/project|online submission|on paper submission|habits of work|writing process and revision|reading, thinking, and evidence( development)?)\s*\|?$/i;
const MONTH_YEAR = new RegExp("^\\s*(" + MONTHS.join("|") + ")\\s+(20\\d{2})\\b", "i");
export const DAY_HEAD = new RegExp("^\\s*(?:(" + MON.join("|") + "|sept)\\.?\\s+)?(\\d{1,2})\\s*$", "i");

function to24(t: string) {
  const m = t.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)/i)!;
  let h = +m[1] % 12;
  if (/p/i.test(m[3])) h += 12;
  return `${String(h).padStart(2, "0")}:${m[2] ?? "00"}`;
}

/**
 * Calendar views copied or printed from school portals (Blackbaud, Canvas…):
 * a day number, then for each item a time, the title, the class, and details.
 * Returns null when the text doesn't look like that layout.
 */
export function candidatesFromBlocks(lines: string[], courseHints: string[], now = new Date(), fixedDate?: string): Candidate[] | null {
  const timeLines = lines.filter((l) => TIME_ONLY.test(l)).length;
  if (!fixedDate && timeLines < 3) return null;
  let month = now.getMonth();
  let year = now.getFullYear();
  let day: number | null = null;
  let lastDay = 0;
  const out: Candidate[] = [];
  let pending: { time: string | null; title: string | null; context: string[] } | null = null;
  const flush = () => {
    if (pending?.title) {
      const date = fixedDate ?? (day ? iso(year, month, day) : null);
      if (date) out.push(toCandidate(pending.title, date, pending.time, courseHints, pending.context.join(" ")));
    }
    pending = null;
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const my = line.match(MONTH_YEAR);
    if (my && line.length < 24) {
      flush();
      month = monthIndex(my[1]);
      year = +my[2];
      lastDay = 0;
      continue;
    }
    const dh = fixedDate ? null : line.match(DAY_HEAD);
    if (dh && +dh[2] >= 1 && +dh[2] <= 31) {
      flush();
      if (dh[1]) {
        const m = monthIndex(dh[1]);
        if (m === 0 && month === 11) year += 1;
        month = m;
      } else if (lastDay === 0 && +dh[2] > 20) {
        // Trailing days of the previous month at the start of a month grid.
        month = (month + 11) % 12;
        if (month === 11) year -= 1;
      } else if (+dh[2] < lastDay - 7) {
        // The grid rolled into next month.
        month = (month + 1) % 12;
        if (month === 0) year += 1;
      }
      day = +dh[2];
      lastDay = day;
      continue;
    }
    if (TIME_ONLY.test(line)) {
      flush();
      pending = { time: to24(line), title: null, context: [] };
      continue;
    }
    if (META.test(line) || UI_WORDS.test(line)) continue;
    if (!pending) pending = { time: null, title: null, context: [] };
    if (!pending.title) pending.title = line;
    else if (pending.context.length < 1) pending.context.push(line);
    else {
      // A new item without a time line.
      flush();
      pending = { time: null, title: line, context: [] };
    }
  }
  flush();
  return dedupe(out);
}

/** Line-based parsing: dated lines, or undated lines under a date heading. */
export function candidatesFromText(text: string, courseHints: string[], now = new Date()): Candidate[] {
  const blocks = candidatesFromBlocks(text.replace(/\r/g, "").split("\n"), courseHints, now);
  if (blocks && blocks.length) return blocks;
  const out: Candidate[] = [];
  let current: string | null = null;
  for (const raw of text.replace(/\r/g, "").split("\n")) {
    const line = raw.trim();
    if (line.length < 2) continue;
    const f = findDate(line, now);
    if (f) {
      if (f.rest.length >= 3 && /[a-z]/i.test(f.rest)) out.push(toCandidate(f.rest, f.date, f.time, courseHints));
      else current = f.date; // a date heading; events follow on the next lines
    } else if (current && /[a-z]{3}/i.test(line) && line.length <= 160) {
      out.push(toCandidate(line, current, null, courseHints));
    }
  }
  return dedupe(out);
}

/** CSV exports: finds the title and date columns by header name. */
export function candidatesFromCsv(csv: string, courseHints: string[], now = new Date()): Candidate[] {
  const rows = csv
    .replace(/\r/g, "")
    .split("\n")
    .filter((r) => r.trim())
    .map((r) => r.match(/("([^"]|"")*"|[^,]*)(,|$)/g)?.map((c) => c.replace(/,$/, "").replace(/^"|"$/g, "").replace(/""/g, '"').trim()) ?? []);
  if (rows.length < 2) return candidatesFromText(csv, courseHints, now);
  const head = rows[0].map((h) => h.toLowerCase());
  const col = (re: RegExp) => head.findIndex((h) => re.test(h));
  const ti = col(/title|subject|summary|assignment|name|event/);
  const di = col(/due|date|start/);
  const ci = col(/class|course/);
  if (ti < 0 || di < 0) return candidatesFromText(csv, courseHints, now);
  const out: Candidate[] = [];
  for (const r of rows.slice(1)) {
    const f = findDate(r[di] ?? "", now);
    if (!f || !r[ti]) continue;
    const title = [ci >= 0 ? r[ci] : "", r[ti]].filter(Boolean).join(": ");
    out.push(toCandidate(title, f.date, f.time, courseHints));
  }
  return dedupe(out);
}

export function dedupe(c: Candidate[]) {
  const seen = new Set<string>();
  return c.filter((x) => {
    const k = `${x.date}|${x.title.toLowerCase()}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
