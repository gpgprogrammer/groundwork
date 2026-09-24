import "server-only";
import { randomUUID } from "node:crypto";
import Stripe from "stripe";
import { emptyBilling, getBilling, grant, saveBilling, trialEndsAt } from "@/lib/billing/access";
import { PRODUCTS, TUTOR_COMMISSION, type Product } from "@/lib/billing/plans";
import { getStore } from "@/lib/data/store";
import { env, isStripeEnabled } from "@/lib/env";
import type { Billing, Booking, Gift, TutorMeta } from "@/lib/types";
import type { Viewer } from "@/lib/viewer";

let client: Stripe | null = null;

export function getStripe() {
  if (!isStripeEnabled) throw new Error("Stripe is not configured (STRIPE_SECRET_KEY).");
  client ??= new Stripe(env.stripeSecretKey, { appInfo: { name: "Merit Learning" } });
  return client;
}

const cents = (usd: number) => Math.round(usd * 100);

async function ensureCustomer(viewer: Viewer) {
  if (viewer.billing.stripeCustomerId) return viewer.billing.stripeCustomerId;
  const customer = await getStripe().customers.create({ email: viewer.user.email, name: viewer.user.name, metadata: { userId: viewer.user.id } });
  await saveBilling({ ...viewer.billing, stripeCustomerId: customer.id });
  return customer.id;
}

/**
 * Checkout for Plus (monthly or annual) or an Exam Sprint. If the student is
 * still inside their free month, the subscription starts billing when it ends,
 * so upgrading early never costs them free time.
 */
export async function createCheckoutUrl(viewer: Viewer, product: Product, origin: string, returnTo: string) {
  const stripe = getStripe();
  const p = PRODUCTS[product];
  const customer = await ensureCustomer(viewer);
  const metadata = { userId: viewer.user.id, product };
  const line_items = [
    {
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: cents(p.amount),
        product_data: { name: p.label },
        ...(p.recurring ? { recurring: { interval: p.recurring } } : {}),
      },
    },
  ];
  const trialEnd = Math.floor(new Date(trialEndsAt(viewer.state.profile)).getTime() / 1000);
  const carryTrial = trialEnd - Date.now() / 1000 > 48 * 3600;
  const session = await stripe.checkout.sessions.create({
    customer,
    client_reference_id: viewer.user.id,
    metadata,
    line_items,
    allow_promotion_codes: true,
    success_url: `${origin}${returnTo}${returnTo.includes("?") ? "&" : "?"}checkout=success&product=${product}`,
    cancel_url: `${origin}${returnTo}${returnTo.includes("?") ? "&" : "?"}checkout=canceled`,
    ...(p.recurring
      ? { mode: "subscription" as const, subscription_data: { metadata, ...(carryTrial ? { trial_end: trialEnd } : {}) } }
      : { mode: "payment" as const, payment_intent_data: { metadata } }),
  });
  if (!session.url) throw new Error("Stripe did not return a Checkout URL.");
  return session.url;
}

/** Parent (or anyone) paying for a student. The gift is claimed when the student signs in with that email. */
export async function createGiftCheckoutUrl(gift: Omit<Gift, "id" | "createdAt" | "source" | "claimedBy" | "claimedAt">, origin: string) {
  const p = PRODUCTS[gift.product];
  const metadata = { gift: "1", product: gift.product, buyerName: gift.buyerName, buyerEmail: gift.buyerEmail, studentEmail: gift.studentEmail };
  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer_email: gift.buyerEmail,
    metadata,
    payment_intent_data: { metadata },
    line_items: [{ quantity: 1, price_data: { currency: "usd", unit_amount: cents(p.amount), product_data: { name: `${p.label} for ${gift.studentEmail}` } } }],
    success_url: `${origin}/pricing/parents?checkout=success&product=${gift.product}`,
    cancel_url: `${origin}/pricing/parents?checkout=canceled`,
  });
  if (!session.url) throw new Error("Stripe did not return a Checkout URL.");
  return session.url;
}

export async function recordGift(g: Omit<Gift, "id" | "createdAt" | "claimedBy" | "claimedAt">) {
  const gift: Gift = { ...g, studentEmail: g.studentEmail.trim().toLowerCase(), id: `gift_${randomUUID().slice(0, 12)}`, createdAt: new Date().toISOString(), claimedBy: null, claimedAt: null };
  await (await getStore()).putDoc("gifts", gift.id, gift);
  return gift;
}

export async function createPortalUrl(viewer: Viewer, origin: string) {
  const customer = await ensureCustomer(viewer);
  const session = await getStripe().billingPortal.sessions.create({ customer, return_url: `${origin}/settings/billing` });
  return session.url;
}

// ── Tutor payouts (Stripe Connect) ───────────────────────────────────────────

/** Onboards a tutor to Stripe Connect Express so students can pay through Merit. */
export async function createConnectOnboardingUrl(meta: TutorMeta, email: string, origin: string) {
  const stripe = getStripe();
  let accountId = meta.stripeAccountId;
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      email,
      capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
      metadata: { tutorId: meta.tutorId },
    });
    accountId = account.id;
    await (await getStore()).putDoc("tutorMeta", meta.tutorId, { ...meta, stripeAccountId: accountId });
  }
  const link = await stripe.accountLinks.create({
    account: accountId,
    type: "account_onboarding",
    refresh_url: `${origin}/tutor/payouts?refresh=1`,
    return_url: `${origin}/tutor/payouts?connected=1`,
  });
  return link.url;
}

export async function refreshConnectStatus(meta: TutorMeta) {
  if (!meta.stripeAccountId) return meta;
  const account = await getStripe().accounts.retrieve(meta.stripeAccountId);
  const next = { ...meta, payoutsEnabled: Boolean(account.charges_enabled && account.payouts_enabled) };
  await (await getStore()).putDoc("tutorMeta", meta.tutorId, next);
  return next;
}

/** Student pays for a session. Merit's 10% is taken as an application fee; the rest goes to the tutor. */
export async function createBookingCheckoutUrl(booking: Booking, meta: TutorMeta, tutorName: string, origin: string) {
  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer_email: booking.studentEmail,
    metadata: { bookingId: booking.id },
    line_items: [
      {
        quantity: 1,
        price_data: { currency: "usd", unit_amount: cents(booking.amount), product_data: { name: `${booking.minutes}-minute session with ${tutorName}` } },
      },
    ],
    payment_intent_data: {
      application_fee_amount: cents(booking.amount * (meta.commissionRate || TUTOR_COMMISSION)),
      transfer_data: { destination: meta.stripeAccountId! },
      metadata: { bookingId: booking.id },
    },
    success_url: `${origin}/bookings/${booking.id}?checkout=success`,
    cancel_url: `${origin}/bookings/${booking.id}?checkout=canceled`,
  });
  if (!session.url) throw new Error("Stripe did not return a Checkout URL.");
  return session.url;
}

/** Tutor pays the referral fees owed on sessions paid directly to them. */
export async function createFeeCheckoutUrl(tutorId: string, bookingIds: string[], total: number, email: string, origin: string) {
  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    metadata: { feeFor: tutorId, bookings: bookingIds.join(",").slice(0, 490) },
    line_items: [{ quantity: 1, price_data: { currency: "usd", unit_amount: cents(total), product_data: { name: `Merit referral fees (${bookingIds.length} sessions)` } } }],
    success_url: `${origin}/tutor/payouts?fees=paid`,
    cancel_url: `${origin}/tutor/payouts`,
  });
  if (!session.url) throw new Error("Stripe did not return a Checkout URL.");
  return session.url;
}

// ── Webhooks ─────────────────────────────────────────────────────────────────

const STATUS: Partial<Record<Stripe.Subscription.Status, Billing["plus"]["status"]>> = {
  active: "active",
  trialing: "active",
  past_due: "past_due",
  unpaid: "past_due",
  canceled: "canceled",
  incomplete_expired: "canceled",
};

async function syncSubscription(sub: Stripe.Subscription) {
  const userId = sub.metadata?.userId;
  if (!userId) return console.warn(`[stripe] subscription ${sub.id} has no userId`);
  const b = (await getBilling(userId)) ?? emptyBilling(userId);
  const item = sub.items.data[0];
  const end = item?.current_period_end;
  b.stripeCustomerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  b.plus = {
    status: STATUS[sub.status] ?? "none",
    interval: item?.price.recurring?.interval === "year" ? "year" : "month",
    currentPeriodEnd: end ? new Date(end * 1000).toISOString() : null,
    cancelAtPeriodEnd: sub.cancel_at_period_end,
    source: "stripe",
    stripeSubscriptionId: sub.id,
  };
  await saveBilling(b);
}

export async function handleStripeEvent(event: Stripe.Event) {
  const store = await getStore();
  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object;
      const md = s.metadata ?? {};
      if (md.gift === "1") {
        await recordGift({
          product: md.product as Gift["product"],
          buyerName: md.buyerName ?? "",
          buyerEmail: md.buyerEmail ?? "",
          studentEmail: md.studentEmail ?? "",
          source: "stripe",
        });
      } else if (md.bookingId) {
        const b = await store.getDoc<Booking>("bookings", md.bookingId);
        if (b) await store.putDoc("bookings", b.id, { ...b, paid: true, feeSettled: true, payment: "merit", source: "stripe" });
      } else if (md.feeFor) {
        for (const id of (md.bookings ?? "").split(",").filter(Boolean)) {
          const b = await store.getDoc<Booking>("bookings", id);
          if (b && b.tutorId === md.feeFor) await store.putDoc("bookings", id, { ...b, feeSettled: true });
        }
      } else if (s.mode === "payment" && md.product === "sprint" && md.userId) {
        await grant(md.userId, "sprint", "stripe", (s.amount_total ?? 0) / 100);
      } else if (s.mode === "subscription" && s.subscription) {
        const id = typeof s.subscription === "string" ? s.subscription : s.subscription.id;
        await syncSubscription(await getStripe().subscriptions.retrieve(id));
        if (md.userId) {
          const b = await getBilling(md.userId);
          b.purchases.unshift({ id: `pur_${randomUUID().slice(0, 12)}`, product: md.product as Product, amount: (s.amount_total ?? 0) / 100, at: new Date().toISOString(), source: "stripe" });
          await saveBilling(b);
        }
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await syncSubscription(event.data.object);
      break;
    case "account.updated": {
      const acct = event.data.object;
      const tutorId = acct.metadata?.tutorId;
      const meta = tutorId ? await store.getDoc<TutorMeta>("tutorMeta", tutorId) : null;
      if (meta) await store.putDoc("tutorMeta", meta.tutorId, { ...meta, payoutsEnabled: Boolean(acct.charges_enabled && acct.payouts_enabled) });
      break;
    }
    default:
      break;
  }
}
