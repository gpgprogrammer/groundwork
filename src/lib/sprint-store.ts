import "server-only";
import { getBilling, saveBilling } from "@/lib/billing/access";
import { getStore } from "@/lib/data/store";
import type { Sprint } from "@/lib/types";

export async function getSprint(id: string) {
  return (await getStore()).getDoc<Sprint>("sprints", id);
}

/** Uses one of the student's paid Sprint credits to unlock this sprint. */
export async function consumeCredit(s: Sprint) {
  if (s.unlocked) return s;
  const b = await getBilling(s.userId);
  if (b.sprintCredits < 1) return s;
  await saveBilling({ ...b, sprintCredits: b.sprintCredits - 1 });
  const next = { ...s, unlocked: true };
  await (await getStore()).putDoc("sprints", s.id, next, s.userId);
  return next;
}
