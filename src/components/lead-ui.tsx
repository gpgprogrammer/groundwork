"use client";

import { useActionState } from "react";
import { logLeadSession, type BookingState } from "@/app/actions/bookings";
import { inputClass } from "./form";
import { cn } from "./ui";

export function LogSessionForm({ leadId }: { leadId: string }) {
  const [state, action, pending] = useActionState<BookingState, FormData>(logLeadSession.bind(null, leadId), {});
  return (
    <form action={action} className="mt-3 flex flex-wrap items-end gap-2">
      <label className="block">
        <span className="mb-1 block text-[12px] text-muted">Session date</span>
        <input type="date" name="date" required className={cn(inputClass, "h-9 w-40")} />
      </label>
      <label className="block">
        <span className="mb-1 block text-[12px] text-muted">Minutes</span>
        <select name="minutes" defaultValue="60" className={cn(inputClass, "h-9 w-24")}>
          {[30, 45, 60, 90, 120].map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
      </label>
      <button disabled={pending} className="h-9 rounded-full bg-ink px-4 text-[13px] font-semibold text-bg disabled:opacity-60">
        {pending ? "Logging…" : "Log session"}
      </button>
      {state.error ? <p className="w-full text-sm text-[#c2410c]">{state.error}</p> : null}
    </form>
  );
}
