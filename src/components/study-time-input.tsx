"use client";

import { useState } from "react";
import { cn } from "./ui";

export const MIN_STUDY_MINUTES = 10;
export const MAX_STUDY_MINUTES = 480;

const QUICK = [15, 30, 45, 60, 90, 120, 180];
const label = (m: number) => (m < 60 ? `${m} min` : m % 60 ? `${Math.floor(m / 60)} hr ${m % 60} min` : `${m / 60} hr`);

/**
 * "How much time do you have?" Type the hours and minutes, or tap a common amount.
 * Submits the total as minutes in a hidden field named \`name\`.
 */
export function StudyTimeInput({ name = "minutesPerDay", defaultMinutes, label: title = "Time per day", onDark = false }: { name?: string; defaultMinutes: number; label?: string; onDark?: boolean }) {
  const [hours, setHours] = useState(String(Math.floor(defaultMinutes / 60)));
  const [mins, setMins] = useState(String(defaultMinutes % 60));
  const total = (Number(hours) || 0) * 60 + (Number(mins) || 0);
  const valid = total >= MIN_STUDY_MINUTES && total <= MAX_STUDY_MINUTES;
  const set = (m: number) => {
    setHours(String(Math.floor(m / 60)));
    setMins(String(m % 60));
  };
  const box = cn("h-11 w-16 rounded-lg px-2 text-center text-[15px] tabular-nums outline-none focus:ring-2 focus:ring-accent", onDark ? "bg-white text-[#0f172a]" : "bg-bg text-ink ring-1 ring-line-strong");
  const muted = onDark ? "text-white/75" : "text-muted";

  return (
    <fieldset>
      <legend className={cn("mb-1.5 text-[13px] font-medium", onDark ? "text-white/80" : "text-ink-2")}>{title}</legend>
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-1.5">
          <input type="number" inputMode="numeric" min={0} max={8} value={hours} onChange={(e) => setHours(e.target.value.slice(0, 1))} aria-label="Hours" className={box} />
          <span className={cn("text-sm", muted)}>hr</span>
        </label>
        <label className="flex items-center gap-1.5">
          <input type="number" inputMode="numeric" min={0} max={59} step={5} value={mins} onChange={(e) => setMins(e.target.value.slice(0, 2))} aria-label="Minutes" className={box} />
          <span className={cn("text-sm", muted)}>min</span>
        </label>
        <span className={cn("text-[13px]", valid ? muted : onDark ? "font-medium text-[#ffd2b8]" : "font-medium text-[#c2410c]")}>
          {valid ? `a day` : total < MIN_STUDY_MINUTES ? `At least ${MIN_STUDY_MINUTES} minutes` : "Up to 8 hours a day"}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {QUICK.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => set(m)}
            className={cn(
              "rounded-full px-2.5 py-1 text-[12.5px] font-medium",
              total === m ? (onDark ? "bg-white text-[#0f172a]" : "bg-accent text-white") : onDark ? "bg-white/15 text-white hover:bg-white/25" : "bg-bg-subtle text-ink-2 hover:bg-line",
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
