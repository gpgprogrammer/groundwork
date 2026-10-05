"use client";

import { Check, MapPin, Star } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useActionState, useState } from "react";
import { requestSession, reviewTutor, setLocation, type FormState } from "@/app/actions/tutoring";
import type { Location } from "@/lib/types";
import { Field, FormMessage, inputClass, selectClass } from "./form";
import { Button, cn, Notice } from "./ui";
import { greetingName } from "@/lib/names";

const violetBtn =
  "press inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-[#7c3aed] px-7 font-brand text-[16.5px] font-extrabold text-white [--ledge:#5b21b6] hover:brightness-110 disabled:pointer-events-none disabled:opacity-50";
const locInput = "h-full bg-transparent text-[15px] text-ink outline-none placeholder:text-faint focus-visible:outline-none";

export function SubjectSelect({ courses, value }: { courses: { id: string; title: string; category: string }[]; value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const groups = [...new Set(courses.map((c) => c.category))];
  return (
    <select
      value={value}
      onChange={(e) => {
        const next = new URLSearchParams(params.toString());
        if (e.target.value) next.set("course", e.target.value);
        else next.delete("course");
        router.replace(`${pathname}?${next}`, { scroll: false });
      }}
      className={cn(selectClass, "h-12 rounded-2xl bg-bg-subtle px-4 font-brand text-[15.5px] font-extrabold ring-2 ring-line focus:ring-[#7c3aed] lg:w-80")}
      aria-label="Subject"
    >
      <option value="">All subjects</option>
      {groups.map((g) => (
        <optgroup key={g} label={g}>
          {courses
            .filter((c) => c.category === g)
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
        </optgroup>
      ))}
    </select>
  );
}

export function LocationForm({ initial }: { initial: Location | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(!initial);
  const [state, action, pending] = useActionState<FormState, FormData>(async (prev, fd) => {
    const r = await setLocation(prev, fd);
    if (r.ok) {
      setOpen(false);
      router.refresh();
    }
    return r;
  }, {});
  if (!open && initial) {
    return (
      <button onClick={() => setOpen(true)} className="press flex h-12 min-w-0 items-center gap-2 rounded-2xl bg-bg-subtle px-4 font-brand text-[15px] font-extrabold text-ink ring-2 ring-inset ring-line transition-colors [--ledge:var(--line)] hover:bg-line/60 lg:flex-1">
        <MapPin className="size-4 shrink-0 text-[#6d28d9] dark:text-[#c9b5ff]" />
        <span className="min-w-0 truncate">{[initial.city, initial.region, initial.zip].filter(Boolean).join(", ")}</span>
        <span className="ml-auto shrink-0 text-sm text-[#6d28d9] dark:text-[#c9b5ff]">Change</span>
      </button>
    );
  }
  return (
    <form action={action} className="flex w-full min-w-0 flex-wrap items-center gap-2 lg:flex-1">
      <div className="flex h-12 w-full min-w-0 items-center gap-2 rounded-2xl bg-bg-subtle pl-4 pr-1.5 ring-2 ring-inset ring-line focus-within:ring-[#7c3aed]">
        <MapPin className="size-4 shrink-0 text-[#6d28d9] dark:text-[#c9b5ff]" />
        <input name="city" defaultValue={initial?.city} placeholder="City" className={locInput + " min-w-0 flex-[2] sm:flex-[2]"} aria-label="City" />
        <span className="h-5 w-px bg-line" />
        <input name="region" defaultValue={initial?.region} placeholder="State" className={locInput + " min-w-0 flex-1 sm:flex-1"} aria-label="State or region" />
        <span className="h-5 w-px bg-line" />
        <input name="zip" defaultValue={initial?.zip} placeholder="ZIP" inputMode="numeric" className={locInput + " min-w-0 flex-1 sm:flex-1"} aria-label="ZIP code" />
        <input type="hidden" name="country" value={initial?.country || "United States"} />
        <button type="submit" disabled={pending} className="press-sm font-brand h-9 shrink-0 rounded-xl bg-[#7c3aed] px-4 text-sm font-extrabold text-white hover:brightness-110 disabled:opacity-60 [--ledge:#5b21b6]">
          {pending ? "Saving…" : "Set"}
        </button>
      </div>
      {state.error ? <p className="w-full text-sm font-medium text-danger" role="alert">{state.error}</p> : null}
    </form>
  );
}

export function RequestSessionForm({
  tutorId,
  tutorName,
  courses,
  defaultCourse,
  prefill,
}: {
  tutorId: string;
  tutorName: string;
  courses: { id: string; title: string }[];
  defaultCourse: string | null;
  prefill?: { name: string; email: string };
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(requestSession, {});
  if (state.ok) {
    return (
      <div className="fade rounded-3xl bg-positive-soft p-6 text-center">
        <span className="check-pop mx-auto flex size-14 items-center justify-center rounded-full bg-positive text-white shadow-[0_4px_0_0_var(--positive-press)]">
          <Check className="size-7" strokeWidth={3} />
        </span>
        <p className="mt-4 font-brand text-[18px] font-extrabold text-ink">Request sent to {greetingName(tutorName)}</p>
        <p className="mt-1 text-sm text-ink-2">They&apos;ll reply to you by email to set up a time.</p>
      </div>
    );
  }
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="tutorId" value={tutorId} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Your name">
          <input name="name" required defaultValue={prefill?.name} className={inputClass} autoComplete="name" />
        </Field>
        <Field label="Email">
          <input name="email" type="email" required defaultValue={prefill?.email} className={inputClass} autoComplete="email" />
        </Field>
      </div>
      <Field label="Subject">
        <select name="courseId" defaultValue={defaultCourse ?? ""} className={selectClass}>
          <option value="">Choose a subject</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </Field>
      <Field label="What do you need help with?">
        <textarea name="message" required rows={4} className={cn(inputClass, "h-auto py-2.5 leading-relaxed")} placeholder="e.g. I'm struggling with related rates and my unit test is in two weeks." />
      </Field>
      <Field label="When are you free?" hint="Optional">
        <input name="availability" className={inputClass} placeholder="Weeknights after 6pm, Sunday mornings" />
      </Field>
      <FormMessage error={state.error} />
      <button type="submit" className={violetBtn} disabled={pending}>
        {pending ? "Sending…" : "Request a session"}
      </button>
      <p className="text-center text-xs text-muted">Free to request. You&apos;ll arrange details and payment directly with the tutor.</p>
    </form>
  );
}

export function ReviewForm({ tutorId, signedIn }: { tutorId: string; signedIn: boolean }) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [state, action, pending] = useActionState<FormState, FormData>(async (prev, fd) => {
    const r = await reviewTutor(prev, fd);
    if (r.ok) router.refresh();
    return r;
  }, {});
  if (!signedIn) return <p className="text-sm text-muted">Sign in to review this tutor.</p>;
  if (state.ok) return <Notice tone="success">Thanks, your review is posted.</Notice>;
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="tutorId" value={tutorId} />
      <input type="hidden" name="rating" value={rating} />
      <div className="flex gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n} stars`}
            onClick={() => setRating(n)}
            className={cn(
              "flex size-12 items-center justify-center rounded-2xl transition-[transform,background-color] duration-150 ease-out active:scale-[0.9]",
              n <= rating ? "bg-[#fff4d1] dark:bg-[#3a2f10]" : "hover:bg-surface",
            )}
          >
            <Star className={cn("size-7 transition-colors duration-150", n <= rating ? "fill-[#f5b301] text-[#f5b301]" : "text-line-strong")} />
          </button>
        ))}
      </div>
      <textarea name="text" rows={3} aria-label="Your review" className={cn(inputClass, "h-auto py-2.5 leading-relaxed")} placeholder="What was a session like?" maxLength={2000} />
      <FormMessage error={state.error} />
      <Button type="submit" variant="dark" disabled={pending || !rating}>
        {pending ? "Posting…" : "Post review"}
      </Button>
    </form>
  );
}
