import "server-only";
import { timingSafeEqual } from "node:crypto";
import { getStore } from "@/lib/data/store";

/**
 * Reel Studio runs on the team Mac (it needs the Claude Code login, local voices and the posting
 * browser), so the site can't host it. The Mac opens a Cloudflare tunnel and reports the tunnel's
 * address here every minute. /admin/studio/app/* forwards admins' requests to it, adding the shared
 * STUDIO_TOKEN that the Studio requires from anything that isn't localhost.
 */
export type StudioBridge = { url: string; at: string; version?: string };

const COLLECTION = "studioBridge";
const ID = "current";
/** The Mac reports every minute; after 3 minutes of silence it's treated as offline. */
export const STALE_MS = 3 * 60_000;

export const studioToken = () => process.env.STUDIO_TOKEN ?? "";

export function tokenMatches(given: string | null | undefined) {
  const want = studioToken();
  if (!want || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(want);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function getBridge() {
  return (await getStore()).getDoc<StudioBridge>(COLLECTION, ID);
}

export async function setBridge(b: StudioBridge) {
  await (await getStore()).putDoc(COLLECTION, ID, b);
}

export const isOnline = (b: StudioBridge | null, now = Date.now()) => Boolean(b && now - Date.parse(b.at) < STALE_MS);

/** Only Cloudflare quick-tunnel addresses are accepted, so a leaked token can't point the proxy anywhere else. */
export const validTunnel = (url: unknown): url is string => typeof url === "string" && /^https:\/\/[a-z0-9-]+\.trycloudflare\.com$/.test(url);
