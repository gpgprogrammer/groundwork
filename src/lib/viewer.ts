import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getSessionUser, type SessionUser } from "@/lib/auth/session";
import { getStore } from "@/lib/data/store";
import type { UserState } from "@/lib/types";

export type Viewer = { user: SessionUser; state: UserState };

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
  return { user, state };
});

/** For pages that require an account. Sends people to sign in, then back here. */
export async function requireViewer(next: string): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) redirect(`/login?next=${encodeURIComponent(next)}`);
  return viewer;
}
