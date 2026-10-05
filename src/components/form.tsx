import { startTransition, type FormEvent, type ReactNode } from "react";
import { cn } from "./ui";

export const inputClass =
  "h-11 w-full rounded-xl bg-surface px-3.5 text-[15px] text-ink ring-1 ring-inset ring-line-strong outline-none transition-[box-shadow] duration-150 placeholder:text-faint focus:ring-2 focus:ring-accent disabled:bg-bg-subtle disabled:text-muted";

export const selectClass = cn(inputClass, "appearance-none bg-[length:16px] bg-[right_0.75rem_center] bg-no-repeat pr-9 bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238a93a3' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")]");

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 flex items-baseline justify-between text-[13px] font-semibold text-ink-2">
        {label}
        {hint ? <span className="text-xs font-normal text-muted">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}

export function FormMessage({ error, ok }: { error?: string; ok?: string | false }) {
  if (error)
    return (
      <p className="fade text-sm font-medium text-danger" role="alert">
        {error}
      </p>
    );
  if (ok)
    return (
      <p className="fade text-sm font-medium text-positive" role="status">
        {ok}
      </p>
    );
  return null;
}

/**
 * Submit handler for a form backed by a server action. Passing the action to `action={...}` makes React
 * clear every field once the action returns, so a failed save would wipe what someone typed. This keeps it.
 */
export function keepValuesOnSubmit(formAction: (data: FormData) => void, before?: (form: HTMLFormElement) => boolean) {
  return (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (before && !before(form)) return;
    const data = new FormData(form, (e.nativeEvent as SubmitEvent).submitter);
    startTransition(() => formAction(data));
  };
}
