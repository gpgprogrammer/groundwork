import { GraduationCap, Presentation } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signInAsDemo, signInWithGoogle } from "@/app/actions/auth";
import { Button } from "@/components/ui";
import { isSupabaseEnabled } from "@/lib/env";
import { getViewer } from "@/lib/viewer";
import { SignInForm } from "../auth-forms";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" && sp.next.startsWith("/") && !sp.next.startsWith("//") ? sp.next : undefined;
  if (await getViewer()) redirect(next ?? "/dashboard");

  return (
    <div className="flex flex-1 items-start justify-center px-5 pb-16 pt-[8vh]">
      <div className="rise w-full max-w-sm">
        <h1 className="headline text-center text-[28px] text-ink">Welcome back</h1>
        <p className="mt-2 text-center text-sm text-muted">Sign in to pick up where you left off.</p>

        {sp.error ? (
          <p className="mt-6 rounded-lg bg-warn-soft px-3 py-2 text-center text-sm text-warn">That sign-in link didn&apos;t work. Please try again.</p>
        ) : null}

        <div className="mt-8">
          {isSupabaseEnabled ? (
            <>
              <form action={signInWithGoogle}>
                <input type="hidden" name="next" value={next ?? ""} />
                <Button variant="secondary" size="lg" className="w-full">
                  <GoogleMark /> Continue with Google
                </Button>
              </form>
              <Divider />
            </>
          ) : null}
          <SignInForm next={next} />
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          New here?{" "}
          <Link href={next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"} className="font-medium text-ink underline underline-offset-4">
            Start your free month
          </Link>
        </p>

        {!isSupabaseEnabled ? (
          <div className="mt-10 rounded-2xl border border-dashed border-line-strong p-5">
            <p className="text-[13px] font-medium text-ink">Explore with a demo account</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">Accounts come pre-filled with history, saved lessons, and requests. Password: groundwork</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <form action={signInAsDemo}>
                <input type="hidden" name="who" value="student" />
                <Button variant="secondary" className="h-auto w-full flex-col items-start gap-0.5 py-2.5 text-left">
                  <span className="flex items-center gap-1.5 text-[13px]">
                    <GraduationCap className="size-3.5" /> Student
                  </span>
                  <span className="text-[11px] font-normal text-muted">Maya · Calc BC</span>
                </Button>
              </form>
              <form action={signInAsDemo}>
                <input type="hidden" name="who" value="creator" />
                <Button variant="secondary" className="h-auto w-full flex-col items-start gap-0.5 py-2.5 text-left">
                  <span className="flex items-center gap-1.5 text-[13px]">
                    <Presentation className="size-3.5" /> Educator
                  </span>
                  <span className="text-[11px] font-normal text-muted">Sarah · Studio</span>
                </Button>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div className="my-6 flex items-center gap-3 text-xs text-faint">
      <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
    </div>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.96 10.96 0 0 0 12 1 11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}
