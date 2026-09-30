import { OAuthButtons } from "@/components/oauth-buttons";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/viewer";
import { AuthShell } from "../auth-shell";
import { SignUpForm } from "../auth-forms";

export const metadata: Metadata = { title: "Create your account" };

export default async function SignUpPage({ searchParams }: PageProps<"/signup">) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" && sp.next.startsWith("/") && !sp.next.startsWith("//") ? sp.next : undefined;
  if (await getViewer()) redirect(next ?? "/");
  const initialType = sp.as === "teacher" || sp.as === "student" ? sp.as : undefined;
  return (
    <AuthShell
      title="Create your free account"
      subtitle="Merit Plus is free for your first month. No card."
      footer={
        <>
          <p className="text-xs leading-relaxed text-muted">
            By continuing you agree to the{" "}
            <Link href="/terms" className="underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline">
              Privacy Policy
            </Link>
            . Students under 13 need a parent to create the account.
          </p>
          <p className="mt-5 text-center text-[15px] text-muted">
            Already have an account?{" "}
            <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"} className="font-brand font-extrabold text-accent-ink hover:underline">
              Sign in
            </Link>
          </p>
        </>
      }
    >
      <OAuthButtons next={next} />
      <SignUpForm next={next} initialType={initialType} />
    </AuthShell>
  );
}
