import clsx, { type ClassValue } from "clsx";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export const cn = (...v: ClassValue[]) => clsx(v);

type Variant = "primary" | "secondary" | "ghost" | "accent";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-150 disabled:pointer-events-none disabled:opacity-50 active:translate-y-px";
const variants: Record<Variant, string> = {
  primary: "bg-ink text-bg hover:bg-ink/85 shadow-[0_1px_0_rgb(255_255_255/0.12)_inset]",
  secondary: "border border-line-strong bg-surface text-ink hover:border-faint hover:bg-bg-subtle shadow-soft",
  ghost: "text-ink-2 hover:bg-bg-subtle hover:text-ink",
  accent: "bg-accent text-white hover:bg-accent/90",
};
const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-9 px-4 text-sm",
  lg: "h-11 px-5 text-[15px]",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}

export function LinkButton({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "accent" | "positive" | "warn" | "outline";
  className?: string;
}) {
  const tones = {
    neutral: "bg-bg-subtle text-ink-2",
    accent: "bg-accent-soft text-accent",
    positive: "bg-positive-soft text-positive",
    warn: "bg-warn-soft text-warn",
    outline: "border border-line text-muted",
  };
  return (
    <span className={cn("inline-flex h-[22px] items-center gap-1 rounded-md px-2 text-xs font-medium", tones[tone], className)}>
      {children}
    </span>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-line bg-surface px-1 font-sans text-[11px] font-medium text-muted">
      {children}
    </kbd>
  );
}

export function Avatar({ name, hue, size = 40, className }: { name: string; hue: number; size?: number; className?: string }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
  return (
    <span
      aria-hidden
      className={cn("inline-flex shrink-0 select-none items-center justify-center rounded-full font-medium", className)}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.36),
        letterSpacing: "-0.02em",
        color: `oklch(0.42 0.09 ${hue})`,
        background: `linear-gradient(145deg, oklch(0.95 0.035 ${hue}), oklch(0.89 0.06 ${hue}))`,
        boxShadow: `inset 0 0 0 1px oklch(0.8 0.06 ${hue} / 0.5)`,
      }}
    >
      {initials}
    </span>
  );
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-1 w-full overflow-hidden rounded-full bg-line", className)}>
      <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${Math.max(0, Math.min(100, value * 100))}%` }} />
    </div>
  );
}

export function Container({ children, className, size = "lg" }: { children: ReactNode; className?: string; size?: "md" | "lg" | "xl" }) {
  const widths = { md: "max-w-3xl", lg: "max-w-6xl", xl: "max-w-7xl" };
  return <div className={cn("mx-auto w-full px-5 sm:px-8", widths[size], className)}>{children}</div>;
}

export function SectionHeading({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-5 flex items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        <h2 className="headline text-[17px] text-ink">{title}</h2>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-line-strong px-6 py-12 text-center">
      <p className="text-sm font-medium text-ink">{title}</p>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 tabular", className)}>
      <svg viewBox="0 0 12 12" className="size-3 fill-current text-[#c99a2e]" aria-hidden>
        <path d="M6 .8l1.6 3.3 3.6.5-2.6 2.5.6 3.6L6 9l-3.2 1.7.6-3.6L.8 4.6l3.6-.5z" />
      </svg>
      {rating.toFixed(2)}
    </span>
  );
}

export function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function formatCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 10_000) return `${Math.round(n / 1000)}k`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}

export function timeAgo(iso: string, now = Date.now()) {
  const s = Math.max(0, (now - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = s / 60;
  if (m < 60) return `${Math.floor(m)}m ago`;
  const h = m / 60;
  if (h < 24) return `${Math.floor(h)}h ago`;
  const d = h / 24;
  if (d < 7) return `${Math.floor(d)}d ago`;
  if (d < 60) return `${Math.floor(d / 7)}w ago`;
  const mo = d / 30;
  if (mo < 12) return `${Math.floor(mo)}mo ago`;
  return `${Math.floor(mo / 12)}y ago`;
}
