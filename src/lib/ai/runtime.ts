import "server-only";
import { probeModel } from "@/lib/ai/model";
import { createHash } from "node:crypto";
import { generateText } from "ai";
import { hasPlus } from "@/lib/billing/access";
import { getStore } from "@/lib/data/store";
import { isAiConfigured } from "@/lib/env";
import type { Viewer } from "@/lib/viewer";
import { AI_LIMITS } from "./limits";
import { trackServer } from "@/lib/analytics";

let status: { ok: boolean; at: number; reason?: string } | null = null;

/**
 * Whether the AI Gateway is answering. Checked with a tiny request and cached,
 * so a missing key or unverified account degrades gracefully instead of erroring.
 */
export async function aiAvailable() {
  if (!isAiConfigured) return false;
  const now = Date.now();
  if (status && now - status.at < (status.ok ? 30 : 3) * 60000) return status.ok;
  try {
    await generateText({ model: probeModel(), prompt: "Reply with OK.", maxOutputTokens: 5 });
    status = { ok: true, at: now };
  } catch (err) {
    status = { ok: false, at: now, reason: err instanceof Error ? err.message.slice(0, 200) : String(err) };
    console.warn("[ai] gateway unavailable:", status.reason);
  }
  return status.ok;
}

export const aiStatus = () => status;

const today = () => new Date().toISOString().slice(0, 10);

function who(viewer: Viewer | null, ip: string) {
  return viewer ? `u:${viewer.user.id}` : `ip:${createHash("sha256").update(ip).digest("base64url").slice(0, 16)}`;
}

export function dailyLimit(viewer: Viewer | null) {
  return !viewer ? AI_LIMITS.anonymous : hasPlus(viewer.plus) ? AI_LIMITS.plus : AI_LIMITS.free;
}

/** Counts a message against today's allowance. Returns remaining messages, or -1 when over. */
export async function spendMessage(viewer: Viewer | null, ip: string) {
  const store = await getStore();
  const id = `${who(viewer, ip)}:${today()}`;
  const row = (await store.getDoc<{ n: number }>("aiUsage", id)) ?? { n: 0 };
  const limit = dailyLimit(viewer);
  if (row.n >= limit) return -1;
  await store.putDoc("aiUsage", id, { n: row.n + 1 });
  await trackServer("ai_question", { u: viewer?.user.id ?? null });
  return limit - row.n - 1;
}
