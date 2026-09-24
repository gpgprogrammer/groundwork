import "server-only";
import { contentModel } from "@/lib/ai/model";
import { generateText, Output } from "ai";
import { z } from "zod";
import { aiAvailable } from "@/lib/ai/runtime";
import { candidatesFromBlocks, candidatesFromText, DAY_HEAD, dedupe, iso, MONTHS, monthIndex, toCandidate, type Candidate } from "@/lib/extract-text";

export { candidatesFromCsv, candidatesFromText, type Candidate } from "@/lib/extract-text";

/**
 * Turns a calendar the student can't subscribe to (a PDF export, a CSV, or text
 * copied from a school portal) into dated events. Nothing is saved until the
 * student reviews the list, so a misread line never lands on their schedule.
 */

type Item = { str: string; x: number; y: number };

/** Rebuilds lines from PDF text positions, and reads month-grid calendars cell by cell. */
export async function candidatesFromPdf(data: Uint8Array, courseHints: string[], now = new Date()): Promise<{ candidates: Candidate[]; text: string }> {
  const { extractTextItems } = await import("unpdf");
  const { items } = await extractTextItems(data);
  const out: Candidate[] = [];
  const lines: string[] = [];
  let lastHeading: RegExpMatchArray | null = null;
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
    // Later pages of a printed month view repeat no heading; reuse the last one.
    const heading: RegExpMatchArray | null = pageLines.join(" ").match(new RegExp(`\\b(${MONTHS.join("|")})\\s+(20\\d{2})\\b`, "i")) ?? lastHeading;
    lastHeading = heading;
    const dayOf = (i: Item) => {
      const m = i.str.trim().match(DAY_HEAD);
      return m && +m[2] >= 1 && +m[2] <= 31 ? +m[2] : null;
    };
    const anchors = cleaned.filter((i) => dayOf(i) !== null && i.str.trim().length <= 7);
    const distinctDays = new Set(anchors.map((a) => dayOf(a)));
    if (heading && distinctDays.size >= 5) {
      const month = monthIndex(heading[1]);
      const year = +heading[2];
      const colXs = [...new Set(anchors.map((a) => Math.round(a.x / 10) * 10))].sort((a, b) => a - b);
      const colWidth = colXs.length > 1 ? Math.min(...colXs.slice(1).map((x, k) => x - colXs[k]).filter((d) => d > 20)) : 100;
      const cellText = new Map<Item, Item[]>();
      for (const i of cleaned) {
        if (anchors.includes(i) || heading[0].toLowerCase().includes(i.str.trim().toLowerCase())) continue;
        // The day cell is the nearest day number above and to the left, within one column.
        const owner = anchors
          .filter((a) => a.y >= i.y - 2 && i.x >= a.x - colWidth * 0.15 && i.x < a.x + colWidth * 0.95)
          .sort((a, b) => a.y - b.y)[0];
        if (owner) cellText.set(owner, [...(cellText.get(owner) ?? []), i]);
      }
      for (const [a, parts] of cellText) {
        const day = dayOf(a)!;
        // Grids show trailing days of neighboring months; skip days that don't exist.
        if (day < 1 || day > new Date(Date.UTC(year, month + 1, 0)).getUTCDate()) continue;
        // Rebuild the cell's lines top to bottom, then read it like a pasted day.
        const rows = new Map<number, Item[]>();
        for (const it of parts) {
          const key = [...rows.keys()].find((y) => Math.abs(y - it.y) < 3) ?? it.y;
          rows.set(key, [...(rows.get(key) ?? []), it]);
        }
        const cellLines = [...rows.entries()].sort((x, y) => y[0] - x[0]).map(([, r]) => r.sort((x, y) => x.x - y.x).map((it) => it.str.trim()).join(" "));
        out.push(...(candidatesFromBlocks(cellLines, courseHints, now, iso(year, month, day)) ?? []));
      }
    }
  }
  const text = lines.join("\n");
  const fromLines = candidatesFromText(text, courseHints, now);
  return { candidates: dedupe(out.length >= fromLines.length ? out : fromLines), text };
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
