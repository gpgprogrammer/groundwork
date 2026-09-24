import { NextResponse, type NextRequest } from "next/server";
import { getCatalog } from "@/lib/catalog";
import { getStore } from "@/lib/data/store";
import { getViewer } from "@/lib/viewer";
import { trackServer } from "@/lib/analytics";

/** Records that a student opened a lesson, then sends them to YouTube. */
export async function GET(_req: NextRequest, ctx: RouteContext<"/go/[id]">) {
  const { id } = await ctx.params;
  if (!/^[A-Za-z0-9_-]{6,20}$/.test(id)) return NextResponse.redirect("https://www.youtube.com", 302);
  const [catalog, viewer] = await Promise.all([getCatalog(), getViewer()]);
  const video = catalog.video(id);
  if (viewer && video) {
    try {
      await (await getStore()).recordOpen(viewer.user.id, id);
    } catch (err) {
      console.error("[go] failed to record open", err);
    }
  }
  if (video) await trackServer("video_open", { u: viewer?.user.id ?? null, x: id });
  const target = video?.isShort ? `https://www.youtube.com/shorts/${id}` : `https://www.youtube.com/watch?v=${id}`;
  return NextResponse.redirect(target, { status: 302, headers: { "Cache-Control": "no-store" } });
}
