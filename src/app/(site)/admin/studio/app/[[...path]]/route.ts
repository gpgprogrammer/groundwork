import { NextResponse, type NextRequest } from "next/server";
import { getBridge, isOnline, studioToken } from "@/lib/studio-bridge";
import { getViewer } from "@/lib/viewer";

/**
 * Forwards an admin's Reel Studio traffic to the Studio running on the team Mac (see studio-bridge.ts).
 * Chat replies stream through as they're written; videos are served in 4 MB pieces so each response
 * stays under the function size limit (browsers fetch video in ranges anyway).
 */
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const BASE = "/admin/studio/app/";
const CHUNK = 4 * 1024 * 1024;
const PASS_UP = ["content-type", "accept"];
const PASS_DOWN = ["content-type", "content-length", "content-range", "accept-ranges", "cache-control", "last-modified", "etag"];

async function proxy(req: NextRequest, ctx: RouteContext<"/admin/studio/app/[[...path]]">) {
  const viewer = await getViewer();
  if (!viewer?.isAdmin) return new NextResponse("Not found", { status: 404 });
  const token = studioToken();
  const bridge = await getBridge();
  if (!token || !bridge || !isOnline(bridge)) return NextResponse.json({ error: "Reel Studio is offline. The Mac that runs it is asleep, off, or not running the Studio." }, { status: 503 });

  const { path = [] } = await ctx.params;
  if (path.some((p) => p === ".." || p === ".")) return new NextResponse("Bad path", { status: 400 });
  const sub = `/${path.map(encodeURIComponent).join("/")}`;
  const headers = new Headers({ "x-studio-token": token, "x-studio-user": viewer.user.email });
  for (const h of PASS_UP) {
    const v = req.headers.get(h);
    if (v) headers.set(h, v);
  }
  const range = req.headers.get("range")?.match(/^bytes=(\d+)-(\d*)$/);
  if (range) {
    const start = Number(range[1]);
    const end = range[2] ? Math.min(Number(range[2]), start + CHUNK - 1) : start + CHUNK - 1;
    headers.set("range", `bytes=${start}-${end}`);
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${bridge.url}${sub}${req.nextUrl.search}`, {
      method: req.method,
      headers,
      body: req.method === "GET" || req.method === "HEAD" ? undefined : await req.arrayBuffer(),
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(maxDuration * 1000 - 5000),
    });
  } catch {
    return NextResponse.json({ error: "Couldn't reach Reel Studio on the Mac. Try again in a minute." }, { status: 502 });
  }

  const out = new Headers();
  for (const h of PASS_DOWN) {
    const v = upstream.headers.get(h);
    if (v) out.set(h, v);
  }
  if (!out.has("cache-control")) out.set("cache-control", "private, no-store");

  // The Studio's page uses relative links; a <base> makes them resolve under this route.
  if (sub === "/" && (upstream.headers.get("content-type") ?? "").includes("text/html")) {
    const html = (await upstream.text()).replace("<head>", `<head><base href="${BASE}" />`);
    out.delete("content-length");
    return new NextResponse(html, { status: upstream.status, headers: out });
  }
  return new NextResponse(upstream.body, { status: upstream.status, headers: out });
}

export { proxy as GET, proxy as POST, proxy as HEAD };
