import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/logo";
import { ForgotPasswordForm } from "../auth-forms";

export const metadata: Metadata = { title: "Reset your password" };

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-1 items-start justify-center px-4 pb-16 pt-[6vh]">
      <div className="rise w-full max-w-[420px] rounded-3xl bg-bg p-8 shadow-soft sm:p-10">
        <LogoMark className="size-10" />
        <h1 className="mt-5 text-[26px] font-bold tracking-tight text-ink">Reset your password</h1>
        <p className="mt-1 text-[15px] text-muted">We&apos;ll email you a link to choose a new one.</p>
        <div className="mt-8">
          <ForgotPasswordForm />
        </div>
        <p className="mt-8 text-center text-sm text-muted">
          Remembered it?{" "}
          <Link href="/login" className="font-medium text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
