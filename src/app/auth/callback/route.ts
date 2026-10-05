import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseEnabled } from "@/lib/env";
import { originOf } from "@/lib/origin";

/** Supabase email-confirmation and OAuth redirect target. */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const origin = originOf(req);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/";

  if (isSupabaseEnabled && code) {
    const { createSessionClient } = await import("@/lib/supabase/server");
    const supabase = await createSessionClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Google / Apple sign-up can't carry metadata, so a teacher chosen on the sign-up page is
      // recorded here, only for a brand-new account that has no type yet.
      const user = data.user;
      const isNew = user && Date.now() - new Date(user.created_at).getTime() < 10 * 60000;
      if (searchParams.get("as") === "teacher" && user && isNew && !user.user_metadata?.account_type) {
        await supabase.auth.updateUser({ data: { account_type: "teacher" } });
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }
  // Keep where they were headed, so signing in afterwards still lands there.
  return NextResponse.redirect(`${origin}/login?error=callback${next !== "/" ? `&next=${encodeURIComponent(next)}` : ""}`);
}
