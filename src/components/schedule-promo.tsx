"use client";

import { ArrowRight, CalendarDays, X } from "lucide-react";
import { CALENDAR_BENEFITS } from "./calendar-benefits";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { dismissSchedulePromo } from "@/app/actions/prompts";
import { buttonClass } from "./ui";
import { PAID_PLANS, PLUS } from "@/lib/billing/plans";

/** Seconds before the popup can be closed, so it gets read first. */
const LOCK_SECONDS = 5;

const DISMISSED_KEY = "merit:schedule-promo-dismissed";

const HIDDEN_ON = /^\/(schedule|onboarding|login|signup|pricing|settings\/billing|admin)/;

/**
 * Shown once, 5 minutes after an account is created (after the student has had a
 * look around): what calendar sync does, and that it comes with Merit Plus or Exam Sprint.
 */
export function SchedulePromo({ showAt, trialDaysLeft }: { showAt: string; trialDaysLeft: number | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [closed, setClosed] = useState(false);
  const [lockLeft, setLockLeft] = useState(LOCK_SECONDS);
  const cta = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    // Closed on this device already (the server copy covers other devices).
    try {
      if (localStorage.getItem(DISMISSED_KEY)) return;
    } catch {}
    const wait = Math.max(1500, new Date(showAt).getTime() - Date.now());
    const t = setTimeout(() => setOpen(true), wait);
    return () => clearTimeout(t);
  }, [showAt]);

  const visible = open && !closed && !HIDDEN_ON.test(pathname);
  const locked = lockLeft > 0;

  // Count down while it's on screen; only then can it be closed.
  useEffect(() => {
    if (!visible) return;
    cta.current?.focus();
    const t = setInterval(() => setLockLeft((n) => Math.max(0, n - 1)), 1000);
    return () => clearInterval(t);
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  });

  function dismiss() {
    setClosed(true);
    try {
      localStorage.setItem(DISMISSED_KEY, new Date().toISOString());
    } catch {}
    void dismissSchedulePromo();
  }

  function close() {
    if (!locked) dismiss();
  }

  if (!visible) return null;
  return (
    <div className="fade fixed inset-0 z-[60] flex items-end justify-center bg-ink/40 backdrop-blur-[2px] sm:items-center sm:p-4" onClick={close}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-promo-title"
        onClick={(e) => e.stopPropagation()}
        className="dialog-in relative max-h-[calc(100dvh-2rem)] w-full overflow-y-auto overscroll-contain rounded-t-[28px] bg-surface shadow-lift ring-1 ring-line sm:max-w-md sm:rounded-[28px]"
      >
        {locked ? (
          <span
            role="timer"
            aria-label={`You can close this in ${lockLeft} seconds`}
            className="tabular absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-full bg-surface text-[14px] font-semibold text-muted ring-1 ring-line"
          >
            {lockLeft}
          </span>
        ) : (
          <button
            type="button"
            onClick={dismiss}
            aria-label="Close"
            className="fade absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-full bg-surface/80 text-muted transition-[background-color,color,transform] duration-150 hover:bg-bg-subtle hover:text-ink active:scale-[0.94]"
          >
            <X className="size-5" />
          </button>
        )}
        <div className="bg-accent-soft px-6 pb-6 pt-3 sm:pt-7">
          <span aria-hidden className="mx-auto mb-4 block h-1 w-10 rounded-full bg-accent/25 sm:hidden" />
          <span className="flex size-12 items-center justify-center rounded-2xl bg-accent text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.14)]">
            <CalendarDays className="size-6" />
          </span>
          <h2 id="schedule-promo-title" className="headline mt-5 text-[26px] text-ink">
            Sync your schedule
          </h2>
          <p className="mt-1.5 text-[15px] leading-relaxed text-ink-2">Merit knows what&apos;s coming, so you know what to study tonight.</p>
        </div>
        <div className="px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-5 sm:pb-6">
          <ul className="space-y-3 text-[14px] leading-relaxed text-ink-2">
            {CALENDAR_BENEFITS.map(({ key, Icon, title, body }, i) => (
              <li key={key} className="flex gap-3">
                <Icon className="mt-0.5 size-[18px] shrink-0 text-accent-ink" />
                <span>
                  <span className="font-semibold text-ink">{title}.</span> {i < 2 ? body : null}
                </span>
              </li>
            ))}
          </ul>
          {PAID_PLANS ? (
          <p className="mt-5 rounded-2xl bg-bg-subtle px-4 py-3 text-[13.5px] leading-relaxed text-ink-2">
            Included with <span className="font-semibold text-ink">Merit Plus</span> or <span className="font-semibold text-ink">Exam Sprint</span>.{" "}
            {trialDaysLeft != null ? (
              <>
                Your Plus trial has <span className="font-semibold text-ink">{trialDaysLeft} {trialDaysLeft === 1 ? "day" : "days"} left</span>.
              </>
            ) : (
              <>You can try Merit Plus free for {PLUS.trialDays} days, no card needed.</>
            )}
          </p>
          ) : (
            <p className="mt-5 rounded-2xl bg-bg-subtle px-4 py-3 text-[13.5px] leading-relaxed text-ink-2">Free with your account. It takes about a minute.</p>
          )}
          <Link ref={cta} href="/schedule" onClick={dismiss} className={buttonClass("primary", "lg", "mt-5 w-full")}>
            Sync my schedule <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
