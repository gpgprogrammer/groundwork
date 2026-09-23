"use client";

import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { completeOnboarding } from "@/app/actions/learning";
import { inputClass } from "@/components/form";
import { Button, cn } from "@/components/ui";

type CourseOption = { id: string; title: string; exam: string; subject: string; hue: number; topics: number };

type Props = {
  firstName: string;
  initial: { courseIds: string[]; examDate: string | null; dailyMinutes: number | null; goal: string | null };
  courses: CourseOption[];
};

const MINUTES = [
  { value: 15, label: "15 min", note: "A lesson a day" },
  { value: 30, label: "30 min", note: "Steady progress" },
  { value: 45, label: "45 min", note: "Serious prep" },
  { value: 60, label: "60 min", note: "Exam crunch" },
];

function upcomingExamDates() {
  const now = new Date();
  const y = now.getMonth() >= 5 ? now.getFullYear() + 1 : now.getFullYear();
  // AP exams run the first two weeks of May; SAT dates are the first Saturday of these months.
  const sat = [2, 4, 5, 7, 9, 10, 11].map((m) => {
    const yr = m < now.getMonth() || (m === now.getMonth() && now.getDate() > 7) ? now.getFullYear() + 1 : now.getFullYear();
    const d = new Date(Date.UTC(yr, m, 1));
    while (d.getUTCDay() !== 6) d.setUTCDate(d.getUTCDate() + 1);
    return d;
  });
  sat.sort((a, b) => a.getTime() - b.getTime());
  return {
    ap: new Date(Date.UTC(y, 4, 5)).toISOString().slice(0, 10),
    sat: sat.slice(0, 3).map((d) => d.toISOString().slice(0, 10)),
  };
}

const pretty = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export function OnboardingFlow({ firstName, initial, courses }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string[]>(initial.courseIds);
  const [examDate, setExamDate] = useState<string | null>(initial.examDate);
  const [minutes, setMinutes] = useState<number | null>(initial.dailyMinutes ?? 30);
  const [goal, setGoal] = useState(initial.goal ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const dates = useMemo(() => upcomingExamDates(), []);

  const hasAP = selected.some((id) => courses.find((c) => c.id === id)?.exam === "AP");
  const hasSAT = selected.some((id) => courses.find((c) => c.id === id)?.exam === "SAT");

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const finish = () => {
    setError(null);
    startTransition(async () => {
      try {
        await completeOnboarding({ courseIds: selected, examDate, goal: goal.trim() || null, dailyMinutes: minutes });
        router.push("/dashboard");
        router.refresh();
      } catch {
        setError("Something went wrong saving your plan. Please try again.");
      }
    });
  };

  const steps = ["Courses", "Exam date", "Pace"];
  const canContinue = step === 0 ? selected.length > 0 : true;

  return (
    <div className="flex flex-1 justify-center px-5 pb-20 pt-[5vh]">
      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-2" aria-label={`Step ${step + 1} of ${steps.length}`}>
          {steps.map((s, i) => (
            <div key={s} className="flex-1">
              <div className={cn("h-1 rounded-full transition-colors duration-300", i <= step ? "bg-ink" : "bg-line")} />
              <p className={cn("mt-2 text-xs", i === step ? "font-medium text-ink" : "text-faint")}>{s}</p>
            </div>
          ))}
        </div>

        <div key={step} className="rise mt-12">
          {step === 0 ? (
            <>
              <h1 className="headline text-3xl text-ink">Welcome, {firstName}. What are you studying?</h1>
              <p className="mt-2 text-[15px] text-muted">Pick everything you&apos;re preparing for this year. You can change this later.</p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {courses.map((c) => {
                  const on = selected.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggle(c.id)}
                      aria-pressed={on}
                      className={cn(
                        "flex items-center gap-4 rounded-xl border bg-surface p-4 text-left transition-all",
                        on ? "border-ink shadow-soft" : "border-line hover:border-line-strong",
                      )}
                    >
                      <span className="size-2.5 shrink-0 rounded-full" style={{ background: `oklch(0.62 0.12 ${c.hue})` }} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] font-medium text-ink">{c.title}</span>
                        <span className="tabular block text-xs text-muted">
                          {c.exam} · {c.topics} topics
                        </span>
                      </span>
                      <span
                        className={cn(
                          "flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                          on ? "border-ink bg-ink text-bg" : "border-line-strong",
                        )}
                      >
                        {on ? <Check className="size-3" strokeWidth={3} /> : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : null}

          {step === 1 ? (
            <>
              <h1 className="headline text-3xl text-ink">When is your exam?</h1>
              <p className="mt-2 text-[15px] text-muted">We&apos;ll pace your plan so you finish every topic with time left to review.</p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {hasAP ? (
                  <DateChoice active={examDate === dates.ap} onClick={() => setExamDate(dates.ap)} title="AP exams" note={`Week of ${pretty(dates.ap)}`} />
                ) : null}
                {hasSAT
                  ? dates.sat.map((d) => <DateChoice key={d} active={examDate === d} onClick={() => setExamDate(d)} title="SAT" note={`Around ${pretty(d)}`} />)
                  : null}
                <DateChoice active={examDate === null} onClick={() => setExamDate(null)} title="Not sure yet" note="We'll keep it flexible" />
              </div>
              <label className="mt-6 block">
                <span className="mb-1.5 block text-[13px] font-medium text-ink-2">Or pick a date</span>
                <input
                  type="date"
                  value={examDate ?? ""}
                  onChange={(e) => setExamDate(e.target.value || null)}
                  className={cn(inputClass, "max-w-56")}
                />
              </label>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <h1 className="headline text-3xl text-ink">How much time can you give it each day?</h1>
              <p className="mt-2 text-[15px] text-muted">Short, regular sessions beat cramming. Most lessons take under ten minutes.</p>
              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {MINUTES.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setMinutes(m.value)}
                    aria-pressed={minutes === m.value}
                    className={cn(
                      "rounded-xl border bg-surface p-4 text-left transition-all",
                      minutes === m.value ? "border-ink shadow-soft" : "border-line hover:border-line-strong",
                    )}
                  >
                    <span className="tabular block text-lg font-semibold tracking-tight text-ink">{m.label}</span>
                    <span className="block text-xs text-muted">{m.note}</span>
                  </button>
                ))}
              </div>
              <label className="mt-8 block">
                <span className="mb-1.5 flex justify-between text-[13px] font-medium text-ink-2">
                  What would make this year a success? <span className="font-normal text-faint">Optional</span>
                </span>
                <input value={goal} onChange={(e) => setGoal(e.target.value)} maxLength={120} placeholder="A 5 on Calc BC and 1500+ on the SAT" className={inputClass} />
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
            <Link href="/creator/join" className="text-[13px] text-muted hover:text-ink">
              I&apos;m an educator
            </Link>
          )}
          {step < steps.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canContinue}>
              Continue <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button onClick={finish} disabled={pending}>
              {pending ? "Building your plan…" : "Start learning"} <ArrowRight className="size-4" />
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
      className={cn(
        "rounded-xl border bg-surface p-4 text-left transition-all",
        active ? "border-ink shadow-soft" : "border-line hover:border-line-strong",
      )}
    >
      <span className="block text-[15px] font-medium text-ink">{title}</span>
      <span className="tabular block text-xs text-muted">{note}</span>
    </button>
  );
}
