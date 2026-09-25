import { NextResponse, type NextRequest } from "next/server";
import { calendarAccess } from "@/lib/billing/access";
import { exchangeCode, GOOGLE_SOURCE_ID, saveGoogleToken, syncGoogle } from "@/lib/google-calendar";
import { originOf } from "@/lib/origin";
import { saveSource } from "@/lib/schedule-save";
import { getViewer } from "@/lib/viewer";

/** Google sends the student back here after they allow read-only calendar access. */
export async function GET(req: NextRequest) {
  const origin = originOf(req);
  const back = (q: string) => {
    const res = NextResponse.redirect(`${origin}/schedule?${q}`);
    res.cookies.delete({ name: "g_cal_state", path: "/api/calendar/google" });
    return res;
  };
  const p = req.nextUrl.searchParams;
  if (p.get("error")) return back("google=canceled");
  const viewer = await getViewer();
  if (!viewer || !calendarAccess(viewer)) return back("google=error");
  if (!p.get("code") || p.get("state") !== req.cookies.get("g_cal_state")?.value) return back("google=error");
  try {
    const tokens = await exchangeCode(p.get("code")!, origin);
    if (!tokens.refresh_token) return back("google=error");
    await saveGoogleToken(viewer.user.id, tokens.refresh_token);
    const { events } = await syncGoogle(viewer.user.id, viewer.state.profile.courseIds);
    const added = await saveSource(viewer, { id: GOOGLE_SOURCE_ID, kind: "google", url: null, label: "Google Calendar", syncedAt: new Date().toISOString(), count: 0 }, events);
    return back(`google=connected&added=${added.length}`);
  } catch (err) {
    console.error("[google-calendar] connect failed", err);
    return back("google=error");
  }
}
