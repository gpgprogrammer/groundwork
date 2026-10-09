import { CalendarCheck, CircleCheck, Gift, KeyRound, Lock, Mail, Target } from "lucide-react";
import { WorldBand } from "@/components/learn-band";
import type { Metadata } from "next";
import { Field, inputClass } from "@/components/form";
import { IconTile, LinkButton, Notice, buttonClass } from "@/components/ui";
import { PAID_PLANS, PLUS, SPRINT, usd } from "@/lib/billing/plans";
import { isStripeEnabled, paymentsPaused } from "@/lib/env";

export const metadata: Metadata = {
  title: "For parents",
  description: PAID_PLANS
    ? "Pay for Merit Plus or an Exam Sprint for your student. It unlocks when they sign in."
    : "Everything on Merit is free for your student: lessons, a learning plan, calendar sync, and Exam Sprint. Find a tutor when they want a person.",
};

export default async function ParentsPage({ searchParams }: PageProps<"/pricing/parents">) {
  if (!PAID_PLANS) return <FreeParents />;
  const sp = await searchParams;
  const done = sp.checkout === "success";
  const error = sp.checkout === "invalid" ? "Please fill in every field with a valid email." : sp.checkout === "same" ? "Use your student's own email, not yours." : sp.checkout === "error" ? "Checkout couldn't start. Please try again." : null;

  return (
    <>
    <WorldBand
      tone="practice"
      size="lg"
      kicker="For parents and guardians"
      title="Give your student a plan, not just more videos."
      lede="Pay with your card; your student gets it the moment they sign in with their email. No shared passwords, no student credit card."
    />
    <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-x-16 grid-cols-[minmax(0,1fr)]">
        <div className="min-w-0">
          <div className="rise space-y-3" style={{ ["--i" as string]: 3 }}>
            <article className="flex gap-4 rounded-2xl bg-surface p-5 ring-2 ring-line">
              <IconTile tone="sprint">
                <Target className="size-5" />
              </IconTile>
              <div className="min-w-0">
                <p className="flex flex-wrap items-baseline justify-between gap-x-3 font-semibold text-ink">
                  {SPRINT.name}
                  <span className="tabular text-[14px] font-semibold text-ink-2">{usd(SPRINT.price)} once</span>
                </p>
                <p className="mt-1 text-[14px] leading-relaxed text-muted">
                  For one AP exam or the SAT: a diagnostic, a day-by-day plan to exam day, unlimited exam-style practice with explanations, and a readiness dashboard with an estimated score.
                </p>
              </div>
            </article>
            <article className="flex gap-4 rounded-2xl bg-surface p-5 ring-2 ring-line">
              <IconTile>
                <CalendarCheck className="size-5" />
              </IconTile>
              <div className="min-w-0">
                <p className="flex flex-wrap items-baseline justify-between gap-x-3 font-semibold text-ink">
                  {PLUS.name}
                  <span className="tabular text-[14px] font-semibold text-ink-2">{usd(PLUS.annual)} for a year</span>
                </p>
                <p className="mt-1 text-[14px] leading-relaxed text-muted">
                  A learning plan with the best videos for what they&apos;re covering in class, every quiz and test on their calendar lined up ahead of time, and progress tracking across all their courses. (Every student can try Plus free for {PLUS.trialDays} days; a gift adds a full year.)
                </p>
              </div>
            </article>
          </div>
        </div>

        <div className="order-last min-w-0 lg:order-none lg:col-start-1">
          <ol className="rise grid gap-5 sm:grid-cols-3" style={{ ["--i" as string]: 4 }}>
            {[
              { Icon: Gift, t: "You pay", b: "Choose a plan and check out with your card." },
              { Icon: Mail, t: "We hold it", b: "It waits on your student's email address." },
              { Icon: KeyRound, t: "They sign in", b: "It unlocks the moment they sign in to Merit." },
            ].map(({ Icon, t, b }, i) => (
              <li key={t} className="flex gap-3 sm:block">
                <span className="tabular flex size-7 shrink-0 items-center justify-center rounded-full bg-bg-subtle text-[12.5px] font-bold text-ink-2 sm:mb-3">{i + 1}</span>
                <span>
                  <span className="flex items-center gap-1.5 text-[14px] font-semibold text-ink">
                    <Icon className="size-4 text-accent-ink" /> {t}
                  </span>
                  <span className="mt-0.5 block text-[13.5px] leading-relaxed text-muted">{b}</span>
                </span>
              </li>
            ))}
          </ol>

          <ul className="mt-10 space-y-2.5 border-t border-line pt-6 text-[14px] text-ink-2">
            <li className="flex gap-2.5">
              <Lock className="mt-0.5 size-4 shrink-0 text-muted" /> Payments are processed securely by Stripe. Merit never sees your card.
            </li>
            <li className="flex gap-2.5">
              <Mail className="mt-0.5 size-4 shrink-0 text-muted" /> We only use your email for the receipt.
            </li>
          </ul>
        </div>

        <div className="rise rounded-[28px] bg-surface p-6 ring-1 ring-line sm:p-7 lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start" style={{ ["--i" as string]: 2 }}>
          {done ? (
            <div className="py-6 text-center">
              <span className="check-pop mx-auto flex size-16 items-center justify-center rounded-full bg-positive-soft">
                <CircleCheck className="size-9 text-positive" />
              </span>
              <p className="headline mt-5 text-2xl text-ink">All set.</p>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-2">
                It unlocks as soon as {typeof sp.to === "string" ? <span className="font-medium text-ink">{sp.to}</span> : "your student"} signs in to Merit with that email.
              </p>
              {sp.test ? <p className="mt-3 text-[13px] text-muted">Test mode: payments aren&apos;t connected yet, so no card was charged.</p> : null}
              <LinkButton href="/" className="mt-7">
                Back to Merit
              </LinkButton>
            </div>
          ) : (
            <form action="/api/billing/gift" method="post" className="space-y-5">
              <h2 className="headline flex items-center gap-2 text-xl text-ink">
                <Gift className="size-5 text-accent-ink" /> Parent checkout
              </h2>
              <fieldset className="grid gap-2">
                <legend className="sr-only">Choose a plan</legend>
                {[
                  { v: "sprint", t: SPRINT.name, p: `${usd(SPRINT.price)} once` },
                  { v: "plus-year", t: `${PLUS.name}, 1 year`, p: usd(PLUS.annual) },
                ].map((o, i) => (
                  <label
                    key={o.v}
                    className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl bg-surface p-4 ring-1 ring-inset ring-line-strong transition-[background-color,box-shadow] duration-150 hover:bg-bg-subtle has-[:checked]:bg-accent-soft has-[:checked]:ring-2 has-[:checked]:ring-accent"
                  >
                    <span className="flex items-center gap-3">
                      <input type="radio" name="product" value={o.v} defaultChecked={i === 0} className="size-4 accent-[var(--accent)]" />
                      <span className="font-semibold text-ink">{o.t}</span>
                    </span>
                    <span className="tabular text-sm font-semibold text-ink">{o.p}</span>
                  </label>
                ))}
              </fieldset>
              <Field label="Your name">
                <input name="buyerName" required maxLength={80} className={inputClass} autoComplete="name" />
              </Field>
              <Field label="Your email (for the receipt)">
                <input name="buyerEmail" type="email" required className={inputClass} autoComplete="email" />
              </Field>
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-semibold text-ink-2">Your student&apos;s email</span>
                <input name="studentEmail" type="email" required className={inputClass} />
                <span className="mt-1.5 block text-[12.5px] text-muted">The email they use (or will use) to sign in to Merit.</span>
              </label>
              {error ? <Notice tone="error">{error}</Notice> : null}
              <button type="submit" disabled={paymentsPaused} className={buttonClass("primary", "lg", "w-full disabled:cursor-not-allowed")}>
                {paymentsPaused ? "Gift purchases open soon" : "Continue to payment"}
              </button>
              {paymentsPaused ? (
                <p className="text-center text-[12.5px] text-muted">Your student can start now: Merit Plus has a free {PLUS.trialDays}-day trial.</p>
              ) : !isStripeEnabled ? (
                <p className="text-center text-[12.5px] text-muted">Test mode: no card will be charged.</p>
              ) : null}
            </form>
          )}
        </div>
      </div>
    </div>
    </>
  );
}

/** For parents while paid plans are switched off: nothing to buy; tutors are the only paid option. */
function FreeParents() {
  const items = [
    { Icon: CalendarCheck, tone: undefined, title: "A learning plan for their classes", body: "The best videos for what they're covering in class, with every quiz and test on their calendar lined up ahead of time, and progress across all their courses." },
    { Icon: Target, tone: "sprint" as const, title: SPRINT.name, body: "For any class test, AP exam, or the SAT: a diagnostic, a day-by-day plan to test day, unlimited practice with explanations, and a readiness dashboard." },
    { Icon: CircleCheck, tone: undefined, title: "Every course and lesson", body: "High school classes, every AP course, and the SAT, with the best lessons for every topic and an AI study partner." },
  ];
  return (
    <>
      <WorldBand
        tone="practice"
        size="lg"
        kicker="For parents and guardians"
        title="Everything on Merit is free for your student."
        lede="No subscription, no trial, no card. They just sign up with their own email."
      />
      <div className="mx-auto w-full max-w-4xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">
        <div className="space-y-3">
          {items.map(({ Icon, tone, title, body }) => (
            <article key={title} className="flex gap-4 rounded-2xl bg-surface p-5 ring-2 ring-line">
              <IconTile tone={tone}>
                <Icon className="size-5" />
              </IconTile>
              <div className="min-w-0">
                <p className="flex flex-wrap items-baseline justify-between gap-x-3 font-semibold text-ink">
                  {title}
                  <span className="tabular text-[14px] font-semibold text-positive">Free</span>
                </p>
                <p className="mt-1 text-[14px] leading-relaxed text-muted">{body}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <LinkButton href="/signup?as=student" size="lg">
            Have them sign up
          </LinkButton>
          <LinkButton href="/tutors" variant="outline" size="lg">
            Find a tutor
          </LinkButton>
        </div>
        <p className="mt-4 text-[14px] text-muted">Tutors are the only paid option on Merit. Each tutor sets their own rate, shown before you book.</p>
      </div>
    </>
  );
}
