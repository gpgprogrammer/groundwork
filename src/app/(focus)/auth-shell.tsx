import { CalendarCheck, Sparkles, Target, Users } from "lucide-react";
import type { ReactNode } from "react";
import { CourseIcon } from "@/components/course-icon";

const VALUE = [
  { Icon: CalendarCheck, title: "A learning plan for your classes", body: "The best videos for what you're covering in class, and for every quiz and test on your calendar." },
  { Icon: Sparkles, title: "An AI study partner", body: "Explanations, practice questions, and the best lesson for any topic, any time." },
  { Icon: Target, title: "Exam Sprints", body: "A day-by-day plan to AP and SAT exam day with a live readiness score." },
  { Icon: Users, title: "Real tutors when you want one", body: "Book top-rated tutors near you or online, right from Merit." },
];
const ICONS = ["ap-calculus-bc", "ap-biology", "ap-us-history", "sat-math", "ap-chemistry", "ap-psychology"];

/** Sign-in screens: a bold Merit-blue brand panel beside a chunky form card. */
export function AuthShell({ title, subtitle, children, footer }: { title: ReactNode; subtitle?: ReactNode; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="flex flex-1 items-start justify-center px-4 pb-16 pt-[3vh]">
      <div className="rise grid w-full max-w-5xl overflow-hidden rounded-[32px] bg-surface shadow-[0_8px_0_0_var(--line)] ring-2 ring-line md:grid-cols-[1fr_1.05fr] grid-cols-[minmax(0,1fr)]">
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-[linear-gradient(145deg,#3b82f6,#1d4ed8)] p-10 text-white md:flex lg:p-12">
          <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full border-[44px] border-white/[0.08]" />
          <div aria-hidden className="pointer-events-none absolute -bottom-28 -left-16 size-72 rounded-full border-[40px] border-white/[0.07]" />
          <div className="relative">
            <div className="flex gap-2" aria-hidden>
              {ICONS.map((id, i) => (
                <span key={id} className="rounded-xl bg-white/20 p-0.5 ring-2 ring-white/25" style={{ rotate: `${[-6, 4, -3, 6, -5, 3][i]}deg` }}>
                  <CourseIcon id={id} size={34} />
                </span>
              ))}
            </div>
            <p className="display mt-8 text-[38px] leading-[1.02]">Understand what you&apos;re studying tonight.</p>
          </div>
          <ul className="relative mt-10 space-y-5">
            {VALUE.map(({ Icon, title: t, body }) => (
              <li key={t} className="flex gap-3.5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-inset ring-white/25">
                  <Icon className="size-5" />
                </span>
                <span>
                  <span className="block font-brand text-[16px] font-extrabold">{t}</span>
                  <span className="mt-0.5 block text-[14px] leading-relaxed text-white/80">{body}</span>
                </span>
              </li>
            ))}
          </ul>
        </aside>
        <div className="p-7 sm:p-10 lg:p-12">
          <h1 className="display text-[34px] text-ink sm:text-[40px]">{title}</h1>
          {subtitle ? <p className="mt-2 text-[16px] text-muted">{subtitle}</p> : null}
          <div className="mt-8">{children}</div>
          {footer ? <div className="mt-8">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}
