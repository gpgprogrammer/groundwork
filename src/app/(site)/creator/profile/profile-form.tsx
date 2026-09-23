"use client";

import { useActionState } from "react";
import { updateEducatorProfile, type EducatorFormState } from "@/app/actions/creator";
import { Field, FormMessage, inputClass } from "@/components/form";
import { Button, cn } from "@/components/ui";

type Initial = { headline: string; bio: string; hourlyRate: number; acceptingStudents: boolean; bookingUrl: string; subjects: string };

export function EducatorProfileForm({ initial }: { initial: Initial }) {
  const [state, action, pending] = useActionState<EducatorFormState, FormData>(updateEducatorProfile, {});
  return (
    <form action={action} className="mt-10 space-y-8">
      <section className="space-y-5 rounded-2xl border border-line bg-surface p-6">
        <Field label="Headline" hint="One line, shown under your name">
          <input name="headline" required maxLength={90} defaultValue={initial.headline} className={inputClass} />
        </Field>
        <Field label="Bio">
          <textarea name="bio" required rows={6} maxLength={1200} defaultValue={initial.bio} className={cn(inputClass, "h-auto py-2.5 leading-relaxed")} />
        </Field>
        <Field label="Subjects" hint="Comma separated">
          <input name="subjects" defaultValue={initial.subjects} className={inputClass} />
        </Field>
      </section>

      <section className="space-y-5 rounded-2xl border border-line bg-surface p-6">
        <div>
          <h2 className="text-[15px] font-semibold text-ink">Tutoring</h2>
          <p className="mt-1 text-sm text-muted">
            Students see “Liked this lesson? Learn with you” after your lessons. Requests arrive in your studio inbox, or go to your own
            booking page if you add one.
          </p>
        </div>
        <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-line bg-bg px-4 py-3">
          <span>
            <span className="block text-sm font-medium text-ink">Accepting new students</span>
            <span className="block text-xs text-muted">Turn off when your schedule is full.</span>
          </span>
          <input type="checkbox" name="acceptingStudents" defaultChecked={initial.acceptingStudents} className="peer sr-only" />
          <span className="relative h-6 w-10 shrink-0 rounded-full bg-line-strong transition-colors after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-ink peer-checked:after:translate-x-4" />
        </label>
        <div className="grid gap-5 sm:grid-cols-[160px_1fr]">
          <Field label="Hourly rate (USD)">
            <input name="hourlyRate" type="number" min={0} max={500} required defaultValue={initial.hourlyRate} className={inputClass} />
          </Field>
          <Field label="External booking link" hint="Optional, e.g. Calendly">
            <input name="bookingUrl" type="url" defaultValue={initial.bookingUrl} placeholder="https://" className={inputClass} />
          </Field>
        </div>
      </section>

      <div className="flex items-center justify-end gap-4">
        <FormMessage error={state.error} ok={state.ok && "Profile updated."} />
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save profile"}
        </Button>
      </div>
    </form>
  );
}
