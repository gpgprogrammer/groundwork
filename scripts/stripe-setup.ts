/**
 * Creates the Groundwork product and $10/month price in your Stripe account
 * (test mode recommended) and prints the price ID to put in STRIPE_PRICE_ID.
 *   STRIPE_SECRET_KEY=sk_test_... npm run stripe:setup
 */
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("Set STRIPE_SECRET_KEY first (use a test key: sk_test_...).");
  process.exit(1);
}
const stripe = new Stripe(key);

const existing = await stripe.prices.list({ lookup_keys: ["groundwork_monthly"], limit: 1 });
if (existing.data[0]) {
  console.log(`Price already exists.\nSTRIPE_PRICE_ID=${existing.data[0].id}`);
  process.exit(0);
}
const product = await stripe.products.create({
  name: "Groundwork",
  description: "Every AP and SAT course and lesson. First month free.",
});
const price = await stripe.prices.create({
  product: product.id,
  currency: "usd",
  unit_amount: 1000,
  recurring: { interval: "month" },
  lookup_key: "groundwork_monthly",
});
console.log(`Created ${product.name} at $10/month.\nSTRIPE_PRICE_ID=${price.id}`);
