import "server-only";
import { getStore } from "@/lib/data/store";
import type { Tier } from "./router-rules";

/**
 * What Merit AI spends, per day and tier, so the admin dashboard can show where answers went, what
 * they cost (as OpenRouter reports it), and what the same answers would have cost on the expert
 * model alone. One small document per day; nothing about the student or the question is stored.
 */

type TierDay = { answers: number; inputTokens: number; outputTokens: number; cachedTokens: number; cost: number; baseline: number; byRule: number; byClassifier: number };
export type CostDay = { date: string; tiers: Partial<Record<Tier, TierDay>>; models: Record<string, number> };

const empty = (): TierDay => ({ answers: 0, inputTokens: 0, outputTokens: 0, cachedTokens: 0, cost: 0, baseline: 0, byRule: 0, byClassifier: 0 });

export async function recordAnswer(a: { tier: Tier; via: "rule" | "classifier" | "off"; model: string; inputTokens: number; outputTokens: number; cachedTokens: number; cost: number; baseline: number }) {
  try {
    const store = await getStore();
    const date = new Date().toISOString().slice(0, 10);
    const day = (await store.getDoc<CostDay>("aiCosts", date)) ?? { date, tiers: {}, models: {} };
    const t = { ...empty(), ...day.tiers[a.tier] };
    t.answers += 1;
    t.inputTokens += a.inputTokens;
    t.outputTokens += a.outputTokens;
    t.cachedTokens += a.cachedTokens;
    t.cost += a.cost;
    t.baseline += a.baseline;
    if (a.via === "rule") t.byRule += 1;
    if (a.via === "classifier") t.byClassifier += 1;
    day.tiers[a.tier] = t;
    day.models[a.model] = (day.models[a.model] ?? 0) + 1;
    await store.putDoc("aiCosts", date, day);
  } catch (err) {
    console.error("[ai-costs] failed to record", err);
  }
}

/** Totals for the last `days` days, newest last. */
export async function costHistory(days = 30) {
  const store = await getStore();
  const since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
  return (await store.listDocs<CostDay>("aiCosts")).filter((d) => d.date >= since).sort((a, b) => a.date.localeCompare(b.date));
}
