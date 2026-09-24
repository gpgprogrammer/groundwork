"use client";

import { useActionState } from "react";
import { applyAsPartner, type PartnerState } from "@/app/actions/partners";
import { inputClass } from "@/components/form";
import { cn } from "@/components/ui";

const KINDS = ["Online", "Local and online", "Learning center", "Test prep", "Languages", "Free"];

export function PartnerForm() {
  const [state, action, pending] = useActionState<PartnerState, FormData>(applyAsPartner, {});
  const field = (name: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-ink-2">{label}</span>
      <input name={name} required className={inputClass} {...props} />
    </label>
  );
  return (
    <form action={action} className="space-y-4">
      <h2 className="text-lg font-bold text-ink">Apply to partner</h2>
      {field("businessName", "Business name")}
      {field("website", "Website", { type: "url", placeholder: "https://" })}
      <div className="grid gap-3 sm:grid-cols-2">
        {field("contactName", "Your name")}
        {field("email", "Work email", { type: "email" })}
      </div>
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-medium text-ink-2">Type</span>
        <select name="kind" className={inputClass}>
          {KINDS.map((k) => (
            <option key={k}>{k}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-medium text-ink-2">What students get</span>
        <textarea name="blurb" required rows={3} maxLength={300} className={cn(inputClass, "h-auto py-2.5")} placeholder="One or two sentences students will see on your card." />
      </label>
      <label className="flex items-start gap-3 rounded-xl bg-bg-subtle p-4 text-[13px] leading-relaxed text-ink-2">
        <input type="checkbox" name="agree" required className="mt-0.5 size-4 accent-[var(--accent)]" />
        We agree to pay Merit a 10% referral fee (revenue share or agreed lead fee) on students referred by Merit, and to honor the prices shown to students.
      </label>
      {state.error ? <p className="text-sm text-[#c2410c]">{state.error}</p> : null}
      <button disabled={pending} className="h-11 w-full rounded-full bg-accent text-sm font-semibold text-white disabled:opacity-60">
        {pending ? "Sending…" : "Submit application"}
      </button>
    </form>
  );
}
