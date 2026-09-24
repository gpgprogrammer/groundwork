import "server-only";
import { contentModel } from "@/lib/ai/model";
import { generateText, Output } from "ai";
import { z } from "zod";
import { aiAvailable } from "@/lib/ai/runtime";
import { candidatesFromText, dedupe, iso, MONTHS, monthIndex, toCandidate, type Candidate } from "@/lib/extract-text";

export { candidatesFromCsv, candidatesFromText, type Candidate } from "@/lib/extract-text";

/**
 * Turns a calendar the student can't subscribe to (a PDF export, a CSV, or text
 * copied from a school portal) into dated events. Nothing is saved until the
 * student reviews the list, so a misread line never lands on their schedule.
 */

type Item = { str: string; x: number; y: number; width?: number };

const WEEKDAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const DAY = 86400000;
/** Timed entries in a portal's month view are class periods, clubs, and games, not coursework. */
const TIMED = /^\d{1,2}(:\d{2})?\s*(a|p|am|pm)\b/i;
const NOT_WORK = /^([AB]( Day| \(TWS\))|[AB] Day \(TWS\))$|^[AB] Day \(|closed$|-close$|^no (school|summatives|quizz|tests|homework)/i;
const CHROME = /^\d{1,2}\/\d{1,2}\/\d{2,4},|^https?:\/\/|^\d+\/\d+$|current view saved|^student\s*:\s*calendar$/i;

/**
 * A month view printed from a school portal (Blackbaud and others). The weekday
 * headers mark the columns; the grid starts on the Sunday before the 1st, so any
 * day number tells us which week a row is. Works across pages.
 */
function monthGrid(pages: Item[][], courseHints: string[], now: Date): Candidate[] | null {
  const all = pages.flat();
  const head = all.map((i) => i.str.trim().match(new RegExp(`^(${MONTHS.join("|")})\\s+(20\\d{2})$`, "i"))).find(Boolean);
  if (!head) return null;
  const month = monthIndex(head[1]);
  const year = +head[2];
  const first = Date.UTC(year, month, 1);
  const gridStart = first - new Date(first).getUTCDay() * DAY;
  const found: { day: number; title: string }[] = [];
  let bounds: number[] | null = null;
  let carryRow: number | null = null;
  for (const page of pages) {
    const items = page.filter((i) => i.str.trim());
    const heads = items.filter((i) => WEEKDAYS.includes(i.str.trim().toLowerCase().slice(0, 3)) && i.str.trim().length <= 9);
    if (heads.length >= 5) {
      const centers = heads.map((h) => h.x + (h.width ?? 0) / 2).sort((x, y) => x - y);
      bounds = centers.slice(1).map((c, k) => (c + centers[k]) / 2);
    }
    if (!bounds) continue;
    const headerY = heads.length ? Math.min(...heads.map((h) => h.y)) : Infinity;
    const col = (x: number) => {
      const k = bounds!.findIndex((b) => x < b);
      return k < 0 ? bounds!.length : k;
    };
    // Week rows on this page, from their day numbers.
    const rows = new Map<number, number>(); // week index -> y of its day numbers
    for (const i of items) {
      if (!/^\d{1,2}$/.test(i.str.trim()) || i.y >= headerY) continue;
      const v = +i.str.trim();
      const c = col(i.x + (i.width ?? 0) / 2);
      for (let r = 0; r < 7; r++) {
        if (new Date(gridStart + (7 * r + c) * DAY).getUTCDate() === v) {
          rows.set(r, Math.max(rows.get(r) ?? -Infinity, i.y));
          break;
        }
      }
    }
    const ordered = [...rows.entries()].sort((x, y) => y[1] - x[1]); // top of page first
    // Collect text lines per (row, column).
    const cells = new Map<string, Item[]>();
    for (const i of items) {
      const t = i.str.trim();
      if (i.y >= headerY || /^\d{1,2}$/.test(t) || CHROME.test(t) || heads.includes(i)) continue;
      const above = ordered.filter(([, y]) => y > i.y);
      const r = above.length ? above[above.length - 1][0] : carryRow;
      if (r === null) continue;
      const key = `${r}:${col(i.x)}`;
      cells.set(key, [...(cells.get(key) ?? []), i]);
    }
    for (const [key, parts] of cells) {
      const [r, c] = key.split(":").map(Number);
      const lines = new Map<number, Item[]>();
      for (const it of parts) {
        const k = [...lines.keys()].find((y) => Math.abs(y - it.y) < 3) ?? it.y;
        lines.set(k, [...(lines.get(k) ?? []), it]);
      }
      for (const [, row] of [...lines.entries()].sort((x, y) => y[0] - x[0])) {
        const title = row.sort((x, y) => x.x - y.x).map((it) => it.str.trim()).join(" ").replace(/\s+/g, " ");
        if (title.length < 3 || TIMED.test(title) || NOT_WORK.test(title)) continue;
        found.push({ day: 7 * r + c, title });
      }
    }
    if (ordered.length) carryRow = ordered[ordered.length - 1][0];
  }
  if (!found.length) return null;
  // Printing cuts titles short, and not always at the same place ("BC 3.2 work" vs "BC 3.2 worksheet"):
  // treat a title that's a prefix of a longer one as the same assignment.
  const titles = [...new Set(found.map((f) => f.title))].sort((x, y) => y.length - x.length);
  const canon = new Map<string, string>();
  for (const t of titles) canon.set(t, titles.find((l) => l.length > t.length && t.length >= 8 && l.startsWith(t)) ?? t);
  // An assignment is drawn in every day from assigned to due: keep the last day of each run.
  const byTitle = new Map<string, number[]>();
  for (const f of found) {
    const t = canon.get(f.title)!;
    byTitle.set(t, [...(byTitle.get(t) ?? []), f.day]);
  }
  const out: Candidate[] = [];
  for (const [title, days] of byTitle) {
    const sorted = [...new Set(days)].sort((x, y) => x - y);
    sorted.forEach((d, k) => {
      if (k + 1 < sorted.length && sorted[k + 1] - d <= 1) return;
      const dt = new Date(gridStart + d * DAY);
      const c = toCandidate(title, iso(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate()), null, courseHints);
      // Titles are cut short in print, hiding words like "worksheet"; anything tied to one of your classes is coursework.
      if (c.courseId && c.kind === "other") out.push({ ...c, kind: "assignment", suggested: true });
      else out.push(c);
    });
  }
  void now;
  return dedupe(out.sort((x, y) => x.date.localeCompare(y.date)));
}

/** Rebuilds lines from PDF text positions, and reads month-grid calendars cell by cell. */
export async function candidatesFromPdf(data: Uint8Array, courseHints: string[], now = new Date()): Promise<{ candidates: Candidate[]; text: string }> {
  const { extractTextItems } = await import("unpdf");
  const { items } = await extractTextItems(data);
  const pages = items as Item[][];
  const lines: string[] = [];
  for (const page of pages) {
    const byY = new Map<number, Item[]>();
    for (const i of page.filter((x) => x.str.trim())) {
      const key = [...byY.keys()].find((y) => Math.abs(y - i.y) < 3) ?? i.y;
      byY.set(key, [...(byY.get(key) ?? []), i]);
    }
    lines.push(...[...byY.entries()].sort((a, b) => b[0] - a[0]).map(([, row]) => row.sort((a, b) => a.x - b.x).map((i) => i.str.trim()).join("  ")));
  }
  const text = lines.join("\n");
  const grid = monthGrid(pages, courseHints, now);
  if (grid?.length) return { candidates: grid, text };
  return { candidates: candidatesFromText(text, courseHints, now), text };
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

/** Screenshots of a school calendar (month or list view). Needs Merit AI to read the image. */
export async function candidatesFromImages(images: { data: Uint8Array; type: string }[], courseHints: string[]): Promise<Candidate[] | null> {
  if (!images.length || !(await aiAvailable())) return null;
  try {
    const { output } = await generateText({
      model: contentModel(),
      maxOutputTokens: 6000,
      output: Output.object({ schema: aiSchema }),
      instructions:
        "You read screenshots of a student's school calendar (for example Blackbaud, Canvas, or Schoology) and list every assignment, quiz, and test exactly as shown, with its date and time. Use the month and year in the calendar header and the day number of the cell each item is in. Copy titles exactly; if a class name is shown under the title, add it after a colon (for example \"BC 2.4 wkst: AP Calculus BC - 4\"). Never invent items. Skip items too cut off to read.",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: `Today is ${new Date().toISOString().slice(0, 10)}. List every item in these calendar screenshots.` },
            ...images.map((i) => ({ type: "file" as const, mediaType: i.type || "image/png", data: i.data })),
          ],
        },
      ],
    });
    return dedupe(
      output.events
        .filter((e) => /^\d{4}-\d{2}-\d{2}$/.test(e.date) && e.title.trim())
        .map((e) => toCandidate(e.title.trim(), e.date, e.time && /^\d{2}:\d{2}$/.test(e.time) ? e.time : null, courseHints)),
    );
  } catch (err) {
    console.error("[import] screenshot reading failed", err);
    return null;
  }
}
