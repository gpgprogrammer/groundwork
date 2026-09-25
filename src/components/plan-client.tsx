"use client";

import { Check, Copy } from "lucide-react";
import { useActionState, useOptimistic, useState, useTransition } from "react";
import { toggleTask, updatePlanPrefs, type PrefsState } from "@/app/actions/plan";
import { cn } from "./ui";
import { StudyTimeInput } from "./study-time-input";

export function TaskCheck({ id, done }: { id: string; done: boolean }) {
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
        "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full transition-colors",
        optimistic ? "bg-positive text-white" : "ring-2 ring-line-strong hover:ring-positive",
      )}
    >
      {optimistic ? <Check className="size-4" strokeWidth={3} /> : null}
    </button>
  );
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function PlanSettings({ minutesPerDay, reminderHour, studyDays }: { minutesPerDay: number; reminderHour: number; studyDays: number[] }) {
  const [state, action, pending] = useActionState<PrefsState, FormData>(updatePlanPrefs, {});
  return (
    <form action={action} className="space-y-5">
      <StudyTimeInput defaultMinutes={minutesPerDay} label="How much time do you have each day?" />
      <label className="block">
        <span className="text-[13px] font-medium text-ink-2">Reminder time</span>
        <select name="reminderHour" defaultValue={reminderHour} className="mt-1.5 h-10 w-full rounded-lg bg-bg px-3 text-sm ring-1 ring-line-strong">
          {Array.from({ length: 19 }, (_, i) => i + 5).map((h) => (
            <option key={h} value={h}>
              {h === 12 ? "12:00 PM" : h > 12 ? `${h - 12}:00 PM` : `${h}:00 AM`}
            </option>
          ))}
        </select>
      </label>
      <fieldset>
        <legend className="text-[13px] font-medium text-ink-2">Study days</legend>
        <div className="mt-1.5 flex gap-1">
          {DAYS.map((d, i) => (
            <label key={d} className="flex-1 cursor-pointer">
              <input type="checkbox" name="studyDays" value={i} defaultChecked={studyDays.includes(i)} className="peer sr-only" />
              <span className="flex h-9 items-center justify-center rounded-lg text-[12px] font-medium text-ink-2 ring-1 ring-line-strong peer-checked:bg-accent peer-checked:text-white peer-checked:ring-accent">
                {d}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      {state.error ? <p className="text-sm text-[#c2410c]">{state.error}</p> : state.ok ? <p className="text-sm text-positive">Saved. Your plan is updated.</p> : null}
      <button type="submit" disabled={pending} className="h-10 w-full rounded-full bg-ink text-sm font-semibold text-bg hover:bg-ink/85 disabled:opacity-60">
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}

export function CopyField({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-2 rounded-lg bg-bg-subtle p-1.5 pl-3">
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
        className="flex h-8 shrink-0 items-center gap-1.5 rounded-md bg-bg px-2.5 text-[12px] font-medium text-ink ring-1 ring-line hover:bg-line"
      >
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />} {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
