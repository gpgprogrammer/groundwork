import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { cache } from "react";
import { env, isSupabaseEnabled } from "@/lib/env";

export type SessionUser = { id: string; email: string; name: string };

export const DEMO_COOKIE = "gw_session";
const MAX_AGE = 60 * 60 * 24 * 30;

function sign(value: string) {
  return createHmac("sha256", env.authSecret).update(value).digest("base64url");
}

export function encodeDemoSession(userId: string) {
  const payload = `${userId}.${Date.now() + MAX_AGE * 1000}`;
  return `${payload}.${sign(payload)}`;
}

export function decodeDemoSession(token: string | undefined): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, expires, sig] = parts;
  const expected = Buffer.from(sign(`${userId}.${expires}`));
  const actual = Buffer.from(sig);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  if (Number(expires) < Date.now()) return null;
  return userId;
}

export async function setDemoSession(userId: string) {
  (await cookies()).set(DEMO_COOKIE, encodeDemoSession(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearDemoSession() {
  (await cookies()).delete(DEMO_COOKIE);
}

/** The signed-in user for this request, or null. Deduplicated per request. */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  if (isSupabaseEnabled) {
    const { createSessionClient } = await import("@/lib/supabase/server");
    const supabase = await createSessionClient();
    const { data } = await supabase.auth.getUser();
    const u = data.user;
    if (!u) return null;
    return {
      id: u.id,
      email: u.email ?? "",
      name: (u.user_metadata?.name as string | undefined) ?? u.email?.split("@")[0] ?? "Student",
    };
  }
  const userId = decodeDemoSession((await cookies()).get(DEMO_COOKIE)?.value);
  if (!userId) return null;
  const { localGetUser } = await import("@/lib/data/demo-store");
  const u = await localGetUser(userId);
  return u ? { id: u.id, email: u.email, name: u.name } : null;
});
