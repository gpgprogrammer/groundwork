import type { Access, UserState } from "@/lib/types";

/** Who can watch: creators, subscribers, and anyone inside their free month. */
export function computeAccess(state: UserState | null, now = Date.now()): Access {
  if (!state) return { kind: "anonymous" };
  const { profile, subscription: sub } = state;
  if (profile.role === "creator") return { kind: "active", renewsAt: null, cancelAtPeriodEnd: false };
  if (sub.status === "active" || sub.status === "trialing" || sub.status === "past_due") {
    return { kind: "active", renewsAt: sub.currentPeriodEnd, cancelAtPeriodEnd: sub.cancelAtPeriodEnd };
  }
  const ends = new Date(profile.trialEndsAt).getTime();
  if (ends > now) return { kind: "trial", daysLeft: Math.ceil((ends - now) / 86400000), endsAt: profile.trialEndsAt };
  return { kind: "expired" };
}
