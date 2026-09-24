import { NextResponse, type NextRequest } from "next/server";
import { getStore } from "@/lib/data/store";
import { getViewer } from "@/lib/viewer";

/** Tracked outbound link to a tutor's own booking page. */
export async function GET(req: NextRequest, ctx: RouteContext<"/r/tutor/[id]">) {
  const { id } = await ctx.params;
  const store = await getStore();
  const tutor = (await store.listTutors()).find((t) => t.id === id);
  if (!tutor?.bookingUrl) return NextResponse.redirect(new URL(tutor ? `/tutors/${id}` : "/tutors", req.url));
  const viewer = await getViewer();
  try {
    await store.logReferral({ partnerId: tutor.id, kind: "tutor-booking", userId: viewer?.user.id ?? null, courseId: req.nextUrl.searchParams.get("course") });
  } catch (err) {
    console.error("[referral] failed to log", err);
  }
  return NextResponse.redirect(tutor.bookingUrl, { status: 302, headers: { "Cache-Control": "no-store" } });
}
