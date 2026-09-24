import "server-only";
import { env, isSupabaseEnabled } from "@/lib/env";

const DEFAULT_DEMO_SECRET = "groundwork-local-demo-secret-change-me";

/** Fail fast on hosted production when the app would run in an unsafe demo configuration. */
export function validateDeploymentConfig() {
  if (process.env.NODE_ENV !== "production") return;
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  if (process.env.VERCEL !== "1") return;

  const allowDemo = process.env.ALLOW_DEMO_MODE === "true";

  if (!isSupabaseEnabled && !allowDemo) {
    throw new Error(
      "[groundwork] Production requires Supabase (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY). " +
        "For a temporary demo deploy only, set ALLOW_DEMO_MODE=true and a strong AUTH_SECRET.",
    );
  }

  if (!isSupabaseEnabled && allowDemo) {
    if (!env.authSecret || env.authSecret === DEFAULT_DEMO_SECRET) {
      throw new Error("[groundwork] Demo mode in production requires a unique AUTH_SECRET (32+ random bytes).");
    }
  }

  if (isSupabaseEnabled && !env.supabaseServiceRoleKey) {
    console.warn("[groundwork] SUPABASE_SERVICE_ROLE_KEY is missing; server-side account writes may fail.");
  }
}
