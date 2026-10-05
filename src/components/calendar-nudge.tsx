import { ArrowRight, CalendarClock, Check } from "lucide-react";
import Link from "next/link";
import { cn } from "./ui";

/** School systems the calendar setup recognizes by name (any calendar with an iCal link also works). */
export const CALENDAR_SYSTEMS = ["Canvas", "Schoology", "Blackbaud", "Google Classroom", "PowerSchool", "Veracross"];

const POINTS = ["Every quiz and test gets its own lessons", "Your feed follows what you're covering", "Takes about a minute"];

/** Where "Connect my calendar" goes: setup for students, sign-up first for visitors. */
export const calendarHref = (signedIn: boolean) => (signedIn ? "/schedule" : "/signup?as=student&next=%2Fschedule");

/**
 * The calendar call to action, in three sizes: a full-width banner, a sidebar card, and a one-line strip.
 * Show it only to visitors and to students who haven't connected a calendar.
 */
export function CalendarNudge({
  variant,
  signedIn,
  title = "Connect your class calendar",
  body = "Merit reads the quizzes and tests on your school calendar and lines up the right lessons for each one, days before it's due.",
  className,
}: {
  variant: "banner" | "card" | "strip";
  signedIn: boolean;
  title?: string;
  body?: string;
  className?: string;
}) {
  const href = calendarHref(signedIn);
  const cta = signedIn ? "Connect my calendar" : "Sign up and connect";

  if (variant === "strip") {
    return (
      <Link
        href={href}
        className={cn("press flex items-center gap-4 rounded-3xl bg-positive p-4 text-white [--ledge:var(--positive-press)] hover:brightness-105 sm:p-5", className)}
      >
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/20">
          <CalendarClock className="size-6" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-brand text-[17px] font-black leading-snug">{title}</span>
          <span className="mt-0.5 block text-[14px] leading-snug text-white/90">{body}</span>
        </span>
        <span className="hidden shrink-0 items-center gap-1.5 rounded-2xl bg-white px-4 py-2.5 font-brand text-[14.5px] font-extrabold text-[#15803d] sm:inline-flex">
          {cta} <ArrowRight className="size-4" />
        </span>
        <ArrowRight className="size-5 shrink-0 sm:hidden" />
      </Link>
    );
  }

  if (variant === "card") {
    return (
      <section className={cn("overflow-hidden rounded-3xl bg-positive text-white shadow-[0_5px_0_0_var(--positive-press)]", className)}>
        <div className="relative p-5">
          <div aria-hidden className="pointer-events-none absolute -right-10 -top-12 size-36 rounded-full border-[20px] border-white/10" />
          <CalendarClock className="relative size-7" />
          <h2 className="relative mt-3 font-brand text-[19px] font-black leading-snug">{title}</h2>
          <p className="relative mt-1.5 text-[14px] leading-relaxed text-white/90">{body}</p>
          <p className="relative mt-3 text-[12.5px] font-semibold text-white/80">Works with {CALENDAR_SYSTEMS.slice(0, 4).join(", ")}, and more.</p>
        </div>
        <div className="px-3 pb-3">
          <Link href={href} className="press flex h-11 items-center justify-center gap-2 rounded-2xl bg-white font-brand text-[15px] font-extrabold text-[#15803d] [--ledge:rgb(0_0_0/0.2)]">
            {cta} <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className={cn("relative overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#17913f,#12722f)] p-6 text-white shadow-[0_6px_0_0_#0f5c2b] sm:p-8", className)}>
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full border-[36px] border-white/10" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 left-1/3 size-48 rounded-full border-[28px] border-white/[0.07]" />
      <div className="relative grid items-center gap-6 lg:grid-cols-[1fr_auto] grid-cols-[minmax(0,1fr)]">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 font-brand text-[13px] font-extrabold">
            <CalendarClock className="size-4" /> Calendar sync
          </p>
          <h2 className="display mt-3 text-[30px] leading-tight sm:text-[38px]">{title}</h2>
          <p className="mt-2 max-w-2xl text-[16px] leading-relaxed text-white/90">{body}</p>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            {POINTS.map((p) => (
              <li key={p} className="flex items-center gap-2 font-brand text-[14.5px] font-extrabold">
                <span className="flex size-5 items-center justify-center rounded-full bg-white text-[#15803d]">
                  <Check className="size-3.5" strokeWidth={3.5} />
                </span>
                {p}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[13px] font-semibold text-white/80">Works with {CALENDAR_SYSTEMS.join(", ")}, and any calendar with a link.</p>
        </div>
        <Link
          href={href}
          className="press inline-flex h-14 w-fit items-center gap-2 rounded-2xl bg-white px-7 font-brand text-[17px] font-extrabold text-[#15803d] [--ledge:rgb(0_0_0/0.22)] hover:brightness-95"
        >
          {cta} <ArrowRight className="size-5" />
        </Link>
      </div>
    </section>
  );
}

/** Whether to show calendar prompts: visitors, and students who haven't connected a calendar. */
export function wantsCalendar(viewer: { user: { accountType: string }; state: { schedule: { sources?: unknown[] } | null } } | null) {
  if (!viewer) return true;
  return viewer.user.accountType !== "teacher" && !viewer.state.schedule?.sources?.length;
}
