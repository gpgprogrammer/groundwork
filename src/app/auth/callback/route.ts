import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseEnabled } from "@/lib/env";

/** Supabase email-confirmation and OAuth redirect target. */
export async function GET(req: NextRequest) {
  const { searchParams, origin } = req.nextUrl;
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/dashboard";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/dashboard";

  if (isSupabaseEnabled && code) {
    const { createSessionClient } = await import("@/lib/supabase/server");
    const supabase = await createSessionClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }
  return NextResponse.redirect(`${origin}/login?error=callback`);
}
