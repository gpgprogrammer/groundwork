"use client";

import { useActionState } from "react";
import { logLeadSession, type BookingState } from "@/app/actions/bookings";
import { FormMessage, inputClass, selectClass } from "./form";
import { cn } from "./ui";

export function LogSessionForm({ leadId }: { leadId: string }) {
  const [state, action, pending] = useActionState<BookingState, FormData>(logLeadSession.bind(null, leadId), {});
  return (
    <form action={action} className="mt-4 grid grid-cols-2 items-end gap-2 sm:flex sm:flex-wrap">
      <label className="block min-w-0">
        <span className="mb-1.5 block font-brand text-[13px] font-extrabold text-ink-2">Session date</span>
        <input type="date" name="date" required className={cn(inputClass, "sm:w-44")} />
      </label>
      <label className="block min-w-0">
        <span className="mb-1.5 block font-brand text-[13px] font-extrabold text-ink-2">Minutes</span>
        <select name="minutes" defaultValue="60" className={cn(selectClass, "tabular sm:w-28")}>
          {[30, 45, 60, 90, 120].map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
      </label>
      <button disabled={pending} className="press font-brand col-span-2 inline-flex h-11 items-center justify-center rounded-2xl bg-[#7c3aed] px-5 text-sm font-extrabold text-white hover:brightness-110 disabled:opacity-50 sm:col-span-1 [--ledge:#5b21b6]">
        {pending ? "Logging…" : "Log session"}
      </button>
      {state.error ? (
        <div className="col-span-2 w-full">
          <FormMessage error={state.error} />
        </div>
      ) : null}
    </form>
  );
}
