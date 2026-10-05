"use client";

import { CalendarCheck, CalendarClock, Plus, Trash2 } from "lucide-react";
import { useActionState, useState, useTransition } from "react";
import { createBooking, saveAvailability, type BookingState } from "@/app/actions/bookings";
import type { DaySlots } from "@/lib/bookings";
import { FormMessage, inputClass, selectClass } from "./form";
import { cn, Notice } from "./ui";
import { greetingName } from "@/lib/names";

const groupLabel = "mb-2 block font-brand text-[13.5px] font-extrabold text-ink";
const chip = "press-sm font-brand font-extrabold transition-[background-color,color,transform,box-shadow] duration-100 ease-out";
const chipOn = "bg-[#7c3aed] text-white [--ledge:#5b21b6]";
const chipOff = "bg-surface text-ink ring-2 ring-inset ring-line [--ledge:var(--line)] hover:bg-bg-subtle";
const violetCta =
  "press inline-flex h-[52px] w-full items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-[#7c3aed] px-7 font-brand text-[16.5px] font-extrabold text-white [--ledge:#5b21b6] hover:brightness-110 disabled:pointer-events-none disabled:opacity-50";

export function BookingForm({
  tutorId,
  tutorName,
  hourlyRate,
  slots,
  courses,
  defaultCourse,
  timezoneLabel,
  signedIn,
}: {
  tutorId: string;
  tutorName: string;
  hourlyRate: number | null;
  slots: Record<string, DaySlots[]>;
  courses: { id: string; title: string }[];
  defaultCourse: string | null;
  timezoneLabel: string;
  signedIn: boolean;
}) {
  const [minutes, setMinutes] = useState("60");
  const days = slots[minutes] ?? [];
  const [date, setDate] = useState(days[0]?.date ?? "");
  const [startsAt, setStartsAt] = useState("");
  const [state, action, pending] = useActionState<BookingState, FormData>(createBooking, {});
  const day = days.find((d) => d.date === date) ?? days[0];
  const price = hourlyRate ? (hourlyRate * Number(minutes)) / 60 : 0;
  const first = greetingName(tutorName);
  const local = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  if (!Object.values(slots).some((d) => d.length)) {
    return (
      <div className="flex items-start gap-3 rounded-2xl bg-bg-subtle p-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface text-muted ring-2 ring-line">
          <CalendarClock className="size-5" aria-hidden />
        </span>
        <p className="text-[14px] leading-relaxed text-ink-2">
          {first} hasn&apos;t posted open hours yet. Send a message below and they&apos;ll reply with times.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="tutorId" value={tutorId} />
      <input type="hidden" name="startsAt" value={startsAt} />

      <div>
        <span className={groupLabel}>Length</span>
        <div className="grid grid-cols-3 gap-2 pb-1" role="radiogroup" aria-label="Session length">
          {["30", "60", "90"].map((m) => (
            <label key={m} className="cursor-pointer">
              <input
                type="radio"
                name="minutes"
                value={m}
                checked={minutes === m}
                onChange={() => {
                  setMinutes(m);
                  setStartsAt("");
                }}
                className="peer sr-only"
              />
              <span className="press-sm flex h-11 items-center justify-center rounded-2xl bg-surface font-brand text-[14px] font-extrabold text-ink ring-2 ring-inset ring-line transition-[background-color,color,transform,box-shadow] duration-100 [--ledge:var(--line)] hover:bg-bg-subtle peer-checked:bg-[#7c3aed] peer-checked:text-white peer-checked:ring-0 peer-checked:[--ledge:#5b21b6] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent">
                {m} min
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <span className={groupLabel}>Day</span>
        <div className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 pb-2 pt-0.5">
          {days.map((d) => {
            const on = day?.date === d.date;
            return (
              <button
                type="button"
                key={d.date}
                aria-pressed={on}
                onClick={() => {
                  setDate(d.date);
                  setStartsAt("");
                }}
                className={cn(
                  chip,
                  "flex h-[72px] w-[70px] shrink-0 flex-col items-center justify-center rounded-2xl text-[12px]",
                  on ? chipOn : chipOff,
                )}
              >
                <span className={cn("text-[11px] uppercase tracking-wide", on ? "text-white/85" : "text-muted")}>{d.label.split(",")[0]}</span>
                <span className="tabular mt-0.5 whitespace-nowrap text-[15px] font-black">{d.label.split(",")[1]?.trim()}</span>
              </button>
            );
          })}
        </div>
      </div>

      {day ? (
        <div>
          <span className={groupLabel}>Start time</span>
          <div className="grid grid-cols-3 gap-2 pb-1">
            {day.times.map((t) => {
              const on = startsAt === t.iso;
              return (
                <button
                  type="button"
                  key={t.iso}
                  aria-pressed={on}
                  onClick={() => setStartsAt(t.iso)}
                  className={cn(
                    chip,
                    "tabular h-11 rounded-full text-[14px]",
                    on ? chipOn : chipOff,
                  )}
                >
                  {local(t.iso)}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-[12px] text-muted">
            Times shown in your time zone. {first} is on {timezoneLabel}.
          </p>
        </div>
      ) : null}

      {courses.length ? (
        <label className="block">
          <span className={groupLabel}>Subject</span>
          <select name="courseId" defaultValue={defaultCourse ?? ""} className={selectClass}>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <textarea
        name="message"
        required
        rows={3}
        maxLength={2000}
        aria-label="Message for the tutor"
        className={cn(inputClass, "h-auto py-2.5 leading-relaxed")}
        placeholder="What do you want to work on? e.g. “Unit 3 test on Friday, I keep missing equilibrium problems.”"
      />
      <FormMessage error={state.error} />
      {signedIn ? (
        <button disabled={pending || !startsAt} className={violetCta}>
          <CalendarCheck className="size-4" aria-hidden />
          {pending ? "Booking…" : startsAt ? `Request ${local(startsAt)}${price ? ` · $${price.toFixed(2).replace(/\.00$/, "")}` : ""}` : "Pick a time"}
        </button>
      ) : (
        <a href={`/login?next=/tutors/${tutorId}`} className={violetCta}>
          Sign in to book
        </a>
      )}
      <p className="text-center text-[12px] text-muted">{first} confirms the time. You pay after it&apos;s confirmed.</p>
    </form>
  );
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const rowSelect = selectClass;

export function AvailabilityEditor({ initial, timezone }: { initial: { day: number; start: string; end: string }[]; timezone: string }) {
  const [rows, setRows] = useState(initial.length ? initial : [{ day: 1, start: "16:00", end: "19:00" }]);
  const [tz] = useState(timezone);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const times = Array.from({ length: 33 }, (_, i) => `${String(6 + Math.floor(i / 2)).padStart(2, "0")}:${i % 2 ? "30" : "00"}`);
  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {rows.map((r, i) => (
          <li key={i} className="grid grid-cols-[1fr_auto] gap-2 rounded-2xl bg-[#f3edff] p-2.5 ring-2 ring-[#7c3aed]/15 dark:bg-[#2a1f45]">
            <select aria-label="Day" value={r.day} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, day: Number(e.target.value) } : x)))} className={rowSelect}>
              {DAYS.map((d, j) => (
                <option key={d} value={j}>
                  {d}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setRows(rows.filter((_, j) => j !== i))}
              className="flex size-11 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-danger"
              aria-label="Remove"
            >
              <Trash2 className="size-4" />
            </button>
            <div className="col-span-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
              <select aria-label="From" value={r.start} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, start: e.target.value } : x)))} className={cn(rowSelect, "tabular")}>
                {times.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <span className="font-brand text-sm font-extrabold text-muted">to</span>
              <select aria-label="To" value={r.end} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, end: e.target.value } : x)))} className={cn(rowSelect, "tabular")}>
                {times.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => setRows([...rows, { day: ((rows.at(-1)?.day ?? 0) + 1) % 7, start: "16:00", end: "19:00" }])}
        className="press-sm inline-flex h-10 items-center gap-1.5 rounded-2xl bg-surface px-4 font-brand text-sm font-extrabold text-[#6d28d9] ring-2 ring-inset ring-line [--ledge:var(--line)] hover:bg-bg-subtle dark:text-[#c9b5ff]"
      >
        <Plus className="size-4" aria-hidden /> Add hours
      </button>
      <p className="text-[12.5px] text-muted">Time zone: {initial.length ? tz.replace(/_/g, " ") : "your device's time zone"}</p>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            let zone = tz;
            if (!initial.length) {
              try {
                zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
              } catch {}
            }
            const r = await saveAvailability(JSON.stringify(rows), zone);
            setMsg("error" in r && r.error ? { ok: false, text: r.error } : { ok: true, text: "Saved. Students can book these hours now." });
          })
        }
        className={violetCta}
      >
        {pending ? "Saving…" : "Save hours"}
      </button>
      {msg ? <Notice tone={msg.ok ? "success" : "error"}>{msg.text}</Notice> : null}
    </div>
  );
}
