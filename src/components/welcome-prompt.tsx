"use client";

import { GraduationCap, Presentation, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogoMark } from "./logo";

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
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4 backdrop-blur-[2px] sm:items-center" onClick={close}>
      <div role="dialog" aria-modal="true" aria-labelledby="welcome-title" onClick={(e) => e.stopPropagation()} className="rise relative w-full max-w-md rounded-3xl bg-bg p-7 shadow-2xl ring-1 ring-line">
        <button type="button" onClick={close} aria-label="Close" className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full text-muted hover:bg-bg-subtle hover:text-ink">
          <X className="size-5" />
        </button>
        <LogoMark className="size-11" />
        <h2 id="welcome-title" className="mt-4 text-2xl font-extrabold tracking-tight text-ink">
          Welcome to Merit
        </h2>
        <p className="mt-1.5 text-[15px] leading-relaxed text-ink-2">
          Create your free account to get lessons picked for your classes, a study plan for tonight, and Merit Plus free for your first month.
        </p>
        <div className="mt-6 space-y-2.5">
          <Link href={`/signup?as=student${next}`} onClick={close} className="flex items-center gap-3 rounded-2xl bg-accent p-4 text-white hover:brightness-110">
            <GraduationCap className="size-6 shrink-0" />
            <span>
              <span className="block font-semibold">I&apos;m a student</span>
              <span className="block text-[13px] text-white/80">Study for AP and SAT exams</span>
            </span>
          </Link>
          <Link href={`/signup?as=teacher${next}`} onClick={close} className="flex items-center gap-3 rounded-2xl bg-bg-subtle p-4 text-ink ring-1 ring-line hover:bg-line">
            <Presentation className="size-6 shrink-0 text-accent" />
            <span>
              <span className="block font-semibold">I&apos;m a teacher or tutor</span>
              <span className="block text-[13px] text-muted">Share lessons, videos, and tutoring</span>
            </span>
          </Link>
        </div>
        <p className="mt-5 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href={`/login${pathname !== "/" ? `?next=${encodeURIComponent(pathname)}` : ""}`} onClick={close} className="font-medium text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
