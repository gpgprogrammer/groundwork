import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

/** Supabase client bound to the signed-in user's session (RLS applies). */
export async function createSessionClient() {
  const store = await cookies();
  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          for (const { name, value, options } of list) store.set(name, value, options);
        } catch {
          // Called from a Server Component; the proxy refreshes the session instead.
        }
      },
    },
  });
}

/** Anonymous client for public catalog reads (no cookies, cacheable). */
export function createPublicClient() {
  return createClient(env.supabaseUrl, env.supabaseAnonKey, { auth: { persistSession: false } });
}

/** Service-role client. Server-only: webhooks, role changes, and billing writes. */
export function createAdminClient() {
  if (!env.supabaseServiceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for this operation.");
  }
  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, { auth: { persistSession: false } });
}
