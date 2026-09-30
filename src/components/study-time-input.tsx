"use client";

import { useState } from "react";
import { cn } from "./ui";

export const MIN_STUDY_MINUTES = 10;
export const MAX_STUDY_MINUTES = 480;

const QUICK = [15, 30, 45, 60, 90, 120, 180];
const label = (m: number) => (m < 60 ? `${m} min` : m % 60 ? `${Math.floor(m / 60)} hr ${m % 60} min` : `${m / 60} hr`);

const TONES = {
  accent: { on: "bg-accent text-white [--ledge:var(--accent-press)]", focus: "focus:ring-accent" },
  positive: { on: "bg-[#15803d] text-white [--ledge:#0f5c2b]", focus: "focus:ring-positive" },
  sprint: { on: "bg-sprint text-white [--ledge:var(--sprint-press)]", focus: "focus:ring-sprint" },
} as const;

/**
 * "How much time do you have?" Type the hours and minutes, or tap a common amount.
 * Submits the total as minutes in a hidden field named \`name\`.
 */
export function StudyTimeInput({
  name = "minutesPerDay",
  defaultMinutes,
  label: title = "Time per day",
  onDark = false,
  tone = "accent",
}: {
  name?: string;
  defaultMinutes: number;
  label?: string;
  onDark?: boolean;
  tone?: keyof typeof TONES;
}) {
  const [hours, setHours] = useState(String(Math.floor(defaultMinutes / 60)));
  const [mins, setMins] = useState(String(defaultMinutes % 60));
  const total = (Number(hours) || 0) * 60 + (Number(mins) || 0);
  const valid = total >= MIN_STUDY_MINUTES && total <= MAX_STUDY_MINUTES;
  const set = (m: number) => {
    setHours(String(Math.floor(m / 60)));
    setMins(String(m % 60));
  };
  const t = TONES[tone];
  const box = cn(
    "h-14 w-[72px] rounded-2xl px-2 text-center font-brand text-[24px] font-black tabular-nums outline-none focus:ring-[3px]",
    t.focus,
    onDark ? "bg-white text-[#0f172a]" : "bg-surface text-ink ring-2 ring-inset ring-line-strong",
  );
  const muted = onDark ? "text-white/75" : "text-muted";

  return (
    <fieldset>
      <legend className={cn("mb-2 font-brand text-[14px] font-extrabold", onDark ? "text-white/90" : "text-ink")}>{title}</legend>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <label className="flex items-center gap-1.5">
          <input type="number" inputMode="numeric" min={0} max={8} value={hours} onChange={(e) => setHours(e.target.value.slice(0, 1))} aria-label="Hours" className={box} />
          <span className={cn("font-brand text-[15px] font-extrabold", muted)}>hr</span>
        </label>
        <label className="flex items-center gap-1.5">
          <input type="number" inputMode="numeric" min={0} max={59} step={5} value={mins} onChange={(e) => setMins(e.target.value.slice(0, 2))} aria-label="Minutes" className={box} />
          <span className={cn("font-brand text-[15px] font-extrabold", muted)}>min</span>
        </label>
        <span className={cn("text-[13.5px] font-semibold", valid ? muted : onDark ? "text-[#ffd2b8]" : "text-sprint-ink")}>
          {valid ? `a day` : total < MIN_STUDY_MINUTES ? `At least ${MIN_STUDY_MINUTES} minutes` : "Up to 8 hours a day"}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {QUICK.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => set(m)}
            aria-pressed={total === m}
            className={cn(
              "press-sm h-9 rounded-xl px-3 font-brand text-[13px] font-extrabold",
              total === m
                ? onDark
                  ? "bg-white text-[#0f172a] [--ledge:rgb(0_0_0/0.22)]"
                  : t.on
                : onDark
                  ? "border-2 border-white/25 bg-white/15 text-white [--ledge:rgb(0_0_0/0.18)] hover:bg-white/25"
                  : "border-2 border-line bg-surface text-ink-2 [--ledge:var(--line)] hover:bg-bg-subtle",
            )}
          >
            {label(m)}
          </button>
        ))}
      </div>
      <input type="hidden" name={name} value={valid ? total : ""} />
    </fieldset>
  );
}
