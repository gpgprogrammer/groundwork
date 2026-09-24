/**
 * Runtime configuration. Nothing is hardcoded: every integration is switched on
 * by environment variables and falls back to local defaults.
 */
export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  authSecret: process.env.AUTH_SECRET ?? "merit-local-demo-secret-change-me",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  /** Chat model (Vercel AI Gateway id). */
  aiModel: process.env.MERIT_AI_MODEL || "anthropic/claude-sonnet-5",
  /** Model for generating practice questions, cram sheets, and FRQ feedback. */
  aiContentModel: process.env.MERIT_AI_CONTENT_MODEL || "anthropic/claude-sonnet-5",
  adminEmails: (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
};

export const isSupabaseEnabled = Boolean(env.supabaseUrl && env.supabaseAnonKey);
export const isStripeEnabled = Boolean(env.stripeSecretKey);
/** On Vercel, the AI Gateway authenticates with the deployment's OIDC token. */
export const isAiConfigured = Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN || process.env.VERCEL);
/** Google and Apple sign-in run through Supabase Auth; enable the providers there too. */
export const oauthProviders = isSupabaseEnabled
  ? (process.env.NEXT_PUBLIC_OAUTH_PROVIDERS ?? "google,apple").split(",").map((p) => p.trim()).filter((p): p is "google" | "apple" => p === "google" || p === "apple")
  : [];
