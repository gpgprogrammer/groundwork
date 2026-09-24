"use client";

import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { completeOnboarding } from "@/app/actions/learning";
import { inputClass } from "@/components/form";
import { CourseIcon } from "@/components/course-icon";
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
  const [pending, start] = useTransition();
  const dates = useMemo(() => upcomingExamDates(), []);

  const hasAP = selected.some((id) => courses.find((c) => c.id === id)?.exam === "AP");
  const hasSAT = selected.some((id) => courses.find((c) => c.id === id)?.exam === "SAT");
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
    <div className="flex flex-1 justify-center px-5 pb-20 pt-[4vh]">
      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-2" aria-label={`Step ${step + 1} of ${steps.length}`}>
          {steps.map((s, i) => (
            <div key={s} className="flex-1">
              <div className={cn("h-1 rounded-full transition-colors duration-300", i <= step ? "bg-accent" : "bg-line")} />
              <p className={cn("mt-2 text-xs", i === step ? "font-medium text-ink" : "text-faint")}>{s}</p>
            </div>
          ))}
        </div>

        <div key={step} className="rise mt-10">
          {step === 0 ? (
            <>
              <h1 className="text-[28px] font-bold tracking-tight text-ink">Welcome, {firstName}. What are you studying?</h1>
              <p className="mt-2 text-[15px] text-muted">Pick everything you&apos;re preparing for this year. You can change this later.</p>
              <div className="mt-8 space-y-6">
                {[...new Set(courses.map((c) => c.category))].map((cat) => (
                  <div key={cat}>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{cat}</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                {courses.filter((c) => c.category === cat).map((c) => {
                  const on = selected.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggle(c.id)}
                      aria-pressed={on}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all",
                        on ? "bg-accent-soft ring-2 ring-accent" : "bg-bg-subtle hover:bg-line",
                      )}
                    >
                      <CourseIcon id={c.id} size={36} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] font-medium text-ink">{c.title}</span>
                        <span className="tabular block text-xs text-muted">{c.videos.toLocaleString()} videos</span>
                      </span>
                      <span className={cn("flex size-5 shrink-0 items-center justify-center rounded-full", on ? "bg-accent text-white" : "ring-1 ring-line-strong")}>
                        {on ? <Check className="size-3" strokeWidth={3} /> : null}
                      </span>
                    </button>
                  );
                })}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : null}

          {step === 1 ? (
            <>
              <h1 className="text-[28px] font-bold tracking-tight text-ink">When is your exam?</h1>
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

        {error ? <p className="mt-6 text-sm text-[#c2410c]">{error}</p> : null}

        <div className="mt-12 flex items-center justify-between border-t border-line pt-6">
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
            <Button onClick={() => setStep(1)} disabled={!selected.length}>
              Continue <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button onClick={finish} disabled={pending}>
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
      className={cn("rounded-xl p-4 text-left transition-all", active ? "bg-accent-soft ring-2 ring-accent" : "bg-bg-subtle hover:bg-line")}
    >
      <span className="block text-[15px] font-medium text-ink">{title}</span>
      <span className="tabular block text-xs text-muted">{note}</span>
    </button>
  );
}
