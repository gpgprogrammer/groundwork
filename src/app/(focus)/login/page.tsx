import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoMark } from "@/components/logo";
import { OAuthButtons } from "@/components/oauth-buttons";
import { getViewer } from "@/lib/viewer";
import { SignInForm } from "../auth-forms";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" && sp.next.startsWith("/") && !sp.next.startsWith("//") ? sp.next : undefined;
  if (await getViewer()) redirect(next ?? "/");

  return (
    <div className="flex flex-1 items-start justify-center px-4 pb-16 pt-[6vh]">
      <div className="rise w-full max-w-[420px] rounded-3xl bg-bg p-8 shadow-soft sm:p-10">
        <LogoMark className="size-10" />
        <h1 className="mt-5 text-[26px] font-bold tracking-tight text-ink">Sign in</h1>
        <p className="mt-1 text-[15px] text-muted">to continue to Merit</p>

        {sp.error ? <p className="mt-6 rounded-lg bg-warn-soft px-3 py-2 text-sm text-warn">That sign-in link didn&apos;t work. Please try again.</p> : null}

        <div className="mt-8">
          <OAuthButtons next={next} />
          <SignInForm next={next} />
        </div>

        <p className="mt-8 text-center text-sm text-muted">
          New to Merit?{" "}
          <Link href={next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"} className="font-medium text-accent hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

