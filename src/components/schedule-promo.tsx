"use client";

import { ArrowRight, BellRing, CalendarDays, Sparkles, Target, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { dismissSchedulePromo } from "@/app/actions/prompts";

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
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4 backdrop-blur-[2px] sm:items-center" onClick={close}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-promo-title"
        onClick={(e) => e.stopPropagation()}
        className="rise relative w-full max-w-md overflow-hidden rounded-3xl bg-bg shadow-2xl ring-1 ring-line"
      >
        {locked ? (
          <span role="timer" aria-label={`You can close this in ${lockLeft} seconds`} className="tabular absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-full bg-white/20 text-[14px] font-semibold text-white">
            {lockLeft}
          </span>
        ) : (
          <button type="button" onClick={dismiss} aria-label="Close" className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-full bg-bg/80 text-muted hover:bg-bg-subtle hover:text-ink">
            <X className="size-5" />
          </button>
        )}
        <div className="bg-gradient-to-br from-accent to-[#1d4ed8] px-6 pb-6 pt-8 text-white">
          <CalendarDays className="size-9" />
          <h2 id="schedule-promo-title" className="mt-4 text-2xl font-extrabold tracking-tight">
            Sync your schedule
          </h2>
          <p className="mt-1 text-[15px] text-white/85">Merit knows what&apos;s coming, so you know what to study tonight.</p>
        </div>
        <div className="px-6 pb-6 pt-5">
          <ul className="space-y-3 text-[14.5px] text-ink-2">
            <li className="flex gap-3">
              <Sparkles className="mt-0.5 size-5 shrink-0 text-accent" />
              <span>
                <span className="font-semibold text-ink">Your feed learns what you&apos;re learning in school.</span> The topics on your calendar move to the top of For you, so Merit keeps pace with your classes.
              </span>
            </li>
            <li className="flex gap-3">
              <CalendarDays className="mt-0.5 size-5 shrink-0 text-accent" />
              Connect Blackbaud, Canvas, Schoology, Google, or a PDF in about a minute. It stays up to date on its own.
            </li>
            <li className="flex gap-3">
              <BellRing className="mt-0.5 size-5 shrink-0 text-accent" />
              Before every quiz and test, Merit lines up the right lessons for that exact topic.
            </li>
            <li className="flex gap-3">
              <Target className="mt-0.5 size-5 shrink-0 text-accent" />
              Big test coming? Turn it into an Exam Sprint with a day-by-day plan.
            </li>
          </ul>
          <p className="mt-5 rounded-xl bg-accent-soft px-4 py-3 text-[13.5px] text-ink">
            Included with <span className="font-semibold">Merit Plus</span> or <span className="font-semibold">Exam Sprint</span>.{" "}
            {trialDaysLeft != null ? (
              <>
                Your first month of Plus is free: <span className="font-semibold">{trialDaysLeft} {trialDaysLeft === 1 ? "day" : "days"} left</span>.
              </>
            ) : (
              <>Merit Plus is free for your first month.</>
            )}
          </p>
          <Link ref={cta} href="/schedule" onClick={dismiss} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-accent text-[15px] font-semibold text-white hover:brightness-110">
            Sync my schedule <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
