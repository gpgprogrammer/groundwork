import { NextResponse, type NextRequest } from "next/server";
import { getStripe, handleStripeEvent } from "@/lib/billing/stripe";
import { env, isStripeEnabled } from "@/lib/env";

export async function POST(req: NextRequest) {
  if (!isStripeEnabled || !env.stripeWebhookSecret) {
    return NextResponse.json({ error: "Stripe webhooks are not configured." }, { status: 501 });
  }
  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event;
  try {
    event = getStripe().webhooks.constructEvent(await req.text(), signature, env.stripeWebhookSecret);
  } catch (err) {
    console.warn("[stripe] signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    await handleStripeEvent(event);
  } catch (err) {
    console.error(`[stripe] failed handling ${event.type}`, err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}
