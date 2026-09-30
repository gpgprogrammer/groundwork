import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { OAuthButtons } from "@/components/oauth-buttons";
import { getViewer } from "@/lib/viewer";
import { AuthShell } from "../auth-shell";
import { SignInForm } from "../auth-forms";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" && sp.next.startsWith("/") && !sp.next.startsWith("//") ? sp.next : undefined;
  if (await getViewer()) redirect(next ?? "/");

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue to Merit."
      footer={
        <p className="text-center text-[15px] text-muted">
          New to Merit?{" "}
          <Link href={next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"} className="font-brand font-extrabold text-accent-ink hover:underline">
            Create an account
          </Link>
        </p>
      }
    >
      {sp.error ? (
        <p className="mb-6 rounded-2xl bg-warn-soft px-4 py-3 text-sm font-medium text-ink" role="alert">
          That sign-in link didn&apos;t work. Please try again.
        </p>
      ) : null}
      <OAuthButtons next={next} />
      <SignInForm next={next} />
    </AuthShell>
  );
}
