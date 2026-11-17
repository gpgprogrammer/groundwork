import "server-only";
import { taskModel } from "@/lib/ai/router";
import { randomUUID } from "node:crypto";
import { generateText, Output } from "ai";
import { z } from "zod";
import { getCatalog } from "@/lib/catalog";
import { getStore } from "@/lib/data/store";
import type { Question } from "@/lib/types";
import { aiAvailable } from "./runtime";
import { generateForTopic, hasPractice } from "@/lib/mathgen";

/**
 * Generated study content, cached so each topic's questions and each unit's
 * cram sheet are written once and shared by every student.
 */

type Bank = { topicId: string; questions: Question[]; updatedAt: string };

const inflight = new Map<string, Promise<Question[]>>();

const questionSchema = z.object({
  questions: z.array(
    z.object({
      stem: z.string().describe("The question. Include any passage, data, or setup it needs. Plain text; use Unicode for math (x², √, π, ≤)."),
      choices: z.array(z.string()).length(4),
      answer: z.number().int().min(0).max(3),
      explanations: z.array(z.string()).length(4).describe("For each choice, one or two sentences on why it is right or wrong"),
      difficulty: z.enum(["easy", "medium", "hard"]),
    }),
  ),
});

async function describeTopic(topicId: string) {
  const catalog = await getCatalog();
  const topic = catalog.topic(topicId);
  if (!topic) throw new Error(`Unknown topic ${topicId}`);
  const unit = catalog.unit(topic.unitId)!;
  const course = catalog.course(topic.courseId)!;
  return { topic, unit, course };
}

export async function questionsForTopic(topicId: string, need = 6): Promise<Question[]> {
  const store = await getStore();
  const bank = await store.getDoc<Bank>("qbank", topicId);
  // Math topics with a built-in generator get fresh, instant problems (no AI wait), mixed with any
  // questions Merit AI already wrote for the topic.
  if (hasPractice(topicId)) return [...generateForTopic(topicId, need), ...(bank?.questions ?? [])];
  if (bank && bank.questions.length >= need) return bank.questions;
  if (!(await aiAvailable())) return bank?.questions ?? [];

  const key = topicId;
  const running = inflight.get(key);
  if (running) return running;
  const job = (async () => {
    const { topic, unit, course } = await describeTopic(topicId);
    const existing = bank?.questions ?? [];
    const { output } = await generateText({
      ...taskModel("expert"),
      maxOutputTokens: 6000,
      output: Output.object({ schema: questionSchema }),
      instructions:
        "You write exam-quality multiple-choice practice questions for high school students in AP, SAT, honors, and regular classes. Questions must be accurate, unambiguous, and match the real exam's or class test's style and difficulty. Exactly one choice is correct. Wrong choices should be plausible and reflect real misconceptions. Vary the correct answer's position.",
      prompt: `Course: ${course.title}
Unit ${unit.order}: ${unit.title}
Topic: ${topic.title}
What students should know: ${topic.summary} ${topic.keyPoints.join("; ")}

Write 6 multiple-choice questions on this topic in the style of ${course.exam === "SAT" ? "the digital SAT" : course.exam === "Class" ? `a high school ${course.title} unit test` : `the AP ${course.title.replace(/^AP /, "")} exam`}: 2 easy, 3 medium, 1 hard.${course.category === "World Languages & Cultures" ? " Write stems and choices in the target language where the real exam would, with any instructions in English." : ""}${
        existing.length ? `\nDon't repeat these existing questions:\n${existing.map((q) => `- ${q.stem.slice(0, 120)}`).join("\n")}` : ""
      }`,
    });
    const fresh: Question[] = output.questions
      .filter((q) => q.choices.length === 4 && q.explanations.length === 4)
      .map((q) => ({ ...q, id: `q_${randomUUID().slice(0, 10)}`, topicId }));
    const questions = [...existing, ...fresh];
    await store.putDoc<Bank>("qbank", topicId, { topicId, questions, updatedAt: new Date().toISOString() });
    return questions;
  })();
  inflight.set(key, job);
  try {
    return await job;
  } catch (err) {
    console.error(`[ai] question generation failed for ${topicId}`, err);
    return bank?.questions ?? [];
  } finally {
    inflight.delete(key);
  }
}

/** Picks `count` questions across topics, preferring ones this student hasn't seen. */
export async function practiceSet(topicIds: string[], count: number, seen: Set<string>) {
  const banks = await Promise.all(topicIds.map((id) => questionsForTopic(id)));
  const pools = banks.map((qs) => [...qs.filter((q) => !seen.has(q.id)), ...qs.filter((q) => seen.has(q.id))]);
  const out: Question[] = [];
  for (let round = 0; out.length < count && pools.some((p) => p.length > round); round++) {
    for (const p of pools) if (p[round] && out.length < count) out.push(p[round]);
  }
  return out;
}

// ── Cram sheets ──────────────────────────────────────────────────────────────

type Cram = { unitId: string; markdown: string; updatedAt: string };

export async function cramSheet(unitId: string) {
  const store = await getStore();
  const cached = await store.getDoc<Cram>("cram", unitId);
  if (cached) return cached.markdown;
  if (!(await aiAvailable())) return null;
  const catalog = await getCatalog();
  const unit = catalog.unit(unitId);
  if (!unit) return null;
  const course = catalog.course(unit.courseId)!;
  const topics = catalog.topicsForUnit(unit.id);
  const { text } = await generateText({
    ...taskModel("standard"),
    maxOutputTokens: 2500,
    instructions:
      "You write one-page cram sheets for high school students the week before an AP exam, the SAT, or a class test. Dense, accurate, scannable. Markdown with ### headings and bullet lists only. No tables, no LaTeX; use Unicode for math.",
    prompt: `${course.title}, Unit ${unit.order}: ${unit.title}.
Topics: ${topics.map((t) => `${t.title} (${t.keyPoints.join("; ")})`).join(" | ")}

Write the cram sheet with these sections:
### The big ideas
### Must-know facts, formulas, and terms
### Classic exam traps
### If you remember only five things`,
  });
  await store.putDoc<Cram>("cram", unitId, { unitId, markdown: text, updatedAt: new Date().toISOString() });
  return text;
}

// ── Free-response coach ──────────────────────────────────────────────────────

export async function frqPrompt(unitId: string) {
  if (!(await aiAvailable())) return null;
  const catalog = await getCatalog();
  const unit = catalog.unit(unitId);
  if (!unit) return null;
  const course = catalog.course(unit.courseId)!;
  const { text } = await generateText({
    ...taskModel("standard"),
    maxOutputTokens: 900,
    instructions: "You write realistic free-response practice prompts for high school students preparing for AP exams, the SAT, and class tests. Output only the prompt: any setup, data, or source excerpt, then clearly lettered parts. Plain text; Unicode for math.",
    prompt: `Write one ${course.exam === "SAT" ? "short constructed-response practice question" : course.exam === "Class" ? `free-response question like those on a high school ${course.title} unit test` : `AP ${course.title.replace(/^AP /, "")}-style free-response question`} on ${course.title}, Unit ${unit.order}: ${unit.title}. Topics to draw from: ${catalog
      .topicsForUnit(unit.id)
      .map((t) => t.title)
      .join(", ")}. It should take about 15 minutes.`,
  });
  return text.trim();
}

const gradeSchema = z.object({
  score: z.number().int().min(0),
  outOf: z.number().int().min(1),
  feedback: z.string().describe("Markdown. What earned points, what lost points, and exactly how to fix it. Then a model answer."),
});

export async function gradeFrq(unitId: string, prompt: string, answer: string) {
  if (!(await aiAvailable())) return null;
  const catalog = await getCatalog();
  const unit = catalog.unit(unitId);
  if (!unit) return null;
  const course = catalog.course(unit.courseId)!;
  const { output } = await generateText({
    ...taskModel("expert"),
    maxOutputTokens: 2500,
    output: Output.object({ schema: gradeSchema }),
    instructions: `You are an experienced ${course.exam === "Class" ? `high school ${course.title} teacher` : `${course.title} exam reader`}. Score the student's answer against a rubric like ${course.exam === "Class" ? "a teacher's test rubric" : "the real exam's"} (one point per required element per part), then coach them. Be encouraging and specific. Use Unicode for math.`,
    prompt: `Question:\n${prompt}\n\nStudent answer:\n${answer}`,
  });
  return output;
}
