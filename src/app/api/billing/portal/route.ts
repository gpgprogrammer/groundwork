import { originOf } from "@/lib/origin";
import { NextResponse, type NextRequest } from "next/server";
import { createPortalUrl } from "@/lib/billing/stripe";
import { isStripeEnabled } from "@/lib/env";
import { getViewer } from "@/lib/viewer";

export async function POST(req: NextRequest) {
  const origin = originOf(req);
  const viewer = await getViewer();
  if (!viewer) return NextResponse.redirect(`${origin}/login?next=/settings/billing`, 303);
  if (!isStripeEnabled || !viewer.billing.stripeCustomerId) return NextResponse.redirect(`${origin}/settings/billing`, 303);
  try {
    return NextResponse.redirect(await createPortalUrl(viewer, origin), 303);
  } catch (err) {
    console.error("[billing] portal failed", err);
    return NextResponse.redirect(`${origin}/settings/billing?portal=error`, 303);
  }
}
