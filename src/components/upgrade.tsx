import { ArrowRight, CalendarCheck, Check, Lock, Sparkles, Target, Timer } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { PLUS, SPRINT, usd, type Product } from "@/lib/billing/plans";
import type { PlusAccess } from "@/lib/types";
import { cn } from "./ui";

export function PlusBadge({ className, onDark }: { className?: string; onDark?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md", onDark ? "bg-white/20" : "bg-gradient-to-r from-[#4287f5] to-[#2346c7]", " px-1.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wide text-white", className)}>
      <Sparkles className="size-3" /> Plus
    </span>
  );
}

export function SprintBadge({ className, onDark }: { className?: string; onDark?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md", onDark ? "bg-white/20" : "bg-gradient-to-r from-[#ff8a3d] to-[#e0531c]", " px-1.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wide text-white", className)}>
      <Target className="size-3" /> Sprint
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
  variant?: "primary" | "sprint" | "light" | "outline" | "glass";
}) {
  return (
    <form action="/api/billing/checkout" method="post" className="contents">
      <input type="hidden" name="product" value={product} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <button
        type="submit"
        className={cn(
          "inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition-[filter,background-color]",
          variant === "primary" && "bg-accent text-white hover:brightness-110",
          variant === "sprint" && "bg-gradient-to-r from-[#ff8a3d] to-[#e0531c] text-white hover:brightness-110",
          variant === "light" && "bg-white text-[#0f172a] hover:bg-white/90",
          variant === "outline" && "bg-bg text-ink ring-1 ring-line-strong hover:bg-bg-subtle",
          variant === "glass" && "bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/20",
          className,
        )}
      >
        {children}
      </button>
    </form>
  );
}

/** Wraps a Plus feature: shows it when the student has Plus, an upgrade card otherwise. */
export function PlusGate({ access, feature, returnTo, children }: { access: PlusAccess; feature: string; returnTo: string; children: ReactNode }) {
  if (access.kind === "trial" || access.kind === "active") return <>{children}</>;
  return <PlusLocked access={access} feature={feature} returnTo={returnTo} />;
}

export function PlusLocked({ access, feature, returnTo }: { access: PlusAccess; feature: string; returnTo: string }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#0b1530] p-8 text-white sm:p-10">
      <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-[#3b82f6]/30 blur-3xl" />
      <div className="relative max-w-xl">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
          <Lock className="size-3.5" /> {feature} is part of Merit Plus
        </span>
        <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">Know exactly what to study tonight.</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-white/75">
          Plus turns your class calendar and exam date into a plan: tonight&apos;s lessons, reminders before every test, and progress you can see.
        </p>
        <ul className="mt-5 grid gap-2 text-sm sm:grid-cols-2">
          {PLUS.features.map((f) => (
            <li key={f.key} className="flex items-center gap-2 text-white/90">
              <Check className="size-4 text-[#7fb2ff]" /> {f.title}
            </li>
          ))}
        </ul>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          {access.kind === "anonymous" ? (
            <Link href={`/signup?next=${encodeURIComponent(returnTo)}`} className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-[#0f172a] hover:bg-white/90">
              Get your first month free <ArrowRight className="size-4" />
            </Link>
          ) : (
            <>
              <BuyButton product="plus-month" returnTo={returnTo} variant="light">
                {usd(PLUS.monthly)}/month
              </BuyButton>
              <BuyButton product="plus-year" returnTo={returnTo} variant="glass">
                {usd(PLUS.annual)}/year
              </BuyButton>
            </>
          )}
          <Link href="/pricing" className="text-sm font-medium text-white/70 hover:text-white">
            Compare plans
          </Link>
        </div>
        {access.kind === "anonymous" ? <p className="mt-3 text-xs text-white/55">No card needed. Plus is free for your first month.</p> : null}
      </div>
    </div>
  );
}

/** A promo that sits in a video grid, sized like a video card. */
export function SprintFeedCard({ courseTitle, courseId }: { courseTitle?: string; courseId?: string }) {
  return (
    <Link href={courseId ? `/sprint?course=${courseId}` : "/sprint"} className="group flex flex-col">
      <div className="relative flex aspect-video flex-col justify-between overflow-hidden rounded-xl bg-gradient-to-br from-[#ff8a3d] via-[#f0602a] to-[#b83212] p-5 text-white">
        <div className="pointer-events-none absolute -bottom-10 -right-10 size-44 rounded-full bg-white/15 blur-2xl" />
        <SprintBadge onDark className="relative w-fit" />
        <div className="relative">
          <p className="text-[22px] font-extrabold leading-tight tracking-tight">
            {courseTitle ? `${courseTitle} in 30 days.` : "Your AP exam, planned day by day."}
          </p>
          <p className="mt-1 text-[13px] text-white/85">Free diagnostic · daily plan · unlimited practice</p>
        </div>
      </div>
      <div className="mt-3 flex gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#fff1e8] text-[#e0531c]">
          <Timer className="size-4.5" />
        </span>
        <div className="min-w-0">
          <p className="text-[15px] font-semibold leading-snug text-ink group-hover:underline">Start an Exam Sprint: see your readiness in 10 minutes</p>
          <p className="mt-1 text-sm text-muted">Merit · {usd(SPRINT.price)} once, diagnostic free</p>
        </div>
      </div>
    </Link>
  );
}

export function PlusFeedCard() {
  return (
    <Link href="/plan" className="group flex flex-col">
      <div className="relative flex aspect-video flex-col justify-between overflow-hidden rounded-xl bg-gradient-to-br from-[#4287f5] to-[#1e2f8f] p-5 text-white">
        <div className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full bg-white/15 blur-2xl" />
        <PlusBadge onDark className="relative w-fit" />
        <div className="relative">
          <p className="text-[22px] font-extrabold leading-tight tracking-tight">Know what to study tonight.</p>
          <p className="mt-1 text-[13px] text-white/85">Your calendar + exam date → a plan, every day</p>
        </div>
      </div>
      <div className="mt-3 flex gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
          <CalendarCheck className="size-4.5" />
        </span>
        <div className="min-w-0">
          <p className="text-[15px] font-semibold leading-snug text-ink group-hover:underline">Build your study plan with Merit Plus</p>
          <p className="mt-1 text-sm text-muted">Merit · first month free</p>
        </div>
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
      className={cn(
        "group flex items-center gap-4 rounded-2xl bg-gradient-to-r from-[#fff4ec] to-[#ffe7d9] p-4 ring-1 ring-[#ffd2b8] transition-shadow hover:shadow-soft dark:from-[#2a1a10] dark:to-[#2a140a] dark:ring-[#5a2e14]",
        className,
      )}
    >
      <span className="flex size-11 shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-[#ff8a3d] to-[#e0531c] text-white">
        {daysLeft !== null ? (
          <>
            <span className="tabular text-[15px] font-extrabold leading-none">{daysLeft}</span>
            <span className="text-[9px] font-semibold uppercase leading-none">days</span>
          </>
        ) : (
          <Target className="size-5" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold text-ink">
          {soon ? `Exam in ${daysLeft} days? Build my plan.` : `Get the ${courseTitle} score you want.`}
        </span>
        <span className="block text-[13px] text-ink-2">Free diagnostic, then a day-by-day Exam Sprint to exam day.</span>
      </span>
      <ArrowRight className="size-5 shrink-0 text-[#e0531c] transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
