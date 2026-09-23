"use client";

import { Check } from "lucide-react";
import { useActionState } from "react";
import { updateProfile, type ProfileFormState } from "@/app/actions/learning";
import { Field, FormMessage, inputClass } from "@/components/form";
import { Button, cn } from "@/components/ui";

type Props = {
  email: string;
  initial: { name: string; courseIds: string[]; examDate: string; goal: string };
  courses: { id: string; title: string; exam: string }[];
};

export function ProfileForm({ email, initial, courses }: Props) {
  const [state, action, pending] = useActionState<ProfileFormState, FormData>(updateProfile, {});
  return (
    <form action={action} className="space-y-10">
      <section className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="text-[15px] font-semibold text-ink">Profile</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Name">
            <input name="name" defaultValue={initial.name} required className={inputClass} autoComplete="name" />
          </Field>
          <Field label="Email">
            <input value={email} disabled className={cn(inputClass, "cursor-not-allowed text-muted")} />
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="text-[15px] font-semibold text-ink">What you&apos;re studying</h2>
        <p className="mt-1 text-sm text-muted">This shapes your home page and recommendations.</p>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {courses.map((c) => (
            <label
              key={c.id}
              className="group flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-bg px-3.5 py-3 transition-colors has-[:checked]:border-ink has-[:checked]:bg-surface"
            >
              <input type="checkbox" name="courseIds" value={c.id} defaultChecked={initial.courseIds.includes(c.id)} className="peer sr-only" />
              <span className="flex size-4 items-center justify-center rounded border border-line-strong text-bg peer-checked:border-ink peer-checked:bg-ink">
                <Check className="size-3" strokeWidth={3} />
              </span>
              <span className="text-sm text-ink">{c.title}</span>
            </label>
          ))}
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Exam date" hint="Optional">
            <input type="date" name="examDate" defaultValue={initial.examDate} className={inputClass} />
          </Field>
          <Field label="Your goal" hint="Optional">
            <input name="goal" defaultValue={initial.goal} maxLength={120} placeholder="e.g. a 5 on Calc BC" className={inputClass} />
          </Field>
        </div>
      </section>

      <div className="flex items-center justify-end gap-4">
        <FormMessage error={state.error} ok={state.ok && "Saved."} />
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
