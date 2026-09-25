import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/logo";
import { getViewer } from "@/lib/viewer";
import { ResetPasswordForm } from "../auth-forms";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false } };

/** Reached from the emailed reset link, which signs the user in first. */
export default async function ResetPasswordPage() {
  const viewer = await getViewer();
  return (
    <div className="flex flex-1 items-start justify-center px-4 pb-16 pt-[6vh]">
      <div className="rise w-full max-w-[420px] rounded-3xl bg-bg p-8 shadow-soft sm:p-10">
        <LogoMark className="size-10" />
        <h1 className="mt-5 text-[26px] font-bold tracking-tight text-ink">Choose a new password</h1>
        {viewer ? (
          <>
            <p className="mt-1 text-[15px] text-muted">for {viewer.user.email}</p>
            <div className="mt-8">
              <ResetPasswordForm />
            </div>
          </>
        ) : (
          <p className="mt-3 text-[15px] leading-relaxed text-ink-2">
            That reset link has expired or was already used.{" "}
            <Link href="/forgot-password" className="font-medium text-accent hover:underline">
              Send a new one
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  );
}
