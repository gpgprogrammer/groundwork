/**
 * AI audit of every lesson's topic fit (writes src/data/video-audit.json).
 *
 *   npx tsx scripts/audit-videos.ts              # audit videos that haven't been audited yet
 *   npx tsx scripts/audit-videos.ts --limit 500  # just the first 500 (to check quality and cost)
 *   npx tsx scripts/audit-videos.ts --redo       # audit everything again
 *
 * Uses the Vercel AI Gateway (AI_GATEWAY_API_KEY or VERCEL_OIDC_TOKEN). YouTube doesn't give out
 * captions for other people's videos, so the audit reads what the API returns: title, channel,
 * description, and length, against the topic and course the video is filed under. Progress is
 * saved after every batch, so it can be stopped and resumed.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { generateText, Output } from "ai";
import { z } from "zod";
import { buildCurriculum } from "../src/lib/catalog/build";
import type { YtVideo } from "../src/lib/types";

const args = process.argv.slice(2);
const opt = (name: string, def: number) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? Number(args[i + 1]) : def;
};
const MODEL = args.includes("--model") ? args[args.indexOf("--model") + 1] : "anthropic/claude-haiku-4.5";
const LIMIT = opt("limit", Infinity);
const BATCH = 25;
const CONCURRENCY = opt("concurrency", 4);
const OUT = path.join(process.cwd(), "src", "data", "video-audit.json");

type Entry = { fit: number; flags?: string[] };
const FLAGS = ["ad", "spam", "non_english", "off_topic", "wrong_level", "not_a_lesson"] as const;

const schema = z.object({
  results: z.array(
    z.object({
      id: z.string(),
      fit: z.number().min(0).max(1).describe("How squarely this video teaches the given topic, for a high school student in this course. 1 = a focused lesson on exactly this topic."),
      flags: z.array(z.enum(FLAGS)).describe("Only the problems that clearly apply."),
    }),
  ),
});

async function main() {
  const cur = buildCurriculum({ allClasses: true });
  const topics = new Map(cur.topics.map((t) => [t.id, t]));
  const courses = new Map(cur.courses.map((c) => [c.id, c]));
  const lib = JSON.parse(readFileSync(path.join(process.cwd(), "src", "data", "youtube.json"), "utf8")) as { videos: YtVideo[] };
  const audit: Record<string, Entry> = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : {};
  const todo = lib.videos.filter((v) => v.topicId && (args.includes("--redo") || !audit[v.id])).slice(0, LIMIT);
  console.log(`${todo.length} videos to audit with ${MODEL} (${Object.keys(audit).length} already done).`);

  const batches: YtVideo[][] = [];
  for (let i = 0; i < todo.length; i += BATCH) batches.push(todo.slice(i, i + BATCH));
  let done = 0;
  let inTokens = 0;
  let outTokens = 0;

  const run = async (batch: YtVideo[]) => {
    const lines = batch.map((v) => {
      const t = topics.get(v.topicId!)!;
      const c = courses.get(v.courseId)!;
      return JSON.stringify({ id: v.id, course: c?.title, topic: t?.title, topicSummary: t?.summary, title: v.title, channel: v.channelTitle, minutes: Math.round(v.durationSec / 60), description: v.description.slice(0, 280) });
    });
    const { output, usage } = await generateText({
      model: MODEL,
      output: Output.object({ schema }),
      maxOutputTokens: 4000,
      instructions:
        "You audit a library of YouTube lessons for high school students. For each video, judge from its title, channel, length, and description how squarely it teaches the topic it's filed under, at a high school level for that course (AP, SAT, or a regular or honors high school class). Score fit from 0 to 1: 1 = a focused lesson on exactly this topic; 0.6 = covers it as part of a broader lesson or review; 0.3 = mostly about something else; 0 = unrelated. Flag only clear problems: ad (selling a product or service), spam (engagement bait, not instruction), non_english (not taught in English, except world-language courses), off_topic, wrong_level (college/graduate material, or another country's exam syllabus that differs, e.g. GCSE or CBSE, when it would mislead a US high school student), not_a_lesson (vlogs, reactions, news, motivation). Be fair to good teachers with clickbait-style titles.",
      prompt: `Audit these videos. Return one result per id.\n${lines.join("\n")}`,
    });
    inTokens += usage.inputTokens ?? 0;
    outTokens += usage.outputTokens ?? 0;
    for (const r of output.results) if (batch.some((v) => v.id === r.id)) audit[r.id] = { fit: Math.round(r.fit * 100) / 100, ...(r.flags.length ? { flags: r.flags } : {}) };
    done += batch.length;
  };

  for (let i = 0; i < batches.length; i += CONCURRENCY) {
    await Promise.all(batches.slice(i, i + CONCURRENCY).map((b) => run(b).catch((e) => console.error("\nbatch failed:", e instanceof Error ? e.message : e))));
    writeFileSync(OUT, JSON.stringify(audit));
    process.stdout.write(`\r${done}/${todo.length} audited · ${inTokens.toLocaleString()} in / ${outTokens.toLocaleString()} out tokens   `);
  }
  const flagged = Object.values(audit).filter((e) => e.flags?.length || e.fit < 0.25).length;
  console.log(`\nDone. ${Object.keys(audit).length} audited, ${flagged} flagged or below 0.25 fit (hidden on the site).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
