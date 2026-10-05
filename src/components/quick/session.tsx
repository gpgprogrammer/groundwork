"use client";

import { ArrowRight, BookOpenCheck, Check, ExternalLink, Lightbulb, Play, RotateCcw, Sparkles, Trophy, Users, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { finishQuickSession, loadQuickCheck } from "@/app/actions/quick";
import { CHECK_SIZE, PASS_RATIO } from "@/lib/quick";
import type { Question } from "@/lib/types";
import { OpenAskButton } from "../ask/quick-ask";
import { CalendarNudge } from "../calendar-nudge";
import { buttonClass, cn, formatDuration } from "../ui";

type Lesson = { id: string; title: string; thumbnail: string; durationSec: number; channelTitle: string };
type Props = {
  topic: { id: string; title: string; summary: string; keyPoints: string[] };
  course: { id: string; slug: string; title: string; shortTitle: string };
  topicHref: string;
  lessons: Lesson[];
  next: { href: string; title: string } | null;
  alreadyMastered: boolean;
  /** Show the calendar prompt after a pass (students who haven't connected one). */
  calendarNudge?: boolean;
};
type Stage = "learn" | "watch" | "loading" | "check" | "self" | "result";
type Result = { passed: boolean; correct: number; total: number };

const STEPS = [
  { key: "learn", label: "Learn" },
  { key: "watch", label: "Watch" },
  { key: "check", label: "Check" },
] as const;

/** Sticky action bar above the phone tab bar, at the bottom of the viewport on desktop. */
const bottomBar = "sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] z-20 -mx-4 mt-8 border-t-2 px-4 py-4 sm:-mx-6 sm:px-6 md:bottom-0";

/** One topic, start to mastered: key ideas, the top lesson, then a short check. */
export function QuickSession({ topic, course, topicHref, lessons, next, alreadyMastered, calendarNudge = false }: Props) {
  const ideas = topic.keyPoints.length ? topic.keyPoints : [topic.summary];
  const [stage, setStage] = useState<Stage>("learn");
  const [attempt, setAttempt] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [i, setI] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{ questionId: string; choice: number }[]>([]);
  const [known, setKnown] = useState<(boolean | null)[]>(() => ideas.map(() => null));
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [opened, setOpened] = useState(false);
  // Passing re-renders the page with the topic mastered; keep how it stood when the session began.
  const [wasMastered] = useState(alreadyMastered);
  const [pending, start] = useTransition();
  const router = useRouter();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [stage, i]);

  const step = stage === "learn" ? 0 : stage === "watch" ? 1 : 2;
  const progress = stage === "result" ? 1 : stage === "check" ? (2 + (i + (choice !== null ? 1 : 0)) / Math.max(1, questions.length)) / 3 : step / 3;

  const beginCheck = () => {
    setStage("loading");
    setError(null);
    start(async () => {
      try {
        const r = await loadQuickCheck(topic.id, attempt);
        if ("error" in r) return router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
        if ("selfCheck" in r) {
          setKnown(ideas.map(() => null));
          return setStage("self");
        }
        setQuestions(r.questions);
        setI(0);
        setChoice(null);
        setAnswers([]);
        setStage("check");
      } catch {
        setError("Couldn't load the check. Try again in a moment.");
        setStage("watch");
      }
    });
  };

  const submit = (payload: Parameters<typeof finishQuickSession>[1]) =>
    start(async () => {
      try {
        const r = await finishQuickSession(topic.id, payload);
        if ("error" in r) return router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
        setResult(r);
        setStage("result");
      } catch {
        setError("Couldn't save your result. Check your connection and try again.");
      }
    });

  const retry = () => {
    setAttempt((a) => a + 1);
    setResult(null);
    setError(null);
    setStage(lessons.length ? "watch" : "learn");
  };

  return (
    <div>
      {/* Header: exit, steps, progress */}
      <div className="flex items-center gap-3">
        <Link href={topicHref} aria-label={`Leave session and go to ${topic.title}`} className="flex size-10 shrink-0 items-center justify-center rounded-xl text-muted transition-colors hover:bg-bg-subtle hover:text-ink">
          <X className="size-6" strokeWidth={2.75} />
        </Link>
        <div
          className="h-4 flex-1 overflow-hidden rounded-full bg-bg-subtle ring-2 ring-inset ring-line"
          role="progressbar"
          aria-label="Session progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
        >
          <div className="relative h-full rounded-full bg-[linear-gradient(90deg,var(--c),var(--c2))] transition-[width] duration-500 ease-out" style={{ width: `${Math.max(progress > 0 ? 6 : 0, progress * 100)}%` }}>
            <span className="absolute inset-x-2 top-1 h-1 rounded-full bg-white/30" />
          </div>
        </div>
      </div>
      {stage !== "result" ? (
        <ol className="mt-4 flex gap-2" aria-label="Steps">
          {STEPS.map((s, k) => (
            <li
              key={s.key}
              aria-current={k === step ? "step" : undefined}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-brand text-[12.5px] font-extrabold",
                k < step ? "bg-positive-soft text-positive" : k === step ? "bg-[color-mix(in_oklab,var(--c)_14%,var(--surface))] text-ink" : "bg-bg-subtle text-muted",
              )}
            >
              {k < step ? <Check className="size-3.5" strokeWidth={3.5} /> : <span className="tabular">{k + 1}</span>} {s.label}
            </li>
          ))}
        </ol>
      ) : null}

      {stage === "learn" ? (
        <section className="mt-6">
          <h2 className="headline text-[26px] text-ink sm:text-[32px]">The key ideas</h2>
          <p className="mt-2 max-w-2xl text-[16px] leading-relaxed text-ink-2">{topic.summary}</p>
          <ol className="mt-6 space-y-3">
            {ideas.map((k, n) => (
              <li key={k} className="rise flex gap-4 rounded-3xl bg-surface p-4 ring-2 ring-line sm:p-5" style={{ ["--i" as string]: n }}>
                <span className="tabular flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--c),var(--c2))] font-brand text-[17px] font-black text-white">{n + 1}</span>
                <p className="self-center font-brand text-[17px] font-extrabold leading-snug text-ink">{k}</p>
              </li>
            ))}
          </ol>
          <div className={cn(bottomBar, "border-line bg-bg/95 backdrop-blur")}>
            <div className="flex items-center justify-between gap-4">
              <p className="hidden font-brand text-[14.5px] font-extrabold text-muted sm:block">{lessons.length ? "Read them once. You'll see them again in the lesson." : "Read them carefully. The check is next."}</p>
              <button onClick={() => (lessons.length ? setStage("watch") : beginCheck())} disabled={pending} className={buttonClass("primary", "lg", "ml-auto px-6")}>
                {lessons.length ? "Next: watch the lesson" : "Next: the check"} <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {stage === "watch" ? (
        <section className="mt-6">
          <h2 className="headline text-[26px] text-ink sm:text-[32px]">Watch the top lesson</h2>
          <p className="mt-2 max-w-2xl text-[16px] text-ink-2">Ranked first for how well it teaches {topic.title}. It opens in a new tab; come back here when you&apos;re done.</p>
          {error ? (
            <p role="alert" className="mt-4 rounded-2xl bg-danger-soft px-4 py-3 font-brand text-[14.5px] font-extrabold text-danger">
              {error}
            </p>
          ) : null}
          {lessons[0] ? (
            <a
              href={`/go/${lessons[0].id}`}
              target="_blank"
              rel="noopener"
              onClick={() => setOpened(true)}
              className="press group mt-6 block overflow-hidden rounded-3xl bg-surface ring-2 ring-line [--ledge:var(--line)] sm:flex"
            >
              <span className="relative block aspect-video shrink-0 bg-bg-subtle sm:w-[46%]">
                <img src={lessons[0].thumbnail} alt="" referrerPolicy="no-referrer" className="absolute inset-0 size-full object-cover" />
                <span className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/30">
                  <span className="flex size-16 items-center justify-center rounded-full bg-white/95 shadow-lg">
                    <Play className="ml-1 size-7 fill-[var(--c2)] text-[var(--c2)]" />
                  </span>
                </span>
                <span className="tabular absolute bottom-2 right-2 rounded-lg bg-black/75 px-1.5 py-0.5 text-[12px] font-bold text-white">{formatDuration(lessons[0].durationSec)}</span>
              </span>
              <span className="flex min-w-0 flex-col justify-center gap-1.5 p-5">
                <span className="font-brand text-[12.5px] font-extrabold uppercase tracking-wide text-muted">Top lesson</span>
                <span className="font-brand text-[19px] font-extrabold leading-snug text-ink group-hover:underline">{lessons[0].title}</span>
                <span className="text-[14px] text-muted">{lessons[0].channelTitle}</span>
                <span className="mt-1 inline-flex items-center gap-1.5 font-brand text-[14px] font-extrabold text-accent-ink">
                  Open lesson <ExternalLink className="size-4" />
                </span>
              </span>
            </a>
          ) : null}
          {lessons.length > 1 ? (
            <div className="mt-6">
              <p className="font-brand text-[14.5px] font-extrabold text-muted">Prefer a different teacher?</p>
              <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                {lessons.slice(1).map((v) => (
                  <li key={v.id}>
                    <a href={`/go/${v.id}`} target="_blank" rel="noopener" onClick={() => setOpened(true)} className="group flex items-center gap-3 rounded-2xl p-1.5 ring-2 ring-transparent transition-colors hover:bg-bg-subtle hover:ring-line">
                      <span className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-xl bg-bg-subtle">
                        <img src={v.thumbnail} alt="" loading="lazy" referrerPolicy="no-referrer" className="absolute inset-0 size-full object-cover" />
                        <span className="tabular absolute bottom-1 right-1 rounded-md bg-black/75 px-1 text-[10.5px] font-bold text-white">{formatDuration(v.durationSec)}</span>
                      </span>
                      <span className="min-w-0">
                        <span className="line-clamp-2 text-[14px] font-bold leading-snug text-ink group-hover:underline">{v.title}</span>
                        <span className="mt-0.5 block truncate text-[12.5px] text-muted">{v.channelTitle}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className={cn(bottomBar, "border-line bg-bg/95 backdrop-blur")}>
            <div className="flex flex-wrap items-center justify-end gap-3">
              {!opened ? (
                <button onClick={beginCheck} disabled={pending} className={buttonClass("ghost", "lg")}>
                  I already know this
                </button>
              ) : null}
              <button onClick={beginCheck} disabled={pending} className={buttonClass("primary", "lg", "px-6")}>
                {opened ? "I watched it: start the check" : "Start the check"} <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {stage === "loading" ? (
        <section className="mt-8" aria-busy>
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-accent-soft text-accent-ink">
              <Sparkles className="size-6" />
            </span>
            <div>
              <p className="font-brand text-[18px] font-extrabold text-ink">Getting your check ready…</p>
              <p className="text-[14px] text-muted">{CHECK_SIZE} exam-style questions on {topic.title}. The first time a topic is checked can take up to a minute.</p>
            </div>
          </div>
          <div className="mt-8 space-y-3" aria-hidden>
            <div className="skeleton h-6 w-4/5 rounded-xl" />
            <div className="skeleton h-6 w-3/5 rounded-xl" />
            {[0, 1, 2, 3].map((k) => (
              <div key={k} className="skeleton h-16 rounded-2xl" />
            ))}
          </div>
        </section>
      ) : null}

      {stage === "check" && questions[i] ? (
        <QuestionCard
          q={questions[i]}
          n={i}
          total={questions.length}
          choice={choice}
          pending={pending}
          error={error}
          onChoose={(j) => {
            setChoice(j);
            setAnswers((a) => [...a, { questionId: questions[i].id, choice: j }]);
          }}
          onNext={() => {
            if (i + 1 >= questions.length) submit({ kind: "questions", answers });
            else {
              setI(i + 1);
              setChoice(null);
            }
          }}
        />
      ) : null}

      {stage === "self" ? (
        <section className="mt-6">
          <h2 className="headline text-[26px] text-ink sm:text-[32px]">Can you explain each idea?</h2>
          <p className="mt-2 max-w-2xl text-[16px] text-ink-2">Practice questions aren&apos;t available for this topic yet, so check yourself: say each idea out loud in your own words, without looking at notes. Be honest.</p>
          <ul className="mt-6 space-y-3">
            {ideas.map((k, n) => (
              <li key={k} className="rounded-3xl bg-surface p-4 ring-2 ring-line sm:p-5">
                <p className="font-brand text-[17px] font-extrabold leading-snug text-ink">{k}</p>
                <div className="mt-3 grid grid-cols-2 gap-2" role="radiogroup" aria-label={`Can you explain: ${k}`}>
                  {[
                    { v: true, label: "I can explain it" },
                    { v: false, label: "Not yet" },
                  ].map((o) => {
                    const on = known[n] === o.v;
                    return (
                      <button
                        key={o.label}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => setKnown((s) => s.map((x, m) => (m === n ? o.v : x)))}
                        className={cn(
                          "press-sm h-12 rounded-2xl px-2 font-brand text-[14.5px] font-extrabold",
                          on && o.v ? "bg-positive text-white [--ledge:var(--positive-press)]" : on ? "bg-ink text-bg [--ledge:rgb(0_0_0/0.3)]" : "bg-surface text-ink-2 ring-2 ring-inset ring-line [--ledge:var(--line)] hover:bg-bg-subtle",
                        )}
                      >
                        {o.label}
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
                {known.filter((x) => x !== null).length} of {ideas.length} answered
              </p>
              <button disabled={known.some((x) => x === null) || pending} onClick={() => submit({ kind: "self", known: known.map(Boolean) })} className={buttonClass("primary", "lg", "px-6")}>
                Finish <ArrowRight className="size-4" />
              </button>
            </div>
            {error ? (
              <p role="alert" className="mt-2 font-brand text-[14px] font-extrabold text-danger">
                {error}
              </p>
            ) : null}
          </div>
        </section>
      ) : null}

      {stage === "result" && result ? (
        <Outcome result={result} topic={topic} course={course} topicHref={topicHref} next={next} alreadyMastered={wasMastered} onRetry={retry} calendarNudge={calendarNudge} />
      ) : null}
    </div>
  );
}

function QuestionCard({
  q,
  n,
  total,
  choice,
  pending,
  error,
  onChoose,
  onNext,
}: {
  q: Question;
  n: number;
  total: number;
  choice: number | null;
  pending: boolean;
  error: string | null;
  onChoose: (j: number) => void;
  onNext: () => void;
}) {
  const answered = choice !== null;
  const right = answered && choice === q.answer;
  const last = n + 1 >= total;
  return (
    <section className="mt-6">
      <p className="flex flex-wrap items-center gap-2">
        <span className="tabular rounded-full bg-accent-soft px-3 py-1 font-brand text-[12.5px] font-extrabold text-accent-ink">
          Question {n + 1} of {total}
        </span>
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
                onClick={() => onChoose(j)}
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
          <button disabled={!answered || pending} onClick={onNext} className={buttonClass(!answered ? "secondary" : right ? "positive" : "primary", "lg", "shrink-0 px-6")}>
            {last ? "See my result" : "Next question"} <ArrowRight className="size-4" />
          </button>
        </div>
        {error ? (
          <p role="alert" className="mt-2 font-brand text-[14px] font-extrabold text-danger">
            {error}
          </p>
        ) : null}
      </div>
    </section>
  );
}

function Outcome({
  result,
  topic,
  course,
  topicHref,
  next,
  alreadyMastered,
  onRetry,
  calendarNudge,
}: {
  result: Result;
  topic: Props["topic"];
  course: Props["course"];
  topicHref: string;
  next: Props["next"];
  alreadyMastered: boolean;
  onRetry: () => void;
  calendarNudge: boolean;
}) {
  if (result.passed) {
    return (
      <section className="mt-6 text-center">
        <div className="relative mx-auto mt-4 flex size-40 items-center justify-center">
          <span aria-hidden className="pop absolute inset-0 rounded-full bg-positive-soft" />
          <span aria-hidden className="pop absolute -inset-4 rounded-full border-4 border-positive/15" style={{ animationDelay: "120ms" }} />
          {[0, 60, 120, 180, 240, 300].map((deg, k) => (
            <span key={deg} aria-hidden className="absolute" style={{ transform: `rotate(${deg}deg) translateY(-92px)` }}>
              <span className="check-pop block size-3 rounded-full" style={{ background: ["var(--positive)", "var(--c)", "var(--accent)"][k % 3], animationDelay: `${200 + k * 40}ms` }} />
            </span>
          ))}
          <span className="check-pop press relative flex size-24 items-center justify-center rounded-full bg-positive text-white [--ledge:var(--positive-press)]" style={{ animationDelay: "80ms" }}>
            <Trophy className="size-11" strokeWidth={2.25} />
          </span>
        </div>
        <p className="rise mt-6 font-brand text-[14px] font-extrabold uppercase tracking-wide text-positive">{alreadyMastered ? "Still mastered" : "Topic mastered"}</p>
        <h2 className="rise display mt-2 text-[36px] leading-tight text-ink sm:text-[44px]" style={{ ["--i" as string]: 1 }}>
          {topic.title}
        </h2>
        <p className="rise mx-auto mt-3 max-w-md text-[16px] text-ink-2" style={{ ["--i" as string]: 2 }}>
          You got <span className="tabular font-bold text-ink">{result.correct} of {result.total}</span>. It now counts as understood in {course.shortTitle}, on your course path and in Progress.
        </p>
        <div className="rise mx-auto mt-8 flex max-w-md flex-col gap-3" style={{ ["--i" as string]: 3 }}>
          {next ? (
            <Link href={next.href} className={buttonClass("primary", "lg", "w-full")}>
              Next topic: {next.title} <ArrowRight className="size-4" />
            </Link>
          ) : null}
          <Link href={`/courses/${course.slug}`} className={buttonClass(next ? "outline" : "primary", "lg", "w-full")}>
            Back to {course.shortTitle}
          </Link>
        </div>
        {calendarNudge ? (
          <CalendarNudge
            variant="strip"
            signedIn
            title="Know what's on your next quiz"
            body={`Connect your class calendar and Merit lines up the ${course.shortTitle} lessons for every quiz and test.`}
            className="rise mx-auto mt-8 max-w-xl text-left"
          />
        ) : null}
      </section>
    );
  }
  return (
    <section className="mt-6 text-center">
      <span className="pop mx-auto mt-4 flex size-24 items-center justify-center rounded-full bg-warn-soft text-warn">
        <Lightbulb className="size-11" strokeWidth={2.25} />
      </span>
      <p className="rise mt-6 font-brand text-[14px] font-extrabold uppercase tracking-wide text-warn">Almost there</p>
      <h2 className="rise display mt-2 text-[36px] leading-tight text-ink sm:text-[44px]" style={{ ["--i" as string]: 1 }}>
        {result.correct} of {result.total}
      </h2>
      <p className="rise mx-auto mt-3 max-w-md text-[16px] text-ink-2" style={{ ["--i" as string]: 2 }}>
        Mastering a topic takes {Math.ceil(result.total * PASS_RATIO)} of {result.total}. Rewatch the lesson or try a different teacher, then take a fresh check.
      </p>
      <div className="rise mx-auto mt-8 flex max-w-md flex-col gap-3" style={{ ["--i" as string]: 3 }}>
        <button onClick={onRetry} className={buttonClass("primary", "lg", "w-full")}>
          <RotateCcw className="size-4" /> Review and try again
        </button>
        <div className="grid grid-cols-2 gap-3">
          <OpenAskButton className={buttonClass("outline", "lg", "w-full")}>
            <Sparkles className="size-4" /> Ask Merit AI
          </OpenAskButton>
          <Link href={`/tutors?course=${course.id}`} className={buttonClass("outline", "lg", "w-full")}>
            <Users className="size-4" /> Find a tutor
          </Link>
        </div>
        <Link href={topicHref} className="mt-1 inline-flex items-center justify-center gap-1.5 font-brand text-[14.5px] font-extrabold text-muted hover:text-ink">
          <BookOpenCheck className="size-4" /> All lessons for this topic
        </Link>
      </div>
    </section>
  );
}
