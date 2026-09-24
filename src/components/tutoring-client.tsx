"use client";

import { Check, MapPin, Star } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useActionState, useState } from "react";
import { requestSession, reviewTutor, setLocation, type FormState } from "@/app/actions/tutoring";
import type { Location } from "@/lib/types";
import { Field, FormMessage, inputClass } from "./form";
import { Button, cn } from "./ui";

const locInput = "h-full bg-transparent text-[15px] text-[#0f0f0f] outline-none placeholder:text-[#909090]";

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
      className="h-11 w-full rounded-full border-0 bg-white px-4 text-[15px] text-[#0f0f0f] outline-none sm:w-80"
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
      <button onClick={() => setOpen(true)} className="flex h-11 items-center gap-2 rounded-full bg-white px-4 text-[15px] text-[#0f0f0f] hover:bg-white/90">
        <MapPin className="size-4 text-accent" />
        {[initial.city, initial.region, initial.zip].filter(Boolean).join(", ")}
        <span className="text-sm text-[#606060]">Change</span>
      </button>
    );
  }
  return (
    <form action={action} className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
      <div className="flex h-11 w-full min-w-0 items-center gap-2 rounded-full bg-white pl-4 pr-1.5 sm:w-auto">
        <MapPin className="size-4 shrink-0 text-[#2563eb]" />
        <input name="city" defaultValue={initial?.city} placeholder="City" className={locInput + " min-w-0 flex-[2] sm:w-32 sm:flex-none"} aria-label="City" />
        <span className="h-5 w-px bg-[#e5e5e5]" />
        <input name="region" defaultValue={initial?.region} placeholder="State" className={locInput + " min-w-0 flex-1 sm:w-16 sm:flex-none"} aria-label="State or region" />
        <span className="h-5 w-px bg-[#e5e5e5]" />
        <input name="zip" defaultValue={initial?.zip} placeholder="ZIP" inputMode="numeric" className={locInput + " min-w-0 flex-1 sm:w-16 sm:flex-none"} aria-label="ZIP code" />
        <input type="hidden" name="country" value={initial?.country || "United States"} />
        <button type="submit" disabled={pending} className="h-8 shrink-0 rounded-full bg-[#2563eb] px-4 text-sm font-medium text-white hover:bg-[#2563eb]/90 disabled:opacity-60">
          {pending ? "Saving…" : "Set"}
        </button>
      </div>
      {state.error ? <p className="w-full text-sm text-[#fca5a5]">{state.error}</p> : null}
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
      <div className="rounded-2xl bg-positive-soft p-6 text-center">
        <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-positive text-white">
          <Check className="size-5" />
        </span>
        <p className="mt-4 text-[16px] font-semibold text-ink">Request sent to {tutorName.split(" ")[0]}</p>
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
        <select name="courseId" defaultValue={defaultCourse ?? ""} className={inputClass}>
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
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Sending…" : "Request a session"}
      </Button>
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
  if (state.ok) return <p className="text-sm text-positive">Thanks, your review is posted.</p>;
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="tutorId" value={tutorId} />
      <input type="hidden" name="rating" value={rating} />
      <div className="flex gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} stars`} onClick={() => setRating(n)}>
            <Star className={cn("size-7", n <= rating ? "fill-[#f5b301] text-[#f5b301]" : "text-line-strong")} />
          </button>
        ))}
      </div>
      <textarea name="text" rows={3} className={cn(inputClass, "h-auto py-2.5")} placeholder="What was a session like?" maxLength={2000} />
      <FormMessage error={state.error} />
      <Button type="submit" disabled={pending || !rating}>
        {pending ? "Posting…" : "Post review"}
      </Button>
    </form>
  );
}
