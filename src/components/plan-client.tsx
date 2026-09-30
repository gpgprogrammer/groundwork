"use client";

import { Check, Copy } from "lucide-react";
import { useActionState, useOptimistic, useState, useTransition } from "react";
import { toggleTask, updatePlanPrefs, type PrefsState } from "@/app/actions/plan";
import { selectClass } from "./form";
import { cn } from "./ui";
import { StudyTimeInput } from "./study-time-input";

/** The big round check on a plan task. Pops when it's ticked. */
export function TaskCheck({ id, done, size = "md" }: { id: string; done: boolean; size?: "md" | "lg" }) {
  const [optimistic, setOptimistic] = useOptimistic(done);
  const [, start] = useTransition();
  return (
    <button
      type="button"
      onClick={() =>
        start(async () => {
          setOptimistic(!optimistic);
          await toggleTask(id, !optimistic);
        })
      }
      aria-pressed={optimistic}
      aria-label={optimistic ? "Mark not done" : "Mark done"}
      className={cn(
        "press-sm flex shrink-0 items-center justify-center rounded-full transition-colors",
        size === "lg" ? "size-12 sm:size-14" : "size-9",
        optimistic
          ? "bg-[#15803d] text-white [--ledge:#0f5c2b]"
          : "border-[3px] border-line-strong bg-surface text-transparent [--ledge:var(--line-strong)] hover:border-positive hover:text-positive/40",
      )}
    >
      <Check key={String(optimistic)} className={cn(optimistic && "check-pop", size === "lg" ? "size-6 sm:size-7" : "size-4")} strokeWidth={3.5} />
    </button>
  );
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function PlanSettings({ minutesPerDay, reminderHour, studyDays }: { minutesPerDay: number; reminderHour: number; studyDays: number[] }) {
  const [state, action, pending] = useActionState<PrefsState, FormData>(updatePlanPrefs, {});
  return (
    <form action={action} className="space-y-6">
      <StudyTimeInput defaultMinutes={minutesPerDay} label="How much time do you have each day?" tone="positive" />
      <label className="block">
        <span className="mb-1.5 block font-brand text-[14px] font-extrabold text-ink">Reminder time</span>
        <select name="reminderHour" defaultValue={reminderHour} className={cn(selectClass, "h-12 rounded-2xl font-semibold ring-2")}>
          {Array.from({ length: 19 }, (_, i) => i + 5).map((h) => (
            <option key={h} value={h}>
              {h === 12 ? "12:00 PM" : h > 12 ? `${h - 12}:00 PM` : `${h}:00 AM`}
            </option>
          ))}
        </select>
      </label>
      <fieldset>
        <legend className="mb-2 font-brand text-[14px] font-extrabold text-ink">Study days</legend>
        <div className="grid grid-cols-7 gap-1.5">
          {DAYS.map((d, i) => (
            <label key={d} className="cursor-pointer">
              <input type="checkbox" name="studyDays" value={i} defaultChecked={studyDays.includes(i)} className="peer sr-only" />
              <span className="press-sm flex h-11 items-center justify-center rounded-xl bg-surface font-brand text-[12.5px] font-extrabold text-ink-2 border-2 border-line [--ledge:var(--line)] peer-checked:bg-[#15803d] peer-checked:text-white peer-checked:border-transparent peer-checked:[--ledge:#0f5c2b] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-positive">
                {d}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      {state.error ? (
        <p className="fade text-sm font-semibold text-danger" role="alert">
          {state.error}
        </p>
      ) : state.ok ? (
        <p className="fade flex items-center gap-2 rounded-2xl bg-positive-soft px-3 py-2.5 text-sm font-semibold text-positive" role="status">
          <Check className="check-pop size-4 shrink-0" strokeWidth={3} /> Saved. Your plan is updated.
        </p>
      ) : null}
      <button type="submit" disabled={pending} className={cn("press flex h-12 w-full items-center justify-center rounded-2xl bg-[#15803d] font-brand text-[15.5px] font-extrabold text-white [--ledge:#0f5c2b] hover:brightness-110 disabled:opacity-60")}>
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}

export function CopyField({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-bg-subtle p-1.5 pl-3 ring-2 ring-inset ring-line">
      <input readOnly value={value} aria-label={label} className="min-w-0 flex-1 bg-transparent font-mono text-[12px] text-ink-2 outline-none" onFocus={(e) => e.currentTarget.select()} />
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          } catch {}
        }}
        className="press-sm flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-surface px-3 font-brand text-[13px] font-extrabold text-ink border-2 border-line [--ledge:var(--line)] hover:bg-bg"
      >
        {copied ? <Check className="check-pop size-3.5 text-positive" strokeWidth={3} /> : <Copy className="size-3.5" />} {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
