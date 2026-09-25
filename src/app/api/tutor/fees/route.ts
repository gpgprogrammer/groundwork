import { originOf } from "@/lib/origin";
import { NextResponse, type NextRequest } from "next/server";
import { ledger, listBookings, saveBooking } from "@/lib/bookings";
import { createFeeCheckoutUrl } from "@/lib/billing/stripe";
import { getStore } from "@/lib/data/store";
import { isStripeEnabled, paymentsPaused } from "@/lib/env";
import { getViewer } from "@/lib/viewer";

/** Tutor pays the 10% referral fees owed on sessions students paid them for directly. */
export async function POST(req: NextRequest) {
  const origin = originOf(req);
  const viewer = await getViewer();
  if (!viewer) return NextResponse.redirect(`${origin}/login?next=/tutor/payouts`, 303);
  const tutor = (await (await getStore()).listTutors()).find((t) => t.userId === viewer.user.id);
  if (!tutor) return NextResponse.redirect(`${origin}/tutors/join`, 303);
  const { owed, owedTotal } = ledger(await listBookings({ tutorId: tutor.id }));
  if (!owed.length || owedTotal <= 0) return NextResponse.redirect(`${origin}/tutor/payouts`, 303);
  if (paymentsPaused) return NextResponse.redirect(`${origin}/tutor/payouts?payments=paused`, 303);
  if (!isStripeEnabled) {
    for (const b of owed) await saveBooking({ ...b, feeSettled: true });
    return NextResponse.redirect(`${origin}/tutor/payouts?fees=paid&test=1`, 303);
  }
  try {
    return NextResponse.redirect(await createFeeCheckoutUrl(tutor.id, owed.map((b) => b.id), owedTotal, viewer.user.email, origin), 303);
  } catch (err) {
    console.error("[tutor] fee checkout failed", err);
    return NextResponse.redirect(`${origin}/tutor/payouts?fees=error`, 303);
  }
}
