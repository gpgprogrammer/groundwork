"use client";

import { ArrowLeft, ArrowRight, Check, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { completeOnboarding } from "@/app/actions/learning";
import { inputClass } from "@/components/form";
import { CourseIcon, courseColor } from "@/components/course-icon";
import { Button, cn } from "@/components/ui";

type CourseOption = { id: string; title: string; exam: string; category: string; hue: number; topics: number; videos: number };

type Props = {
  firstName: string;
  initial: { courseIds: string[]; examDate: string | null };
  courses: CourseOption[];
  next: string;
};

function upcomingExamDates() {
  const now = new Date();
  const y = now.getMonth() >= 5 ? now.getFullYear() + 1 : now.getFullYear();
  // SAT dates are typically the first Saturday of these months; shown as approximate.
  const sat = [2, 4, 5, 7, 9, 10, 11].map((m) => {
    const yr = m < now.getMonth() || (m === now.getMonth() && now.getDate() > 7) ? now.getFullYear() + 1 : now.getFullYear();
    const d = new Date(Date.UTC(yr, m, 1));
    while (d.getUTCDay() !== 6) d.setUTCDate(d.getUTCDate() + 1);
    return d;
  });
  sat.sort((a, b) => a.getTime() - b.getTime());
  return { ap: new Date(Date.UTC(y, 4, 5)).toISOString().slice(0, 10), sat: sat.slice(0, 3).map((d) => d.toISOString().slice(0, 10)) };
}

const pretty = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export function OnboardingFlow({ firstName, initial, courses, next }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string[]>(initial.courseIds);
  const [examDate, setExamDate] = useState<string | null>(initial.examDate);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [pending, start] = useTransition();
  const dates = useMemo(() => upcomingExamDates(), []);

  const hasAP = selected.some((id) => courses.find((c) => c.id === id)?.exam === "AP");
  const hasSAT = selected.some((id) => courses.find((c) => c.id === id)?.exam === "SAT");
  const matches = (c: CourseOption) => !filter.trim() || `${c.title} ${c.category}`.toLowerCase().includes(filter.trim().toLowerCase());
  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  // Save and go straight into Merit. Calendar sync is offered later, once they've looked around.
  const finish = () => {
    setError(null);
    start(async () => {
      try {
        await completeOnboarding({ courseIds: selected, examDate });
        router.push(next);
        router.refresh();
      } catch {
        setError("Something went wrong saving that. Please try again.");
      }
    });
  };

  const steps = ["Courses", "Exam date"];

  return (
    <div className="flex flex-1 justify-center px-5 pb-32 pt-[3vh] sm:pb-20">
      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-2" aria-label={`Step ${step + 1} of ${steps.length}`}>
          {steps.map((s, i) => (
            <div key={s} className="flex-1">
              <div className="h-3.5 overflow-hidden rounded-full bg-bg-subtle ring-2 ring-inset ring-line">
                <div className={cn("h-full rounded-full bg-accent transition-[width] duration-500 ease-out", i <= step ? "w-full" : "w-0")} />
              </div>
              <p className={cn("mt-2 text-[12.5px]", i === step ? "font-semibold text-ink" : "text-muted")}>
                <span className="tabular">{i + 1}.</span> {s}
              </p>
            </div>
          ))}
        </div>

        <div key={step} className="rise mt-10">
          {step === 0 ? (
            <>
              <h1 className="display text-[34px] text-ink sm:text-[44px]">Welcome, {firstName}. What are you studying?</h1>
              <p className="mt-2 text-[15px] text-muted">Pick everything you&apos;re preparing for this year. You can change this later.</p>
              <label className="press font-brand mt-6 flex h-12 items-center gap-3 rounded-2xl bg-surface px-4 ring-2 ring-inset ring-line focus-within:ring-2 focus-within:ring-accent font-extrabold [--ledge:var(--line)]">
                <Search className="size-[18px] shrink-0 text-muted" />
                <span className="sr-only">Filter courses</span>
                <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter courses, like “bio” or “SAT”" className="h-full min-w-0 flex-1 bg-transparent text-[16px] text-ink outline-none placeholder:text-muted focus-visible:outline-none" />
              </label>
              <div className="mt-8 space-y-7">
                {[...new Set(courses.map((c) => c.category))].filter((cat) => courses.some((c) => c.category === cat && matches(c))).map((cat) => (
                  <div key={cat}>
                    <p className="mb-2.5 text-[13px] font-semibold text-muted">{cat}</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                {courses.filter((c) => c.category === cat && matches(c)).map((c) => {
                  const on = selected.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      style={{ ["--c" as string]: courseColor(c.id) }}
                      type="button"
                      onClick={() => toggle(c.id)}
                      aria-pressed={on}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl px-3.5 py-3 text-left transition-[background-color,box-shadow,transform] duration-150 active:scale-[0.98]",
                        on ? "press bg-[color-mix(in_oklab,var(--c)_12%,var(--surface))] ring-[3px] ring-[var(--c)] [--ledge:var(--c)]" : "press bg-surface ring-2 ring-line [--ledge:var(--line)] hover:ring-line-strong",
                      )}
                    >
                      <CourseIcon id={c.id} size={36} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] font-semibold leading-snug text-ink">{c.title}</span>
                        <span className="tabular block text-xs text-muted">{c.videos.toLocaleString()} videos</span>
                      </span>
                      <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-full", on ? "bg-[var(--c)] text-white" : "ring-2 ring-line-strong")}>
                        {on ? <Check className="check-pop size-4" strokeWidth={3.5} /> : null}
                      </span>
                    </button>
                  );
                })}
                    </div>
                  </div>
                ))}
                {!courses.some(matches) ? <p className="py-10 text-center text-sm text-muted">No course matches “{filter.trim()}”.</p> : null}
              </div>
            </>
          ) : null}

          {step === 1 ? (
            <>
              <h1 className="display text-[34px] text-ink sm:text-[44px]">{hasAP || hasSAT ? "When is your exam?" : "When is your next big test?"}</h1>
              <p className="mt-2 text-[15px] text-muted">We&apos;ll prioritize what you need to cover before then.</p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {hasAP ? <DateChoice active={examDate === dates.ap} onClick={() => setExamDate(dates.ap)} title="AP exams" note={`Week of ${pretty(dates.ap)}`} /> : null}
                {hasSAT ? dates.sat.map((d) => <DateChoice key={d} active={examDate === d} onClick={() => setExamDate(d)} title="SAT" note={`Around ${pretty(d)}`} />) : null}
                <DateChoice active={examDate === null} onClick={() => setExamDate(null)} title="Not sure yet" note="We'll keep it flexible" />
              </div>
              <label className="mt-6 block">
                <span className="mb-1.5 block text-[13px] font-medium text-ink-2">Or pick a date</span>
                <input type="date" value={examDate ?? ""} onChange={(e) => setExamDate(e.target.value || null)} className={cn(inputClass, "max-w-56")} />
              </label>
            </>
          ) : null}

        </div>

        {error ? <p className="mt-6 text-sm text-danger">{error}</p> : null}

        <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-line bg-bg/90 px-5 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-xl sm:static sm:mt-12 sm:border-t sm:bg-transparent sm:px-0 sm:pt-6 sm:backdrop-blur-none">
          {step > 0 ? (
            <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
              <ArrowLeft className="size-4" /> Back
            </Button>
          ) : (
            <Link href="/" className="text-[13px] text-muted hover:text-ink">
              Skip for now
            </Link>
          )}
          {step === 0 ? (
            <Button onClick={() => setStep(1)} disabled={!selected.length} size="lg">
              {selected.length ? <span className="tabular rounded-full bg-white/20 px-2 py-0.5 text-[12px]">{selected.length}</span> : null}
              Continue <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button onClick={finish} disabled={pending} size="lg">
              {pending ? "Saving…" : "Start learning"} <ArrowRight className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function DateChoice({ active, onClick, title, note }: { active: boolean; onClick: () => void; title: string; note: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn("press rounded-2xl p-5 text-left", active ? "bg-accent-soft ring-[3px] ring-accent [--ledge:var(--accent)]" : "bg-surface ring-2 ring-line [--ledge:var(--line)] hover:ring-line-strong")}
    >
      <span className="block text-[15px] font-semibold text-ink">{title}</span>
      <span className="tabular block text-xs text-muted">{note}</span>
    </button>
  );
}
