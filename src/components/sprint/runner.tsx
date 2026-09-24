"use client";

import { ArrowRight, Check, Loader2, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { finishSession, loadQuestions, recordAnswer, saveConfidence, type Mode } from "@/app/actions/sprint";
import type { Question } from "@/lib/types";
import { cn } from "../ui";

type Unit = { id: string; order: number; title: string };

const CONF = ["Lost", "Shaky", "Okay", "Solid", "Nailed it"];

export function SprintRunner({
  sprintId,
  mode,
  topicIds = [],
  taskId = null,
  units = [],
  topicTitles,
  initialConfidence = {},
}: {
  sprintId: string;
  mode: Mode;
  topicIds?: string[];
  taskId?: string | null;
  units?: Unit[];
  topicTitles: Record<string, string>;
  initialConfidence?: Record<string, number>;
}) {
  const router = useRouter();
  const [stage, setStage] = useState<"confidence" | "loading" | "questions" | "done" | "unavailable" | "locked">(mode === "diagnostic" ? "confidence" : "loading");
  const [confidence, setConfidence] = useState<Record<string, number>>(initialConfidence);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [i, setI] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [results, setResults] = useState<{ topicId: string; correct: boolean }[]>([]);
  const [pending, start] = useTransition();

  const fetchQuestions = () =>
    start(async () => {
      const r = await loadQuestions(sprintId, mode, topicIds);
      if (r.locked) return setStage("locked");
      if (!r.questions.length) return setStage("unavailable");
      setQuestions(r.questions);
      setStage("questions");
    });
  const load = () => {
    setStage("loading");
    fetchQuestions();
  };

  useEffect(() => {
    if (mode !== "diagnostic") fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (stage === "confidence") {
    const ready = units.every((u) => confidence[u.id]);
    return (
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-ink">First, how do you feel about each unit?</h2>
        <p className="mt-1 text-[15px] text-muted">Be honest. This plus your answers sets your starting plan.</p>
        <ul className="mt-6 divide-y divide-line rounded-2xl ring-1 ring-line">
          {units.map((u) => (
            <li key={u.id} className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center">
              <p className="min-w-0 flex-1 text-[14.5px] font-medium text-ink">
                <span className="tabular mr-2 text-muted">{u.order}</span>
                {u.title}
              </p>
              <div className="flex gap-1" role="radiogroup" aria-label={`Confidence in ${u.title}`}>
                {CONF.map((c, j) => (
                  <button
                    key={c}
                    role="radio"
                    aria-checked={confidence[u.id] === j + 1}
                    onClick={() => setConfidence((s) => ({ ...s, [u.id]: j + 1 }))}
                    className={cn(
                      "h-8 rounded-full px-2.5 text-[12px] font-medium ring-1 transition-colors",
                      confidence[u.id] === j + 1 ? "bg-accent text-white ring-accent" : "text-ink-2 ring-line-strong hover:bg-bg-subtle",
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="text-[13px] text-muted">{units.filter((u) => confidence[u.id]).length} of {units.length} rated</p>
          <button
            disabled={!ready || pending}
            onClick={() =>
              start(async () => {
                await saveConfidence(sprintId, confidence);
                load();
              })
            }
            className="inline-flex h-11 items-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-white disabled:opacity-40"
          >
            Start the questions <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    );
  }

  if (stage === "loading") {
    return (
      <div className="flex flex-col items-center py-24 text-center">
        <Loader2 className="size-8 animate-spin text-accent" />
        <p className="mt-4 font-semibold text-ink">Writing your questions…</p>
        <p className="mt-1 max-w-sm text-sm text-muted">Exam-style questions for each topic, with an explanation for every answer. The first time takes up to a minute.</p>
      </div>
    );
  }

  if (stage === "locked" || stage === "unavailable") {
    return (
      <div className="rounded-2xl bg-bg-subtle p-8 text-center">
        <Sparkles className="mx-auto size-8 text-accent" />
        <p className="mt-3 font-semibold text-ink">{stage === "locked" ? "Unlock your Sprint to practice." : "Practice questions are almost ready."}</p>
        <p className="mt-1 text-sm text-muted">
          {stage === "locked" ? "Your diagnostic is free. Daily practice, checkpoints, and cram sheets come with the Sprint." : "Merit AI is being switched on for question writing. Your ratings are saved, so your plan still works; come back soon for questions."}
        </p>
        <Link href={`/sprint/${sprintId}`} className="mt-5 inline-flex h-10 items-center rounded-full bg-ink px-4 text-sm font-semibold text-bg">
          Back to my Sprint
        </Link>
      </div>
    );
  }

  if (stage === "done") {
    const correct = results.filter((r) => r.correct).length;
    const byTopic = new Map<string, { c: number; n: number }>();
    for (const r of results) {
      const x = byTopic.get(r.topicId) ?? { c: 0, n: 0 };
      x.n++;
      if (r.correct) x.c++;
      byTopic.set(r.topicId, x);
    }
    const missed = [...byTopic.entries()].filter(([, x]) => x.c < x.n);
    return (
      <div className="text-center">
        <p className="text-[13px] font-semibold uppercase tracking-wide text-muted">{mode === "diagnostic" ? "Diagnostic complete" : "Session complete"}</p>
        <p className="tabular mt-3 text-6xl font-extrabold tracking-tight text-ink">
          {correct}/{results.length}
        </p>
        <p className="mt-2 text-[15px] text-ink-2">
          {correct === results.length ? "Perfect. Those topics are locked in." : correct / Math.max(1, results.length) >= 0.7 ? "Strong work. Your plan will keep the misses coming back." : "Every miss just told your plan exactly where to focus."}
        </p>
        {missed.length ? (
          <div className="mx-auto mt-6 max-w-md rounded-2xl p-4 text-left ring-1 ring-line">
            <p className="text-[13px] font-semibold text-ink">Coming back in your plan</p>
            <ul className="mt-2 space-y-1 text-[14px] text-ink-2">
              {missed.map(([t]) => (
                <li key={t}>• {topicTitles[t] ?? "A topic"}</li>
              ))}
            </ul>
          </div>
        ) : null}
        <button
          onClick={() =>
            start(async () => {
              await finishSession(sprintId, taskId);
              router.push(`/sprint/${sprintId}${mode === "diagnostic" ? "?diagnostic=done" : ""}`);
            })
          }
          disabled={pending}
          className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-accent px-6 text-[15px] font-semibold text-white"
        >
          {mode === "diagnostic" ? "See my readiness" : "Back to my Sprint"} <ArrowRight className="size-4" />
        </button>
      </div>
    );
  }

  const q = questions[i];
  const answered = choice !== null;
  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${((i + (answered ? 1 : 0)) / questions.length) * 100}%` }} />
        </div>
        <span className="tabular text-[13px] text-muted">
          {i + 1} / {questions.length}
        </span>
      </div>
      <p className="mt-6 text-[12.5px] font-medium text-muted">
        {topicTitles[q.topicId] ?? ""} · {q.difficulty}
      </p>
      <p className="mt-2 whitespace-pre-wrap text-[18px] font-medium leading-relaxed text-ink">{q.stem}</p>
      <div className="mt-6 grid gap-2">
        {q.choices.map((c, j) => (
          <div key={j}>
            <button
              disabled={answered || pending}
              onClick={() => {
                setChoice(j);
                start(async () => {
                  const r = await recordAnswer(sprintId, q.id, j, mode === "diagnostic" ? "diagnostic" : mode === "checkpoint" ? "checkpoint" : "practice");
                  setResults((rs) => [...rs, { topicId: q.topicId, correct: r.correct }]);
                });
              }}
              className={cn(
                "flex w-full items-start gap-3 rounded-xl px-4 py-3 text-left text-[15px] ring-1 transition-colors",
                !answered && "ring-line-strong hover:bg-bg-subtle",
                answered && j === q.answer && "bg-positive-soft ring-2 ring-positive",
                answered && j === choice && j !== q.answer && "bg-[#fde8e8] ring-2 ring-[#e5484d] dark:bg-[#3a1215]",
                answered && j !== choice && j !== q.answer && "ring-line",
              )}
            >
              <span className="tabular mt-px font-semibold text-muted">{String.fromCharCode(65 + j)}</span>
              <span className="flex-1 whitespace-pre-wrap text-ink">{c}</span>
              {answered && j === q.answer ? <Check className="size-5 shrink-0 text-positive" /> : answered && j === choice ? <X className="size-5 shrink-0 text-[#e5484d]" /> : null}
            </button>
            {answered && (j === q.answer || j === choice) ? <p className="px-4 pb-1 pt-2 text-[13.5px] leading-relaxed text-ink-2">{q.explanations[j]}</p> : null}
          </div>
        ))}
      </div>
      {answered ? (
        <details className="mt-3 text-[13px] text-muted">
          <summary className="cursor-pointer">Why the other choices are wrong</summary>
          <ul className="mt-2 space-y-1.5">
            {q.choices.map((_, j) =>
              j !== q.answer && j !== choice ? (
                <li key={j}>
                  <span className="font-semibold">{String.fromCharCode(65 + j)}.</span> {q.explanations[j]}
                </li>
              ) : null,
            )}
          </ul>
        </details>
      ) : null}
      <div className="mt-8 flex justify-end">
        <button
          disabled={!answered || pending}
          onClick={() => {
            if (i + 1 >= questions.length) setStage("done");
            else {
              setI(i + 1);
              setChoice(null);
            }
          }}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-bg disabled:opacity-30"
        >
          {i + 1 >= questions.length ? "Finish" : "Next question"} <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
