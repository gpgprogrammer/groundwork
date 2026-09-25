import { originOf } from "@/lib/origin";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createGiftCheckoutUrl, recordGift } from "@/lib/billing/stripe";
import { isStripeEnabled, paymentsPaused } from "@/lib/env";

const schema = z.object({
  product: z.enum(["plus-year", "sprint"]),
  buyerName: z.string().trim().min(1).max(80),
  buyerEmail: z.string().trim().toLowerCase().email(),
  studentEmail: z.string().trim().toLowerCase().email(),
});

export async function POST(req: NextRequest) {
  const origin = originOf(req);
  const parsed = schema.safeParse(Object.fromEntries(await req.formData()));
  if (!parsed.success) return NextResponse.redirect(`${origin}/pricing/parents?checkout=invalid`, 303);
  const g = parsed.data;
  if (g.buyerEmail === g.studentEmail) return NextResponse.redirect(`${origin}/pricing/parents?checkout=same`, 303);
  if (paymentsPaused) return NextResponse.redirect(`${origin}/pricing/parents?checkout=paused`, 303);
  if (!isStripeEnabled) {
    await recordGift({ ...g, source: "test" });
    return NextResponse.redirect(`${origin}/pricing/parents?checkout=success&product=${g.product}&test=1&to=${encodeURIComponent(g.studentEmail)}`, 303);
  }
  try {
    return NextResponse.redirect(await createGiftCheckoutUrl(g, origin), 303);
  } catch (err) {
    console.error("[billing] gift checkout failed", err);
    return NextResponse.redirect(`${origin}/pricing/parents?checkout=error`, 303);
  }
}
