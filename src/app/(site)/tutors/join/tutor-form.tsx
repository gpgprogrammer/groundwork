"use client";

import { useActionState } from "react";
import { removeTutorProfile, saveTutorProfile, type FormState } from "@/app/actions/tutoring";
import { Field, FormMessage, inputClass } from "@/components/form";
import { Button, cn } from "@/components/ui";
import type { Tutor } from "@/lib/types";

type Props = { existing: Tutor | null; defaultName: string; courses: { id: string; title: string; category: string }[]; agreed: boolean };

export function TutorForm({ existing, defaultName, courses, agreed }: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveTutorProfile, {});
  const groups = [...new Set(courses.map((c) => c.category))];
  const e = existing;
  return (
    <form action={action} className="mt-8 space-y-6">
      <section className="space-y-4 rounded-2xl p-6 ring-1 ring-line">
        <h2 className="text-lg font-bold text-ink">Profile</h2>
        <Field label="Name">
          <input name="name" required defaultValue={e?.name ?? defaultName} className={inputClass} />
        </Field>
        <Field label="Headline" hint="One line students see first">
          <input name="headline" required maxLength={120} defaultValue={e?.headline} placeholder="AP Chemistry teacher, 8 years; patient with first-timers" className={inputClass} />
        </Field>
        <Field label="About you">
          <textarea name="bio" required rows={6} maxLength={2000} defaultValue={e?.bio} className={cn(inputClass, "h-auto py-2.5 leading-relaxed")} placeholder="How you teach, who you help most, and results your students have had." />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Years tutoring">
            <input name="yearsExperience" type="number" min={0} max={60} defaultValue={e?.yearsExperience ?? 0} className={inputClass} />
          </Field>
          <Field label="Credentials" hint="Optional">
            <input name="credentials" maxLength={300} defaultValue={e?.credentials} placeholder="M.S. Chemistry; AP Reader" className={inputClass} />
          </Field>
        </div>
      </section>

      <section className="rounded-2xl p-6 ring-1 ring-line">
        <h2 className="text-lg font-bold text-ink">Subjects you tutor</h2>
        <div className="mt-4 space-y-4">
          {groups.map((g) => (
            <div key={g}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{g}</p>
              <div className="flex flex-wrap gap-2">
                {courses
                  .filter((c) => c.category === g)
                  .map((c) => (
                    <label key={c.id} className="cursor-pointer">
                      <input type="checkbox" name="courseIds" value={c.id} defaultChecked={e?.courseIds.includes(c.id)} className="peer sr-only" />
                      <span className="flex h-8 items-center gap-1.5 rounded-full bg-bg-subtle px-3 text-[13px] font-medium text-ink peer-checked:bg-accent peer-checked:text-white">
                        {c.title}
                      </span>
                    </label>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl p-6 ring-1 ring-line">
        <h2 className="text-lg font-bold text-ink">Where and how</h2>
        <div className="flex flex-wrap gap-5">
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" name="online" defaultChecked={e?.online ?? true} className="size-4 accent-[var(--accent)]" /> Online sessions
          </label>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" name="inPerson" defaultChecked={e?.inPerson ?? false} className="size-4 accent-[var(--accent)]" /> In person
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="City">
            <input name="city" defaultValue={e?.city} className={inputClass} />
          </Field>
          <Field label="State / region">
            <input name="region" defaultValue={e?.region} className={inputClass} />
          </Field>
          <Field label="Country">
            <input name="country" defaultValue={e?.country ?? "United States"} className={inputClass} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
          <input type="hidden" name="bookingUrl" value="" />
          <Field label="Rate (USD / hour)" hint="Blank = free">
            <input name="hourlyRate" type="number" min={0} max={1000} defaultValue={e?.hourlyRate ?? ""} className={inputClass} />
          </Field>

        </div>
      </section>

      {!agreed ? (
        <section className="rounded-2xl bg-bg-subtle p-6">
          <h2 className="text-lg font-bold text-ink">Merit Partner Terms</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[14px] leading-relaxed text-ink-2">
            <li>Listing is free. Merit earns a 10% referral fee on sessions students book with you through Merit.</li>
            <li>If students pay through Merit, the fee is deducted automatically and the rest is paid out to you. If they pay you directly, Merit bills the 10% after the session.</li>
            <li>The fee applies to every session with a student Merit referred to you (anyone who booked or messaged you through Merit) for 12 months, whether they book here or with you directly. Log sessions held outside Merit from your dashboard.</li>
            <li>Keep your profile honest. Reviews come from real Merit students and can&apos;t be edited or bought.</li>
          </ul>
          <label className="mt-4 flex items-start gap-3 text-[14px] font-medium text-ink">
            <input type="checkbox" name="agreeTerms" required className="mt-0.5 size-4 accent-[var(--accent)]" /> I agree to the Merit Partner Terms.
          </label>
        </section>
      ) : null}

      <div className="flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <FormMessage error={state.error} />
        <Button type="submit" size="lg" disabled={pending} className="sm:ml-auto">
          {pending ? "Saving…" : e ? "Save changes" : "Publish my listing"}
        </Button>
      </div>
      {e ? (
        <button formAction={removeTutorProfile} formNoValidate className="text-sm text-muted hover:text-ink">
          Remove my listing
        </button>
      ) : null}
    </form>
  );
}
