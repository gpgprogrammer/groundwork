"use client";

import { Loader2, PenLine, Sparkles } from "lucide-react";
import { useState, useTransition } from "react";
import { newFrq, submitFrq } from "@/app/actions/sprint";
import type { FrqAttempt } from "@/lib/types";
import { Markdown } from "../ask/markdown";
import { selectClass } from "../form";
import { buttonClass } from "../ui";

export function FrqCoach({ sprintId, units, initialUnit, past }: { sprintId: string; units: { id: string; label: string }[]; initialUnit: string; past: FrqAttempt[] }) {
  const [unitId, setUnitId] = useState(initialUnit);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<FrqAttempt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [grading, setGrading] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 rounded-3xl bg-surface p-5 ring-2 ring-line sm:flex-row sm:items-end">
        <label className="block flex-1">
          <span className="mb-1.5 block font-brand text-[14px] font-extrabold text-ink">Unit</span>
          <select value={unitId} onChange={(e) => setUnitId(e.target.value)} className={selectClass.replace("h-11", "h-12").replace("rounded-xl", "rounded-2xl").replace("ring-1 ring-inset", "ring-2 ring-inset").replace("focus:ring-accent", "focus:ring-sprint")}>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </select>
        </label>
        <button
          disabled={pending}
          onClick={() =>
            start(async () => {
              setError(null);
              setResult(null);
              setAnswer("");
              const r = await newFrq(sprintId, unitId);
              if ("error" in r) setError(r.error ?? "Something went wrong.");
              else setPrompt(r.prompt);
            })
          }
          className={buttonClass("sprint", "md", "h-12")}
        >
          {pending && !grading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />} {prompt ? "New question" : "Give me a question"}
        </button>
      </div>
      {error ? <p className="rounded-2xl bg-warn-soft p-4 text-sm font-semibold text-ink">{error}</p> : null}
      {prompt ? (
        <div className="space-y-4">
          <div className="pop rounded-3xl bg-sprint-soft p-5 sm:p-6">
            <p className="inline-flex rounded-full bg-sprint px-3 py-1 font-brand text-[12.5px] font-extrabold text-white">Question</p>
            <p className="mt-3 whitespace-pre-wrap text-[16px] font-medium leading-relaxed text-ink">{prompt}</p>
          </div>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={12}
            placeholder="Write your answer. Label each part (a), (b), (c)…"
            className="w-full rounded-3xl bg-surface p-5 text-[16px] leading-relaxed text-ink ring-2 ring-inset ring-line outline-none focus:ring-sprint"
          />
          <div className="flex items-center justify-between">
            <p className="tabular font-brand text-[13.5px] font-extrabold text-muted">{answer.trim().split(/\s+/).filter(Boolean).length} words</p>
            <button
              disabled={pending || answer.trim().length < 40}
              onClick={() => {
                setGrading(true);
                start(async () => {
                  setError(null);
                  const r = await submitFrq(sprintId, unitId, prompt, answer);
                  setGrading(false);
                  if ("error" in r) setError(r.error ?? "Something went wrong.");
                  else if (r.attempt) setResult(r.attempt);
                });
              }}
              className={buttonClass("sprint", "lg")}
            >
              {grading ? <Loader2 className="size-4 animate-spin" /> : <PenLine className="size-4" />} {grading ? "Grading…" : "Grade my answer"}
            </button>
          </div>
        </div>
      ) : null}
      {result ? (
        <div className="rise overflow-hidden rounded-3xl bg-surface ring-2 ring-line">
          <div className="flex items-center gap-4 bg-sprint p-5 text-white sm:p-6">
            <p className="check-pop tabular display text-[56px] leading-none">
              {result.score}/{result.outOf}
            </p>
            <p className="font-brand text-[15px] font-extrabold text-white/90">points a reader would give this answer</p>
          </div>
          <div className="p-5 sm:p-6">
            <Markdown text={result.feedback} />
          </div>
        </div>
      ) : null}
      {past.length ? (
        <section>
          <h2 className="headline text-[22px] text-ink">Past answers</h2>
          <ul className="mt-3 space-y-2">
            {past.map((a) => (
              <li key={a.id}>
                <details className="rounded-2xl bg-surface ring-2 ring-line [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 text-[14.5px] font-semibold text-ink">
                    <span className="truncate">{a.prompt.slice(0, 90)}…</span>
                    <span className="tabular shrink-0 rounded-full bg-sprint-soft px-3 py-1 font-brand font-extrabold text-sprint-ink">
                      {a.score}/{a.outOf}
                    </span>
                  </summary>
                  <div className="border-t-2 border-line p-4">
                    <Markdown text={a.feedback} />
                  </div>
                </details>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
