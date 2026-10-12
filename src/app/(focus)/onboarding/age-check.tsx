"use client";

import { useActionState, useState } from "react";
import { confirmAge, type AgeState } from "@/app/actions/age";
import { FormMessage } from "@/components/form";
import { buttonClass, cn } from "@/components/ui";
import { ageFrom, MIN_AGE, TOO_YOUNG } from "@/lib/company";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const YEARS = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);
const select =
  "h-12 w-full appearance-none rounded-2xl border-2 border-line-strong bg-surface px-4 text-[16px] text-ink outline-none focus:border-accent focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--accent)_18%,transparent)]";

/** One question before onboarding, for students who signed up with Google or Apple. */
export function AgeCheck({ firstName, next }: { firstName: string; next: string }) {
  const [state, action, pending] = useActionState<AgeState, FormData>(confirmAge, {});
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const tooYoung = month && year ? ageFrom(Number(month), Number(year)) < MIN_AGE : false;
  return (
    <div className="flex flex-1 justify-center px-5 pb-20 pt-[6vh]">
      <form action={action} className="rise w-full max-w-md space-y-5">
        <h1 className="display text-[34px] text-ink sm:text-[40px]">Welcome, {firstName}. One quick question.</h1>
        <p className="text-[15px] text-muted">Merit is for students {MIN_AGE} and older. When were you born? We only keep the month and year.</p>
        <input type="hidden" name="next" value={next} />
        <div className="grid grid-cols-2 gap-3">
          <select name="birthMonth" required aria-label="Birth month" value={month} onChange={(e) => setMonth(e.target.value)} className={select}>
            <option value="">Month</option>
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
          <select name="birthYear" required aria-label="Birth year" value={year} onChange={(e) => setYear(e.target.value)} className={select}>
            <option value="">Year</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        {tooYoung ? (
          <p className="rounded-2xl bg-warn-soft px-4 py-3 text-[14px] leading-relaxed text-ink" role="alert">
            {TOO_YOUNG} Continuing will delete the account you just made.
          </p>
        ) : null}
        <FormMessage error={state.error} />
        <button type="submit" disabled={pending || !month || !year} className={cn(buttonClass("primary", "lg"), "w-full")}>
          {pending ? "Saving…" : tooYoung ? "Delete my account" : "Continue"}
        </button>
      </form>
    </div>
  );
}
