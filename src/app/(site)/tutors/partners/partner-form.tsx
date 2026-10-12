"use client";

import { useActionState } from "react";
import { applyAsPartner, type PartnerState } from "@/app/actions/partners";
import { Field, FormMessage, inputClass, selectClass } from "@/components/form";
import { cn } from "@/components/ui";

const KINDS = ["Online", "Local and online", "Learning center", "Test prep", "Languages", "Free"];

export function PartnerForm() {
  const [state, action, pending] = useActionState<PartnerState, FormData>(applyAsPartner, {});
  const field = (name: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <Field label={label}>
      <input name={name} required className={inputClass} {...props} />
    </Field>
  );
  return (
    <form action={action} className="space-y-4">
      <div className="mb-2">
        <h2 className="headline text-[24px] text-ink">Apply to partner</h2>
        <p className="mt-1 text-sm text-muted">We&apos;ll reply by email to set up tracking and terms.</p>
      </div>
      {field("businessName", "Business name", { autoComplete: "organization" })}
      {field("website", "Website", { type: "url", placeholder: "https://", inputMode: "url" })}
      <div className="grid gap-4 sm:grid-cols-2">
        {field("contactName", "Your name", { autoComplete: "name" })}
        {field("email", "Work email", { type: "email", autoComplete: "email" })}
      </div>
      <Field label="Type">
        <select name="kind" className={selectClass}>
          {KINDS.map((k) => (
            <option key={k}>{k}</option>
          ))}
        </select>
      </Field>
      <Field label="What students get">
        <textarea name="blurb" required rows={3} maxLength={300} className={cn(inputClass, "h-auto py-2.5 leading-relaxed")} placeholder="One or two sentences students will see on your card." />
      </Field>
      <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-bg-subtle p-4 text-[13.5px] leading-relaxed text-ink-2 ring-2 ring-inset ring-line has-[:checked]:bg-[#f3edff] has-[:checked]:ring-[#7c3aed] dark:has-[:checked]:bg-[#2a1f45]">
        <input type="checkbox" name="agree" required className="mt-0.5 size-[18px] shrink-0 accent-[#7c3aed]" />
        We agree to pay Merit 10% of sessions students book through Merit, and nothing else, and to honor the prices shown to students.
      </label>
      <FormMessage error={state.error} />
      <button
        type="submit"
        disabled={pending}
        className="press inline-flex h-[52px] w-full items-center justify-center rounded-2xl bg-[#7c3aed] px-7 font-brand text-[16.5px] font-extrabold text-white [--ledge:#5b21b6] hover:brightness-110 disabled:pointer-events-none disabled:opacity-50"
      >
        {pending ? "Sending…" : "Submit application"}
      </button>
    </form>
  );
}
