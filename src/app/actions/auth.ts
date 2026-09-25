"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { clearDemoSession, setDemoSession } from "@/lib/auth/session";
import { getStore } from "@/lib/data/store";
import { env, isSupabaseEnabled } from "@/lib/env";

export type AuthState = { error?: string; message?: string; fields?: { name?: string; email?: string } };

const safeNext = (next: unknown, fallback: string) => {
  const n = typeof next === "string" ? next : "";
  return n.startsWith("/") && !n.startsWith("//") ? n : fallback;
};

const signUpSchema = z.object({
  name: z.string().trim().min(1, "Tell us your name.").max(80),
  email: z.string().trim().toLowerCase().email("That email doesn't look right."),
  password: z.string().min(8, "Use at least 8 characters."),
  accountType: z.enum(["student", "teacher"], { message: "Choose whether this is a student or a teacher account." }),
});

async function origin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return host ? `${proto}://${host}` : env.appUrl;
}

export async function signUp(_: AuthState, form: FormData): Promise<AuthState> {
  const parsed = signUpSchema.safeParse(Object.fromEntries(form));
  const fields = { name: String(form.get("name") ?? ""), email: String(form.get("email") ?? "") };
  if (!parsed.success) return { error: parsed.error.issues[0].message, fields };
  const { name, email, password, accountType } = parsed.data;
  const teacher = accountType === "teacher";
  // Teachers set up their studio profile; students pick their courses.
  const firstStop = teacher ? "/studio?welcome=teacher" : "/onboarding";

  if (isSupabaseEnabled) {
    const { createSessionClient } = await import("@/lib/supabase/server");
    const supabase = await createSessionClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, account_type: accountType }, emailRedirectTo: `${await origin()}/auth/callback?next=${encodeURIComponent(firstStop)}` },
    });
    if (error) return { error: error.message, fields };
    if (!data.session) return { message: `Check ${email} for a confirmation link to finish creating your account.` };
  } else {
    const { localCreateUser, localFindUserByEmail } = await import("@/lib/data/demo-store");
    if (await localFindUserByEmail(email)) return { error: "An account with that email already exists. Sign in instead.", fields };
    const user = await localCreateUser(name, email, password);
    await (await getStore()).ensureProfile({ id: user.id, email: user.email, name: user.name });
    await setDemoSession(user.id);
  }
  const next = safeNext(form.get("next"), "");
  if (teacher) redirect(firstStop);
  redirect(next ? `/onboarding?next=${encodeURIComponent(next)}` : "/onboarding");
}

export async function signIn(_: AuthState, form: FormData): Promise<AuthState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const next = safeNext(form.get("next"), "/");
  if (!email || !password) return { error: "Enter your email and password.", fields: { email } };

  if (isSupabaseEnabled) {
    const { createSessionClient } = await import("@/lib/supabase/server");
    const supabase = await createSessionClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: "That email and password don't match.", fields: { email } };
  } else {
    const { localFindUserByEmail, verifyPassword } = await import("@/lib/data/demo-store");
    const user = await localFindUserByEmail(email);
    if (!user || !verifyPassword(user, password)) return { error: "That email and password don't match.", fields: { email } };
    await setDemoSession(user.id);
  }
  redirect(next);
}

/** Google or Apple sign-in through Supabase Auth. */
export async function signInWithProvider(form: FormData) {
  if (!isSupabaseEnabled) redirect("/login");
  const provider = form.get("provider") === "apple" ? "apple" : "google";
  const { createSessionClient } = await import("@/lib/supabase/server");
  const supabase = await createSessionClient();
  const next = safeNext(form.get("next"), "/");
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${await origin()}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error || !data.url) redirect("/login?error=oauth");
  redirect(data.url);
}

export async function signOut() {
  if (isSupabaseEnabled) {
    const { createSessionClient } = await import("@/lib/supabase/server");
    await (await createSessionClient()).auth.signOut();
  } else {
    await clearDemoSession();
  }
  redirect("/");
}

/** Emails a link to choose a new password. Always answers the same way, so it doesn't reveal who has an account. */
export async function requestPasswordReset(_: AuthState, form: FormData): Promise<AuthState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (!z.string().email().safeParse(email).success) return { error: "Enter the email you signed up with.", fields: { email } };
  if (!isSupabaseEnabled) return { error: "Password reset needs the database connected." };
  const { createSessionClient } = await import("@/lib/supabase/server");
  const supabase = await createSessionClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${await origin()}/auth/callback?next=/reset-password` });
  if (error && /rate|limit|seconds/i.test(error.message)) return { error: "Too many requests. Wait a minute and try again.", fields: { email } };
  if (error) console.error("[auth] reset email failed", error.message);
  return { message: `If there's a Merit account for ${email}, we've emailed it a link to choose a new password. Check your spam folder if it doesn't arrive in a few minutes.` };
}

/** Sets a new password for the signed-in user (after following the emailed link). */
export async function updatePassword(_: AuthState, form: FormData): Promise<AuthState> {
  const password = String(form.get("password") ?? "");
  if (password.length < 8) return { error: "Use at least 8 characters." };
  if (password !== String(form.get("confirm") ?? "")) return { error: "Those passwords don't match." };
  if (!isSupabaseEnabled) return { error: "Password reset needs the database connected." };
  const { createSessionClient } = await import("@/lib/supabase/server");
  const supabase = await createSessionClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: /session|auth/i.test(error.message) ? "That reset link has expired. Request a new one." : error.message };
  redirect("/home?password=updated");
}
