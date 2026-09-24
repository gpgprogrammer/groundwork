import { NextResponse, type NextRequest } from "next/server";
import { loadLibrary } from "@/lib/catalog";
import { PARTS, refreshPart } from "@/lib/youtube-refresh";

export const maxDuration = 300;

/** Daily (see vercel.json): refreshes one seventh of the library from the YouTube Data API. */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const part = Number(req.nextUrl.searchParams.get("part") ?? Math.floor(Date.now() / 86_400_000) % PARTS);
  try {
    return NextResponse.json(await refreshPart(loadLibrary(), part));
  } catch (err) {
    console.error("[cron] youtube refresh failed", err);
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : "failed" }, { status: 500 });
  }
}
