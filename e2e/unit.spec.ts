import { expect, test } from "@playwright/test";
import { buildCatalog } from "../src/lib/catalog/build";
import { computeAccess } from "../src/lib/access";
import { rankVideo, wilsonLowerBound } from "../src/lib/ranking";

test.describe("ranking", () => {
  const base = { views: 10000, completions: 6000, avgWatchFraction: 0.7, helpful: 400, notHelpful: 40, saves: 600, rewatchRate: 0.15, earlyDropRate: 0.15 };

  test("views alone do not win", () => {
    const viral = rankVideo({ ...base, views: 80000, completions: 20000, avgWatchFraction: 0.4, saves: 900, earlyDropRate: 0.4 });
    const good = rankVideo(base);
    expect(good.score).toBeGreaterThan(viral.score);
  });

  test("confidence matters for helpful votes", () => {
    expect(wilsonLowerBound(900, 1000)).toBeGreaterThan(wilsonLowerBound(9, 10));
  });

  test("tiny samples are smoothed toward the prior", () => {
    const lucky = rankVideo({ ...base, views: 3, completions: 3, helpful: 3, notHelpful: 0, saves: 3 });
    expect(lucky.completion).toBeLessThan(0.5);
    expect(lucky.score).toBeLessThan(rankVideo(base).score);
  });

  test("scores stay within 0–100", () => {
    for (const v of buildCatalog().videos) {
      const r = rankVideo(v.stats);
      expect(r.score).toBeGreaterThanOrEqual(0);
      expect(r.score).toBeLessThanOrEqual(100);
    }
  });
});

test("catalog ids are unique and every video points at a real topic and educator", () => {
  const c = buildCatalog();
  expect(new Set(c.videos.map((v) => v.id)).size).toBe(c.videos.length);
  expect(new Set(c.topics.map((t) => t.slug)).size).toBe(c.topics.length);
  const topics = new Set(c.topics.map((t) => t.id));
  const eds = new Set(c.educators.map((e) => e.id));
  for (const v of c.videos) {
    expect(topics.has(v.topicId)).toBe(true);
    expect(eds.has(v.educatorId)).toBe(true);
  }
});

test.describe("access", () => {
  const now = Date.parse("2026-09-01T00:00:00Z");
  const state = (over: { trialEndsAt?: string; status?: "none" | "active" | "canceled"; role?: "student" | "creator" }) =>
    ({
      profile: { role: over.role ?? "student", trialEndsAt: over.trialEndsAt ?? "2026-09-10T00:00:00Z" },
      subscription: { status: over.status ?? "none", currentPeriodEnd: null, cancelAtPeriodEnd: false },
    }) as unknown as Parameters<typeof computeAccess>[0];

  test("trial, expired, subscribed, creator", () => {
    expect(computeAccess(null, now).kind).toBe("anonymous");
    expect(computeAccess(state({}), now)).toMatchObject({ kind: "trial", daysLeft: 9 });
    expect(computeAccess(state({ trialEndsAt: "2026-08-01T00:00:00Z" }), now).kind).toBe("expired");
    expect(computeAccess(state({ trialEndsAt: "2026-08-01T00:00:00Z", status: "active" }), now).kind).toBe("active");
    expect(computeAccess(state({ trialEndsAt: "2026-08-01T00:00:00Z", status: "canceled" }), now).kind).toBe("expired");
    expect(computeAccess(state({ trialEndsAt: "2026-08-01T00:00:00Z", role: "creator" }), now).kind).toBe("active");
  });
});
