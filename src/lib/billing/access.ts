import "server-only";
import { randomUUID } from "node:crypto";
import { PLUS } from "@/lib/billing/plans";
import { getStore } from "@/lib/data/store";
import type { Billing, Gift, PaymentSource, PlusAccess, Profile } from "@/lib/types";

export const emptyBilling = (userId: string): Billing => ({
  userId,
  stripeCustomerId: null,
  plus: { status: "none", interval: null, currentPeriodEnd: null, cancelAtPeriodEnd: false, source: null, stripeSubscriptionId: null },
  sprintPass: false,
  sprintCredits: 0,
  purchases: [],
});

export async function getBilling(userId: string): Promise<Billing> {
  const store = await getStore();
  const b = await store.getDoc<Billing>("billing", userId);
  return b ? { ...emptyBilling(userId), ...b, sprintPass: Boolean(b.sprintPass || b.sprintCredits > 0) } : emptyBilling(userId);
}

export async function saveBilling(b: Billing) {
  await (await getStore()).putDoc("billing", b.userId, b, b.userId);
}

export function trialEndsAt(profile: Pick<Profile, "createdAt">) {
  return new Date(new Date(profile.createdAt).getTime() + PLUS.trialDays * 86400000).toISOString();
}

export function plusAccess(profile: Profile | null, billing: Billing | null, now = Date.now()): PlusAccess {
  if (!profile) return { kind: "anonymous" };
  const p = billing?.plus;
  const periodOk = p?.currentPeriodEnd ? new Date(p.currentPeriodEnd).getTime() > now : true;
  if (p && (p.status === "active" || p.status === "past_due") && periodOk) {
    return { kind: "active", renewsAt: p.currentPeriodEnd, cancelAtPeriodEnd: p.cancelAtPeriodEnd, interval: p.interval };
  }
  const ends = trialEndsAt(profile);
  const left = new Date(ends).getTime() - now;
  if (left > 0) return { kind: "trial", daysLeft: Math.ceil(left / 86400000), endsAt: ends };
  return { kind: "expired" };
}

export const hasPlus = (a: PlusAccess) => a.kind === "trial" || a.kind === "active";

/** Calendar sync comes with Plus or with the Exam Sprint pass. */
export const calendarAccess = (v: { plus: PlusAccess; billing: Billing }) => hasPlus(v.plus) || v.billing.sprintPass;

/** Grants a product to a user (after Stripe confirms payment, in test mode, or from a gift). */
export async function grant(userId: string, product: "plus-month" | "plus-year" | "sprint", source: PaymentSource, amount: number, note?: string) {
  const b = await getBilling(userId);
  if (product === "sprint") {
    b.sprintPass = true;
  } else if (source !== "stripe") {
    // Stripe subscriptions are synced from webhooks; this covers gifts and test mode.
    const base = Math.max(Date.now(), b.plus.currentPeriodEnd ? new Date(b.plus.currentPeriodEnd).getTime() : 0);
    const days = product === "plus-year" ? 365 : 30;
    b.plus = {
      ...b.plus,
      status: "active",
      interval: product === "plus-year" ? "year" : "month",
      currentPeriodEnd: new Date(base + days * 86400000).toISOString(),
      cancelAtPeriodEnd: source === "gift",
      source,
    };
  }
  b.purchases.unshift({ id: `pur_${randomUUID().slice(0, 12)}`, product, amount, at: new Date().toISOString(), source, note });
  await saveBilling(b);
  return b;
}

/** Applies any gifts bought for this email address. */
export async function claimGifts(userId: string, email: string) {
  const store = await getStore();
  const gifts = (await store.listDocs<Gift>("gifts")).filter((g) => !g.claimedBy && g.studentEmail === email.trim().toLowerCase());
  for (const g of gifts) {
    await store.putDoc("gifts", g.id, { ...g, claimedBy: userId, claimedAt: new Date().toISOString() });
    await grant(userId, g.product, "gift", 0, `Gift from ${g.buyerName}`);
  }
  return gifts;
}
