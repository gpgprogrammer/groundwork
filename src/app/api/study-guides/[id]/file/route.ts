import { NextResponse, type NextRequest } from "next/server";
import { getGuide, getPurchase, guideDownloadUrl, recordPurchase } from "@/lib/market";
import { originOf } from "@/lib/origin";
import { getViewer } from "@/lib/viewer";

/** Opens a guide's file for its seller, admins, and anyone who got it (free guides are added on first open). */
export async function GET(req: NextRequest, ctx: RouteContext<"/api/study-guides/[id]/file">) {
  const { id } = await ctx.params;
  const origin = originOf(req);
  const viewer = await getViewer();
  if (!viewer) return NextResponse.redirect(`${origin}/login?next=${encodeURIComponent(`/study-guides/${id}`)}`, 303);
  const g = await getGuide(id);
  if (!g?.file) return NextResponse.redirect(`${origin}/study-guides`, 303);
  const owner = g.sellerId === viewer.user.id || viewer.isAdmin;
  let has = owner || Boolean(await getPurchase(g.id, viewer.user.id));
  if (!has && g.price === 0) {
    await recordPurchase(g, viewer.user.id, 0, "free");
    has = true;
  }
  if (!has) return NextResponse.redirect(`${origin}/study-guides/${id}`, 303);
  try {
    const url = await guideDownloadUrl(g);
    return url ? NextResponse.redirect(url, 303) : NextResponse.redirect(`${origin}/study-guides/${id}`, 303);
  } catch (err) {
    console.error("[market] download failed", err);
    return NextResponse.redirect(`${origin}/study-guides/${id}?file=unavailable`, 303);
  }
}
