import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getSessionUser, type SessionUser } from "@/lib/auth/session";
import { getStore } from "@/lib/data/store";
import { computeAccess } from "@/lib/access";
import type { Access, UserState } from "@/lib/types";

export { computeAccess };

export type Viewer = { user: SessionUser; state: UserState; access: Access };

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
  return { user, state, access: computeAccess(state) };
});

/** For pages that require an account. Sends people to sign in, then back here. */
export async function requireViewer(next: string): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) redirect(`/login?next=${encodeURIComponent(next)}`);
  return viewer;
}

/** Plus features: calendar sync and the personalized feed. */
export function hasPlus(access: Access) {
  return access.kind === "trial" || access.kind === "active";
}
