"use server";

import { revalidatePath } from "next/cache";
import { getCatalog } from "@/lib/catalog";
import { getStore } from "@/lib/data/store";
import { questionFromId } from "@/lib/mathgen";
import { addResults, PRACTICE_COLLECTION, type PracticeStats } from "@/lib/practice-stats";
import { getViewer } from "@/lib/viewer";

/**
 * Saves a practice round for a signed-in student. Answers are re-checked on the server by rebuilding
 * each problem from its id, so results can't be faked. Signed-out practice simply isn't saved.
 */
export async function recordPractice(topicId: string, answers: { questionId: string; choice: number }[]): Promise<{ saved: boolean }> {
  const viewer = await getViewer();
  if (!viewer) return { saved: false };
  if (!(await getCatalog()).topic(topicId)) return { saved: false };
  const results: boolean[] = [];
  const seen = new Set<string>();
  for (const a of answers.slice(0, 50)) {
    if (seen.has(a.questionId)) continue;
    seen.add(a.questionId);
    const q = questionFromId(a.questionId);
    if (!q || q.topicId !== topicId) continue;
    results.push(a.choice === q.answer);
  }
  if (!results.length) return { saved: false };
  try {
    const store = await getStore();
    const prev = await store.getDoc<PracticeStats>(PRACTICE_COLLECTION, viewer.user.id);
    await store.putDoc(PRACTICE_COLLECTION, viewer.user.id, addResults(prev, viewer.user.id, topicId, results), viewer.user.id);
  } catch (err) {
    console.error("[practice] couldn't save results", err);
    return { saved: false };
  }
  revalidatePath("/practice");
  revalidatePath("/plan");
  return { saved: true };
}
