"use server";

import { revalidatePath } from "next/cache";
import { questionsForTopic } from "@/lib/ai/content";
import { aiAvailable } from "@/lib/ai/runtime";
import { getCatalog } from "@/lib/catalog";
import { getStore } from "@/lib/data/store";
import { gradeCheck, gradeSelfCheck, pickCheck, type CheckAnswer } from "@/lib/quick";
import type { Question } from "@/lib/types";
import { getViewer } from "@/lib/viewer";

async function topicOrThrow(topicId: string) {
  const topic = (await getCatalog()).topic(topicId);
  if (!topic) throw new Error("Unknown topic");
  return topic;
}

/** The mastery check for a quick session. Falls back to a self-check when no questions are available. */
export async function loadQuickCheck(topicId: string, attempt: number): Promise<{ questions: Question[] } | { selfCheck: true } | { error: "auth" }> {
  if (!(await getViewer())) return { error: "auth" };
  await topicOrThrow(topicId);
  const bank = await questionsForTopic(topicId);
  if (!bank.length) {
    if (await aiAvailable()) console.warn(`[quick] no questions for ${topicId}; using self-check`);
    return { selfCheck: true };
  }
  return { questions: pickCheck(bank, attempt) };
}

/** Grades a finished check on the server and marks the topic mastered when it passes. */
export async function finishQuickSession(
  topicId: string,
  result: { kind: "questions"; answers: CheckAnswer[] } | { kind: "self"; known: boolean[] },
): Promise<{ passed: boolean; correct: number; total: number } | { error: "auth" }> {
  const viewer = await getViewer();
  if (!viewer) return { error: "auth" };
  const topic = await topicOrThrow(topicId);
  let graded: { passed: boolean; correct: number; total: number };
  if (result.kind === "questions") {
    const bank = (await (await getStore()).getDoc<{ questions: Question[] }>("qbank", topicId))?.questions ?? [];
    graded = gradeCheck(bank, result.answers.slice(0, 10));
  } else {
    // Only allowed when there really are no questions for this topic.
    const bank = (await (await getStore()).getDoc<{ questions: Question[] }>("qbank", topicId))?.questions ?? [];
    if (bank.length) throw new Error("This topic has a question check.");
    graded = gradeSelfCheck(topic.keyPoints.length || 1, result.known);
  }
  if (graded.passed && !viewer.state.mastered[topicId]) {
    await (await getStore()).setMastered(viewer.user.id, topicId, true);
    revalidatePath("/", "layout");
  }
  return graded;
}
