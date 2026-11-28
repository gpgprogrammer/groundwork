import { NextResponse, type NextRequest } from "next/server";
import { setBridge, tokenMatches, validTunnel } from "@/lib/studio-bridge";

/** The Mac running Reel Studio reports its tunnel address here every minute. */
export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!tokenMatches(auth)) return NextResponse.json({ error: "Not allowed." }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { url?: unknown; version?: unknown };
  if (!validTunnel(body.url)) return NextResponse.json({ error: "Bad tunnel address." }, { status: 400 });
  await setBridge({ url: body.url, at: new Date().toISOString(), ...(typeof body.version === "string" ? { version: body.version.slice(0, 40) } : {}) });
  return NextResponse.json({ ok: true });
}
