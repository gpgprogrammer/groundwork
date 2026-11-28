"use client";

import { ArrowRight, Check, Lock, Sparkles, Trophy, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { finishSession, loadQuestions, recordAnswer, saveConfidence, type Mode } from "@/app/actions/sprint";
import type { Question } from "@/lib/types";
import { playSound } from "@/lib/sound";
import { buttonClass, cn } from "../ui";

type Unit = { id: string; order: number; title: string };

const CONF = ["Lost", "Shaky", "Okay", "Solid", "Nailed it"];

/** Sticky action bar that sits above the phone tab bar and at the bottom of the viewport on desktop. */
const bottomBar = "sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] z-20 -mx-4 mt-8 border-t-2 px-4 py-4 sm:-mx-6 sm:px-6 md:bottom-0";

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

  // Each new screen (and each new question) starts at the top.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [stage, i]);

  useEffect(() => {
    if (mode !== "diagnostic") fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (stage === "confidence") {
    const rated = units.filter((u) => confidence[u.id]).length;
    const ready = units.every((u) => confidence[u.id]);
    return (
      <div>
        <div className="flex items-center gap-3">
          <ExitLink sprintId={sprintId} />
          <Track value={rated / Math.max(1, units.length)} />
        </div>
        <span className="mt-8 inline-flex items-center gap-1.5 rounded-full bg-sprint-soft px-3 py-1 font-brand text-[13px] font-extrabold text-sprint-ink">Step 1 of 2</span>
        <h2 className="headline mt-3 text-[28px] text-ink sm:text-[34px]">First, how do you feel about each unit?</h2>
        <p className="mt-2 text-[16px] text-muted">Be honest. This plus your answers sets your starting plan.</p>
        <ul className="mt-6 space-y-3">
          {units.map((u, k) => (
            <li key={u.id} className="rise rounded-3xl bg-surface p-4 ring-2 ring-line sm:p-5" style={{ ["--i" as string]: Math.min(k, 8) }}>
              <p className="flex items-center gap-3 font-brand text-[16px] font-extrabold leading-snug text-ink">
                <span className={cn("tabular flex size-9 shrink-0 items-center justify-center rounded-xl text-[15px] font-black", confidence[u.id] ? "bg-sprint text-white" : "bg-bg-subtle text-muted")}>
                  {confidence[u.id] ? <Check className="check-pop size-5" strokeWidth={3.5} /> : u.order}
                </span>
                {u.title}
              </p>
              <div className="mt-3 grid grid-cols-5 gap-1.5 sm:gap-2" role="radiogroup" aria-label={`Confidence in ${u.title}`}>
                {CONF.map((c, j) => {
                  const on = confidence[u.id] === j + 1;
                  return (
                    <button
                      key={c}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => setConfidence((s) => ({ ...s, [u.id]: j + 1 }))}
                      className={cn(
                        "press-sm font-brand h-12 min-w-0 rounded-2xl px-1 text-[12.5px] font-extrabold leading-tight sm:text-[14px]",
                        on ? "bg-sprint text-white [--ledge:var(--sprint-press)]" : "bg-surface text-ink-2 ring-2 ring-inset ring-line [--ledge:var(--line)] hover:bg-bg-subtle",
                      )}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>
        <div className={cn(bottomBar, "border-line bg-bg/95 backdrop-blur")}>
          <div className="flex items-center justify-between gap-4">
            <p className="tabular font-brand text-[14.5px] font-extrabold text-muted">
              {rated} of {units.length} rated
            </p>
            <button
              disabled={!ready || pending}
              onClick={() =>
                start(async () => {
                  await saveConfidence(sprintId, confidence);
                  load();
                })
              }
              className={buttonClass("sprint", "lg", "px-6")}
            >
              Start the questions <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === "loading") {
    return (
      <div aria-busy>
        <div className="flex items-center gap-3">
          <ExitLink sprintId={sprintId} />
          <Track value={0} />
        </div>
        <div className="mt-10 flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-sprint-soft text-sprint-ink">
            <Sparkles className="size-6" />
          </span>
          <div>
            <p className="font-brand text-[18px] font-extrabold text-ink">Writing your questions…</p>
            <p className="text-[14px] text-muted">Exam-style questions for each topic, with an explanation for every answer. The first time takes up to a minute.</p>
          </div>
        </div>
        <div className="mt-8 space-y-3" aria-hidden>
          <div className="skeleton h-6 w-4/5 rounded-xl" />
          <div className="skeleton h-6 w-3/5 rounded-xl" />
          {[0, 1, 2, 3].map((k) => (
            <div key={k} className="skeleton h-16 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (stage === "locked" || stage === "unavailable") {
    return (
      <div className="rise flex flex-col items-center rounded-3xl bg-surface p-8 text-center ring-2 ring-line sm:p-12">
        <span className="press-sm flex size-16 items-center justify-center rounded-2xl bg-sprint text-white [--ledge:var(--sprint-press)]">
          {stage === "locked" ? <Lock className="size-8" /> : <Sparkles className="size-8" />}
        </span>
        <p className="headline mt-5 text-[24px] text-ink">{stage === "locked" ? "Unlock your Sprint to practice." : "Practice questions are almost ready."}</p>
        <p className="mt-2 max-w-md text-[15px] leading-relaxed text-muted">
          {stage === "locked" ? "Your diagnostic is free. Daily practice, checkpoints, and cram sheets come with the Sprint." : "Merit AI isn't writing questions right now. Your ratings are saved, so your plan still works; questions will appear here once it's back."}
        </p>
        <Link href={`/sprint/${sprintId}`} className={buttonClass("sprint", "lg", "mt-7")}>
          Back to my Sprint <ArrowRight className="size-4" />
        </Link>
      </div>
    );
  }

  if (stage === "done") {
    const correct = results.filter((r) => r.correct).length;
    const pct = Math.round((correct / Math.max(1, results.length)) * 100);
    const byTopic = new Map<string, { c: number; n: number }>();
    for (const r of results) {
      const x = byTopic.get(r.topicId) ?? { c: 0, n: 0 };
      x.n++;
      if (r.correct) x.c++;
      byTopic.set(r.topicId, x);
    }
    const missed = [...byTopic.entries()].filter(([, x]) => x.c < x.n);
    const great = pct >= 70;
    return (
      <div className="text-center">
        <div className="relative mx-auto mt-4 flex size-40 items-center justify-center">
          {/* A tasteful burst: rings pop out once around the trophy */}
          <span aria-hidden className="pop absolute inset-0 rounded-full bg-sprint-soft" />
          <span aria-hidden className="pop absolute -inset-4 rounded-full border-4 border-sprint/15" style={{ animationDelay: "120ms" }} />
          {[0, 60, 120, 180, 240, 300].map((deg, k) => (
            <span key={deg} aria-hidden className="absolute" style={{ transform: `rotate(${deg}deg) translateY(-92px)` }}>
              <span
                className="check-pop block size-3 rounded-full"
                style={{ background: ["var(--sprint)", "var(--accent)", "var(--positive)"][k % 3], animationDelay: `${200 + k * 40}ms` }}
              />
            </span>
          ))}
          <span className="check-pop press relative flex size-24 items-center justify-center rounded-full bg-sprint text-white [--ledge:var(--sprint-press)]" style={{ animationDelay: "80ms" }}>
            <Trophy className="size-11" strokeWidth={2.25} />
          </span>
        </div>
        <p className="rise mt-6 font-brand text-[14px] font-extrabold uppercase tracking-wide text-sprint-ink">{mode === "diagnostic" ? "Diagnostic complete" : "Session complete"}</p>
        <p className="rise tabular display mt-2 text-[80px] leading-none text-ink sm:text-[96px]" style={{ ["--i" as string]: 1 }}>
          {correct}/{results.length}
        </p>
        <p className="rise mx-auto mt-3 max-w-md text-[16px] text-ink-2" style={{ ["--i" as string]: 2 }}>
          {correct === results.length ? "Perfect. Those topics are locked in." : great ? "Strong work. Your plan will keep the misses coming back." : "Every miss just told your plan exactly where to focus."}
        </p>
        <div className="rise mx-auto mt-7 grid max-w-md grid-cols-3 gap-3" style={{ ["--i" as string]: 3 }}>
          {[
            { v: `${pct}%`, l: "accuracy", c: "bg-sprint-soft text-sprint-ink" },
            { v: correct, l: "correct", c: "bg-positive-soft text-positive" },
            { v: results.length - correct, l: "to review", c: "bg-bg-subtle text-ink" },
          ].map((s) => (
            <div key={s.l} className={cn("rounded-3xl px-2 py-4", s.c)}>
              <p className="tabular font-brand text-[28px] font-black leading-none">{s.v}</p>
              <p className="mt-1 font-brand text-[12.5px] font-extrabold">{s.l}</p>
            </div>
          ))}
        </div>
        {missed.length ? (
          <div className="rise mx-auto mt-5 max-w-md rounded-3xl bg-surface p-5 text-left ring-2 ring-line" style={{ ["--i" as string]: 4 }}>
            <p className="font-brand text-[15px] font-extrabold text-ink">Coming back in your plan</p>
            <ul className="mt-3 space-y-2">
              {missed.map(([t]) => (
                <li key={t} className="flex items-center gap-2.5 text-[14.5px] text-ink-2">
                  <span className="size-2.5 shrink-0 rounded-full bg-sprint" />
                  {topicTitles[t] ?? "A topic"}
                </li>
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
          className={buttonClass("sprint", "lg", "rise mt-8 w-full max-w-md")}
          style={{ ["--i" as string]: 5 }}
        >
          {mode === "diagnostic" ? "See my readiness" : "Back to my Sprint"} <ArrowRight className="size-4" />
        </button>
      </div>
    );
  }

  const q = questions[i];
  const answered = choice !== null;
  const right = answered && choice === q.answer;
  const last = i + 1 >= questions.length;
  return (
    <div>
      <div className="flex items-center gap-3">
        <ExitLink sprintId={sprintId} />
        <Track value={(i + (answered ? 1 : 0)) / questions.length} max={questions.length} now={i + (answered ? 1 : 0)} />
        <span className="tabular shrink-0 font-brand text-[14px] font-extrabold text-muted">
          {i + 1}/{questions.length}
        </span>
      </div>
      <p className="mt-8 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-sprint-soft px-3 py-1 font-brand text-[12.5px] font-extrabold text-sprint-ink">{topicTitles[q.topicId] ?? "Question"}</span>
        <span className="rounded-full bg-bg-subtle px-3 py-1 font-brand text-[12.5px] font-extrabold capitalize text-muted">{q.difficulty}</span>
      </p>
      <p key={q.id} className="fade mt-4 whitespace-pre-wrap font-brand text-[21px] font-extrabold leading-snug text-ink sm:text-[24px]">
        {q.stem}
      </p>
      <div className="mt-7 grid gap-3">
        {q.choices.map((c, j) => {
          const isAnswer = answered && j === q.answer;
          const isWrong = answered && j === choice && j !== q.answer;
          return (
            <div key={`${q.id}-${j}`}>
              <button
                disabled={answered || pending}
                data-sound="none"
                onClick={() => {
                  playSound(j === q.answer ? "correct" : "wrong");
                  setChoice(j);
                  start(async () => {
                    const r = await recordAnswer(sprintId, q.id, j, mode === "diagnostic" ? "diagnostic" : mode === "checkpoint" ? "checkpoint" : "practice");
                    setResults((rs) => [...rs, { topicId: q.topicId, correct: r.correct }]);
                  });
                }}
                className={cn(
                  "press flex w-full items-center gap-3.5 rounded-2xl px-4 py-3.5 text-left text-[16px] ring-2 ring-inset",
                  !answered && "bg-surface ring-line [--ledge:var(--line)] hover:bg-bg-subtle hover:ring-line-strong",
                  isAnswer && "bg-positive-soft ring-positive [--ledge:var(--positive-press)]",
                  isWrong && "bg-danger-soft ring-danger [--ledge:color-mix(in_oklab,var(--danger)_70%,black)]",
                  answered && !isAnswer && !isWrong && "bg-surface opacity-60 ring-line [--ledge:var(--line)]",
                )}
              >
                <span
                  className={cn(
                    "tabular flex size-9 shrink-0 items-center justify-center rounded-xl font-brand text-[15px] font-black",
                    isAnswer ? "bg-positive text-bg" : isWrong ? "bg-danger text-bg" : "bg-bg-subtle text-ink-2 ring-2 ring-inset ring-line",
                  )}
                >
                  {isAnswer ? <Check className="check-pop size-5" strokeWidth={3.5} /> : isWrong ? <X className="check-pop size-5" strokeWidth={3.5} /> : String.fromCharCode(65 + j)}
                </span>
                <span className="flex-1 whitespace-pre-wrap font-semibold text-ink">{c}</span>
              </button>
              {answered && (j === q.answer || j === choice) ? <p className="fade px-4 pb-1 pt-2.5 text-[14.5px] leading-relaxed text-ink-2">{q.explanations[j]}</p> : null}
            </div>
          );
        })}
      </div>
      {answered ? (
        <details className="mt-4 rounded-2xl bg-bg-subtle px-4 py-3 text-[14px] text-ink-2 [&_summary::-webkit-details-marker]:hidden">
          <summary className="cursor-pointer list-none font-brand font-extrabold text-ink">Why the other choices are wrong</summary>
          <ul className="mt-2 space-y-1.5">
            {q.choices.map((_, j) =>
              j !== q.answer && j !== choice ? (
                <li key={j}>
                  <span className="font-bold">{String.fromCharCode(65 + j)}.</span> {q.explanations[j]}
                </li>
              ) : null,
            )}
          </ul>
        </details>
      ) : null}
      <div className={cn(bottomBar, "transition-colors duration-200", !answered ? "border-line bg-bg/95 backdrop-blur" : right ? "border-positive/30 bg-positive-soft" : "border-danger/30 bg-danger-soft")}>
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0" aria-live="polite">
            {answered ? (
              <p className={cn("pop flex items-center gap-2.5 font-brand text-[18px] font-black", right ? "text-positive" : "text-danger")}>
                <span className={cn("check-pop flex size-9 shrink-0 items-center justify-center rounded-full text-bg", right ? "bg-positive" : "bg-danger")}>
                  {right ? <Check className="size-5" strokeWidth={3.5} /> : <X className="size-5" strokeWidth={3.5} />}
                </span>
                {right ? "Nice!" : "Not quite"}
              </p>
            ) : (
              <p className="font-brand text-[14.5px] font-extrabold text-muted">Pick an answer</p>
            )}
          </div>
          <button
            disabled={!answered || pending}
            onClick={() => {
              if (last) {
                const got = results.filter((r) => r.correct).length;
                playSound(results.length && got / results.length >= 0.7 ? "complete" : "finish");
                setStage("done");
              }
              else {
                setI(i + 1);
                setChoice(null);
              }
            }}
            className={buttonClass(!answered ? "secondary" : right ? "positive" : "sprint", "lg", "shrink-0 px-6")}
          >
            {last ? "Finish" : "Next question"} <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ExitLink({ sprintId }: { sprintId: string }) {
  return (
    <Link href={`/sprint/${sprintId}`} aria-label="Back to my Sprint" className="flex size-10 shrink-0 items-center justify-center rounded-xl text-muted transition-colors hover:bg-bg-subtle hover:text-ink">
      <X className="size-6" strokeWidth={2.75} />
    </Link>
  );
}

/** The thick, rounded progress track. */
function Track({ value, max, now }: { value: number; max?: number; now?: number }) {
  return (
    <div
      className="h-4 flex-1 overflow-hidden rounded-full bg-bg-subtle ring-2 ring-inset ring-line"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max ?? 100}
      aria-valuenow={now ?? Math.round(value * 100)}
    >
      <div className="relative h-full rounded-full bg-sprint transition-[width] duration-500 ease-out" style={{ width: `${Math.max(value > 0 ? 6 : 0, Math.min(100, value * 100))}%` }}>
        <span className="absolute inset-x-2 top-1 h-1 rounded-full bg-white/30" />
      </div>
    </div>
  );
}
