import "server-only";
import { contentModel } from "@/lib/ai/model";
import { generateText, Output } from "ai";
import { z } from "zod";
import { aiAvailable } from "@/lib/ai/runtime";
import { curriculum } from "@/lib/catalog";
import { classify, matchEvent } from "@/lib/ics";
import type { ScheduleEvent } from "@/lib/types";

/**
 * Turns a calendar the student can't subscribe to (a PDF export, a CSV, or text
 * copied from a school portal) into dated events. Nothing is saved until the
 * student reviews the list, so a misread line never lands on their schedule.
 */

export type Candidate = { title: string; date: string; time: string | null; kind: ScheduleEvent["kind"]; courseId: string | null; topicIds: string[]; suggested: boolean };

const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
const MON = MONTHS.map((m) => m.slice(0, 3));
const monthIndex = (s: string) => {
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

const iso = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

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

function toCandidate(title: string, date: string, time: string | null, courseHints: string[]): Candidate {
  const kind = classify(title);
  const { courseId, topicIds } = matchEvent(curriculum, title, courseHints);
  return { title: title.slice(0, 160), date, time, kind, courseId, topicIds, suggested: kind === "test" || kind === "assignment" };
}

/** Line-based parsing: dated lines, or undated lines under a date heading. */
export function candidatesFromText(text: string, courseHints: string[], now = new Date()): Candidate[] {
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

type Item = { str: string; x: number; y: number };

/** Rebuilds lines from PDF text positions, and reads month-grid calendars cell by cell. */
export async function candidatesFromPdf(data: Uint8Array, courseHints: string[], now = new Date()): Promise<{ candidates: Candidate[]; text: string }> {
  const { extractTextItems } = await import("unpdf");
  const { items } = await extractTextItems(data);
  const out: Candidate[] = [];
  const lines: string[] = [];
  for (const page of items as Item[][]) {
    const cleaned = page.filter((i) => i.str.trim());
    // Group into lines by y (top to bottom), then left to right.
    const byY = new Map<number, Item[]>();
    for (const i of cleaned) {
      const key = [...byY.keys()].find((y) => Math.abs(y - i.y) < 3) ?? i.y;
      byY.set(key, [...(byY.get(key) ?? []), i]);
    }
    const pageLines = [...byY.entries()].sort((a, b) => b[0] - a[0]).map(([, row]) => row.sort((a, b) => a.x - b.x).map((i) => i.str.trim()).join("  "));
    lines.push(...pageLines);

    // Month grid: a "September 2026" heading and day numbers 1..28+ spread across columns.
    const heading = pageLines.join(" ").match(new RegExp(`\\b(${MONTHS.join("|")})\\s+(20\\d{2})\\b`, "i"));
    const anchors = cleaned.filter((i) => /^\d{1,2}$/.test(i.str.trim()) && +i.str <= 31);
    const distinctDays = new Set(anchors.map((a) => +a.str));
    if (heading && distinctDays.size >= 25) {
      const month = monthIndex(heading[1]);
      const year = +heading[2];
      const colXs = [...new Set(anchors.map((a) => Math.round(a.x / 10) * 10))].sort((a, b) => a - b);
      const colWidth = colXs.length > 1 ? Math.min(...colXs.slice(1).map((x, k) => x - colXs[k]).filter((d) => d > 20)) : 100;
      const cellText = new Map<Item, string[]>();
      for (const i of cleaned) {
        if (anchors.includes(i) || heading[0].toLowerCase().includes(i.str.trim().toLowerCase())) continue;
        // The day cell is the nearest day number above and to the left, within one column.
        const owner = anchors
          .filter((a) => a.y >= i.y - 2 && i.x >= a.x - colWidth * 0.15 && i.x < a.x + colWidth * 0.95)
          .sort((a, b) => a.y - b.y)[0];
        if (owner) cellText.set(owner, [...(cellText.get(owner) ?? []), i.str.trim()]);
      }
      for (const [a, parts] of cellText) {
        const day = +a.str;
        // Grids show trailing days of neighboring months; skip days that don't exist.
        if (day < 1 || day > new Date(Date.UTC(year, month + 1, 0)).getUTCDate()) continue;
        for (const title of parts.join(" ").split(/\s{2,}|(?<=[a-z0-9)])\s+(?=(?:AP|Honors|HW|Quiz|Test|Due)\b)/)) {
          if (title.length >= 3 && /[a-z]{3}/i.test(title)) out.push(toCandidate(title, iso(year, month, day), null, courseHints));
        }
      }
    }
  }
  const text = lines.join("\n");
  const fromLines = candidatesFromText(text, courseHints, now);
  return { candidates: dedupe(out.length >= fromLines.length ? out : fromLines), text };
}

function dedupe(c: Candidate[]) {
  const seen = new Set<string>();
  return c.filter((x) => {
    const k = `${x.date}|${x.title.toLowerCase()}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

const aiSchema = z.object({
  events: z.array(
    z.object({
      title: z.string(),
      date: z.string().describe("YYYY-MM-DD"),
      time: z.string().nullable().describe("HH:MM 24-hour, or null"),
    }),
  ),
});

/** When Merit AI is on, it reads messy layouts better than rules do. It may only copy events that are in the text. */
export async function candidatesWithAi(text: string, courseHints: string[]): Promise<Candidate[] | null> {
  if (!text.trim() || !(await aiAvailable())) return null;
  try {
    const { output } = await generateText({
      model: contentModel(),
      maxOutputTokens: 4000,
      output: Output.object({ schema: aiSchema }),
      instructions:
        "Extract school tests, quizzes, and assignments with their dates from a student's calendar export. Copy titles exactly as written. Only include items that are explicitly in the text, with the date the text gives for them. Never invent, infer, or add events. If a date's year is missing, use the year that makes the date fall within the current school year.",
      prompt: `Today is ${new Date().toISOString().slice(0, 10)}.\n\n${text.slice(0, 30000)}`,
    });
    return dedupe(
      output.events
        .filter((e) => /^\d{4}-\d{2}-\d{2}$/.test(e.date) && text.toLowerCase().includes(e.title.toLowerCase().slice(0, 12)))
        .map((e) => toCandidate(e.title, e.date, e.time && /^\d{2}:\d{2}$/.test(e.time) ? e.time : null, courseHints)),
    );
  } catch (err) {
    console.error("[import] AI extraction failed", err);
    return null;
  }
}
