"use client";

import { Check, X } from "lucide-react";
import { useActionState, useEffect, useState, type ReactNode } from "react";
import { requestTutoring, type TutoringState } from "@/app/actions/learning";
import type { Educator } from "@/lib/types";
import { Field, inputClass } from "./form";
import { Avatar, Button, cn } from "./ui";

type Prefill = { name?: string; email?: string };

export function TutoringDialogButton({
  educator,
  courseId,
  sourceVideoId,
  prefill,
  children,
  className,
  variant = "primary",
}: {
  educator: Pick<Educator, "id" | "name" | "firstName" | "hue" | "hourlyRate" | "responseTime" | "acceptingStudents" | "bookingUrl">;
  courseId?: string | null;
  sourceVideoId?: string | null;
  prefill?: Prefill;
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary";
}) {
  const [open, setOpen] = useState(false);
  if (educator.bookingUrl) {
    return (
      <a
        href={educator.bookingUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "inline-flex h-9 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium",
          variant === "primary" ? "bg-ink text-bg hover:bg-ink/85" : "border border-line-strong bg-surface text-ink hover:bg-bg-subtle",
          className,
        )}
      >
        {children}
      </a>
    );
  }
  return (
    <>
      <Button variant={variant} onClick={() => setOpen(true)} className={className} disabled={!educator.acceptingStudents}>
        {educator.acceptingStudents ? children : "Not taking new students"}
      </Button>
      {open ? (
        <TutoringDialog
          educator={educator}
          courseId={courseId ?? null}
          sourceVideoId={sourceVideoId ?? null}
          prefill={prefill}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}

function TutoringDialog({
  educator,
  courseId,
  sourceVideoId,
  prefill,
  onClose,
}: {
  educator: Pick<Educator, "id" | "name" | "firstName" | "hue" | "hourlyRate" | "responseTime">;
  courseId: string | null;
  sourceVideoId: string | null;
  prefill?: Prefill;
  onClose: () => void;
}) {
  const [state, action, pending] = useActionState<TutoringState, FormData>(requestTutoring, {});

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal aria-labelledby="tutoring-title">
      <div className="fade absolute inset-0 bg-[#0d0d0f]/35 backdrop-blur-[2px]" onClick={onClose} />
      <div className="rise relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-line bg-surface shadow-lift sm:rounded-2xl">
        <button onClick={onClose} className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-lg text-muted hover:bg-bg-subtle" aria-label="Close">
          <X className="size-4" />
        </button>
        {state.ok ? (
          <div className="px-8 py-12 text-center">
            <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-positive-soft text-positive">
              <Check className="size-5" />
            </span>
            <h2 className="headline mt-5 text-xl text-ink">Request sent to {educator.firstName}</h2>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted">
              {educator.responseTime}. They&apos;ll reply to you by email to set up a time.
            </p>
            <Button variant="secondary" className="mt-7" onClick={onClose}>
              Back to learning
            </Button>
          </div>
        ) : (
          <form action={action} className="p-6 sm:p-7">
            <div className="flex items-center gap-3">
              <Avatar name={educator.name} hue={educator.hue} size={40} />
              <div>
                <h2 id="tutoring-title" className="text-[15px] font-semibold text-ink">
                  Learn with {educator.firstName}
                </h2>
                <p className="tabular text-[13px] text-muted">
                  ${educator.hourlyRate}/hour · {educator.responseTime.replace("Usually replies", "Replies")}
                </p>
              </div>
            </div>
            <input type="hidden" name="educatorId" value={educator.id} />
            <input type="hidden" name="courseId" value={courseId ?? ""} />
            <input type="hidden" name="sourceVideoId" value={sourceVideoId ?? ""} />
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Your name">
                <input name="name" required defaultValue={prefill?.name} className={inputClass} autoComplete="name" />
              </Field>
              <Field label="Email">
                <input name="email" type="email" required defaultValue={prefill?.email} className={inputClass} autoComplete="email" />
              </Field>
            </div>
            <Field label="What would you like help with?" className="mt-4">
              <textarea
                name="message"
                required
                rows={4}
                className={cn(inputClass, "h-auto py-2.5 leading-relaxed")}
                placeholder="e.g. I understand the chain rule on its own but get lost when it's combined with implicit differentiation. My exam is in May."
              />
            </Field>
            <Field label="When are you usually free?" hint="Optional" className="mt-4">
              <input name="availability" className={inputClass} placeholder="Weeknights after 6pm, Sunday mornings" />
            </Field>
            {state.error ? <p className="mt-4 text-sm text-[#c2410c]">{state.error}</p> : null}
            <div className="mt-6 flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center">
              <p className="text-xs text-muted">No payment now. You&apos;ll arrange details directly.</p>
              <Button type="submit" disabled={pending}>
                {pending ? "Sending…" : "Send request"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

