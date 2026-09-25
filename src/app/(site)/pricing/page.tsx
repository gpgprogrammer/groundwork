import { ArrowRight, Bot, Check, GraduationCap, HeartHandshake, Sparkles, Target } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutNotice } from "@/components/checkout-notice";
import { Faq } from "@/components/marketing";
import { BillingToggle } from "@/components/pricing-client";
import { BuyButton, PlusBadge, SprintBadge } from "@/components/upgrade";
import { cn } from "@/components/ui";
import { AI_LIMITS } from "@/lib/ai/limits";
import { annualSavings, PLUS, SPRINT, usd } from "@/lib/billing/plans";
import { isStripeEnabled, paymentsPaused } from "@/lib/env";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = {
  title: "Pricing",
  description: `Merit is free to learn. Plus is ${usd(PLUS.monthly)}/month after a free first month. Exam Sprint is ${usd(SPRINT.price)} once.`,
};

export default async function PricingPage({ searchParams }: PageProps<"/pricing">) {
  const [viewer, sp] = await Promise.all([getViewer(), searchParams]);
  const plus = viewer?.plus ?? { kind: "anonymous" as const };
  const trialEnds = plus.kind === "trial" ? new Date(plus.endsAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : null;

  const plusCta =
    plus.kind === "anonymous" ? (
      <Link href="/signup?next=/plan" className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white text-[15px] font-semibold text-[#0f172a] hover:bg-white/90">
        Start your free month <ArrowRight className="size-4" />
      </Link>
    ) : plus.kind === "active" ? (
      <Link href="/plan" className="flex h-12 w-full items-center justify-center rounded-full bg-white text-[15px] font-semibold text-[#0f172a] hover:bg-white/90">
        You have Plus · open your plan
      </Link>
    ) : null;

  const priceBlock = (period: "year" | "month") => (
    <div>
      <p className="flex items-baseline gap-1.5">
        <span className="text-5xl font-extrabold tracking-tight">{usd(period === "year" ? PLUS.annual : PLUS.monthly)}</span>
        <span className="text-white/70">/{period}</span>
      </p>
      <p className="mt-1 text-[13px] text-white/70">{period === "year" ? `That's ${usd(PLUS.annual / 12)} a month.` : "Cancel anytime."}</p>
      <div className="mt-6">
        {plusCta ?? (
          <div className="space-y-2">
            <BuyButton product={period === "year" ? "plus-year" : "plus-month"} returnTo="/plan" variant="light" className="h-12 w-full text-[15px]">
              {plus.kind === "trial" ? `Lock in ${usd(period === "year" ? PLUS.annual : PLUS.monthly)}/${period}` : `Get Plus for ${usd(period === "year" ? PLUS.annual : PLUS.monthly)}/${period}`}
            </BuyButton>
            {trialEnds ? <p className="text-center text-[12px] text-white/70">Your free month runs until {trialEnds}. You won&apos;t be charged before then.</p> : null}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-20 pt-10 sm:px-6">
      <CheckoutNotice sp={sp} />
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">Understand what you&apos;re studying tonight.</h1>
        <p className="mt-4 text-[17px] leading-relaxed text-ink-2">
          Every course and lesson is free, forever. Plus plans your nights around your real schedule. Exam Sprint gets you ready for one big exam.
        </p>
      </div>

      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {/* Free */}
        <section className="flex flex-col rounded-3xl p-7 ring-1 ring-line">
          <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
            <GraduationCap className="size-5 text-accent" /> Free
          </h2>
          <p className="mt-4 text-5xl font-extrabold tracking-tight text-ink">$0</p>
          <p className="mt-1 text-[13px] text-muted">Forever. No card.</p>
          <ul className="mt-6 flex-1 space-y-3 text-[14.5px] text-ink-2">
            {[
              "Every AP course and the SAT, unit by unit",
              "The best lessons for every topic, ranked",
              `Merit AI study partner (${AI_LIMITS.free} questions a day)`,
              "Mark topics understood",
              "Find tutors near you and online",
              "Lessons added by real teachers",
            ].map((f) => (
              <li key={f} className="flex gap-2.5">
                <Check className="mt-0.5 size-4 shrink-0 text-positive" /> {f}
              </li>
            ))}
          </ul>
          <Link href={viewer ? "/courses" : "/signup"} className="mt-8 flex h-12 items-center justify-center rounded-full bg-bg-subtle text-[15px] font-semibold text-ink hover:bg-line">
            {viewer ? "Browse courses" : "Create a free account"}
          </Link>
        </section>

        {/* Plus */}
        <section className="relative flex flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-[#2d5ff0] via-[#2346c7] to-[#172a7a] p-7 text-white shadow-lift">
          <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-white/15 blur-3xl" />
          <div className="relative flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <Sparkles className="size-5" /> {PLUS.name}
            </h2>
            <span className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide">First month free</span>
          </div>
          <div className="relative mt-4">
            <BillingToggle savings={annualSavings} annual={priceBlock("year")} monthly={priceBlock("month")} />
          </div>
          <ul className="relative mt-7 space-y-3 text-[14.5px]">
            <li className="flex gap-2.5 font-medium">
              <Check className="mt-0.5 size-4 shrink-0 text-[#a9c8ff]" /> Everything in Free
            </li>
            {PLUS.features.map((f) => (
              <li key={f.key} className="flex gap-2.5">
                <Check className="mt-0.5 size-4 shrink-0 text-[#a9c8ff]" />
                <span>
                  <span className="font-semibold">{f.title}.</span> <span className="text-white/75">{f.body}</span>
                </span>
              </li>
            ))}
            <li className="flex gap-2.5">
              <Check className="mt-0.5 size-4 shrink-0 text-[#a9c8ff]" /> <span className="text-white/90">{AI_LIMITS.plus} AI questions a day</span>
            </li>
          </ul>
        </section>

        {/* Sprint */}
        <section className="flex flex-col rounded-3xl p-7 ring-2 ring-[#ff8a3d]">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
              <Target className="size-5 text-[#e0531c]" /> {SPRINT.name}
            </h2>
            <span className="rounded-full bg-[#fff1e8] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-[#c2410c] dark:bg-[#3a1d0c] dark:text-[#ffb489]">
              One-time
            </span>
          </div>
          <p className="mt-4 flex items-baseline gap-1.5">
            <span className="text-5xl font-extrabold tracking-tight text-ink">{usd(SPRINT.price)}</span>
            <span className="text-muted">once</span>
          </p>
          <p className="mt-1 text-[13px] text-muted">Try it free for 7 days. Then pay once: every class and every test, forever, with calendar sync.</p>
          <ul className="mt-6 flex-1 space-y-3 text-[14.5px] text-ink-2">
            {SPRINT.features.map((f) => (
              <li key={f.title} className="flex gap-2.5">
                <Check className="mt-0.5 size-4 shrink-0 text-[#e0531c]" />
                <span>
                  <span className="font-semibold text-ink">{f.title}.</span> {f.body}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-8 space-y-2">
            <Link href="/sprint" className="flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ff8a3d] to-[#e0531c] text-[15px] font-semibold text-white hover:brightness-110">
              Take the free diagnostic <ArrowRight className="size-4" />
            </Link>
            {viewer ? (
              <BuyButton product="sprint" returnTo="/sprint" variant="outline" className="h-11 w-full">
                Buy a Sprint now · {usd(SPRINT.price)}
              </BuyButton>
            ) : null}
          </div>
        </section>
      </div>

      <section className="mt-6 grid gap-5 md:grid-cols-2">
        <Link href="/pricing/parents" className="group flex items-center gap-5 rounded-3xl bg-bg-subtle p-7 hover:bg-line">
          <HeartHandshake className="size-10 shrink-0 text-[#e0531c]" />
          <div>
            <p className="text-lg font-bold text-ink">Buying for your student?</p>
            <p className="mt-1 text-[14px] text-ink-2">Pay for Plus or an Exam Sprint with your card. It unlocks the moment they sign in with their email.</p>
            <p className="mt-2 text-sm font-semibold text-accent group-hover:underline">Parent checkout →</p>
          </div>
        </Link>
        <Link href="/ask" className="group flex items-center gap-5 rounded-3xl bg-bg-subtle p-7 hover:bg-line">
          <Bot className="size-10 shrink-0 text-accent" />
          <div>
            <p className="text-lg font-bold text-ink">Try Merit AI free</p>
            <p className="mt-1 text-[14px] text-ink-2">Ask it to explain a topic, quiz you, or find the best lesson. No account needed for your first {AI_LIMITS.anonymous} questions.</p>
            <p className="mt-2 text-sm font-semibold text-accent group-hover:underline">Ask a question →</p>
          </div>
        </Link>
      </section>

      <section className="mx-auto mt-20 max-w-3xl">
        <h2 className="text-center text-3xl font-bold tracking-tight text-ink">How an Exam Sprint works</h2>
        <ol className="mt-10 grid gap-4 sm:grid-cols-2">
          {[
            ["Take the diagnostic", "Ten minutes of exam-style questions across every unit, plus how confident you feel. Free."],
            ["See your readiness", "Unit by unit, with an estimated score. You'll know exactly where the points are."],
            ["Follow the daily plan", "Each day: the one or two best lessons for your weakest topics and a practice set. Weak spots come back until they stick."],
            ["Walk in ready", "Weekly checkpoints, free-response feedback, and one-page cram sheets for the last week."],
          ].map(([t, b], i) => (
            <li key={t} className="rounded-2xl p-6 ring-1 ring-line">
              <span className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-[#ff8a3d] to-[#e0531c] text-sm font-bold text-white">{i + 1}</span>
              <p className="mt-4 font-semibold text-ink">{t}</p>
              <p className="mt-1 text-[14px] leading-relaxed text-muted">{b}</p>
            </li>
          ))}
        </ol>
      </section>

      <div className="mx-auto mt-20 max-w-3xl">
        <Faq
          items={[
            ["Is Merit really free?", "Yes. Every course, every lesson, tutor search, and the AI study partner (with a daily limit) are free forever. You only pay for planning and exam prep tools."],
            ["What does the free month of Plus mean?", `Every new account gets Merit Plus free for ${PLUS.trialDays === 30 ? "a full month" : `${PLUS.trialDays} days`}. No card needed. After that, Plus is ${usd(PLUS.monthly)}/month or ${usd(PLUS.annual)}/year, and everything free stays free.`],
            ["Is Exam Sprint a subscription?", `No. You pay ${usd(SPRINT.price)} once and it unlocks Exam Sprint for every class and test, forever, plus calendar sync. The diagnostic and your readiness report are free, so you can see what you'd get first.`],
            ["Can I cancel Plus?", "Anytime, from Settings → Plan and billing. You keep Plus until the end of the period you paid for."],
            ["Can my parent pay?", "Yes. Parent checkout lets anyone pay with their own card. The purchase unlocks when the student signs in with the email you enter."],
            ["Do tutors pay to be ranked higher?", "Never. Tutor and lesson rankings are based on reviews, results, and teaching quality. Merit earns a referral fee from tutors booked here, and that never affects ranking."],
          ]}
        />
      </div>

      <p className={cn("mt-12 text-center text-[12px] text-muted", isStripeEnabled && "hidden")}>
        <PlusBadge className="mr-1.5 align-middle" /> <SprintBadge className="mr-1.5 align-middle" />{" "}
        {paymentsPaused ? "Purchases open soon. Until then, Merit Plus is free for your first month and Exam Sprint has a free 7-day trial." : "Payments are in test mode while Merit connects its payment processor. No card is charged."}
      </p>
    </div>
  );
}
