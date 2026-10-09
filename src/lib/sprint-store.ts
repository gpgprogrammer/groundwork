import "server-only";
import { getBilling, sprintTrialActive } from "@/lib/billing/access";
import { PAID_PLANS } from "@/lib/billing/plans";
import { getStore } from "@/lib/data/store";
import type { Sprint } from "@/lib/types";

export async function getSprint(id: string) {
  return (await getStore()).getDoc<Sprint>("sprints", id);
}

/**
 * Applies the student's Exam Sprint access. The pass unlocks for good; the free
 * week unlocks only while it lasts (nothing is saved, so it relocks afterward). While paid plans
 * are switched off, every Sprint is unlocked.
 */
export async function consumeCredit(s: Sprint) {
  if (s.unlocked) return s;
  // While paid plans are off every Sprint is open (not saved, so it would relock if they come back).
  if (!PAID_PLANS) return { ...s, unlocked: true };
  const b = await getBilling(s.userId);
  if (b.sprintPass) {
    const next = { ...s, unlocked: true };
    await (await getStore()).putDoc("sprints", s.id, next, s.userId);
    return next;
  }
  return sprintTrialActive(b) ? { ...s, unlocked: true } : s;
}
