import { originOf } from "@/lib/origin";
import { NextResponse, type NextRequest } from "next/server";
import { getBooking, getTutorMeta, saveBooking } from "@/lib/bookings";
import { createBookingCheckoutUrl } from "@/lib/billing/stripe";
import { getStore } from "@/lib/data/store";
import { isStripeEnabled, paymentsPaused } from "@/lib/env";
import { getViewer } from "@/lib/viewer";

/** Student pays a confirmed session through Merit; Merit's 10% is taken automatically. */
export async function POST(req: NextRequest, ctx: RouteContext<"/api/bookings/[id]/pay">) {
  const { id } = await ctx.params;
  const origin = originOf(req);
  const viewer = await getViewer();
  const b = await getBooking(id);
  if (!viewer || !b || b.studentId !== viewer.user.id) return NextResponse.redirect(`${origin}/bookings`, 303);
  if (b.paid || b.status !== "confirmed" || b.payment !== "merit") return NextResponse.redirect(`${origin}/bookings/${id}`, 303);
  const meta = await getTutorMeta(b.tutorId);
  if (paymentsPaused) return NextResponse.redirect(`${origin}/bookings/${id}?checkout=paused`, 303);
  if (!isStripeEnabled || !meta.stripeAccountId) {
    await saveBooking({ ...b, paid: true, feeSettled: true, source: "test" });
    return NextResponse.redirect(`${origin}/bookings/${id}?checkout=success&test=1`, 303);
  }
  try {
    const tutor = (await (await getStore()).listTutors()).find((t) => t.id === b.tutorId);
    return NextResponse.redirect(await createBookingCheckoutUrl(b, meta, tutor?.name ?? "your tutor", origin), 303);
  } catch (err) {
    console.error("[bookings] checkout failed", err);
    return NextResponse.redirect(`${origin}/bookings/${id}?checkout=error`, 303);
  }
}
