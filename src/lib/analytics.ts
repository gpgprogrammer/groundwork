import "server-only";
import { randomUUID } from "node:crypto";
import { cookies, headers } from "next/headers";
import { getStore } from "@/lib/data/store";
import { isSupabaseEnabled } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * First-party analytics. Events are stored in our own database (never sent to a
 * third party) with a random visitor id; no IP addresses are kept.
 */

export type EventType = "view" | "video_open" | "upload_play" | "calendar_connect" | "ai_question" | "checkout";

export type AnalyticsEvent = {
  t: EventType;
  at: string;
  /** Random visitor id from a first-party cookie. */
  v: string;
  u: string | null;
  path?: string;
  /** Referring site's host. */
  ref?: string;
  dev?: "mobile" | "tablet" | "desktop";
  c?: string;
  /** What the event is about: a video id, calendar method, product. */
  x?: string;
};

export const VISITOR_COOKIE = "mv_vid";
const BOT = /bot|crawl|spider|slurp|facebookexternalhit|preview|headless|lighthouse|pingdom|monitor|curl|wget|python|node-fetch|vercel/i;

export function deviceOf(ua: string, width?: number): AnalyticsEvent["dev"] {
  if (/ipad|tablet/i.test(ua) || (width && width >= 640 && width < 1024 && /mobile|android/i.test(ua))) return "tablet";
  if (/mobi|iphone|android/i.test(ua) || (width && width < 640)) return "mobile";
  return "desktop";
}

export const isBot = (ua: string) => !ua || BOT.test(ua);

export async function saveEvent(e: AnalyticsEvent) {
  const id = `${e.at}_${randomUUID().slice(0, 8)}`;
  await (await getStore()).putDoc("events", id, e);
}

/** Records a server-side event for the current request. Never throws. */
export async function trackServer(t: EventType, extra: { u?: string | null; x?: string; path?: string } = {}) {
  try {
    const [jar, h] = await Promise.all([cookies(), headers()]);
    const ua = h.get("user-agent") ?? "";
    if (isBot(ua)) return;
    await saveEvent({
      t,
      at: new Date().toISOString(),
      v: jar.get(VISITOR_COOKIE)?.value ?? "server",
      u: extra.u ?? null,
      ...(extra.path ? { path: extra.path } : {}),
      ...(extra.x ? { x: extra.x } : {}),
      dev: deviceOf(ua),
      ...(h.get("x-vercel-ip-country") ? { c: h.get("x-vercel-ip-country")! } : {}),
    });
  } catch (err) {
    console.error("[analytics] track failed", err);
  }
}

/** Events since a moment, oldest first. Ids start with the timestamp, so the primary key orders them. */
export async function eventsSince(since: Date, max = 200_000): Promise<AnalyticsEvent[]> {
  const from = since.toISOString();
  if (!isSupabaseEnabled) {
    return (await (await getStore()).listDocs<AnalyticsEvent>("events")).filter((e) => e.at >= from).sort((a, b) => a.at.localeCompare(b.at));
  }
  const out: AnalyticsEvent[] = [];
  const page = 1000;
  let after = from;
  while (out.length < max) {
    const { data, error } = await createAdminClient().from("docs").select("id,data").eq("collection", "events").gte("id", after).order("id").limit(page);
    if (error) throw new Error(error.message);
    const rows = (data ?? []).filter((r) => r.id !== after);
    out.push(...rows.map((r) => r.data as AnalyticsEvent));
    if ((data ?? []).length < page) break;
    after = data![data!.length - 1].id;
  }
  return out;
}

/** Account sign-ups, from the auth system itself. */
export async function signupsSince(since: Date) {
  if (!isSupabaseEnabled) return [] as { at: string; email: string | null }[];
  const out: { at: string; email: string | null }[] = [];
  for (let page = 1; page < 100; page++) {
    const { data, error } = await createAdminClient().auth.admin.listUsers({ page, perPage: 1000 });
    if (error) break;
    out.push(...data.users.filter((u) => u.created_at >= since.toISOString()).map((u) => ({ at: u.created_at, email: u.email ?? null })));
    if (data.users.length < 1000) break;
  }
  return out;
}
