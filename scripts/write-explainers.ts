/**
 * Writes a short original explainer (200–350 words) for each topic page (src/data/explainers.json).
 *
 *   npx tsx scripts/write-explainers.ts --limit 20             # a sample to review first
 *   npx tsx scripts/write-explainers.ts --courses ap-biology   # one course
 *   npx tsx scripts/write-explainers.ts                        # every topic still missing one
 *
 * Uses the Vercel AI Gateway (AI_GATEWAY_API_KEY or VERCEL_OIDC_TOKEN). Review a sample before
 * shipping: these are shown on the site as Merit's own explanation of each topic.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { generateText, Output } from "ai";
import { z } from "zod";
import { buildCurriculum } from "../src/lib/catalog/build";

const args = process.argv.slice(2);
const val = (name: string) => (args.includes(`--${name}`) ? args[args.indexOf(`--${name}`) + 1] : undefined);
const MODEL = val("model") ?? "anthropic/claude-sonnet-5";
const LIMIT = Number(val("limit") ?? Infinity);
const COURSES = val("courses")?.split(",") ?? null;
const CONCURRENCY = Number(val("concurrency") ?? 4);
const OUT = path.join(process.cwd(), "src", "data", "explainers.json");

const schema = z.object({ paragraphs: z.array(z.string()).min(2).max(4) });

async function main() {
  const cur = buildCurriculum({ allClasses: true });
  const courses = new Map(cur.courses.map((c) => [c.id, c]));
  const units = new Map(cur.units.map((u) => [u.id, u]));
  const out: Record<string, string[]> = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : {};
  const todo = cur.topics.filter((t) => !t.sameAs && !out[t.id] && (!COURSES || COURSES.includes(t.courseId))).slice(0, LIMIT);
  console.log(`${todo.length} topics to write with ${MODEL}.`);
  let done = 0;

  const run = async (t: (typeof todo)[number]) => {
    const course = courses.get(t.courseId)!;
    const unit = units.get(t.unitId)!;
    const { output } = await generateText({
      model: MODEL,
      output: Output.object({ schema }),
      maxOutputTokens: 1200,
      instructions:
        "You write the short explanation at the top of a topic page for high school students. 200 to 350 words in 2 to 4 plain paragraphs (no headings, lists, or markdown). Teach the idea clearly and accurately at the level of the course, with one concrete example and the most common mistake to avoid. Use Unicode for math. Don't mention videos, Merit, or the exam by name unless the topic is about the exam itself.",
      prompt: `Course: ${course.title}\nUnit ${unit.order}: ${unit.title}\nTopic: ${t.title}\nSummary: ${t.summary}\nKey points: ${t.keyPoints.join("; ")}`,
    });
    out[t.id] = output.paragraphs.map((p) => p.trim()).filter(Boolean);
    done++;
  };

  for (let i = 0; i < todo.length; i += CONCURRENCY) {
    await Promise.all(todo.slice(i, i + CONCURRENCY).map((t) => run(t).catch((e) => console.error(`\n${t.id} failed:`, e instanceof Error ? e.message : e))));
    writeFileSync(OUT, JSON.stringify(out, null, 0));
    process.stdout.write(`\r${done}/${todo.length} written   `);
  }
  console.log(`\nDone. ${Object.keys(out).length} topics have explainers.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
