"use client";

import { Check } from "lucide-react";
import { useActionState } from "react";
import { becomeCreator, type JoinState } from "@/app/actions/creator";
import { Field, FormMessage, inputClass } from "@/components/form";
import { Button, cn } from "@/components/ui";

export function JoinForm({ courses }: { courses: { id: string; title: string }[] }) {
  const [state, action, pending] = useActionState<JoinState, FormData>(becomeCreator, {});
  return (
    <form action={action} className="space-y-5 rounded-2xl border border-line bg-surface p-6 shadow-soft sm:p-8">
      <h2 className="text-[17px] font-semibold tracking-tight text-ink">Set up your educator profile</h2>
      <Field label="Headline">
        <input name="headline" required maxLength={90} className={inputClass} placeholder="AP Chemistry teacher, 10 years" />
      </Field>
      <Field label="Bio" hint="How you teach, and who you help most">
        <textarea name="bio" required rows={5} maxLength={1200} className={cn(inputClass, "h-auto py-2.5 leading-relaxed")} />
      </Field>
      <fieldset>
        <legend className="mb-1.5 text-[13px] font-medium text-ink-2">Courses you teach</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {courses.map((c) => (
            <label key={c.id} className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-line bg-bg px-3 py-2.5 has-[:checked]:border-ink has-[:checked]:bg-surface">
              <input type="checkbox" name="courseIds" value={c.id} className="peer sr-only" />
              <span className="flex size-4 items-center justify-center rounded border border-line-strong text-bg peer-checked:border-ink peer-checked:bg-ink">
                <Check className="size-3" strokeWidth={3} />
              </span>
              <span className="text-sm text-ink">{c.title}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Hourly rate (USD)" hint="0 = no tutoring">
          <input name="hourlyRate" type="number" min={0} max={500} defaultValue={60} className={inputClass} />
        </Field>
        <Field label="Location" hint="Optional">
          <input name="location" maxLength={80} className={inputClass} placeholder="Chicago, IL" />
        </Field>
      </div>
      <FormMessage error={state.error} />
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Setting up…" : "Open my studio"}
      </Button>
    </form>
  );
}
