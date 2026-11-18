"use client";

import { Radio, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState, useTransition } from "react";
import { acceptOnCall, requestOnCall, setOnCall, type OnCallState } from "@/app/actions/on-call";
import { Field, FormMessage, inputClass, selectClass } from "./form";
import { violetButton } from "./tutoring-ui";
import { buttonClass, cn } from "./ui";

/** Re-renders the page from the server every few seconds while it's visible (waiting screens, tutor inbox). */
export function AutoRefresh({ seconds = 5 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    const t = setInterval(tick, seconds * 1000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [router, seconds]);
  return null;
}

/** Counts up from a time: "2:05". */
export function Elapsed({ since }: { since: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const s = Math.max(0, Math.floor((now - new Date(since).getTime()) / 1000));
  return (
    <span className="tabular">
      {Math.floor(s / 60)}:{String(s % 60).padStart(2, "0")}
    </span>
  );
}

type Opt = { id: string; title: string };

export function OnCallRequestForm({
  courses,
  topics,
  defaultCourse,
  defaultTopic,
  urgency,
  lengths,
  disabled,
  rates,
}: {
  courses: Opt[];
  topics: Record<string, Opt[]>;
  defaultCourse: string;
  defaultTopic?: string;
  urgency: Record<string, string>;
  lengths: readonly number[];
  disabled?: boolean;
  /** Lowest and highest on-call rate (per hour) among tutors on call for the chosen class. */
  rates?: { min: number; max: number } | null;
}) {
  const [length, setLength] = useState(lengths[1] ?? lengths[0]);
  const price = (rate: number) => `$${(Math.round((rate * length * 100) / 60) / 100).toFixed(2).replace(/\.00$/, "")}`;
  const [state, action, pending] = useActionState<OnCallState, FormData>(requestOnCall, {});
  const [course, setCourse] = useState(defaultCourse);
  const router = useRouter();
  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Class">
          <select
            name="courseId"
            value={course}
            onChange={(e) => {
              setCourse(e.target.value);
              // The list of on-call tutors below follows the class.
              router.replace(`/tutors/on-call?course=${encodeURIComponent(e.target.value)}`, { scroll: false });
            }}
            className={selectClass}
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Topic" hint="Optional">
          <select name="topicId" defaultValue={defaultTopic ?? ""} key={course} className={selectClass}>
            <option value="">Not sure / several</option>
            {(topics[course] ?? []).map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <fieldset>
        <legend className="mb-1.5 font-brand text-[13.5px] font-extrabold text-ink">How soon is it due?</legend>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(urgency).map(([k, label], i) => (
            <label key={k} className="press-sm flex h-12 cursor-pointer items-center gap-2 rounded-2xl bg-surface px-3 text-[14px] font-bold text-ink ring-2 ring-inset ring-line [--ledge:var(--line)] has-[:checked]:bg-[#f3edff] has-[:checked]:ring-[#7c3aed] dark:has-[:checked]:bg-[#2a1f45]">
              <input type="radio" name="urgency" value={k} defaultChecked={i === 0} className="accent-[#7c3aed]" />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-1.5 font-brand text-[13.5px] font-extrabold text-ink">Session length</legend>
        <div className="grid grid-cols-3 gap-2">
          {lengths.map((m, i) => (
            <label key={m} className="press-sm flex h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-surface text-[14px] font-bold text-ink ring-2 ring-inset ring-line [--ledge:var(--line)] has-[:checked]:bg-[#f3edff] has-[:checked]:ring-[#7c3aed] dark:has-[:checked]:bg-[#2a1f45]">
              <input type="radio" name="minutes" value={m} defaultChecked={i === 1} onChange={() => setLength(m)} className="accent-[#7c3aed]" />
              {m} min
            </label>
          ))}
        </div>
      </fieldset>
      <Field label="What are you stuck on?">
        <textarea name="message" required minLength={10} rows={4} className={cn(inputClass, "h-auto py-2.5 leading-relaxed")} placeholder="e.g. Problem set on related rates due at midnight. I don't get how to set up #4 and #7." />
      </Field>
      {rates ? (
        <p className="tabular rounded-2xl bg-[#f3edff] px-4 py-3 text-[14px] leading-relaxed text-ink dark:bg-[#2a1f45]">
          <span className="font-bold">Price: {rates.min === rates.max ? price(rates.min) : `${price(rates.min)}–${price(rates.max)}`}</span> for {length} minutes. Each on-call tutor sets their own rate; you pay the rate of the tutor who accepts, and you&apos;ll see it before you join.
        </p>
      ) : null}
      <FormMessage error={state.error} />
      <button type="submit" disabled={pending || disabled} className={violetButton("lg", "w-full")}>
        <Zap className="size-4" /> {pending ? "Sending…" : disabled ? "No tutors on call for this class" : "Get a tutor now"}
      </button>
    </form>
  );
}

export function OnCallToggle({ onCall, defaultUrl, defaultRate, hours, minRate, maxRate }: { onCall: { until: string; rate?: number } | null; defaultUrl: string; defaultRate: number | null; hours: readonly number[]; minRate: number; maxRate: number }) {
  const [state, action, pending] = useActionState<OnCallState, FormData>(setOnCall, {});
  if (onCall) {
    return (
      <form action={action} className="space-y-3">
        <input type="hidden" name="off" value="1" />
        <p className="flex items-center gap-2 font-brand text-[15px] font-extrabold text-positive">
          <span className="relative flex size-3">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-positive opacity-60 motion-reduce:hidden" />
            <span className="relative inline-flex size-3 rounded-full bg-positive" />
          </span>
          On call until {new Date(onCall.until).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
        </p>
        {onCall.rate ? <p className="tabular text-[13.5px] text-muted">Your on-call rate: ${onCall.rate}/hour</p> : null}
        <FormMessage error={state.error} />
        <button disabled={pending} className={buttonClass("outline", "md", "w-full")}>
          Go off call
        </button>
      </form>
    );
  }
  return (
    <form action={action} className="space-y-3">
      <Field label="Your video link" hint="Zoom, Google Meet, or Teams">
        <input name="meetUrl" type="url" required defaultValue={defaultUrl} placeholder="https://meet.google.com/abc-defg-hij" className={inputClass} />
      </Field>
      <Field label="Your on-call rate" hint="Per hour. Students see it before they ask.">
        <label className="flex h-11 items-center gap-1 rounded-xl bg-surface px-3 ring-2 ring-line focus-within:ring-[#7c3aed]">
          <span className="font-bold text-muted">$</span>
          <input name="rate" type="number" required min={minRate} max={maxRate} step="1" defaultValue={defaultRate ?? undefined} placeholder="50" className="w-full bg-transparent font-bold text-ink outline-none" aria-label="On-call rate in dollars per hour" />
          <span className="shrink-0 text-[13px] font-semibold text-muted">/ hour</span>
        </label>
      </Field>
      <Field label="For how long?">
        <select name="hours" defaultValue={2} className={selectClass}>
          {hours.map((h) => (
            <option key={h} value={h}>
              {h} {h === 1 ? "hour" : "hours"}
            </option>
          ))}
        </select>
      </Field>
      <FormMessage error={state.error} />
      <button disabled={pending} className={violetButton("md", "w-full")}>
        <Radio className="size-4" /> {pending ? "Going on call…" : "Go on call"}
      </button>
    </form>
  );
}

export function AcceptButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <div>
      <button
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await acceptOnCall(id);
            if (r?.error) setError(r.error);
          })
        }
        className={violetButton("md", "w-full sm:w-auto")}
      >
        <Zap className="size-4" /> {pending ? "Accepting…" : "Accept and start"}
      </button>
      {error ? <p className="mt-2 text-[13px] font-semibold text-danger">{error}</p> : null}
    </div>
  );
}
