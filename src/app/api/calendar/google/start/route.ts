import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { calendarAccess } from "@/lib/billing/access";
import { googleAuthUrl, googleCalendarEnabled } from "@/lib/google-calendar";
import { originOf } from "@/lib/origin";
import { getViewer } from "@/lib/viewer";

/** Starts "Connect Google Calendar": sends the student to Google's consent screen. */
export async function GET(req: NextRequest) {
  const origin = originOf(req);
  const viewer = await getViewer();
  if (!viewer) return NextResponse.redirect(`${origin}/login?next=/schedule`);
  if (!googleCalendarEnabled || !calendarAccess(viewer)) return NextResponse.redirect(`${origin}/schedule`);
  const state = randomUUID();
  const res = NextResponse.redirect(googleAuthUrl(origin, state, viewer.user.email));
  res.cookies.set("g_cal_state", state, { httpOnly: true, sameSite: "lax", secure: origin.startsWith("https"), maxAge: 600, path: "/api/calendar/google" });
  return res;
}
