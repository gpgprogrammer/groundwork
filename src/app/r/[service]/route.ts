import { NextResponse, type NextRequest } from "next/server";

/** Outside tutoring services are no longer listed on Merit; old links land on Merit's own tutors. */
export async function GET(req: NextRequest) {
  return NextResponse.redirect(new URL("/tutors", req.url), { status: 302, headers: { "Cache-Control": "no-store" } });
}
