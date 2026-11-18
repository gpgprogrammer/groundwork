import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getSessionUser, type SessionUser } from "@/lib/auth/session";
import { claimGifts, getBilling, plusAccess } from "@/lib/billing/access";
import { getStore } from "@/lib/data/store";
import { env } from "@/lib/env";
import { PAID_PLANS } from "@/lib/billing/plans";
import type { Billing, PlusAccess, UserState } from "@/lib/types";

export type Viewer = { user: SessionUser; state: UserState; billing: Billing; plus: PlusAccess; isAdmin: boolean };

export const getViewer = cache(async (): Promise<Viewer | null> => {
  const user = await getSessionUser();
  if (!user) return null;
  const store = await getStore();
  // Profile and billing load together instead of one after the other.
  let [state, billing] = await Promise.all([store.getUserState(user.id), getBilling(user.id)]);
  if (!state) {
    await store.ensureProfile(user);
    state = await store.getUserState(user.id);
  }
  if (!state) return null;
  // Gifts can only be bought while paid plans are on, so skip reading every gift on each page view otherwise.
  if (PAID_PLANS) {
    try {
      if ((await claimGifts(user.id, user.email)).length) billing = await getBilling(user.id);
    } catch (err) {
      console.error("[billing] gift claim failed", err);
    }
  }
  return { user, state, billing, plus: plusAccess(state.profile, billing), isAdmin: env.adminEmails.includes(user.email.toLowerCase()) };
});

/** For pages that require an account. Sends people to sign in, then back here. */
export async function requireViewer(next: string): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) redirect(`/login?next=${encodeURIComponent(next)}`);
  return viewer;
}
