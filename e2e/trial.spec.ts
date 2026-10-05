import { expect, test } from "@playwright/test";
import { AUTO_TRIAL_CUTOFF, hasPlus, plusAccess } from "../src/lib/billing/trial";
import type { Billing, Profile } from "../src/lib/types";

const DAY = 86400000;
const NOW = Date.parse("2026-10-20T12:00:00Z");
const profile = (createdAt: string) => ({ createdAt }) as Profile;
const billing = (over: Partial<Billing> = {}) =>
  ({
    userId: "u",
    stripeCustomerId: null,
    plus: { status: "none", interval: null, currentPeriodEnd: null, cancelAtPeriodEnd: false, source: null, stripeSubscriptionId: null },
    sprintPass: false,
    sprintCredits: 0,
    purchases: [],
    ...over,
  }) as Billing;

test.describe("Merit Plus trial", () => {
  test("new accounts start on the free plan, not a trial", () => {
    const a = plusAccess(profile("2026-10-19T00:00:00Z"), billing(), NOW);
    expect(a.kind).toBe("free");
    expect(hasPlus(a)).toBe(false);
  });

  test("a started trial lasts until its end date, then it's used up", () => {
    const ends = new Date(NOW + 14 * DAY - 1000).toISOString();
    const running = plusAccess(profile("2026-10-19T00:00:00Z"), billing({ plusTrialEndsAt: ends }), NOW);
    expect(running).toMatchObject({ kind: "trial", daysLeft: 14 });
    expect(hasPlus(running)).toBe(true);
    expect(plusAccess(profile("2026-10-19T00:00:00Z"), billing({ plusTrialEndsAt: ends }), NOW + 15 * DAY).kind).toBe("expired");
  });

  test("accounts from before opt-in trials keep their automatic free month", () => {
    const before = new Date(Date.parse(AUTO_TRIAL_CUTOFF) - DAY).toISOString();
    const a = plusAccess(profile(before), billing(), Date.parse(AUTO_TRIAL_CUTOFF) + 10 * DAY);
    expect(a.kind).toBe("trial");
    expect(plusAccess(profile(before), billing(), Date.parse(AUTO_TRIAL_CUTOFF) + 40 * DAY).kind).toBe("expired");
  });

  test("a paid subscription wins over everything", () => {
    const paid = billing({ plus: { status: "active", interval: "month", currentPeriodEnd: new Date(NOW + 20 * DAY).toISOString(), cancelAtPeriodEnd: false, source: "stripe", stripeSubscriptionId: "sub" } });
    expect(plusAccess(profile("2026-10-19T00:00:00Z"), paid, NOW).kind).toBe("active");
  });
});
