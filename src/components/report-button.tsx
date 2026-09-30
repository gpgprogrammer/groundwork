"use client";

import { CircleCheck, Flag, Loader2, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { reportContent } from "@/app/actions/moderation";
import { REPORT_REASONS } from "@/lib/report-reasons";
import type { ReportKind } from "@/lib/types";
import { inputClass } from "./form";
import { buttonClass, cn } from "./ui";

/** "Report" link that opens a short form. Reports go to Merit's admins. */
export function ReportButton({ kind, targetId, className, onDark }: { kind: ReportKind; targetId: string; signedIn?: boolean; className?: string; onDark?: boolean }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>("");
  const [details, setDetails] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const submit = () =>
    start(async () => {
      const r = await reportContent({
        kind,
        targetId,
        reason: reason as (typeof REPORT_REASONS)[number],
        details,
      });
      if (r.ok) setDone(true);
      else setError(r.error ?? "Couldn't send that. Try again.");
    });

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex min-h-9 items-center gap-1.5 rounded-full font-brand text-[13px] font-extrabold transition-colors duration-150",
          onDark ? "text-white/75 hover:text-white" : "text-muted hover:text-ink",
          className,
        )}
      >
        <Flag className="size-3.5" /> Report
      </button>
      {/* Portaled to <body> so an animated (transformed) ancestor can't trap the fixed overlay. */}
      {open
        ? createPortal(
            <div className="fade fixed inset-0 z-[70] flex items-end justify-center bg-ink/40 backdrop-blur-[2px] sm:items-center sm:p-4" onClick={() => setOpen(false)}>
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="report-title"
                onClick={(e) => e.stopPropagation()}
                className="dialog-in relative max-h-[calc(100dvh-2rem)] w-full overflow-y-auto overscroll-contain rounded-t-[28px] bg-surface shadow-lift ring-2 ring-line sm:max-w-md sm:rounded-[28px] px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-3 sm:p-6"
              >
                <span aria-hidden className="mx-auto mb-4 block h-1 w-10 rounded-full bg-line-strong sm:hidden" />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-full text-muted transition-[background-color,color,transform] duration-150 hover:bg-bg-subtle hover:text-ink active:scale-[0.94]"
                >
                  <X className="size-5" />
                </button>
                {done ? (
                  <>
                    <span className="check-pop flex size-14 items-center justify-center rounded-full bg-positive text-white shadow-[0_4px_0_0_var(--positive-press)]">
                      <CircleCheck className="size-7" strokeWidth={2.5} />
                    </span>
                    <h2 id="report-title" className="headline mt-4 text-[22px] text-ink">
                      Thanks for letting us know
                    </h2>
                    <p className="mt-2 text-[14.5px] leading-relaxed text-ink-2">
                      Merit&apos;s team will review it. If someone is in danger, contact local emergency services right away.
                    </p>
                    <button type="button" onClick={() => setOpen(false)} className={buttonClass("primary", "md", "mt-6 w-full sm:w-auto")}>
                      Done
                    </button>
                  </>
                ) : (
                  <>
                    <h2 id="report-title" className="headline flex items-center gap-2 pr-10 text-[22px] text-ink">
                      <span className="flex size-9 items-center justify-center rounded-xl bg-danger-soft text-danger">
                        <Flag className="size-4" />
                      </span>
                      Report this
                    </h2>
                    <p className="mt-1 text-[14px] text-muted">What&apos;s wrong? Reports are private.</p>
                    <div className="mt-4 space-y-2">
                      {REPORT_REASONS.map((r) => (
                        <label
                          key={r}
                          className={cn(
                            "flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl px-4 py-2.5 font-brand text-[14.5px] font-bold text-ink ring-2 ring-inset transition-[background-color,box-shadow,transform] duration-150 active:translate-y-px",
                            reason === r ? "bg-accent-soft ring-accent" : "ring-line hover:bg-bg-subtle",
                          )}
                        >
                          <input type="radio" name="reason" value={r} checked={reason === r} onChange={() => setReason(r)} className="size-4 shrink-0 accent-[var(--accent)]" />
                          {r}
                        </label>
                      ))}
                    </div>
                    <label className="mt-4 block">
                      <span className="mb-1.5 block text-[13px] font-semibold text-ink-2">Details (optional)</span>
                      <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={3} maxLength={1000} className={cn(inputClass, "h-auto py-2.5")} />
                    </label>
                    {error ? (
                      <p role="alert" className="fade mt-2 text-sm font-medium text-danger">
                        {error}
                      </p>
                    ) : null}
                    <button type="button" onClick={submit} disabled={!reason || pending} className={buttonClass("primary", "lg", "mt-5 w-full")}>
                      {pending ? <Loader2 className="size-4 animate-spin" /> : null} Send report
                    </button>
                  </>
                )}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
