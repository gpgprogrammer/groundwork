import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { resilientFetch } from "@/lib/supabase/fetch";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Keeps Supabase auth cookies fresh on navigation. In demo mode there is
 * nothing to refresh; pages do their own (authoritative) session checks.
 */
export async function proxy(request: NextRequest) {
  if (!supabaseUrl || !supabaseKey) return NextResponse.next();

  // Signed-out visitors have no session to refresh: skip the network round trip entirely.
  if (!request.cookies.getAll().some((c) => c.name.startsWith("sb-"))) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    global: { fetch: resilientFetch },
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        for (const { name, value } of list) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of list) response.cookies.set(name, value, options);
      },
    },
  });
  try {
    await supabase.auth.getUser();
  } catch {
    // Auth is unreachable: let the page render (it treats the visitor as signed out) instead of hanging.
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|api/billing/webhook|.*\\.(?:png|jpg|svg|webp|ico)$).*)"],
};
