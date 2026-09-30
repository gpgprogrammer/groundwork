import type { Metadata } from "next";
import Link from "next/link";
import { getViewer } from "@/lib/viewer";
import { AuthShell } from "../auth-shell";
import { ResetPasswordForm } from "../auth-forms";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false } };

/** Reached from the emailed reset link, which signs the user in first. */
export default async function ResetPasswordPage() {
  const viewer = await getViewer();
  return (
    <AuthShell title="Choose a new password" subtitle={viewer ? `for ${viewer.user.email}` : undefined}>
      {viewer ? (
        <ResetPasswordForm />
      ) : (
        <p className="text-[15px] leading-relaxed text-ink-2">
          That reset link has expired or was already used.{" "}
          <Link href="/forgot-password" className="font-brand font-extrabold text-accent-ink hover:underline">
            Send a new one
          </Link>
          .
        </p>
      )}
    </AuthShell>
  );
}
