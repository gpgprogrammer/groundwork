import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { deviceOf, isBot, saveEvent, VISITOR_COOKIE, type AnalyticsEvent } from "@/lib/analytics";
import { logError } from "@/lib/error-log";

/** Page views and Merit video plays from the browser (sent with navigator.sendBeacon). */
export async function POST(req: NextRequest) {
  const ua = req.headers.get("user-agent") ?? "";
  const res = new NextResponse(null, { status: 204 });
  if (isBot(ua)) return res;
  let body: { type?: string; path?: string; ref?: string; ref_id?: string; w?: number; u?: string | null; message?: string; digest?: string; stack?: string } = {};
  try {
    body = JSON.parse((await req.text()).slice(0, 4000));
  } catch {
    return res;
  }
  if (body.type === "error") {
    await logError({ source: "browser", message: String(body.message ?? "Unknown error"), digest: body.digest ? String(body.digest) : undefined, path: typeof body.path === "string" ? body.path : undefined, stack: body.stack ? String(body.stack) : undefined });
    return res;
  }
  const type = body.type === "upload_play" ? "upload_play" : body.type === "cta" ? "cta" : body.type === "view" ? "view" : null;
  if (!type) return res;
  let v = req.cookies.get(VISITOR_COOKIE)?.value;
  if (!v || !/^[\w-]{8,40}$/.test(v)) {
    v = randomUUID();
    res.cookies.set(VISITOR_COOKIE, v, { httpOnly: true, sameSite: "lax", secure: req.nextUrl.protocol === "https:", maxAge: 60 * 60 * 24 * 365, path: "/" });
  }
  let ref: string | undefined;
  try {
    const host = body.ref ? new URL(body.ref).host : "";
    if (host && host !== req.nextUrl.host) ref = host.replace(/^www\./, "");
  } catch {}
  const e: AnalyticsEvent = {
    t: type,
    at: new Date().toISOString(),
    v,
    u: typeof body.u === "string" && /^[\w-]{10,60}$/.test(body.u) ? body.u : null,
    dev: deviceOf(ua, typeof body.w === "number" ? body.w : undefined),
    ...(req.headers.get("x-vercel-ip-country") ? { c: req.headers.get("x-vercel-ip-country")! } : {}),
    ...(ref ? { ref } : {}),
    ...(typeof body.path === "string" ? { path: body.path.slice(0, 300).split("?")[0] } : {}),
    ...((type === "upload_play" || type === "cta") && typeof body.ref_id === "string" ? { x: body.ref_id.slice(0, 40) } : {}),
  };
  try {
    await saveEvent(e);
  } catch (err) {
    console.error("[track]", err);
  }
  return res;
}
