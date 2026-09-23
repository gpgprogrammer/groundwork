import { Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PLAN } from "@/lib/env";
import { getViewer } from "@/lib/viewer";
import { SignUpForm } from "../auth-forms";

export const metadata: Metadata = { title: "Start your free month" };

export default async function SignUpPage() {
  if (await getViewer()) redirect("/dashboard");
  return (
    <div className="flex flex-1 items-start justify-center px-5 pb-16 pt-[6vh]">
      <div className="rise grid w-full max-w-4xl gap-12 md:grid-cols-[1fr_1fr] md:gap-16">
        <div className="order-2 md:order-1 md:pt-12">
          <p className="font-serif text-[28px] leading-snug text-ink">
            Find the <span className="italic">one</span> good explanation, without scrolling through twenty bad ones.
          </p>
          <ul className="mt-10 space-y-4">
            {[
              [`${PLAN.trialDays} days free`, "No card needed to start."],
              ["Short, ranked lessons", "The ones students actually finish come first."],
              ["A plan for your exam", "Tell us your date and we'll pace you."],
            ].map(([t, d]) => (
              <li key={t} className="flex gap-3">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-positive-soft text-positive">
                  <Check className="size-3" strokeWidth={3} />
                </span>
                <div>
                  <p className="text-sm font-medium text-ink">{t}</p>
                  <p className="text-sm text-muted">{d}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="order-1 md:order-2">
          <div className="rounded-2xl border border-line bg-surface p-7 shadow-soft">
            <h1 className="headline text-2xl text-ink">Start your free month</h1>
            <p className="mt-1.5 text-sm text-muted">
              Then ${PLAN.priceMonthly}/month if you decide to stay.
            </p>
            <div className="mt-7">
              <SignUpForm />
            </div>
            <p className="mt-5 text-center text-xs leading-relaxed text-faint">
              By continuing you agree to the Terms and Privacy Policy. Students under 13 need a parent to create the account.
            </p>
          </div>
          <p className="mt-6 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-ink underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
