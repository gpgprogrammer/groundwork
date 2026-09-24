import "server-only";
import { getBilling } from "@/lib/billing/access";
import { getStore } from "@/lib/data/store";
import type { Sprint } from "@/lib/types";

export async function getSprint(id: string) {
  return (await getStore()).getDoc<Sprint>("sprints", id);
}

/** The Exam Sprint pass is bought once and unlocks every sprint, for every class and test. */
export async function consumeCredit(s: Sprint) {
  if (s.unlocked) return s;
  const b = await getBilling(s.userId);
  if (!b.sprintPass) return s;
  const next = { ...s, unlocked: true };
  await (await getStore()).putDoc("sprints", s.id, next, s.userId);
  return next;
}
