import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { deviceOf, isBot, saveEvent, VISITOR_COOKIE, type AnalyticsEvent, type EventType } from "@/lib/analytics";
import { logError } from "@/lib/error-log";

const TYPES = new Set<EventType>(["view", "engage", "time", "upload_play", "cta", "act"]);

/**
 * Page views, engagement and Merit video plays from the browser (sent with navigator.sendBeacon).
 * "engage" is sent once per page after a real interaction (scroll, tap, key, pointer) and is how
 * the dashboard tells people from bots that run JavaScript. "time" carries seconds of active use.
 */
export async function POST(req: NextRequest) {
  const ua = req.headers.get("user-agent") ?? "";
  const res = new NextResponse(null, { status: 204 });
  if (isBot(ua)) return res;
  let body: { type?: string; path?: string; ref?: string; ref_id?: string; x?: string; d?: string; src?: string; s?: number; w?: number; u?: string | null; message?: string; digest?: string; stack?: string } = {};
  try {
    body = JSON.parse((await req.text()).slice(0, 4000));
  } catch {
    return res;
  }
  if (body.type === "error") {
    await logError({ source: "browser", message: String(body.message ?? "Unknown error"), digest: body.digest ? String(body.digest) : undefined, path: typeof body.path === "string" ? body.path : undefined, stack: body.stack ? String(body.stack) : undefined });
    return res;
  }
  const type = TYPES.has(body.type as EventType) ? (body.type as EventType) : null;
  if (!type) return res;
  let v = req.cookies.get(VISITOR_COOKIE)?.value;
  const fresh = !v || !/^[\w-]{8,40}$/.test(v);
  if (fresh) {
    v = randomUUID();
    res.cookies.set(VISITOR_COOKIE, v, { httpOnly: true, sameSite: "lax", secure: req.nextUrl.protocol === "https:", maxAge: 60 * 60 * 24 * 365, path: "/" });
  }
  let ref: string | undefined;
  try {
    const host = body.ref ? new URL(body.ref).host.replace(/^www\./, "") : "";
    const self = req.nextUrl.host.replace(/^www\./, "");
    // Our own domains (and the old vercel.app names that redirect here) aren't outside referrers.
    if (host && host !== self && !/(^|\.)meritlearning\.org$|merit-learning\.vercel\.app$|groundwork-[\w-]+\.vercel\.app$/.test(host)) ref = host;
  } catch {}
  const src = typeof body.src === "string" ? body.src.toLowerCase().replace(/[^\w.-]/g, "").slice(0, 40) : "";
  const e: AnalyticsEvent = {
    t: type,
    at: new Date().toISOString(),
    v: v!,
    u: typeof body.u === "string" && /^[\w-]{10,60}$/.test(body.u) ? body.u : null,
    dev: deviceOf(ua, typeof body.w === "number" ? body.w : undefined),
    ...(req.headers.get("x-vercel-ip-country") ? { c: req.headers.get("x-vercel-ip-country")! } : {}),
    ...(ref ? { ref } : {}),
    ...(src ? { src } : {}),
    ...(fresh ? { nv: 1 as const } : {}),
    ...(typeof body.path === "string" ? { path: body.path.slice(0, 300).split("?")[0] } : {}),
    ...(type === "time" && typeof body.s === "number" && body.s > 0 ? { s: Math.min(Math.round(body.s), 3600) } : {}),
    ...((type === "upload_play" || type === "cta") && typeof body.ref_id === "string" ? { x: body.ref_id.slice(0, 40) } : {}),
    ...(type === "act" && typeof body.x === "string" ? { x: body.x.replace(/[^\w-]/g, "").slice(0, 40) } : {}),
    ...(type === "act" && typeof body.d === "string" && body.d.trim() ? { d: body.d.replace(/\s+/g, " ").trim().slice(0, 160) } : {}),
  };
  if (type === "time" && !e.s) return res;
  if (type === "act" && !e.x) return res;
  try {
    await saveEvent(e);
  } catch (err) {
    console.error("[track]", err);
  }
  return res;
}
