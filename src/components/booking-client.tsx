"use client";

import { CalendarCheck, Plus, Trash2 } from "lucide-react";
import { useActionState, useState, useTransition } from "react";
import { createBooking, saveAvailability, type BookingState } from "@/app/actions/bookings";
import type { DaySlots } from "@/lib/bookings";
import { inputClass } from "./form";
import { cn } from "./ui";

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
  const local = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  if (!Object.values(slots).some((d) => d.length)) {
    return <p className="rounded-xl bg-bg-subtle p-4 text-[14px] text-ink-2">{tutorName.split(" ")[0]} hasn&apos;t posted open hours yet. Send a message below and they&apos;ll reply with times.</p>;
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="tutorId" value={tutorId} />
      <input type="hidden" name="startsAt" value={startsAt} />
      <div className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-label="Session length">
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
            <span className="flex h-9 items-center justify-center rounded-lg text-[13px] font-medium ring-1 ring-line-strong peer-checked:bg-ink peer-checked:text-bg peer-checked:ring-ink">{m} min</span>
          </label>
        ))}
      </div>
      <div className="scrollbar-none -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {days.map((d) => (
          <button
            type="button"
            key={d.date}
            onClick={() => {
              setDate(d.date);
              setStartsAt("");
            }}
            className={cn("flex h-14 w-16 shrink-0 flex-col items-center justify-center rounded-xl text-[12px] ring-1", day?.date === d.date ? "bg-accent text-white ring-accent" : "text-ink-2 ring-line-strong hover:bg-bg-subtle")}
          >
            <span className="font-semibold">{d.label.split(",")[0]}</span>
            <span>{d.label.split(",")[1]?.trim()}</span>
          </button>
        ))}
      </div>
      {day ? (
        <div className="grid grid-cols-3 gap-1.5">
          {day.times.map((t) => (
            <button
              type="button"
              key={t.iso}
              onClick={() => setStartsAt(t.iso)}
              className={cn("h-9 rounded-lg text-[13px] font-medium ring-1", startsAt === t.iso ? "bg-accent text-white ring-accent" : "text-ink ring-line-strong hover:bg-bg-subtle")}
            >
              {local(t.iso)}
            </button>
          ))}
        </div>
      ) : null}
      <p className="text-[11.5px] text-muted">Times shown in your time zone. {tutorName.split(" ")[0]} is on {timezoneLabel}.</p>
      {courses.length ? (
        <select name="courseId" defaultValue={defaultCourse ?? ""} className={inputClass}>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      ) : null}
      <textarea name="message" required rows={3} maxLength={2000} className={cn(inputClass, "h-auto py-2.5")} placeholder="What do you want to work on? e.g. “Unit 3 test on Friday, I keep missing equilibrium problems.”" />
      {state.error ? <p className="text-sm text-[#c2410c]">{state.error}</p> : null}
      {signedIn ? (
        <button disabled={pending || !startsAt} className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-accent text-sm font-semibold text-white disabled:opacity-50">
          <CalendarCheck className="size-4" /> {pending ? "Booking…" : startsAt ? `Request ${local(startsAt)}${price ? ` · $${price.toFixed(2).replace(/\.00$/, "")}` : ""}` : "Pick a time"}
        </button>
      ) : (
        <a href={`/login?next=/tutors/${tutorId}`} className="flex h-11 w-full items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
          Sign in to book
        </a>
      )}
      <p className="text-center text-[11.5px] text-muted">{tutorName.split(" ")[0]} confirms the time. You pay after it&apos;s confirmed.</p>
    </form>
  );
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function AvailabilityEditor({ initial, timezone }: { initial: { day: number; start: string; end: string }[]; timezone: string }) {
  const [rows, setRows] = useState(initial.length ? initial : [{ day: 1, start: "16:00", end: "19:00" }]);
  const [tz] = useState(timezone);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const times = Array.from({ length: 33 }, (_, i) => `${String(6 + Math.floor(i / 2)).padStart(2, "0")}:${i % 2 ? "30" : "00"}`);
  return (
    <div className="space-y-3">
      {rows.map((r, i) => (
        <div key={i} className="flex flex-wrap items-center gap-2">
          <select value={r.day} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, day: Number(e.target.value) } : x)))} className="h-9 rounded-lg bg-bg px-2 text-sm ring-1 ring-line-strong">
            {DAYS.map((d, j) => (
              <option key={d} value={j}>
                {d}
              </option>
            ))}
          </select>
          <select value={r.start} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, start: e.target.value } : x)))} className="h-9 rounded-lg bg-bg px-2 text-sm ring-1 ring-line-strong">
            {times.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <span className="text-sm text-muted">to</span>
          <select value={r.end} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, end: e.target.value } : x)))} className="h-9 rounded-lg bg-bg px-2 text-sm ring-1 ring-line-strong">
            {times.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <button type="button" onClick={() => setRows(rows.filter((_, j) => j !== i))} className="flex size-9 items-center justify-center rounded-full text-muted hover:bg-bg-subtle" aria-label="Remove">
            <Trash2 className="size-4" />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => setRows([...rows, { day: ((rows.at(-1)?.day ?? 0) + 1) % 7, start: "16:00", end: "19:00" }])} className="inline-flex items-center gap-1.5 text-sm font-medium text-accent">
        <Plus className="size-4" /> Add hours
      </button>
      <p className="text-[12.5px] text-muted">Time zone: {initial.length ? tz : "your device's time zone"}</p>
      <div className="flex items-center gap-3">
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
              setMsg("error" in r && r.error ? r.error : "Saved. Students can book these hours now.");
            })
          }
          className="h-10 rounded-full bg-ink px-5 text-sm font-semibold text-bg disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save hours"}
        </button>
        {msg ? <p className="text-sm text-muted">{msg}</p> : null}
      </div>
    </div>
  );
}
