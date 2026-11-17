import { ArrowRight, Bot, Check, GraduationCap, HeartHandshake, Sparkles, Target } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutNotice } from "@/components/checkout-notice";
import { Faq } from "@/components/marketing";
import { BillingToggle } from "@/components/pricing-client";
import { BuyButton, PlusBadge, SprintBadge, TrialButton } from "@/components/upgrade";
import { cn } from "@/components/ui";
import { WorldBand } from "@/components/learn-band";
import { AI_LIMITS } from "@/lib/ai/limits";
import { annualSavings, PAID_PLANS, PLUS, SPRINT, sprintFeatures, usd } from "@/lib/billing/plans";
import { isStripeEnabled, paymentsPaused } from "@/lib/env";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = {
  title: "Pricing",
  description: PAID_PLANS
    ? `Merit is free to learn. Try Plus free for ${PLUS.trialDays} days, then ${usd(PLUS.monthly)}/month. Exam Sprint is ${usd(SPRINT.price)} once.`
    : "Everything on Merit is free: every course and lesson, Merit AI, the learning plan, calendar sync, and Exam Sprint. You only pay a tutor if you book one.",
};

export default async function PricingPage({ searchParams }: PageProps<"/pricing">) {
  const [viewer, sp] = await Promise.all([getViewer(), searchParams]);
  if (!PAID_PLANS) return <FreePricing signedIn={Boolean(viewer)} />;
  const plus = viewer?.plus ?? { kind: "anonymous" as const };
  const trialEnds = plus.kind === "trial" ? new Date(plus.endsAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : null;

  const plusCta =
    plus.kind === "anonymous" || plus.kind === "free" ? (
      <div className="space-y-2">
        <TrialButton returnTo="/plan" signedIn={plus.kind === "free"} className="w-full justify-center" />
        <p className="text-center text-[12px] text-white/70">{PLUS.trialDays} days free, no card needed.</p>
      </div>
    ) : plus.kind === "active" ? (
      <Link href="/plan" className="flex h-12 w-full items-center justify-center rounded-full bg-white text-[15px] font-semibold text-[#0f172a] hover:bg-white/90">
        You have Plus · open your plan
      </Link>
    ) : null;

  const priceBlock = (period: "year" | "month") => (
    <div>
      <p className="flex items-baseline gap-1.5">
        <span className="font-brand text-5xl font-black tracking-tight">{usd(period === "year" ? PLUS.annual : PLUS.monthly)}</span>
        <span className="text-white/70">/{period}</span>
      </p>
      <p className="mt-1 text-[13px] text-white/70">{period === "year" ? `That's ${usd(PLUS.annual / 12)} a month.` : "Cancel anytime."}</p>
      <div className="mt-6">
        {plusCta ?? (
          <div className="space-y-2">
            <BuyButton product={period === "year" ? "plus-year" : "plus-month"} returnTo="/plan" variant="light" className="h-12 w-full text-[15px]">
              {plus.kind === "trial" ? `Lock in ${usd(period === "year" ? PLUS.annual : PLUS.monthly)}/${period}` : `Get Plus for ${usd(period === "year" ? PLUS.annual : PLUS.monthly)}/${period}`}
            </BuyButton>
            {trialEnds ? <p className="text-center text-[12px] text-white/70">Your free trial runs until {trialEnds}. You won&apos;t be charged before then.</p> : null}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
    <WorldBand
      size="lg"
      className="pb-24 text-center lg:pb-28 [&_h1]:mx-auto [&_p]:mx-auto"
      kicker={<span className="mx-auto rounded-full bg-white/15 px-3.5 py-1.5 ring-1 ring-inset ring-white/25">Pricing</span>}
      title="Understand what you're studying tonight."
      lede="Every course and lesson is free, forever. Plus picks the best videos for what you're learning in class. Exam Sprint gets you ready for one big exam."
    />
    <div className="mx-auto max-w-[1200px] px-4 pb-20 sm:px-6">
      <div className="pt-6">
        <CheckoutNotice sp={sp} />
      </div>
      <div className="relative -mt-24 grid gap-5 lg:-mt-28 lg:grid-cols-3">
        {/* Free */}
        <section className="flex flex-col rounded-[28px] bg-surface p-7 shadow-[0_6px_0_0_var(--line)] ring-2 ring-line">
          <h2 className="flex items-center gap-2 font-brand text-[20px] font-black text-ink">
            <GraduationCap className="size-5 text-accent-ink" /> Free
          </h2>
          <p className="mt-4 font-brand text-5xl font-black tracking-tight text-ink">$0</p>
          <p className="mt-1 text-[13px] text-muted">Forever. No card.</p>
          <ul className="mt-6 flex-1 space-y-3 text-[14.5px] text-ink-2">
            {[
              "Every math class from Algebra 1 to AP Calculus, plus SAT Math, unit by unit",
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
        <section className="relative flex flex-col overflow-hidden rounded-[28px] bg-accent p-7 text-white shadow-[0_6px_0_0_var(--accent-press)] ring-4 ring-white dark:ring-surface">
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full border-[28px] border-white/10" />
          <div className="relative flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-brand text-[20px] font-black">
              <Sparkles className="size-5" /> {PLUS.name}
            </h2>
            <span className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide">{PLUS.trialDays} days free</span>
          </div>
          <div className="relative mt-4">
            <BillingToggle savings={annualSavings} annual={priceBlock("year")} monthly={priceBlock("month")} />
          </div>
          <ul className="relative mt-7 space-y-3 text-[14.5px]">
            <li className="flex gap-2.5 font-medium">
              <Check className="mt-0.5 size-4 shrink-0 text-white/80" /> Everything in Free
            </li>
            {PLUS.features.map((f) => (
              <li key={f.key} className="flex gap-2.5">
                <Check className="mt-0.5 size-4 shrink-0 text-white/80" />
                <span>
                  <span className="font-semibold">{f.title}.</span> <span className="text-white/75">{f.body}</span>
                </span>
              </li>
            ))}
            <li className="flex gap-2.5">
              <Check className="mt-0.5 size-4 shrink-0 text-white/80" /> <span className="text-white/90">{AI_LIMITS.plus} AI questions a day</span>
            </li>
          </ul>
        </section>

        {/* Sprint */}
        <section className="flex flex-col rounded-[28px] bg-surface p-7 shadow-[0_6px_0_0_var(--sprint-press)] ring-2 ring-sprint">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-brand text-[20px] font-black text-ink">
              <Target className="size-5 text-sprint" /> {SPRINT.name}
            </h2>
            <span className="rounded-full bg-sprint-soft px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-sprint-ink">
              One-time
            </span>
          </div>
          <p className="mt-4 flex items-baseline gap-1.5">
            <span className="font-brand text-5xl font-black tracking-tight text-ink">{usd(SPRINT.price)}</span>
            <span className="text-muted">once</span>
          </p>
          <p className="mt-1 text-[13px] text-muted">Try it free for 7 days. Then pay once: every class and every test, forever, with calendar sync.</p>
          <ul className="mt-6 flex-1 space-y-3 text-[14.5px] text-ink-2">
            {SPRINT.features.map((f) => (
              <li key={f.title} className="flex gap-2.5">
                <Check className="mt-0.5 size-4 shrink-0 text-sprint" />
                <span>
                  <span className="font-semibold text-ink">{f.title}.</span> {f.body}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-8 space-y-2">
            <Link href="/sprint" className="flex h-12 items-center justify-center gap-2 rounded-full bg-sprint text-[15px] font-semibold text-white hover:brightness-110 transition-[background-color,transform] duration-150 active:scale-[0.97]">
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
        <Link href="/pricing/parents" className="press group flex items-center gap-5 rounded-[28px] bg-sprint-soft p-7 ring-2 ring-sprint/15 [--ledge:color-mix(in_oklab,var(--sprint)_25%,transparent)]">
          <HeartHandshake className="size-10 shrink-0 text-sprint" />
          <div>
            <p className="text-lg font-bold text-ink">Buying for your student?</p>
            <p className="mt-1 text-[14px] text-ink-2">Pay for Plus or an Exam Sprint with your card. It unlocks the moment they sign in with their email.</p>
            <p className="mt-2 text-sm font-semibold text-accent-ink group-hover:underline">Parent checkout →</p>
          </div>
        </Link>
        <Link href="/ask" className="press group flex items-center gap-5 rounded-[28px] bg-[#fdeef6] p-7 ring-2 ring-[#db2777]/15 [--ledge:#f9a8d4] dark:bg-[#3d1830]">
          <Bot className="size-10 shrink-0 text-accent-ink" />
          <div>
            <p className="text-lg font-bold text-ink">Try Merit AI free</p>
            <p className="mt-1 text-[14px] text-ink-2">Ask it to explain a topic, quiz you, or find the best lesson. No account needed for your first {AI_LIMITS.anonymous} questions.</p>
            <p className="mt-2 text-sm font-semibold text-accent-ink group-hover:underline">Ask a question →</p>
          </div>
        </Link>
      </section>

      <section className="mx-auto mt-20 max-w-3xl">
        <h2 className="text-center headline text-[28px] sm:text-[34px] text-ink">How an Exam Sprint works</h2>
        <ol className="mt-10 grid gap-4 sm:grid-cols-2">
          {[
            ["Take the diagnostic", "Ten minutes of exam-style questions across every unit, plus how confident you feel. Free."],
            ["See your readiness", "Unit by unit, with an estimated score. You'll know exactly where the points are."],
            ["Follow the daily plan", "Each day: the one or two best lessons for your weakest topics and a practice set. Weak spots come back until they stick."],
            ["Walk in ready", "Weekly checkpoints, free-response feedback, and one-page cram sheets for the last week."],
          ].map(([t, b], i) => (
            <li key={t} className="rounded-2xl p-6 bg-surface ring-2 ring-line">
              <span className="flex size-8 items-center justify-center rounded-full bg-sprint text-sm font-bold text-white">{i + 1}</span>
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
            ["How does the free trial of Plus work?", `Your account starts on the free plan. Whenever you open a Plus feature, like your learning plan or calendar sync, you can start a ${PLUS.trialDays}-day free trial. No card needed, and it's one trial per account. After that, Plus is ${usd(PLUS.monthly)}/month or ${usd(PLUS.annual)}/year, and everything free stays free.`],
            ["Is Exam Sprint a subscription?", `No. You pay ${usd(SPRINT.price)} once and it unlocks Exam Sprint for every class and test, forever, plus calendar sync. The diagnostic and your readiness report are free, so you can see what you'd get first.`],
            ["Can I cancel Plus?", "Anytime, from Settings → Plan and billing. You keep Plus until the end of the period you paid for."],
            ["Can my parent pay?", "Yes. Parent checkout lets anyone pay with their own card. The purchase unlocks when the student signs in with the email you enter."],
            ["Do tutors pay to be ranked higher?", "Never. Tutor and lesson rankings are based on reviews, results, and teaching quality. Merit earns a referral fee from tutors booked here, and that never affects ranking."],
          ]}
        />
      </div>

      <p className={cn("mt-12 text-center text-[12px] text-muted", isStripeEnabled && "hidden")}>
        <PlusBadge className="mr-1.5 align-middle" /> <SprintBadge className="mr-1.5 align-middle" />{" "}
        {paymentsPaused ? "Purchases open soon. Until then, you can try Merit Plus free for ${PLUS.trialDays} days and Exam Sprint free for 7 days." : "Payments are in test mode while Merit connects its payment processor. No card is charged."}
      </p>
    </div>
    </>
  );
}

/** Pricing while paid plans are switched off: everything is free; tutors are the only thing you pay for. */
function FreePricing({ signedIn }: { signedIn: boolean }) {
  const groups = [
    {
      Icon: GraduationCap,
      tint: "text-accent-ink",
      title: "Learn",
      items: ["Every course, unit by unit", "The best lessons for every topic, ranked", "Lessons added by real teachers", "Mark topics understood and track progress"],
    },
    {
      Icon: Sparkles,
      tint: "text-accent-ink",
      title: "Your learning plan",
      items: [...PLUS.features.map((f) => f.title), `Merit AI study partner (${AI_LIMITS.plus} questions a day)`],
    },
    {
      Icon: Target,
      tint: "text-sprint",
      title: SPRINT.name,
      items: sprintFeatures().map((f) => f.title),
    },
  ];
  return (
    <>
      <WorldBand
        size="lg"
        className="pb-24 text-center lg:pb-28 [&_h1]:mx-auto [&_p]:mx-auto"
        kicker={<span className="mx-auto rounded-full bg-white/15 px-3.5 py-1.5 ring-1 ring-inset ring-white/25">Pricing</span>}
        title="Everything on Merit is free."
        lede="Every course and lesson, Merit AI, your learning plan, calendar sync, and Exam Sprint. No trial, no card, nothing to unlock."
      />
      <div className="mx-auto max-w-[1200px] px-4 pb-20 sm:px-6">
        <div className="relative -mt-24 grid gap-5 lg:-mt-28 lg:grid-cols-3">
          {groups.map(({ Icon, tint, title, items }) => (
            <section key={title} className="flex flex-col rounded-[28px] bg-surface p-7 shadow-[0_6px_0_0_var(--line)] ring-2 ring-line">
              <h2 className="flex items-center gap-2 font-brand text-[20px] font-black text-ink">
                <Icon className={cn("size-5", tint)} /> {title}
              </h2>
              <p className="mt-4 font-brand text-5xl font-black tracking-tight text-ink">$0</p>
              <ul className="mt-6 flex-1 space-y-3 text-[14.5px] text-ink-2">
                {items.map((f) => (
                  <li key={f} className="flex gap-2.5">
                    <Check className="mt-0.5 size-4 shrink-0 text-positive" /> {f}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <Link href={signedIn ? "/plan" : "/signup?as=student"} className="press font-brand inline-flex h-12 items-center gap-2 rounded-2xl bg-accent px-6 text-[16px] font-extrabold text-white [--ledge:var(--accent-press)] hover:brightness-110">
            {signedIn ? "Open my learning plan" : "Create a free account"} <ArrowRight className="size-4" />
          </Link>
        </div>

        <section className="relative mt-14 overflow-hidden rounded-[28px] bg-surface p-7 ring-2 ring-line sm:p-9">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <h2 className="flex items-center gap-2 font-brand text-[22px] font-black text-ink">
                <HeartHandshake className="size-5 text-accent-ink" /> Want a person? Book a tutor.
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-2">
                The only thing you ever pay for on Merit is a tutor you choose to book. Each tutor sets their own rate, and you see it before you book. Merit also lists great free teachers and tutoring services.
              </p>
            </div>
            <Link href="/tutors" className="press font-brand inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-surface px-6 text-[15px] font-extrabold text-ink ring-2 ring-inset ring-line [--ledge:var(--line)] hover:bg-bg-subtle">
              Find a tutor <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
