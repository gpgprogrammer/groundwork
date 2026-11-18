"use client";

import { ArrowRight, Check, Flame, Lightbulb, PlayCircle, RotateCcw, Timer, Trophy, Users, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { recordPractice } from "@/app/actions/practice";
import { generateForTopic, type GeneratedQuestion } from "@/lib/mathgen";
import { buttonClass, cn } from "../ui";

type TopicRef = { id: string; title: string; href: string };
type Answer = { q: GeneratedQuestion; choice: number; hinted: boolean; seconds: number };

const ROUND = 10;
const noopSubscribe = () => () => {};
/** Seconds per problem in a timed drill. */
const TIMED_SECONDS = 90;

/** A round of problems from one or more topics, interleaved. */
function makeRound(topics: TopicRef[], size: number): GeneratedQuestion[] {
  const seed = Math.floor(Math.random() * 2 ** 31);
  const per = Math.ceil(size / topics.length);
  const pools = topics.map((t, k) => generateForTopic(t.id, per, seed + k * 104729));
  const out: GeneratedQuestion[] = [];
  for (let i = 0; out.length < size && pools.some((p) => p[i]); i++) for (const p of pools) if (p[i] && out.length < size) out.push(p[i]);
  return out;
}

/** Sticky action bar above the phone tab bar (same as Exam Sprint's). */
const bottomBar = "sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] z-20 -mx-4 mt-8 border-t-2 px-4 py-4 sm:-mx-6 sm:px-6 md:bottom-0";

export function PracticeSession({ topics, courseId, timed = false, signedIn }: { topics: TopicRef[]; courseId: string; timed?: boolean; signedIn: boolean }) {
  const [round, setRound] = useState<GeneratedQuestion[]>([]);
  const [i, setI] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [hint, setHint] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [done, setDone] = useState(false);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [left, setLeft] = useState(timed ? ROUND * TIMED_SECONDS : 0);
  const [saved, setSaved] = useState<boolean | null>(null);
  const shownAt = useRef(0);
  const titles = useMemo(() => Object.fromEntries(topics.map((t) => [t.id, t])), [topics]);

  const start = () => {
    setRound(makeRound(topics, ROUND));
    setI(0);
    setChoice(null);
    setHint(false);
    setAnswers([]);
    setDone(false);
    setSaved(null);
    setLeft(timed ? ROUND * TIMED_SECONDS : 0);
  };

  // Problems are random, so they're generated in the browser only (never during the server render).
  const inBrowser = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [started, setStarted] = useState(false);
  if (inBrowser && !started) {
    setStarted(true);
    start();
  }

  useEffect(() => {
    shownAt.current = Date.now();
    window.scrollTo({ top: 0 });
  }, [i, done]);

  // Timed drill: one clock for the whole round. When it runs out, the round ends.
  useEffect(() => {
    if (!timed || done || !round.length) return;
    if (left <= 0) {
      finish(answers);
      return;
    }
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }); // eslint-disable-line react-hooks/exhaustive-deps

  function finish(list: Answer[]) {
    setDone(true);
    const byTopic = new Map<string, { questionId: string; choice: number }[]>();
    for (const a of list) byTopic.set(a.q.topicId, [...(byTopic.get(a.q.topicId) ?? []), { questionId: a.q.id, choice: a.choice }]);
    if (!signedIn || !byTopic.size) return;
    Promise.all([...byTopic].map(([t, as]) => recordPractice(t, as)))
      .then((rs) => setSaved(rs.some((r) => r.saved)))
      .catch(() => setSaved(false));
  }

  if (!round.length) {
    return (
      <div aria-busy className="mt-6 space-y-3">
        <div className="skeleton h-7 w-4/5 rounded-xl" />
        {[0, 1, 2, 3].map((k) => (
          <div key={k} className="skeleton h-16 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (done) {
    const correct = answers.filter((a) => a.choice === a.q.answer).length;
    const pct = Math.round((correct / Math.max(1, answers.length)) * 100);
    const missed = answers.filter((a) => a.choice !== a.q.answer);
    const skills = new Map<string, { c: number; n: number }>();
    for (const a of answers) {
      const s = skills.get(a.q.skill) ?? { c: 0, n: 0 };
      s.n++;
      if (a.choice === a.q.answer) s.c++;
      skills.set(a.q.skill, s);
    }
    const first = topics[0];
    return (
      <div>
        <div className="rise flex flex-col items-center text-center">
          <span className={cn("press-sm flex size-20 items-center justify-center rounded-3xl text-white", pct >= 80 ? "bg-positive [--ledge:var(--positive-press)]" : "bg-sprint [--ledge:var(--sprint-press)]")}>
            <Trophy className="size-10" />
          </span>
          <p className="tabular display mt-5 text-[56px] leading-none text-ink">
            {correct}/{answers.length}
          </p>
          <p className="headline mt-2 text-[22px] text-ink">{pct >= 90 ? "You've got this down." : pct >= 70 ? "Solid. A few more and it sticks." : pct >= 40 ? "Getting there. Review the misses below." : "This one needs a lesson first."}</p>
          <p className="mt-1 text-[14px] text-muted">
            {timed ? (answers.length < round.length ? `Time ran out after ${answers.length} of ${round.length}. ` : "Finished in time. ") : null}
            Best streak: {best}
            {signedIn ? (saved === false ? " · Couldn't save this round." : saved ? " · Saved to your progress and plan." : "") : null}
          </p>
        </div>

        {skills.size > 1 ? (
          <ul className="mt-8 grid gap-2 sm:grid-cols-2">
            {[...skills].map(([skill, s]) => (
              <li key={skill} className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3 ring-2 ring-line">
                <span className="min-w-0 flex-1 truncate font-brand text-[14.5px] font-extrabold text-ink">{skill}</span>
                <span className={cn("tabular font-brand text-[14.5px] font-black", s.c === s.n ? "text-positive" : "text-sprint-ink")}>
                  {s.c}/{s.n}
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        {missed.length ? (
          <section className="mt-8">
            <h2 className="headline text-[20px] text-ink">Review your misses</h2>
            <ol className="mt-3 space-y-3">
              {missed.map((a) => (
                <li key={a.q.id} className="rounded-3xl bg-surface p-4 ring-2 ring-line sm:p-5">
                  <p className="whitespace-pre-wrap font-brand text-[16px] font-extrabold leading-snug text-ink">{a.q.stem}</p>
                  <p className="mt-2 text-[14px] text-danger">
                    You picked <span className="font-bold">{a.choice >= 0 ? a.q.choices[a.choice] : "nothing (time ran out)"}</span>
                    {a.choice >= 0 ? `: ${a.q.explanations[a.choice]}` : ""}
                  </p>
                  <p className="mt-2 text-[14px] text-positive">
                    Answer: <span className="font-bold">{a.q.choices[a.q.answer]}</span>
                  </p>
                  <ol className="mt-2 list-decimal space-y-1 pl-5 text-[14px] leading-relaxed text-ink-2">
                    {a.q.steps.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ol>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <button onClick={start} className={buttonClass("sprint", "lg")}>
            <RotateCcw className="size-4" /> Another {ROUND}
          </button>
          {topics.length === 1 ? (
            <Link href={first.href} className={buttonClass("secondary", "lg")}>
              <PlayCircle className="size-4" /> Watch the lesson
            </Link>
          ) : null}
        </div>
        {pct < 70 ? (
          <Link
            href={`/tutors/on-call?course=${encodeURIComponent(courseId)}&topic=${encodeURIComponent(first.id)}`}
            className="press mt-4 flex items-center gap-4 rounded-3xl bg-[#7c3aed] p-5 text-white [--ledge:#5b21b6] hover:brightness-110"
          >
            <Users className="size-7 shrink-0" />
            <span className="min-w-0 flex-1">
              <span className="block font-brand text-[17px] font-black">Due soon and still stuck?</span>
              <span className="block text-[14px] text-white/85">An on-call tutor can walk you through it in minutes.</span>
            </span>
            <ArrowRight className="size-5 shrink-0" />
          </Link>
        ) : null}
        {!signedIn ? (
          <p className="mt-6 text-center text-[14px] text-muted">
            <Link href="/signup?as=student&next=%2Fpractice" className="font-bold text-accent-ink hover:underline">
              Create a free account
            </Link>{" "}
            to save your results, see your weak spots, and get them in your learning plan.
          </p>
        ) : null}
      </div>
    );
  }

  const q = round[i];
  const answered = choice !== null;
  const right = answered && choice === q.answer;
  const last = i + 1 >= round.length;
  const mm = Math.floor(left / 60);
  const ss = String(left % 60).padStart(2, "0");

  const pick = (j: number) => {
    if (answered) return;
    setChoice(j);
    const a: Answer = { q, choice: j, hinted: hint, seconds: Math.round((Date.now() - shownAt.current) / 1000) };
    setAnswers((xs) => [...xs, a]);
    if (j === q.answer) {
      setStreak((s) => {
        setBest((b) => Math.max(b, s + 1));
        return s + 1;
      });
    } else setStreak(0);
    // Timed drills move straight on; the review comes at the end.
    if (timed) setTimeout(() => next([...answers, a]), 350);
  };

  const next = (list = answers) => {
    if (last) return finish(list);
    setI((k) => k + 1);
    setChoice(null);
    setHint(false);
  };

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="h-3.5 flex-1 overflow-hidden rounded-full bg-bg-subtle ring-2 ring-inset ring-line">
          <div className="h-full rounded-full bg-sprint transition-[width] duration-300" style={{ width: `${((i + (answered ? 1 : 0)) / round.length) * 100}%` }} />
        </div>
        <span className="tabular shrink-0 font-brand text-[14px] font-extrabold text-muted">
          {i + 1}/{round.length}
        </span>
        {timed ? (
          <span className={cn("tabular inline-flex h-8 shrink-0 items-center gap-1 rounded-full px-3 font-brand text-[13.5px] font-black", left <= 60 ? "bg-danger-soft text-danger" : "bg-bg-subtle text-ink-2")}>
            <Timer className="size-3.5" /> {mm}:{ss}
          </span>
        ) : streak >= 2 ? (
          <span className="pop tabular inline-flex h-8 shrink-0 items-center gap-1 rounded-full bg-sprint-soft px-3 font-brand text-[13.5px] font-black text-sprint-ink">
            <Flame className="size-3.5" /> {streak}
          </span>
        ) : null}
      </div>
      <p className="mt-7 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-sprint-soft px-3 py-1 font-brand text-[12.5px] font-extrabold text-sprint-ink">{topics.length > 1 ? titles[q.topicId]?.title : q.skill}</span>
        <span className="rounded-full bg-bg-subtle px-3 py-1 font-brand text-[12.5px] font-extrabold capitalize text-muted">{q.difficulty}</span>
      </p>
      <p key={q.id} className="fade mt-4 whitespace-pre-wrap font-brand text-[21px] font-extrabold leading-snug text-ink sm:text-[24px]">
        {q.stem}
      </p>

      {!timed && !answered ? (
        hint ? (
          <p className="fade mt-4 flex gap-2.5 rounded-2xl bg-accent-soft px-4 py-3 text-[14.5px] leading-relaxed text-accent-ink">
            <Lightbulb className="mt-0.5 size-4 shrink-0" /> {q.steps[0]}
          </p>
        ) : (
          <button onClick={() => setHint(true)} className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-xl bg-bg-subtle px-3 font-brand text-[13px] font-extrabold text-ink-2 transition-colors hover:bg-line hover:text-ink">
            <Lightbulb className="size-3.5" /> Show the first step
          </button>
        )
      ) : null}

      <div className="mt-6 grid gap-3">
        {q.choices.map((c, j) => {
          const isAnswer = answered && !timed && j === q.answer;
          const isWrong = answered && !timed && j === choice && j !== q.answer;
          const isPicked = answered && timed && j === choice;
          return (
            <div key={`${q.id}-${j}`}>
              <button
                disabled={answered}
                onClick={() => pick(j)}
                className={cn(
                  "press flex w-full items-center gap-3.5 rounded-2xl px-4 py-3.5 text-left text-[16px] ring-2 ring-inset",
                  !answered && "bg-surface ring-line [--ledge:var(--line)] hover:bg-bg-subtle hover:ring-line-strong",
                  isAnswer && "bg-positive-soft ring-positive [--ledge:var(--positive-press)]",
                  isWrong && "bg-danger-soft ring-danger [--ledge:color-mix(in_oklab,var(--danger)_70%,black)]",
                  isPicked && "bg-sprint-soft ring-sprint [--ledge:var(--sprint-press)]",
                  answered && !isAnswer && !isWrong && !isPicked && "bg-surface opacity-60 ring-line [--ledge:var(--line)]",
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
              {answered && !timed && j === choice && j !== q.answer ? <p className="fade px-4 pb-1 pt-2.5 text-[14.5px] leading-relaxed text-danger">{q.explanations[j]}</p> : null}
            </div>
          );
        })}
      </div>

      {answered && !timed ? (
        <div className="fade mt-5 rounded-3xl bg-surface p-4 ring-2 ring-line sm:p-5">
          <p className="font-brand text-[14px] font-extrabold text-muted">Step by step</p>
          <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-[15px] leading-relaxed text-ink">
            {q.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </div>
      ) : null}

      {!timed ? (
        <div className={cn(bottomBar, "transition-colors duration-200", !answered ? "border-line bg-bg/95 backdrop-blur" : right ? "border-positive/30 bg-positive-soft" : "border-danger/30 bg-danger-soft")}>
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0" aria-live="polite">
              {answered ? (
                <p className={cn("pop flex items-center gap-2.5 font-brand text-[18px] font-black", right ? "text-positive" : "text-danger")}>
                  <span className={cn("check-pop flex size-9 shrink-0 items-center justify-center rounded-full text-bg", right ? "bg-positive" : "bg-danger")}>
                    {right ? <Check className="size-5" strokeWidth={3.5} /> : <X className="size-5" strokeWidth={3.5} />}
                  </span>
                  {right ? (streak >= 3 ? `${streak} in a row!` : "Nice!") : "Not quite"}
                </p>
              ) : (
                <p className="font-brand text-[14.5px] font-extrabold text-muted">Pick an answer</p>
              )}
            </div>
            <button disabled={!answered} onClick={() => next()} className={buttonClass(!answered ? "secondary" : right ? "positive" : "sprint", "lg", "shrink-0 px-6")}>
              {last ? "See results" : "Next problem"} <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
