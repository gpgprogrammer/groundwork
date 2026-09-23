import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getCatalog } from "@/lib/catalog";
import { getStore } from "@/lib/data/store";
import { canWatch, getViewer } from "@/lib/viewer";

const schema = z.object({
  videoId: z.string().min(1).max(64),
  position: z.number().min(0),
  // Seconds of actual playback since the last report (capped server-side).
  watchedDelta: z.number().min(0),
});

export async function POST(req: NextRequest) {
  const viewer = await getViewer();
  if (!viewer) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  if (!canWatch(viewer.access)) return NextResponse.json({ error: "subscription_required" }, { status: 402 });

  const body = schema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const video = (await getCatalog()).video(body.data.videoId);
  if (!video) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const progress = await (await getStore()).recordProgress(viewer.user.id, video.id, {
    position: Math.min(body.data.position, video.durationSec),
    duration: video.durationSec,
    watchedDelta: Math.min(body.data.watchedDelta, 45),
  });
  return NextResponse.json({ progress });
}
