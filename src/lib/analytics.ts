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

export type EventType = "view" | "engage" | "time" | "video_open" | "upload_play" | "calendar_connect" | "ai_question" | "checkout" | "cta" | "act";

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
  /** Campaign source from ?utm_source= or ?ref= on the landing URL. */
  src?: string;
  /** Seconds the page was visible and in use ("time" events). */
  s?: number;
  /** "act" events: what happened, in words (a button label, "Algebra: 8/10"). */
  d?: string;
  /** 1 when this request arrived without our visitor cookie (a new cookie was issued). */
  nv?: 1;
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
export async function trackServer(t: EventType, extra: { u?: string | null; x?: string; d?: string; path?: string } = {}) {
  try {
    const [jar, h] = await Promise.all([cookies(), headers()]);
    const ua = h.get("user-agent") ?? "";
    if (isBot(ua)) return;
    // Real browsers carry the visitor cookie from the page they clicked on. A request with
    // neither the cookie nor a signed-in user is a crawler following links, so it isn't counted.
    const v = jar.get(VISITOR_COOKIE)?.value;
    if (!v && !extra.u) return;
    await saveEvent({
      t,
      at: new Date().toISOString(),
      v: v ?? `user:${extra.u}`,
      u: extra.u ?? null,
      ...(extra.path ? { path: extra.path } : {}),
      ...(extra.x ? { x: extra.x } : {}),
      ...(extra.d ? { d: extra.d.slice(0, 200) } : {}),
      dev: deviceOf(ua),
      ...(h.get("x-vercel-ip-country") ? { c: h.get("x-vercel-ip-country")! } : {}),
    });
  } catch (err) {
    console.error("[analytics] track failed", err);
  }
}

/** Events since a moment, oldest first. Ids start with the timestamp, so the primary key orders them. */
export async function eventsSince(since: Date, max = 200_000, until?: Date): Promise<AnalyticsEvent[]> {
  const from = since.toISOString();
  if (!isSupabaseEnabled) {
    return (await (await getStore()).listDocs<AnalyticsEvent>("events")).filter((e) => e.at >= from).sort((a, b) => a.at.localeCompare(b.at));
  }
  const out: AnalyticsEvent[] = [];
  const page = 1000;
  let after = from;
  while (out.length < max) {
    // Crawler hits recorded before cookie checks existed (visitor "server") are skipped at the source.
    let q = createAdminClient().from("docs").select("id,data").eq("collection", "events").gte("id", after).neq("data->>v", "server");
    if (until) q = q.lt("id", until.toISOString());
    const { data, error } = await q.order("id").limit(page);
    if (error) throw new Error(error.message);
    const rows = (data ?? []).filter((r) => r.id !== after);
    out.push(...rows.map((r) => r.data as AnalyticsEvent));
    if ((data ?? []).length < page) break;
    after = data![data!.length - 1].id;
  }
  return out;
}

/** Events from the last `days` days. */
export function recentEvents(days: number) {
  return eventsSince(new Date(Date.now() - days * 86_400_000));
}

/**
 * Everything one account did: events while signed in, plus events from any browser (visitor cookie)
 * they signed in on, including visits from before they signed in. Oldest first.
 */
export async function eventsForUser(userId: string, max = 20_000): Promise<AnalyticsEvent[]> {
  if (!isSupabaseEnabled) {
    const all = await (await getStore()).listDocs<AnalyticsEvent>("events");
    const vids = new Set(all.filter((e) => e.u === userId).map((e) => e.v));
    return all.filter((e) => e.u === userId || (!e.u && vids.has(e.v))).sort((a, b) => a.at.localeCompare(b.at));
  }
  const db = createAdminClient();
  const page = async (filter: (q: ReturnType<typeof base>) => ReturnType<typeof base>) => {
    const rows: { id: string; data: AnalyticsEvent }[] = [];
    let after = "";
    while (rows.length < max) {
      const { data, error } = await filter(base()).gt("id", after).order("id").limit(1000);
      if (error) throw new Error(error.message);
      rows.push(...((data ?? []) as { id: string; data: AnalyticsEvent }[]));
      if ((data ?? []).length < 1000) break;
      after = data![data!.length - 1].id;
    }
    return rows;
  };
  const base = () => db.from("docs").select("id,data").eq("collection", "events");
  const mine = await page((q) => q.eq("data->>u", userId));
  const vids = [...new Set(mine.map((r) => r.data.v).filter((v) => v && !v.startsWith("user:")))].slice(0, 50);
  const before = vids.length ? await page((q) => q.in("data->>v", vids).is("data->>u", null)) : [];
  const seen = new Set<string>();
  return [...mine, ...before]
    .filter((r) => (seen.has(r.id) ? false : (seen.add(r.id), true)))
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((r) => r.data);
}

export type Signup = { id: string; at: string; email: string | null; type: "student" | "teacher" | null; lastSignIn: string | null };

/** Account sign-ups, from the auth system itself. */
export async function signupsSince(since: Date): Promise<Signup[]> {
  if (!isSupabaseEnabled) return [];
  const out: Signup[] = [];
  for (let page = 1; page < 100; page++) {
    const { data, error } = await createAdminClient().auth.admin.listUsers({ page, perPage: 1000 });
    if (error) break;
    out.push(
      ...data.users
        .filter((u) => Date.parse(u.created_at) >= since.getTime())
        .map((u) => {
          const t = (u.user_metadata as { account_type?: string } | null)?.account_type;
          return { id: u.id, at: new Date(u.created_at).toISOString(), email: u.email ?? null, type: t === "teacher" ? "teacher" : t === "student" ? "student" : null, lastSignIn: u.last_sign_in_at ?? null } as Signup;
        }),
    );
    if (data.users.length < 1000) break;
  }
  return out;
}
