import "server-only";
import Stripe from "stripe";
import { getStore } from "@/lib/data/store";
import { env, isStripeEnabled, PLAN } from "@/lib/env";
import type { Subscription, SubscriptionStatus } from "@/lib/types";
import type { Viewer } from "@/lib/viewer";

let client: Stripe | null = null;

export function getStripe() {
  if (!isStripeEnabled) throw new Error("Stripe is not configured (STRIPE_SECRET_KEY, STRIPE_PRICE_ID).");
  client ??= new Stripe(env.stripeSecretKey, { appInfo: { name: "Groundwork" } });
  return client;
}

async function ensureCustomer(viewer: Viewer) {
  const existing = viewer.state.subscription.stripeCustomerId;
  if (existing) return existing;
  const customer = await getStripe().customers.create({
    email: viewer.user.email,
    name: viewer.user.name,
    metadata: { userId: viewer.user.id },
  });
  const store = await getStore();
  await store.setSubscription(viewer.user.id, { ...viewer.state.subscription, stripeCustomerId: customer.id });
  return customer.id;
}

/**
 * Starts Stripe Checkout for the monthly plan. Whatever is left of the
 * student's free month carries over as a Stripe trial, so subscribing early
 * never costs them free days.
 */
export async function createCheckoutUrl(viewer: Viewer, origin: string) {
  const stripe = getStripe();
  const customer = await ensureCustomer(viewer);
  const trialEnd = Math.floor(new Date(viewer.state.profile.trialEndsAt).getTime() / 1000);
  // Stripe requires a trial end at least 48 hours out.
  const carryTrial = trialEnd - Date.now() / 1000 > 48 * 3600;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer,
    client_reference_id: viewer.user.id,
    line_items: [{ price: env.stripePriceId, quantity: 1 }],
    subscription_data: {
      metadata: { userId: viewer.user.id },
      ...(carryTrial ? { trial_end: trialEnd } : {}),
    },
    allow_promotion_codes: true,
    success_url: `${origin}/settings/billing?checkout=success`,
    cancel_url: `${origin}/settings/billing?checkout=canceled`,
  });
  if (!session.url) throw new Error("Stripe did not return a Checkout URL.");
  return session.url;
}

export async function createPortalUrl(viewer: Viewer, origin: string) {
  const customer = await ensureCustomer(viewer);
  const session = await getStripe().billingPortal.sessions.create({
    customer,
    return_url: `${origin}/settings/billing`,
  });
  return session.url;
}

const STATUS_MAP: Partial<Record<Stripe.Subscription.Status, SubscriptionStatus>> = {
  active: "active",
  trialing: "trialing",
  past_due: "past_due",
  unpaid: "past_due",
  canceled: "canceled",
  incomplete_expired: "canceled",
};

export function toSubscription(sub: Stripe.Subscription): Subscription {
  const periodEnd = sub.items.data[0]?.current_period_end;
  return {
    status: STATUS_MAP[sub.status] ?? "none",
    stripeCustomerId: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
    stripeSubscriptionId: sub.id,
    currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    cancelAtPeriodEnd: sub.cancel_at_period_end,
  };
}

/** Webhook handler body: keeps our subscription row in sync with Stripe. */
export async function handleStripeEvent(event: Stripe.Event) {
  const store = await getStore();
  const stripe = getStripe();

  const syncFromSubscription = async (sub: Stripe.Subscription, hintedUserId?: string | null) => {
    const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
    const userId = hintedUserId || sub.metadata?.userId || (await store.findUserIdByStripeCustomer(customerId));
    if (!userId) {
      console.warn(`[stripe] no user for customer ${customerId}`);
      return;
    }
    await store.setSubscription(userId, toSubscription(sub));
  };

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      if (session.mode === "subscription" && session.subscription) {
        const subId = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
        await syncFromSubscription(await stripe.subscriptions.retrieve(subId), session.client_reference_id);
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await syncFromSubscription(event.data.object);
      break;
    default:
      break;
  }
}

/** Demo-mode stand-in for Checkout: activates the plan locally with no charge. */
export async function activateDemoSubscription(viewer: Viewer) {
  const store = await getStore();
  const trialEnds = new Date(viewer.state.profile.trialEndsAt).getTime();
  const start = Math.max(Date.now(), trialEnds);
  await store.setSubscription(viewer.user.id, {
    status: trialEnds > Date.now() ? "trialing" : "active",
    stripeCustomerId: null,
    stripeSubscriptionId: `demo_${viewer.user.id}`,
    currentPeriodEnd: new Date(start + 30 * 86400000).toISOString(),
    cancelAtPeriodEnd: false,
  });
}

export async function cancelDemoSubscription(viewer: Viewer, cancel: boolean) {
  const store = await getStore();
  await store.setSubscription(viewer.user.id, { ...viewer.state.subscription, cancelAtPeriodEnd: cancel });
}

export { PLAN };
