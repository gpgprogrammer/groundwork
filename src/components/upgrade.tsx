import { ArrowRight, CalendarCheck, Check, Lock, Sparkles, Target, Timer } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { PLUS, SPRINT, usd, type Product } from "@/lib/billing/plans";
import type { PlusAccess } from "@/lib/types";
import { paymentsPaused } from "@/lib/env";
import { startTrial } from "@/app/actions/billing";
import { cn } from "./ui";

export function PlusBadge({ className, onDark }: { className?: string; onDark?: boolean }) {
  return (
    <span className={cn("inline-flex h-7 items-center gap-1 rounded-full px-3 font-brand text-[12.5px] font-extrabold", onDark ? "bg-white/20 text-white" : "bg-accent text-white", className)}>
      <Sparkles className="size-3.5" /> Plus
    </span>
  );
}

export function SprintBadge({ className, onDark }: { className?: string; onDark?: boolean }) {
  return (
    <span className={cn("inline-flex h-7 items-center gap-1 rounded-full px-3 font-brand text-[12.5px] font-extrabold", onDark ? "bg-white/20 text-white" : "bg-sprint text-white", className)}>
      <Target className="size-3.5" /> Sprint
    </span>
  );
}

/** Posts to checkout. Anonymous visitors are sent to sign up first, then back. */
export function BuyButton({
  product,
  returnTo,
  children,
  className,
  variant = "primary",
}: {
  product: Product;
  returnTo: string;
  children: ReactNode;
  className?: string;
  /** light: white on a dark tile. onBlue / onSprint: white with the world color's text, for solid colored tiles. */
  variant?: "primary" | "sprint" | "light" | "outline" | "glass" | "onBlue" | "onSprint";
}) {
  if (paymentsPaused) {
    return (
      <span
        title="Purchases open soon"
        className={cn("press font-brand inline-flex h-11 cursor-not-allowed flex-col items-center justify-center rounded-2xl bg-bg-subtle px-5 text-sm font-extrabold leading-tight text-muted ring-2 ring-inset ring-line [--ledge:var(--line)]", className)}
      >
        {children}
        <span className="text-[10.5px] font-semibold">Opening soon</span>
      </span>
    );
  }
  return (
    <form action="/api/billing/checkout" method="post" className="contents">
      <input type="hidden" name="product" value={product} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <button
        type="submit"
        className={cn(
          "press font-brand inline-flex h-11 select-none items-center justify-center gap-2 whitespace-nowrap rounded-2xl px-5 text-[15px] font-extrabold",
          variant === "primary" && "bg-accent text-white [--ledge:var(--accent-press)] hover:brightness-110",
          variant === "sprint" && "bg-sprint text-white [--ledge:var(--sprint-press)] hover:brightness-110",
          variant === "light" && "bg-white text-[#0f172a] [--ledge:rgb(0_0_0/0.22)] hover:brightness-95",
          variant === "onBlue" && "bg-white text-[#1d4ed8] [--ledge:rgb(0_0_0/0.22)] hover:brightness-95",
          variant === "onSprint" && "bg-white text-[#b3400f] [--ledge:rgb(0_0_0/0.22)] hover:brightness-95",
          variant === "outline" && "bg-surface text-ink ring-2 ring-inset ring-line [--ledge:var(--line)] hover:bg-bg-subtle",
          variant === "glass" && "bg-white/15 text-white ring-2 ring-inset ring-white/30 [--ledge:rgb(0_0_0/0.18)] hover:bg-white/25",
          className,
        )}
      >
        {children}
      </button>
    </form>
  );
}

/**
 * Starts the free Merit Plus trial (once per account) and comes back to `returnTo`.
 * Visitors are sent to create an account first, then back here to start it.
 */
export function TrialButton({
  returnTo,
  signedIn,
  className,
  label,
  tone = "blue",
}: {
  returnTo: string;
  signedIn: boolean;
  className?: string;
  label?: string;
  /** White button with blue or green text (on colored panels), or a solid blue button (on white). */
  tone?: "blue" | "green" | "solid";
}) {
  const cls = cn(
    "press font-brand inline-flex h-12 items-center gap-2 rounded-2xl px-6 text-[15.5px] font-extrabold",
    tone === "solid" ? "bg-accent text-white [--ledge:var(--accent-press)] hover:brightness-110" : "bg-white [--ledge:rgb(0_0_0/0.22)] hover:brightness-95",
    tone === "green" ? "text-[#12722f]" : tone === "blue" ? "text-[#1d4ed8]" : null,
    className,
  );
  const text = label ?? `Start my ${PLUS.trialDays}-day free trial`;
  if (!signedIn) {
    return (
      <Link href={`/signup?as=student&next=${encodeURIComponent(returnTo)}`} className={cls}>
        {text} <ArrowRight className="size-4" />
      </Link>
    );
  }
  return (
    <form action={startTrial} className="contents">
      <input type="hidden" name="returnTo" value={returnTo} />
      <button type="submit" className={cls}>
        {text} <ArrowRight className="size-4" />
      </button>
    </form>
  );
}

/** Wraps a Plus feature: shows it when the student has Plus, an upgrade card otherwise. */
export function PlusGate({ access, feature, returnTo, children }: { access: PlusAccess; feature: string; returnTo: string; children: ReactNode }) {
  if (access.kind === "trial" || access.kind === "active") return <>{children}</>;
  return <PlusLocked access={access} feature={feature} returnTo={returnTo} />;
}

export function PlusLocked({ access, feature, returnTo, title = "Videos picked for what you're learning in class." }: { access: PlusAccess; feature: string; returnTo: string; title?: string }) {
  return (
    <div className="rise relative overflow-hidden rounded-3xl bg-accent p-7 text-white sm:p-10">
      <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 size-80 rounded-full border-[44px] border-white/10" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 right-40 size-56 rounded-full border-[32px] border-white/[0.07]" />
      <div className="relative max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 font-brand text-[13px] font-extrabold">
          <Lock className="size-3.5" /> {feature} is part of Merit Plus
        </span>
        <h2 className="display mt-5 text-[34px] sm:text-[44px]">{title}</h2>
        <p className="mt-3 text-[16px] leading-relaxed text-white/90">
          Plus follows what you&apos;re covering in school, from your class calendar or the topics you pick, and gives you a learning plan: the best videos for exactly those topics, plus every upcoming quiz and test lined up with its lessons, and progress you can see.
        </p>
        <ul className="mt-6 grid gap-2 text-[14.5px] sm:grid-cols-2">
          {PLUS.features.map((f) => (
            <li key={f.key} className="flex items-center gap-2.5 rounded-2xl bg-white/10 px-3 py-2.5 font-brand font-extrabold">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white">
                <Check className="size-3.5 text-[#1d4ed8]" strokeWidth={3.5} />
              </span>
              {f.title}
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          {access.kind === "anonymous" || access.kind === "free" ? (
            <TrialButton returnTo={returnTo} signedIn={access.kind === "free"} />
          ) : (
            <>
              <BuyButton product="plus-month" returnTo={returnTo} variant="onBlue" className="h-12 px-6">
                {usd(PLUS.monthly)}/month
              </BuyButton>
              <BuyButton product="plus-year" returnTo={returnTo} variant="glass" className="h-12 px-6">
                {usd(PLUS.annual)}/year
              </BuyButton>
            </>
          )}
          <Link href="/pricing" className="px-2 font-brand text-[14.5px] font-extrabold text-white/85 transition-colors hover:text-white">
            Compare plans
          </Link>
        </div>
        {access.kind === "anonymous" || access.kind === "free" ? (
          <p className="mt-3 text-[13px] text-white/80">
            Free for {PLUS.trialDays} days, no card needed. Then {usd(PLUS.monthly)}/month if you want to keep it.
          </p>
        ) : null}
      </div>
    </div>
  );
}

/** A promo tile that sits in a lesson grid, sized like a lesson tile. */
export function SprintFeedCard({ courseTitle, courseId }: { courseTitle?: string; courseId?: string }) {
  return (
    <Link
      href={courseId ? `/sprint?course=${courseId}` : "/sprint"}
      className="press group relative flex min-h-[320px] flex-col justify-between overflow-hidden rounded-3xl bg-sprint p-6 text-white [--ledge:var(--sprint-press)]"
    >
      <div aria-hidden className="pointer-events-none absolute -bottom-16 -right-16 size-64 rounded-full border-[36px] border-white/10" />
      <div aria-hidden className="pointer-events-none absolute -right-2 top-16 size-24 rounded-full border-[14px] border-white/10" />
      <span className="relative inline-flex w-fit items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 font-brand text-[12.5px] font-extrabold">
        <Target className="size-3.5" /> Exam Sprint
      </span>
      <div className="relative">
        <p className="display text-[30px] leading-[1.05]">{courseTitle ? `${courseTitle} in 30 days.` : "Your AP exam, planned day by day."}</p>
        <p className="mt-2 text-[14px] text-white/85">Free diagnostic · daily plan · unlimited practice</p>
        <span className="mt-5 inline-flex h-11 items-center gap-2 rounded-2xl bg-white px-5 font-brand text-[15px] font-extrabold text-sprint-ink">
          Start an Exam Sprint <Timer className="size-4" />
        </span>
        <p className="mt-2 text-[12.5px] text-white/75">{usd(SPRINT.price)} once, diagnostic free</p>
      </div>
    </Link>
  );
}

export function PlusFeedCard() {
  return (
    <Link href="/plan" className="press group relative flex min-h-[320px] flex-col justify-between overflow-hidden rounded-3xl bg-accent p-6 text-white [--ledge:var(--accent-press)]">
      <div aria-hidden className="pointer-events-none absolute -right-14 -top-14 size-56 rounded-full border-[32px] border-white/10" />
      <span className="relative inline-flex w-fit items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 font-brand text-[12.5px] font-extrabold">
        <Sparkles className="size-3.5" /> Merit Plus
      </span>
      <div className="relative">
        <p className="display text-[30px] leading-[1.05]">Your learning plan.</p>
        <p className="mt-2 text-[14px] text-white/85">Merit Plus suggests videos for what you&apos;re learning in class</p>
        <span className="mt-5 inline-flex h-11 items-center gap-2 rounded-2xl bg-white px-5 font-brand text-[15px] font-extrabold text-accent-ink">
          See my plan <CalendarCheck className="size-4" />
        </span>
        <p className="mt-2 text-[12.5px] text-white/75">Try it free for {PLUS.trialDays} days</p>
      </div>
    </Link>
  );
}

/** Contextual prompt for topic and course pages: "Exam in 18 days? Build my plan." */
export function ExamCta({ daysLeft, courseId, courseTitle, className }: { daysLeft: number | null; courseId: string; courseTitle: string; className?: string }) {
  const soon = daysLeft !== null && daysLeft <= 45;
  return (
    <Link
      href={`/sprint?course=${courseId}`}
      className={cn("press group relative flex items-center gap-4 overflow-hidden rounded-3xl bg-sprint p-4 text-white [--ledge:var(--sprint-press)] hover:brightness-105", className)}
    >
      <div aria-hidden className="pointer-events-none absolute -right-10 -top-12 size-32 rounded-full border-[18px] border-white/10" />
      <span className="relative flex size-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-white text-[#b3400f]">
        {daysLeft !== null ? (
          <>
            <span className="tabular font-brand text-[20px] font-black leading-none">{daysLeft}</span>
            <span className="mt-0.5 font-brand text-[9.5px] font-extrabold uppercase leading-none tracking-wide">days</span>
          </>
        ) : (
          <Target className="size-6" />
        )}
      </span>
      <span className="relative min-w-0 flex-1">
        <span className="block font-brand text-[16px] font-extrabold leading-snug">{soon ? `Exam in ${daysLeft} days? Build my plan.` : `Get the ${courseTitle} score you want.`}</span>
        <span className="mt-0.5 block text-[13px] text-white/85">Free diagnostic, then a day-by-day Exam Sprint to exam day.</span>
      </span>
      <ArrowRight className="relative size-5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
    </Link>
  );
}
