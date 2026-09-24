import { NextResponse, type NextRequest } from "next/server";
import { getCatalog } from "@/lib/catalog";
import { getStore } from "@/lib/data/store";
import { findService } from "@/lib/partners";
import { withReferral } from "@/lib/tutoring";
import { getViewer } from "@/lib/viewer";

/** Tracked outbound link to a tutoring service (the basis for referral commission). */
export async function GET(req: NextRequest, ctx: RouteContext<"/r/[service]">) {
  const { service: id } = await ctx.params;
  const service = await findService(id);
  if (!service) return NextResponse.redirect(new URL("/tutors", req.url));
  const [catalog, viewer] = await Promise.all([getCatalog(), getViewer()]);
  const course = catalog.course(req.nextUrl.searchParams.get("course") ?? "") ?? null;
  const zip = req.nextUrl.searchParams.get("zip")?.replace(/[^0-9A-Za-z -]/g, "").slice(0, 10) || null;
  try {
    await (await getStore()).logReferral({ partnerId: service.id, kind: "service", userId: viewer?.user.id ?? null, courseId: course?.id ?? null });
  } catch (err) {
    console.error("[referral] failed to log", err);
  }
  return NextResponse.redirect(withReferral(service, service.url(course, zip)), { status: 302, headers: { "Cache-Control": "no-store" } });
}
