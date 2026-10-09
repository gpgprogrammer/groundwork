import { PAID_PLANS } from "@/lib/billing/plans";
import type { Billing, PlusAccess, Profile } from "@/lib/types";

/** Who has Merit Plus right now: pure rules, shared by the server and tests. */

/**
 * Accounts created before trials became opt-in got Plus free for their first month automatically;
 * they keep it. Everyone after starts on the free plan and starts a trial when they want one.
 */
export const AUTO_TRIAL_CUTOFF = "2026-10-05T15:39:00.000Z";
const LEGACY_TRIAL_DAYS = 30;

/** When this account's Plus trial ends (or ended), or null if it has never started one. */
export function trialEndsAt(profile: Pick<Profile, "createdAt">, billing: Pick<Billing, "plusTrialEndsAt"> | null) {
  if (billing?.plusTrialEndsAt) return billing.plusTrialEndsAt;
  if (profile.createdAt && profile.createdAt < AUTO_TRIAL_CUTOFF) return new Date(new Date(profile.createdAt).getTime() + LEGACY_TRIAL_DAYS * 86400000).toISOString();
  return null;
}

/** Who has Plus right now. While paid plans are off, every signed-in student does. */
export function plusAccess(profile: Profile | null, billing: Billing | null, now = Date.now()): PlusAccess {
  if (profile && !PAID_PLANS) return { kind: "included" };
  return paidPlusAccess(profile, billing, now);
}

/** The paid-plan rules (subscriptions and trials), used whenever paid plans are on. */
export function paidPlusAccess(profile: Profile | null, billing: Billing | null, now = Date.now()): PlusAccess {
  if (!profile) return { kind: "anonymous" };
  const p = billing?.plus;
  const periodOk = p?.currentPeriodEnd ? new Date(p.currentPeriodEnd).getTime() > now : true;
  if (p && (p.status === "active" || p.status === "past_due") && periodOk) {
    return { kind: "active", renewsAt: p.currentPeriodEnd, cancelAtPeriodEnd: p.cancelAtPeriodEnd, interval: p.interval };
  }
  const ends = trialEndsAt(profile, billing);
  if (!ends) return { kind: "free" };
  const left = new Date(ends).getTime() - now;
  if (left > 0) return { kind: "trial", daysLeft: Math.ceil(left / 86400000), endsAt: ends };
  return { kind: "expired" };
}

export const hasPlus = (a: PlusAccess) => a.kind === "trial" || a.kind === "active" || a.kind === "included";
