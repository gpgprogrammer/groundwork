/**
 * Runtime configuration. Nothing is hardcoded: every integration is switched on
 * by environment variables and falls back to a self-contained demo mode.
 */
export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripePriceId: process.env.STRIPE_PRICE_ID ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  authSecret: process.env.AUTH_SECRET ?? "groundwork-local-demo-secret-change-me",
};

export const isSupabaseEnabled = Boolean(env.supabaseUrl && env.supabaseAnonKey);
export const isStripeEnabled = Boolean(env.stripeSecretKey && env.stripePriceId);

export const PLAN = {
  name: "Groundwork",
  priceMonthly: 10,
  trialDays: 30,
} as const;

