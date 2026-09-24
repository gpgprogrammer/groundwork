"use client";

import { Loader2, PenLine, Sparkles } from "lucide-react";
import { useState, useTransition } from "react";
import { newFrq, submitFrq } from "@/app/actions/sprint";
import type { FrqAttempt } from "@/lib/types";
import { Markdown } from "../ask/markdown";

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="block flex-1">
          <span className="mb-1.5 block text-[13px] font-medium text-ink-2">Unit</span>
          <select value={unitId} onChange={(e) => setUnitId(e.target.value)} className="h-11 w-full rounded-xl bg-bg px-3 text-[15px] ring-1 ring-line-strong">
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
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ff8a3d] to-[#e0531c] px-5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending && !grading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />} {prompt ? "New question" : "Give me a question"}
        </button>
      </div>
      {error ? <p className="rounded-xl bg-warn-soft p-4 text-sm text-ink">{error}</p> : null}
      {prompt ? (
        <div className="space-y-4">
          <div className="rounded-2xl bg-bg-subtle p-5">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-muted">Question</p>
            <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed text-ink">{prompt}</p>
          </div>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={12}
            placeholder="Write your answer. Label each part (a), (b), (c)…"
            className="w-full rounded-2xl bg-bg p-4 text-[15px] leading-relaxed text-ink ring-1 ring-line-strong outline-none focus:ring-accent"
          />
          <div className="flex items-center justify-between">
            <p className="tabular text-[12.5px] text-muted">{answer.trim().split(/\s+/).filter(Boolean).length} words</p>
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
              className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-bg disabled:opacity-40"
            >
              {grading ? <Loader2 className="size-4 animate-spin" /> : <PenLine className="size-4" />} {grading ? "Grading…" : "Grade my answer"}
            </button>
          </div>
        </div>
      ) : null}
      {result ? (
        <div className="rounded-3xl p-6 ring-2 ring-[#ff8a3d]">
          <p className="tabular text-4xl font-extrabold text-ink">
            {result.score}/{result.outOf}
          </p>
          <div className="mt-4">
            <Markdown text={result.feedback} />
          </div>
        </div>
      ) : null}
      {past.length ? (
        <section>
          <h2 className="text-lg font-bold text-ink">Past answers</h2>
          <ul className="mt-3 space-y-2">
            {past.map((a) => (
              <li key={a.id}>
                <details className="rounded-xl ring-1 ring-line">
                  <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3 text-[14px] text-ink">
                    <span className="truncate">{a.prompt.slice(0, 90)}…</span>
                    <span className="tabular shrink-0 font-semibold">
                      {a.score}/{a.outOf}
                    </span>
                  </summary>
                  <div className="border-t border-line p-4">
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
