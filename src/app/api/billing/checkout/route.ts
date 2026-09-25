import { originOf } from "@/lib/origin";
import { NextResponse, type NextRequest } from "next/server";
import { grant } from "@/lib/billing/access";
import { PRODUCTS, type Product } from "@/lib/billing/plans";
import { createCheckoutUrl } from "@/lib/billing/stripe";
import { isStripeEnabled, paymentsPaused } from "@/lib/env";
import { getViewer } from "@/lib/viewer";
import { trackServer } from "@/lib/analytics";

const safePath = (p: unknown) => (typeof p === "string" && p.startsWith("/") && !p.startsWith("//") ? p : "/settings/billing");

export async function POST(req: NextRequest) {
  const origin = originOf(req);
  const form = await req.formData();
  const product = String(form.get("product") ?? "") as Product;
  const returnTo = safePath(form.get("returnTo"));
  if (!(product in PRODUCTS)) return NextResponse.redirect(`${origin}/pricing`, 303);

  const viewer = await getViewer();
  await trackServer("checkout", { u: viewer?.user.id ?? null, x: product });
  if (!viewer) return NextResponse.redirect(`${origin}/signup?next=${encodeURIComponent(`/pricing?buy=${product}`)}`, 303);

  const sep = returnTo.includes("?") ? "&" : "?";
  if (paymentsPaused) return NextResponse.redirect(`${origin}${returnTo}${sep}checkout=paused`, 303);
  if (!isStripeEnabled) {
    // Test mode: no payment processor connected, so grant the product without charging.
    await grant(viewer.user.id, product, "test", 0, "Test mode: no charge");
    return NextResponse.redirect(`${origin}${returnTo}${sep}checkout=success&product=${product}&test=1`, 303);
  }
  try {
    return NextResponse.redirect(await createCheckoutUrl(viewer, product, origin, returnTo), 303);
  } catch (err) {
    console.error("[billing] checkout failed", err);
    return NextResponse.redirect(`${origin}${returnTo}${sep}checkout=error`, 303);
  }
}
