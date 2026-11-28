"use client";

import { ArrowRight, Check, Loader2, X } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { tryQuestions, type TryQuestions as Result } from "@/app/actions/try";
import { playSound } from "@/lib/sound";
import { cn } from "../ui";

/** Three sample diagnostic questions for visitors, before they make an account. */
export function TryQuestions({ courseId }: { courseId: string }) {
  const [result, setResult] = useState<Result | null>(null);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [right, setRight] = useState(0);
  const [pending, start] = useTransition();

  if (!result) {
    return (
      <button
        type="button"
        disabled={!courseId || pending}
        onClick={() => start(async () => setResult(await tryQuestions(courseId)))}
        className="press inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-surface font-brand text-[15px] font-extrabold text-sprint-ink ring-2 ring-inset ring-sprint [--ledge:var(--sprint-press)] disabled:opacity-50"
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : null} Try 3 questions first, no account
      </button>
    );
  }
  if (!result.ok) return <p className="rounded-2xl bg-warn-soft px-4 py-3 text-[14px] text-ink">{result.error}</p>;

  const done = i >= result.questions.length;
  if (done) {
    return (
      <div className="fade rounded-2xl bg-sprint-soft p-4 text-ink">
        <p className="font-brand text-[18px] font-extrabold">
          {right} of {result.questions.length} right in {result.course}.
        </p>
        <p className="mt-1 text-[14px] text-ink-2">The full diagnostic covers every unit and builds your day-by-day plan to test day. It&apos;s free.</p>
        <Link href={`/signup?as=student&next=${encodeURIComponent(`/sprint?course=${courseId}`)}`} className="press mt-3 inline-flex h-11 items-center gap-2 rounded-2xl bg-sprint px-5 font-brand text-[15px] font-extrabold text-white [--ledge:var(--sprint-press)]">
          Take the full diagnostic <ArrowRight className="size-4" />
        </Link>
      </div>
    );
  }
  const q = result.questions[i];
  return (
    <div className="fade rounded-2xl bg-bg-subtle p-4">
      <p className="font-brand text-[12.5px] font-extrabold text-muted">
        Question {i + 1} of {result.questions.length} · {q.topicTitle}
      </p>
      <p className="mt-2 text-[15px] font-semibold leading-relaxed text-ink">{q.stem}</p>
      <ul className="mt-3 space-y-2">
        {q.choices.map((c, k) => {
          const isAnswer = k === q.answer;
          const chosen = picked === k;
          return (
            <li key={k}>
              <button
                type="button"
                disabled={picked !== null}
                data-sound="none"
                onClick={() => {
                  playSound(isAnswer ? "correct" : "wrong");
                  setPicked(k);
                  if (isAnswer) setRight((r) => r + 1);
                }}
                className={cn(
                  "flex w-full items-start gap-2 rounded-xl px-3 py-2.5 text-left text-[14px] ring-2 ring-inset",
                  picked === null ? "bg-surface ring-line hover:ring-sprint" : isAnswer ? "bg-positive-soft ring-positive" : chosen ? "bg-danger-soft ring-danger" : "bg-surface ring-line opacity-70",
                )}
              >
                {picked !== null && isAnswer ? <Check className="mt-0.5 size-4 shrink-0 text-positive" /> : picked !== null && chosen ? <X className="mt-0.5 size-4 shrink-0 text-danger" /> : null}
                <span>{c}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {picked !== null ? (
        <div className="fade mt-3">
          <p className="text-[13.5px] leading-relaxed text-ink-2">{q.explanations[picked]}</p>
          <button
            type="button"
            onClick={() => {
              setI(i + 1);
              setPicked(null);
            }}
            className="press mt-3 inline-flex h-10 items-center gap-1.5 rounded-xl bg-sprint px-4 font-brand text-[14px] font-extrabold text-white [--ledge:var(--sprint-press)]"
          >
            {i + 1 < result.questions.length ? "Next question" : "See how I did"} <ArrowRight className="size-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
