import { NextResponse, type NextRequest } from "next/server";
import { getCatalog } from "@/lib/catalog";
import { pageOf, queryFeed } from "@/lib/feed";
import { getViewer } from "@/lib/viewer";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const [catalog, viewer] = await Promise.all([getCatalog(), getViewer()]);
  const result = queryFeed(catalog, viewer?.state ?? null, {
    chip: sp.get("chip") ?? undefined,
    sort: sp.get("sort") ?? undefined,
    length: sp.get("length") ?? undefined,
    courseId: sp.get("course") ?? undefined,
    topicId: sp.get("topic") ?? undefined,
    channelId: sp.get("channel") ?? undefined,
  });
  const offset = Math.max(0, Number(sp.get("offset")) || 0);
  const limit = Math.min(48, Math.max(1, Number(sp.get("limit")) || 24));
  return NextResponse.json(pageOf(catalog, result, offset, limit));
}
