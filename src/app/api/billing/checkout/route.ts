import { NextResponse, type NextRequest } from "next/server";
import { activateDemoSubscription, createCheckoutUrl } from "@/lib/billing/stripe";
import { isStripeEnabled } from "@/lib/env";
import { getViewer } from "@/lib/viewer";

export async function POST(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const viewer = await getViewer();
  if (!viewer) return NextResponse.redirect(`${origin}/signup?next=/settings/billing`, 303);

  if (!isStripeEnabled) {
    await activateDemoSubscription(viewer);
    return NextResponse.redirect(`${origin}/settings/billing?checkout=success&demo=1`, 303);
  }
  try {
    return NextResponse.redirect(await createCheckoutUrl(viewer, origin), 303);
  } catch (err) {
    console.error("[billing] checkout failed", err);
    return NextResponse.redirect(`${origin}/settings/billing?checkout=error`, 303);
  }
}
