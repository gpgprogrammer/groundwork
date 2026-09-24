import { originOf } from "@/lib/origin";
import { NextResponse, type NextRequest } from "next/server";
import { getTutorMeta, saveTutorMeta } from "@/lib/bookings";
import { createConnectOnboardingUrl } from "@/lib/billing/stripe";
import { getStore } from "@/lib/data/store";
import { isStripeEnabled } from "@/lib/env";
import { getViewer } from "@/lib/viewer";

/** Starts Stripe Connect onboarding so students can pay the tutor through Merit. */
export async function POST(req: NextRequest) {
  const origin = originOf(req);
  const viewer = await getViewer();
  if (!viewer) return NextResponse.redirect(`${origin}/login?next=/tutor/payouts`, 303);
  const tutor = (await (await getStore()).listTutors()).find((t) => t.userId === viewer.user.id);
  if (!tutor) return NextResponse.redirect(`${origin}/tutors/join`, 303);
  const meta = await getTutorMeta(tutor.id);
  if (!isStripeEnabled) {
    await saveTutorMeta({ ...meta, payoutsEnabled: true });
    return NextResponse.redirect(`${origin}/tutor/payouts?connected=1&test=1`, 303);
  }
  try {
    return NextResponse.redirect(await createConnectOnboardingUrl(meta, viewer.user.email, origin), 303);
  } catch (err) {
    console.error("[tutor] connect failed", err);
    return NextResponse.redirect(`${origin}/tutor/payouts?connect=error`, 303);
  }
}
