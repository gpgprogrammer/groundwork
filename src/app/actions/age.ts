"use server";

import { redirect } from "next/navigation";
import { oldEnough, parseBirth, saveBirth } from "@/lib/age";
import { removeAdminUserAccount } from "@/lib/admin-users";
import { clearDemoSession } from "@/lib/auth/session";
import { isSupabaseEnabled } from "@/lib/env";
import { getViewer } from "@/lib/viewer";

export type AgeState = { error?: string };

/**
 * The age check for students who signed up with Google or Apple (signup couldn't ask first).
 * Old enough: the birth month and year are saved and onboarding continues. Under 13: the account
 * and everything in it are deleted right away, and they're signed out.
 */
export async function confirmAge(_: AgeState, form: FormData): Promise<AgeState> {
  const viewer = await getViewer();
  if (!viewer) redirect("/login");
  const birth = parseBirth(form.get("birthMonth"), form.get("birthYear"));
  if (!birth) return { error: "Choose your birth month and year." };
  const next = String(form.get("next") ?? "/");
  if (oldEnough(birth)) {
    await saveBirth(viewer.user.id, birth);
    redirect(`/onboarding${next && next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`);
  }
  if (isSupabaseEnabled) {
    await removeAdminUserAccount({ actorId: "age-check", targetId: viewer.user.id, adminEmails: [] });
    const { createSessionClient } = await import("@/lib/supabase/server");
    await (await createSessionClient()).auth.signOut();
  } else {
    await clearDemoSession();
  }
  redirect("/signup?under13=1");
}
