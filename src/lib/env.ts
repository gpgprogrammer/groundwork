/**
 * Runtime configuration. Nothing is hardcoded: every integration is switched on
 * by environment variables and falls back to local defaults.
 */
export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  authSecret: process.env.AUTH_SECRET ?? "groundwork-local-demo-secret-change-me",
};

export const isSupabaseEnabled = Boolean(env.supabaseUrl && env.supabaseAnonKey);
