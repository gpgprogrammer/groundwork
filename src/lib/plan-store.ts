import "server-only";
import { randomBytes } from "node:crypto";
import { getStore } from "@/lib/data/store";
import { DEFAULT_PREFS, type PlanPrefs } from "@/lib/plan";

export async function getPlanPrefs(userId: string): Promise<PlanPrefs> {
  const store = await getStore();
  const existing = await store.getDoc<PlanPrefs>("planPrefs", userId);
  if (existing?.feedToken) return { ...DEFAULT_PREFS, ...existing };
  const prefs = { ...DEFAULT_PREFS, ...existing, feedToken: randomBytes(18).toString("base64url") };
  await store.putDoc("planPrefs", userId, prefs, userId);
  await store.putDoc("planFeeds", prefs.feedToken, { userId });
  return prefs;
}

export async function savePlanPrefs(userId: string, patch: Partial<Omit<PlanPrefs, "feedToken">>) {
  const store = await getStore();
  const prefs = { ...(await getPlanPrefs(userId)), ...patch };
  await store.putDoc("planPrefs", userId, prefs, userId);
  return prefs;
}

export async function userForFeed(token: string) {
  return (await (await getStore()).getDoc<{ userId: string }>("planFeeds", token))?.userId ?? null;
}

export async function getDoneTasks(userId: string) {
  return (await (await getStore()).getDoc<Record<string, string>>("planDone", userId)) ?? {};
}

export async function setTaskDone(userId: string, taskId: string, done: boolean) {
  const store = await getStore();
  const rows = await getDoneTasks(userId);
  if (done) rows[taskId] = new Date().toISOString();
  else delete rows[taskId];
  // Keep a rolling 60 days.
  const cutoff = new Date(Date.now() - 60 * 86400000).toISOString().slice(0, 10);
  for (const k of Object.keys(rows)) if (k.slice(0, 10) < cutoff) delete rows[k];
  await store.putDoc("planDone", userId, rows, userId);
}
