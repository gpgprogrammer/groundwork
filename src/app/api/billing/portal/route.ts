import { NextResponse, type NextRequest } from "next/server";
import { cancelDemoSubscription, createPortalUrl } from "@/lib/billing/stripe";
import { isStripeEnabled } from "@/lib/env";
import { getViewer } from "@/lib/viewer";

export async function POST(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const viewer = await getViewer();
  if (!viewer) return NextResponse.redirect(`${origin}/login?next=/settings/billing`, 303);

  if (!isStripeEnabled) {
    // Demo mode has no hosted portal; toggle cancel-at-period-end locally.
    const form = await req.formData().catch(() => null);
    await cancelDemoSubscription(viewer, form?.get("intent") !== "resume");
    return NextResponse.redirect(`${origin}/settings/billing?demo=1`, 303);
  }
  try {
    return NextResponse.redirect(await createPortalUrl(viewer, origin), 303);
  } catch (err) {
    console.error("[billing] portal failed", err);
    return NextResponse.redirect(`${origin}/settings/billing?portal=error`, 303);
  }
}
