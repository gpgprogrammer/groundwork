"use client";

import { Flag, Loader2, X } from "lucide-react";
import { useState, useTransition } from "react";
import { reportContent } from "@/app/actions/moderation";
import { REPORT_REASONS } from "@/lib/report-reasons";
import type { ReportKind } from "@/lib/types";
import { inputClass } from "./form";
import { cn } from "./ui";

/** "Report" link that opens a short form. Reports go to Merit's admins. */
export function ReportButton({ kind, targetId, className }: { kind: ReportKind; targetId: string; signedIn?: boolean; className?: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>("");
  const [details, setDetails] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const submit = () =>
    start(async () => {
      const r = await reportContent({ kind, targetId, reason: reason as (typeof REPORT_REASONS)[number], details });
      if (r.ok) setDone(true);
      else setError(r.error ?? "Couldn't send that. Try again.");
    });

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={cn("inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-ink", className)}>
        <Flag className="size-3.5" /> Report
      </button>
      {open ? (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 p-4 sm:items-center" onClick={() => setOpen(false)}>
          <div role="dialog" aria-modal="true" aria-labelledby="report-title" onClick={(e) => e.stopPropagation()} className="relative w-full max-w-md rounded-3xl bg-bg p-6 shadow-2xl ring-1 ring-line">
            <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full text-muted hover:bg-bg-subtle hover:text-ink">
              <X className="size-5" />
            </button>
            {done ? (
              <>
                <h2 id="report-title" className="text-lg font-bold text-ink">
                  Thanks for letting us know
                </h2>
                <p className="mt-2 text-[14.5px] text-ink-2">Merit&apos;s team will review it. If someone is in danger, contact local emergency services right away.</p>
                <button type="button" onClick={() => setOpen(false)} className="mt-5 h-10 rounded-full bg-ink px-5 text-sm font-semibold text-bg">
                  Done
                </button>
              </>
            ) : (
              <>
                <h2 id="report-title" className="text-lg font-bold text-ink">
                  Report this
                </h2>
                <p className="mt-1 text-[13.5px] text-muted">What&apos;s wrong? Reports are private.</p>
                <div className="mt-4 space-y-2">
                  {REPORT_REASONS.map((r) => (
                    <label key={r} className={cn("flex cursor-pointer items-center gap-3 rounded-xl px-3.5 py-2.5 text-[14px] ring-1", reason === r ? "bg-accent-soft ring-accent" : "ring-line hover:bg-bg-subtle")}>
                      <input type="radio" name="reason" value={r} checked={reason === r} onChange={() => setReason(r)} className="accent-[var(--accent)]" />
                      {r}
                    </label>
                  ))}
                </div>
                <label className="mt-4 block">
                  <span className="mb-1.5 block text-[13px] font-medium text-ink-2">Details (optional)</span>
                  <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={3} maxLength={1000} className={cn(inputClass, "h-auto py-2.5")} />
                </label>
                {error ? <p className="mt-2 text-sm text-[#c2410c]">{error}</p> : null}
                <button type="button" onClick={submit} disabled={!reason || pending} className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-bg disabled:opacity-50">
                  {pending ? <Loader2 className="size-4 animate-spin" /> : null} Send report
                </button>
              </>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
