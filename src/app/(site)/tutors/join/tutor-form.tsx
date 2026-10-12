"use client";

import { Check, MapPin, MonitorSmartphone } from "lucide-react";
import type { ReactNode } from "react";
import { useActionState } from "react";
import { removeTutorProfile, saveTutorProfile, type FormState } from "@/app/actions/tutoring";
import { Field, FormMessage, inputClass, keepValuesOnSubmit } from "@/components/form";
import { violetButton } from "@/components/tutoring-ui";
import { cn, panel } from "@/components/ui";
import type { Tutor } from "@/lib/types";
import { TUTOR_FEE } from "@/lib/billing/plans";

type Props = { existing: Tutor | null; defaultName: string; courses: { id: string; title: string; category: string }[]; agreed: boolean };

function Step({ n, title, sub, children, i }: { n: number; title: string; sub?: string; children: ReactNode; i: number }) {
  return (
    <section className={cn(panel, "rise p-5 sm:p-7")} style={{ ["--i" as string]: i }}>
      <div className="mb-6 flex items-center gap-3.5">
        <span className="press-sm tabular flex size-12 shrink-0 items-center justify-center rounded-full bg-[#7c3aed] font-brand text-[20px] font-black text-white [--ledge:#5b21b6]">{n}</span>
        <div className="min-w-0">
          <h2 className="headline text-[22px] text-ink">{title}</h2>
          {sub ? <p className="mt-0.5 text-sm text-muted">{sub}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

const toggleCard =
  "press-sm flex min-h-12 items-center gap-2.5 rounded-2xl bg-surface px-4 py-2 font-brand text-[14.5px] leading-tight font-extrabold text-ink ring-2 ring-inset ring-line [--ledge:var(--line)] transition-[background-color,box-shadow,color,transform] duration-100 ease-out hover:bg-bg-subtle has-[:checked]:bg-[#f3edff] has-[:checked]:text-[#5b21b6] has-[:checked]:ring-[#7c3aed] has-[:checked]:[--ledge:#7c3aed] dark:has-[:checked]:bg-[#2a1f45] dark:has-[:checked]:text-[#c9b5ff]";

export function TutorForm({ existing, defaultName, courses, agreed }: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveTutorProfile, {});
  const groups = [...new Set(courses.map((c) => c.category))];
  const e = existing;
  return (
    <form onSubmit={keepValuesOnSubmit(action)} className="mt-8 space-y-5">
      <Step n={1} title="Profile" sub="What students see on your card and profile." i={1}>
        <div className="space-y-4">
          <Field label="Name">
            <input name="name" required defaultValue={e?.name ?? defaultName} className={inputClass} autoComplete="name" />
          </Field>
          <Field label="Headline" hint="One line students see first">
            <input name="headline" required maxLength={120} defaultValue={e?.headline} placeholder="AP Chemistry teacher, 8 years; patient with first-timers" className={inputClass} />
          </Field>
          <Field label="About you">
            <textarea name="bio" required rows={6} maxLength={2000} defaultValue={e?.bio} className={cn(inputClass, "h-auto py-2.5 leading-relaxed")} placeholder="How you teach, who you help most, and results your students have had." />
          </Field>
          <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
            <Field label="Years tutoring">
              <input name="yearsExperience" type="number" min={0} max={60} defaultValue={e?.yearsExperience ?? 0} className={cn(inputClass, "tabular")} inputMode="numeric" />
            </Field>
            <Field label="Credentials" hint="Optional">
              <input name="credentials" maxLength={300} defaultValue={e?.credentials} placeholder="M.S. Chemistry; AP Reader" className={inputClass} />
            </Field>
          </div>
        </div>
      </Step>

      <Step n={2} title="Subjects you tutor" sub="Pick every course you can help with." i={2}>
        <div className="space-y-5">
          {groups.map((g) => (
            <div key={g}>
              <p className="mb-2.5 font-brand text-[13px] font-extrabold text-muted">{g}</p>
              <div className="flex flex-wrap gap-2">
                {courses
                  .filter((c) => c.category === g)
                  .map((c) => (
                    <label key={c.id} className="cursor-pointer">
                      <input type="checkbox" name="courseIds" value={c.id} defaultChecked={e?.courseIds.includes(c.id)} className="peer sr-only" />
                      <span className="press-sm font-brand flex h-10 items-center gap-1.5 rounded-2xl bg-surface px-4 text-[13.5px] font-extrabold text-ink ring-2 ring-inset ring-line [--ledge:var(--line)] hover:bg-bg-subtle peer-checked:bg-[#7c3aed] peer-checked:text-white peer-checked:ring-[#7c3aed] peer-checked:[--ledge:#5b21b6] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent [&>svg]:hidden peer-checked:[&>svg]:block">
                        <Check className="size-3.5" strokeWidth={3} aria-hidden />
                        {c.title}
                      </span>
                    </label>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </Step>

      <Step n={3} title="Where and how" sub="Set where you meet students and what you charge." i={3}>
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <label className={cn(toggleCard, "cursor-pointer")}>
              <input type="checkbox" name="online" defaultChecked={e?.online ?? true} className="size-[18px] shrink-0 accent-[#7c3aed]" />
              <MonitorSmartphone className="size-4 shrink-0" aria-hidden /> Online sessions
            </label>
            <span className={cn(toggleCard, "cursor-not-allowed opacity-60")} aria-disabled="true">
              <MapPin className="size-4 shrink-0" aria-hidden /> In person (coming later)
            </span>
          </div>
          <p className="text-[13px] leading-relaxed text-muted">
            Merit lists online tutoring only for now. In-person sessions with students will open once Merit runs background checks on every in-person tutor.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="City">
              <input name="city" defaultValue={e?.city} className={inputClass} autoComplete="address-level2" />
            </Field>
            <Field label="State / region">
              <input name="region" defaultValue={e?.region} className={inputClass} autoComplete="address-level1" />
            </Field>
            <Field label="Country">
              <input name="country" defaultValue={e?.country ?? "United States"} className={inputClass} autoComplete="country-name" />
            </Field>
          </div>
          <input type="hidden" name="bookingUrl" value="" />
          <Field label="Rate (USD / hour)" hint="Blank = free" className="sm:max-w-[240px]">
            <span className="relative block">
              <span aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[15px] text-muted">
                $
              </span>
              <input name="hourlyRate" type="number" min={0} max={1000} defaultValue={e?.hourlyRate ?? ""} className={cn(inputClass, "tabular pl-7")} inputMode="numeric" />
            </span>
          </Field>
        </div>
      </Step>

      {!agreed ? (
        <section className="rise rounded-3xl bg-[#f3edff] p-5 ring-2 ring-[#7c3aed]/20 sm:p-7 dark:bg-[#2a1f45]" style={{ ["--i" as string]: 4 }}>
          <div className="flex items-center gap-3.5">
            <span className="press-sm flex size-12 shrink-0 items-center justify-center rounded-full bg-[#7c3aed] font-brand text-[20px] font-black text-white [--ledge:#5b21b6]">4</span>
            <h2 className="headline text-[22px] text-ink">Merit Partner Terms</h2>
          </div>
          <ul className="mt-4 space-y-2.5 text-[14px] leading-relaxed text-ink-2">
            {[
              TUTOR_FEE,
              "If a student pays through Merit, the 10% is deducted automatically and the rest is paid out to you. If they pay you directly for a session booked on Merit, Merit bills the 10% after the session.",
              "Sessions a student books with you outside Merit are yours alone. Merit takes nothing from them.",
              "Keep your profile honest. Reviews come from real Merit students and can't be edited or bought.",
            ].map((t) => (
              <li key={t} className="flex gap-2.5">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#7c3aed] text-white">
                  <Check className="size-3" strokeWidth={3.5} aria-hidden />
                </span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
          <label className="mt-5 flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl bg-surface px-4 py-3 font-brand text-[15px] font-extrabold text-ink ring-2 ring-inset ring-line has-[:checked]:ring-[#7c3aed]">
            <input type="checkbox" name="agreeTerms" required className="size-[18px] shrink-0 accent-[#7c3aed]" /> I agree to the Merit Partner Terms.
          </label>
        </section>
      ) : null}

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
        <div className="sm:order-1 sm:flex-1">
          <FormMessage error={state.error} />
        </div>
        <button type="submit" disabled={pending} className={violetButton("lg", "w-full sm:order-3 sm:w-auto")}>
          {pending ? "Saving…" : e ? "Save changes" : "Publish my listing"}
        </button>
        {e ? (
          <button formAction={removeTutorProfile} formNoValidate className="h-11 rounded-2xl px-4 font-brand text-sm font-extrabold text-muted transition-colors hover:bg-danger-soft hover:text-danger sm:order-2">
            Remove my listing
          </button>
        ) : null}
      </div>
    </form>
  );
}
