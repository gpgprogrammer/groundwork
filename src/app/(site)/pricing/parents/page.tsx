import { CircleCheck, Gift, Lock, Mail } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { inputClass } from "@/components/form";
import { cn } from "@/components/ui";
import { PLUS, SPRINT, usd } from "@/lib/billing/plans";
import { isStripeEnabled } from "@/lib/env";

export const metadata: Metadata = {
  title: "For parents",
  description: "Pay for Merit Plus or an Exam Sprint for your student. It unlocks when they sign in.",
};

export default async function ParentsPage({ searchParams }: PageProps<"/pricing/parents">) {
  const sp = await searchParams;
  const done = sp.checkout === "success";
  const error = sp.checkout === "invalid" ? "Please fill in every field with a valid email." : sp.checkout === "same" ? "Use your student's own email, not yours." : sp.checkout === "error" ? "Checkout couldn't start. Please try again." : null;

  return (
    <div className="mx-auto max-w-[1000px] px-4 pb-20 pt-10 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-[1fr_420px]">
        <div>
          <p className="text-sm font-semibold text-[#e0531c]">For parents and guardians</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-ink">Give your student a plan, not just more videos.</h1>
          <p className="mt-4 text-[17px] leading-relaxed text-ink-2">
            Pay with your card; your student gets it the moment they sign in with their email. No shared passwords, no student credit card.
          </p>
          <div className="mt-8 space-y-4">
            <div className="rounded-2xl p-5 ring-1 ring-line">
              <p className="font-semibold text-ink">
                {SPRINT.name} · {usd(SPRINT.price)} once
              </p>
              <p className="mt-1 text-[14px] leading-relaxed text-muted">
                For one AP exam or the SAT: a diagnostic, a day-by-day plan to exam day, unlimited exam-style practice with explanations, and a readiness dashboard with an estimated score.
              </p>
            </div>
            <div className="rounded-2xl p-5 ring-1 ring-line">
              <p className="font-semibold text-ink">
                {PLUS.name} · {usd(PLUS.annual)} for a year
              </p>
              <p className="mt-1 text-[14px] leading-relaxed text-muted">
                A nightly study plan built from their class calendar, reminders before every test, and progress tracking across all their courses. (Every student already gets their first year of Plus free; a gift adds a year on top.)
              </p>
            </div>
          </div>
          <ul className="mt-8 space-y-2 text-[14px] text-ink-2">
            <li className="flex gap-2">
              <Lock className="mt-0.5 size-4 shrink-0 text-muted" /> Payments are processed securely by Stripe. Merit never sees your card.
            </li>
            <li className="flex gap-2">
              <Mail className="mt-0.5 size-4 shrink-0 text-muted" /> We only use your email for the receipt.
            </li>
          </ul>
        </div>

        <div className="rounded-3xl p-6 ring-1 ring-line lg:sticky lg:top-20 lg:self-start">
          {done ? (
            <div className="py-6 text-center">
              <CircleCheck className="mx-auto size-12 text-positive" />
              <p className="mt-4 text-xl font-bold text-ink">All set.</p>
              <p className="mt-2 text-[15px] text-ink-2">
                It unlocks as soon as {typeof sp.to === "string" ? <span className="font-medium">{sp.to}</span> : "your student"} signs in to Merit with that email.
              </p>
              {sp.test ? <p className="mt-3 text-[13px] text-muted">Test mode: payments aren&apos;t connected yet, so no card was charged.</p> : null}
              <Link href="/" className="mt-6 inline-flex h-11 items-center rounded-full bg-ink px-5 text-sm font-semibold text-bg">
                Back to Merit
              </Link>
            </div>
          ) : (
            <form action="/api/billing/gift" method="post" className="space-y-5">
              <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
                <Gift className="size-5 text-[#e0531c]" /> Parent checkout
              </h2>
              <fieldset className="grid gap-2">
                {[
                  { v: "sprint", t: SPRINT.name, p: `${usd(SPRINT.price)} once` },
                  { v: "plus-year", t: `${PLUS.name}, 1 year`, p: usd(PLUS.annual) },
                ].map((o, i) => (
                  <label key={o.v} className="flex cursor-pointer items-center justify-between rounded-xl p-4 ring-1 ring-line has-[:checked]:ring-2 has-[:checked]:ring-accent">
                    <span className="flex items-center gap-3">
                      <input type="radio" name="product" value={o.v} defaultChecked={i === 0} className="size-4 accent-[var(--accent)]" />
                      <span className="font-medium text-ink">{o.t}</span>
                    </span>
                    <span className="tabular text-sm font-semibold text-ink">{o.p}</span>
                  </label>
                ))}
              </fieldset>
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-medium text-ink-2">Your name</span>
                <input name="buyerName" required maxLength={80} className={inputClass} autoComplete="name" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-medium text-ink-2">Your email (for the receipt)</span>
                <input name="buyerEmail" type="email" required className={inputClass} autoComplete="email" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-medium text-ink-2">Your student&apos;s email</span>
                <input name="studentEmail" type="email" required className={inputClass} />
                <span className="mt-1 block text-[12px] text-muted">The email they use (or will use) to sign in to Merit.</span>
              </label>
              {error ? <p className="text-sm text-[#c2410c]">{error}</p> : null}
              <button type="submit" className={cn("h-12 w-full rounded-full bg-gradient-to-r from-[#ff8a3d] to-[#e0531c] text-[15px] font-semibold text-white hover:brightness-110")}>
                Continue to payment
              </button>
              {!isStripeEnabled ? <p className="text-center text-[12px] text-muted">Test mode: no card will be charged.</p> : null}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
