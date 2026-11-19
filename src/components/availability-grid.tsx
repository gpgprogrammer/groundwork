"use client";

import { CalendarOff, Check, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState, useSyncExternalStore, useTransition } from "react";
import { saveAvailability } from "@/app/actions/bookings";
import { inputClass, selectClass } from "./form";
import { cn, Notice } from "./ui";

type Window = { day: number; start: string; end: string };
type Off = { from: string; to: string };

/** Half-hour rows from 6:00 am to 11:00 pm. */
const START_MIN = 6 * 60;
const ROWS = 34;
/** Display order Monday→Sunday; values are JS day numbers (0 = Sunday). */
const ORDER = [1, 2, 3, 4, 5, 6, 0];
const SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
const hhmm = (n: number) => `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
const rowMin = (r: number) => START_MIN + r * 30;
function clock(n: number, short = false) {
  const h = Math.floor(n / 60) % 24;
  const m = n % 60;
  const h12 = h % 12 || 12;
  const ap = h < 12 ? "am" : "pm";
  if (short) return m ? `${h12}:${String(m).padStart(2, "0")}` : `${h12} ${ap}`;
  return `${h12}${m ? `:${String(m).padStart(2, "0")}` : ""} ${ap}`;
}

const empty = () => Array.from({ length: 7 }, () => Array<boolean>(ROWS).fill(false));

function toGrid(windows: Window[]) {
  const g = empty();
  for (const w of windows) {
    for (let r = 0; r < ROWS; r++) {
      const t = rowMin(r);
      if (t >= toMin(w.start) && t + 30 <= toMin(w.end)) g[w.day][r] = true;
    }
  }
  return g;
}

function toWindows(g: boolean[][]): Window[] {
  const out: Window[] = [];
  for (let d = 0; d < 7; d++) {
    let open: number | null = null;
    for (let r = 0; r <= ROWS; r++) {
      const on = r < ROWS && g[d][r];
      if (on && open === null) open = r;
      if (!on && open !== null) {
        out.push({ day: d, start: hhmm(rowMin(open)), end: hhmm(rowMin(r)) });
        open = null;
      }
    }
  }
  return out;
}

const PRESETS: { label: string; days: number[]; from: number; to: number }[] = [
  { label: "Weekday afternoons", days: [1, 2, 3, 4, 5], from: 15 * 60, to: 18 * 60 },
  { label: "Weekday evenings", days: [1, 2, 3, 4, 5], from: 18 * 60, to: 21 * 60 },
  { label: "Weekend days", days: [6, 0], from: 10 * 60, to: 16 * 60 },
];

const noop = () => () => {};

/** Paint the times you're free on a week grid, mark days you're away, and save. */
export function AvailabilityGrid({ initial, timezone, hasSaved, timeOff: initialOff, profileHref }: { initial: Window[]; timezone: string; hasSaved: boolean; timeOff: Off[]; profileHref: string }) {
  const [grid, setGrid] = useState(() => toGrid(initial));
  const [off, setOff] = useState<Off[]>(initialOff);
  const [chosenTz, setChosenTz] = useState<string | null>(hasSaved ? timezone : null);
  const deviceTz = useSyncExternalStore(
    noop,
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || timezone,
    () => timezone,
  );
  const tz = chosenTz ?? deviceTz;
  const zones = useMemo(() => {
    let all: string[] = [];
    try {
      all = (Intl as unknown as { supportedValuesOf?: (k: string) => string[] }).supportedValuesOf?.("timeZone") ?? [];
    } catch {}
    const common = ["America/New_York", "America/Chicago", "America/Denver", "America/Phoenix", "America/Los_Angeles", "America/Anchorage", "Pacific/Honolulu"];
    return [...new Set([tz, ...common, ...all])];
  }, [tz]);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [dirty, setDirty] = useState(false);
  const [pending, start] = useTransition();
  const paint = useRef<boolean | null>(null);

  const set = (d: number, r: number, v: boolean) => {
    setGrid((g) => {
      if (g[d][r] === v) return g;
      const next = g.map((row) => row.slice());
      next[d][r] = v;
      return next;
    });
    setDirty(true);
    setMsg(null);
  };
  const cellAt = (x: number, y: number) => {
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    const c = el?.closest<HTMLElement>("[data-cell]");
    return c ? { d: Number(c.dataset.d), r: Number(c.dataset.r) } : null;
  };
  const applyPreset = (p: (typeof PRESETS)[number]) => {
    setGrid((g) => {
      const next = g.map((row) => row.slice());
      for (const d of p.days) for (let r = 0; r < ROWS; r++) if (rowMin(r) >= p.from && rowMin(r) + 30 <= p.to) next[d][r] = true;
      return next;
    });
    setDirty(true);
    setMsg(null);
  };

  const windows = toWindows(grid);
  const hours = windows.reduce((s, w) => s + (toMin(w.end) - toMin(w.start)) / 60, 0);
  const today = new Date().toISOString().slice(0, 10);

  const save = () =>
    start(async () => {
      const r = await saveAvailability(JSON.stringify(windows), tz, JSON.stringify(off.filter((o) => o.from && o.to)));
      if ("error" in r && r.error) setMsg({ ok: false, text: r.error });
      else {
        setMsg({ ok: true, text: windows.length ? "Saved. Students can book these times now." : "Saved. You have no free times, so students can't book you until you add some." });
        setDirty(false);
        setChosenTz(tz);
      }
    });

  return (
    <div className="space-y-8">
      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="headline text-[22px] text-ink">When are you free?</h2>
            <p className="mt-1 max-w-xl text-[14px] leading-relaxed text-muted">Tap or drag across the times you can tutor each week. Green means free. Everything else is off. Students only see open times, and you confirm each request.</p>
          </div>
          <p className="tabular font-brand text-[14px] font-extrabold text-ink">{hours ? `${hours % 1 ? hours.toFixed(1) : hours} hours a week` : "No free times yet"}</p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button key={p.label} type="button" onClick={() => applyPreset(p)} className="press-sm inline-flex h-10 items-center gap-1.5 rounded-full bg-surface px-4 font-brand text-[13.5px] font-extrabold text-ink ring-2 ring-inset ring-line [--ledge:var(--line)] hover:bg-bg-subtle">
              <Plus className="size-3.5" aria-hidden /> {p.label} <span className="font-semibold text-muted">{clock(p.from)}–{clock(p.to)}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setGrid(empty());
              setDirty(true);
              setMsg(null);
            }}
            className="inline-flex h-10 items-center rounded-full px-4 font-brand text-[13.5px] font-extrabold text-muted hover:bg-bg-subtle hover:text-danger"
          >
            Clear all
          </button>
        </div>

        <div
          className="mt-4 select-none rounded-3xl bg-surface p-2 ring-2 ring-line sm:p-3"
          style={{ touchAction: "pan-y" }}
          onPointerMove={(e) => {
            if (paint.current === null) return;
            const c = cellAt(e.clientX, e.clientY);
            if (c) set(c.d, c.r, paint.current);
          }}
          onPointerUp={() => (paint.current = null)}
          onPointerLeave={() => (paint.current = null)}
          onPointerCancel={() => (paint.current = null)}
        >
          <div className="grid grid-cols-[2.75rem_repeat(7,minmax(0,1fr))] gap-x-1 sm:grid-cols-[3.5rem_repeat(7,minmax(0,1fr))]">
            <span />
            {ORDER.map((d) => (
              <span key={d} className="pb-2 text-center font-brand text-[12.5px] font-extrabold text-ink sm:text-[13.5px]">
                {SHORT[d]}
              </span>
            ))}
            {Array.from({ length: ROWS }, (_, r) => (
              <Row key={r} r={r} grid={grid} onDown={(d, v) => (paint.current = v)} set={set} />
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-bg-subtle p-4">
          <p className="font-brand text-[13.5px] font-extrabold text-ink">Your week</p>
          {windows.length ? (
            <ul className="mt-2 grid gap-1 text-[14px] text-ink-2 sm:grid-cols-2">
              {ORDER.map((d) => {
                const w = windows.filter((x) => x.day === d);
                return (
                  <li key={d} className="flex gap-2">
                    <span className="w-24 shrink-0 font-bold text-ink">{LONG[d]}</span>
                    <span className="tabular">{w.length ? w.map((x) => `${clock(toMin(x.start))}–${clock(toMin(x.end))}`).join(", ") : <span className="text-muted">Not free</span>}</span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-1 text-[14px] text-muted">Nothing yet. Pick a preset above or tap the grid.</p>
          )}
        </div>

        <label className="mt-4 block max-w-sm">
          <span className="mb-1.5 block font-brand text-[13.5px] font-extrabold text-ink">Time zone</span>
          <select
            value={tz}
            onChange={(e) => {
              setChosenTz(e.target.value);
              setDirty(true);
              setMsg(null);
            }}
            className={selectClass}
          >
            {zones.map((z) => (
              <option key={z} value={z}>
                {z.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section>
        <h2 className="headline flex items-center gap-2 text-[22px] text-ink">
          <CalendarOff className="size-5 text-muted" aria-hidden /> Days you&apos;re away
        </h2>
        <p className="mt-1 max-w-xl text-[14px] leading-relaxed text-muted">Vacation or a busy day? Add it here and nobody can book you on those dates. Your weekly times stay the same.</p>
        {off.length ? (
          <ul className="mt-4 space-y-2">
            {off.map((o, i) => (
              <li key={i} className="flex flex-wrap items-center gap-2 rounded-2xl bg-bg-subtle p-2.5">
                <input
                  type="date"
                  aria-label="Away from"
                  min={today}
                  value={o.from}
                  onChange={(e) => {
                    setOff(off.map((x, j) => (j === i ? { from: e.target.value, to: x.to && x.to < e.target.value ? e.target.value : x.to || e.target.value } : x)));
                    setDirty(true);
                  }}
                  className={cn(inputClass, "w-auto flex-1")}
                />
                <span className="font-brand text-sm font-extrabold text-muted">to</span>
                <input
                  type="date"
                  aria-label="Away until"
                  min={o.from || today}
                  value={o.to}
                  onChange={(e) => {
                    setOff(off.map((x, j) => (j === i ? { ...x, to: e.target.value } : x)));
                    setDirty(true);
                  }}
                  className={cn(inputClass, "w-auto flex-1")}
                />
                <button
                  type="button"
                  onClick={() => {
                    setOff(off.filter((_, j) => j !== i));
                    setDirty(true);
                  }}
                  className="flex size-11 items-center justify-center rounded-full text-muted hover:bg-surface hover:text-danger"
                  aria-label="Remove these dates"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        <button
          type="button"
          onClick={() => {
            setOff([...off, { from: today, to: today }]);
            setDirty(true);
          }}
          className="press-sm mt-3 inline-flex h-10 items-center gap-1.5 rounded-2xl bg-surface px-4 font-brand text-sm font-extrabold text-ink ring-2 ring-inset ring-line [--ledge:var(--line)] hover:bg-bg-subtle"
        >
          <Plus className="size-4" aria-hidden /> Add days away
        </button>
      </section>

      <div className="sticky bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-10 md:bottom-3 space-y-3 rounded-3xl bg-surface/95 p-3 shadow-[0_6px_24px_rgb(0_0_0/0.12)] ring-2 ring-line backdrop-blur sm:flex sm:items-center sm:gap-4 sm:space-y-0">
        <button
          type="button"
          disabled={pending}
          onClick={save}
          className="press inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-[#7c3aed] px-7 font-brand text-[16.5px] font-extrabold text-white [--ledge:#5b21b6] hover:brightness-110 disabled:opacity-50 sm:w-auto"
        >
          <Check className="size-5" aria-hidden /> {pending ? "Saving…" : "Save my free times"}
        </button>
        <p className="text-center text-[13px] text-muted sm:text-left">
          {msg ? null : dirty ? "You have unsaved changes." : hasSaved ? "Saved. " : "Not saved yet. "}
          {!msg && !dirty && hasSaved ? (
            <Link href={profileHref} className="font-bold text-[#6d28d9] underline-offset-2 hover:underline dark:text-[#c9b5ff]">
              See what students see
            </Link>
          ) : null}
        </p>
      </div>
      {msg ? (
        <Notice tone={msg.ok ? "success" : "error"}>
          {msg.text}{" "}
          {msg.ok && windows.length ? (
            <Link href={profileHref} className="font-bold underline">
              See what students see
            </Link>
          ) : null}
        </Notice>
      ) : null}
    </div>
  );
}

function Row({ r, grid, onDown, set }: { r: number; grid: boolean[][]; onDown: (d: number, v: boolean) => void; set: (d: number, r: number, v: boolean) => void }) {
  const t = rowMin(r);
  const hourMark = t % 60 === 0;
  return (
    <>
      <span className={cn("tabular -mt-2 pr-1 text-right text-[11px] font-semibold leading-none text-muted sm:text-[12px]", !hourMark && "invisible")} aria-hidden>
        {clock(t)}
      </span>
      {ORDER.map((d) => {
        const on = grid[d][r];
        const prevOn = r > 0 && grid[d][r - 1];
        const nextOn = r < ROWS - 1 && grid[d][r + 1];
        return (
          <button
            key={d}
            type="button"
            data-cell
            data-d={d}
            data-r={r}
            aria-pressed={on}
            aria-label={`${LONG[d]} ${clock(t)} to ${clock(t + 30)}: ${on ? "free" : "not free"}`}
            onPointerDown={(e) => {
              if (e.button !== 0) return;
              onDown(d, !on);
              set(d, r, !on);
              const el = e.currentTarget as HTMLElement;
              if (el.hasPointerCapture?.(e.pointerId)) el.releasePointerCapture(e.pointerId);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                set(d, r, !on);
              }
            }}
            className={cn(
              "block h-[18px] w-full transition-colors duration-75 focus-visible:relative focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-[#7c3aed] sm:h-5",
              hourMark ? "border-t border-line" : "border-t border-dashed border-line/60",
              on ? "border-t-transparent bg-positive" : "bg-bg-subtle hover:bg-[#e9e0ff] dark:hover:bg-[#2a1f45]",
              on && !prevOn && "rounded-t-md",
              on && !nextOn && "rounded-b-md",
            )}
          />
        );
      })}
    </>
  );
}
