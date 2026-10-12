import "server-only";
import { cookies } from "next/headers";
import { ageFrom, MIN_AGE } from "@/lib/company";
import { getStore } from "@/lib/data/store";

/**
 * Students give their birth month and year at signup (COPPA): anyone under 13 is turned away before
 * an account exists. Google and Apple sign-up can't ask first, so the signup page stores the answer in
 * a short-lived cookie and onboarding saves it, or asks again if it's missing.
 */
export type BirthDate = { month: number; year: number };

export const AGE_COOKIE = "merit_birth";

export function parseBirth(month: unknown, year: unknown): BirthDate | null {
  const m = Number(month);
  const y = Number(year);
  const now = new Date().getFullYear();
  if (!Number.isInteger(m) || m < 1 || m > 12 || !Number.isInteger(y) || y < now - 100 || y > now) return null;
  return { month: m, year: y };
}

export const oldEnough = (b: BirthDate) => ageFrom(b.month, b.year) >= MIN_AGE;

export async function saveBirth(userId: string, b: BirthDate) {
  await (await getStore()).putDoc("ages", userId, { ...b, at: new Date().toISOString() }, userId);
}

export async function getBirth(userId: string) {
  return (await getStore()).getDoc<BirthDate>("ages", userId);
}

/** The birth month and year a student gave on the signup page before using Google or Apple, if any. */
export async function birthFromCookie() {
  const raw = (await cookies()).get(AGE_COOKIE)?.value ?? "";
  const [m, y] = raw.split("-");
  return parseBirth(m, y);
}
