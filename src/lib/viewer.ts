import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getSessionUser, type SessionUser } from "@/lib/auth/session";
import { claimGifts, getBilling, plusAccess } from "@/lib/billing/access";
import { getStore } from "@/lib/data/store";
import { env } from "@/lib/env";
import type { Billing, PlusAccess, UserState } from "@/lib/types";

export type Viewer = { user: SessionUser; state: UserState; billing: Billing; plus: PlusAccess; isAdmin: boolean };

export const getViewer = cache(async (): Promise<Viewer | null> => {
  const user = await getSessionUser();
  if (!user) return null;
  const store = await getStore();
  let state = await store.getUserState(user.id);
  if (!state) {
    await store.ensureProfile(user);
    state = await store.getUserState(user.id);
  }
  if (!state) return null;
  let billing = await getBilling(user.id);
  try {
    if ((await claimGifts(user.id, user.email)).length) billing = await getBilling(user.id);
  } catch (err) {
    console.error("[billing] gift claim failed", err);
  }
  return { user, state, billing, plus: plusAccess(state.profile, billing), isAdmin: env.adminEmails.includes(user.email.toLowerCase()) };
});

/** For pages that require an account. Sends people to sign in, then back here. */
export async function requireViewer(next: string): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) redirect(`/login?next=${encodeURIComponent(next)}`);
  return viewer;
}
