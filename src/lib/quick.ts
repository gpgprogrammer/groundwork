import type { Question } from "@/lib/types";

/**
 * Quick sessions: learn one topic's key ideas, watch its top lesson, then pass a
 * short check to mark it mastered. Pure helpers, shared by the server actions and tests.
 */

/** Questions in a mastery check. */
export const CHECK_SIZE = 4;
/** Share of answers that must be right to pass (3 of 4). */
export const PASS_RATIO = 0.75;

/** A check from a topic's question bank; each attempt starts further along the bank, so retries see new questions when there are any. */
export function pickCheck(bank: Question[], attempt: number, size = CHECK_SIZE): Question[] {
  if (bank.length <= size) return bank;
  const start = (Math.max(0, attempt) * size) % bank.length;
  return Array.from({ length: size }, (_, k) => bank[(start + k) % bank.length]);
}

export type CheckAnswer = { questionId: string; choice: number };

/** Grades answers against the bank. Unknown or repeated question ids count as wrong. */
export function gradeCheck(bank: Question[], answers: CheckAnswer[]) {
  const byId = new Map(bank.map((q) => [q.id, q]));
  const seen = new Set<string>();
  let correct = 0;
  for (const a of answers) {
    const q = byId.get(a.questionId);
    if (!q || seen.has(a.questionId)) continue;
    seen.add(a.questionId);
    if (a.choice === q.answer) correct++;
  }
  const total = Math.max(answers.length, 1);
  return { correct, total: answers.length, passed: answers.length > 0 && correct / total >= PASS_RATIO };
}

/** Self-check (used when no practice questions are available): every key idea must be one you can explain. */
export function gradeSelfCheck(keyPointCount: number, known: boolean[]) {
  const count = known.filter(Boolean).length;
  return { correct: count, total: keyPointCount, passed: keyPointCount > 0 && known.length === keyPointCount && count === keyPointCount };
}

/** Rough session length: the lesson plus about five minutes for the ideas and the check. */
export function sessionMinutes(lessonSeconds: number | undefined) {
  return Math.max(5, Math.round((lessonSeconds ?? 0) / 60) + 5);
}
