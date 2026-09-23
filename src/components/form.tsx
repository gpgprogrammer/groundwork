import type { ReactNode } from "react";
import { cn } from "./ui";

export const inputClass =
  "h-10 w-full rounded-lg border border-line-strong bg-bg px-3 text-sm text-ink outline-none transition-[border-color,box-shadow] placeholder:text-faint focus:border-accent focus:ring-4 focus:ring-accent/10";

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 flex items-baseline justify-between text-[13px] font-medium text-ink-2">
        {label}
        {hint ? <span className="text-xs font-normal text-faint">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}

export function FormMessage({ error, ok }: { error?: string; ok?: string | false }) {
  if (error) return <p className="text-sm text-[#c2410c]" role="alert">{error}</p>;
  if (ok) return <p className="text-sm text-positive" role="status">{ok}</p>;
  return null;
}
