"use client";

import { GraduationCap, Presentation, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogoMark } from "./logo";
import { PLUS } from "@/lib/billing/plans";

const KEY = "merit:welcome-dismissed";
/** After closing it, a visitor sees it again only after this long. */
const QUIET_DAYS = 3;
// Not on the landing page itself: it already is the invitation.
const HIDDEN_ON = /^\/($|signup|login|auth|terms|privacy|onboarding|forgot-password|reset-password)/;

function recentlyDismissed() {
  try {
    const at = Number(localStorage.getItem(KEY) ?? 0);
    return Date.now() - at < QUIET_DAYS * 86_400_000;
  } catch {
    return false;
  }
}

/** For signed-out visitors: a welcome that invites them to create a free account. */
export function WelcomePrompt() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (recentlyDismissed()) return;
    const t = setTimeout(() => setOpen(true), 800);
    return () => clearTimeout(t);
  }, []);

  const visible = open && !HIDDEN_ON.test(pathname);

  useEffect(() => {
    if (!visible) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  });

  function close() {
    setOpen(false);
    try {
      localStorage.setItem(KEY, String(Date.now()));
    } catch {}
  }

  if (!visible) return null;
  const next = pathname !== "/" ? `&next=${encodeURIComponent(pathname)}` : "";
  return (
    <div className="fade fixed inset-0 z-[60] flex items-end justify-center bg-ink/40 backdrop-blur-[2px] sm:items-center sm:p-4" onClick={close}>
      <div role="dialog" aria-modal="true" aria-labelledby="welcome-title" onClick={(e) => e.stopPropagation()} className="dialog-in relative max-h-[calc(100dvh-2rem)] w-full overflow-y-auto overscroll-contain rounded-t-[28px] bg-surface shadow-lift ring-1 ring-line sm:max-w-md sm:rounded-[28px] px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-3 sm:p-7">
        <span aria-hidden className="mx-auto mb-4 block h-1 w-10 rounded-full bg-line-strong sm:hidden" />
        <button type="button" onClick={close} aria-label="Close" className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-full text-muted transition-[background-color,color,transform] duration-150 hover:bg-bg-subtle hover:text-ink active:scale-[0.94]">
          <X className="size-5" />
        </button>
        <LogoMark className="size-12" />
        <h2 id="welcome-title" className="headline mt-5 text-[26px] text-ink">
          Welcome to Merit
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">
          Create your free account to get lessons picked for your classes, and a free {PLUS.trialDays}-day trial of Merit Plus whenever you want it.
        </p>
        <div className="mt-6 space-y-2.5">
          <Link href={`/signup?as=student${next}`} onClick={close} className="group flex items-center gap-3.5 rounded-2xl bg-accent p-4 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.14)] transition-[background-color,transform] duration-150 ease-out hover:bg-accent-hover active:scale-[0.98]">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
              <GraduationCap className="size-5" />
            </span>
            <span>
              <span className="block text-[15px] font-semibold">I&apos;m a student</span>
              <span className="block text-[13px] text-white/85">Study for AP and SAT exams</span>
            </span>
          </Link>
          <Link href={`/signup?as=teacher${next}`} onClick={close} className="group flex items-center gap-3.5 rounded-2xl bg-surface p-4 text-ink ring-1 ring-inset ring-line-strong transition-[background-color,transform] duration-150 ease-out hover:bg-bg-subtle active:scale-[0.98]">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-ink">
              <Presentation className="size-5" />
            </span>
            <span>
              <span className="block text-[15px] font-semibold">I&apos;m a teacher or tutor</span>
              <span className="block text-[13px] text-muted">Share lessons, videos, and tutoring</span>
            </span>
          </Link>
        </div>
        <p className="mt-5 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href={`/login${pathname !== "/" ? `?next=${encodeURIComponent(pathname)}` : ""}`} onClick={close} className="font-semibold text-accent-ink hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
