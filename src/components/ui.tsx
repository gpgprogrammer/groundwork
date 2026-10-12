import clsx, { type ClassValue } from "clsx";
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export const cn = (...v: ClassValue[]) => clsx(v);

/*
 * Merit 2.0 primitives: bold and tactile.
 * Buttons and tappable tiles sit on a solid "ledge" (.press) and sink when pushed.
 * Shape rule: buttons 16px (rounded-2xl), tiles and panels 24px (rounded-3xl) with a 2px outline,
 * chips and badges are pills. Headings use the rounded display face (.headline / .display).
 */

type Variant = "primary" | "secondary" | "ghost" | "accent" | "outline" | "dark" | "sprint" | "positive";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-2xl font-brand font-extrabold tracking-[0.01em] disabled:pointer-events-none disabled:opacity-50";
const variants: Record<Variant, string> = {
  primary: "press bg-accent text-white [--ledge:var(--accent-press)] hover:brightness-110",
  accent: "press bg-accent text-white [--ledge:var(--accent-press)] hover:brightness-110",
  sprint: "press bg-sprint text-white [--ledge:var(--sprint-press)] hover:brightness-110",
  positive: "press bg-positive text-white [--ledge:var(--positive-press)] hover:brightness-110",
  dark: "press bg-ink text-bg [--ledge:color-mix(in_oklab,var(--ink)_60%,black)] hover:bg-ink/90",
  secondary: "press bg-bg-subtle text-ink [--ledge:var(--line-strong)] hover:bg-line",
  outline: "press bg-surface text-ink ring-2 ring-inset ring-line [--ledge:var(--line)] hover:bg-bg-subtle",
  ghost: "text-ink transition-colors hover:bg-bg-subtle active:scale-[0.97]",
};
const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[13.5px]",
  md: "h-11 px-5 text-[15px]",
  lg: "h-[52px] px-7 text-[16.5px]",
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

/** A thick-outlined tile: the one container style used across the app. */
export const panel = "rounded-3xl bg-surface ring-2 ring-line";
/** A tile that is also a link or button: it sits on a ledge and presses down. */
export const panelLink = "press rounded-3xl bg-surface ring-2 ring-line [--ledge:var(--line)] hover:bg-bg-subtle/60";

export function Panel({ children, className, as: Tag = "section" }: { children: ReactNode; className?: string; as?: "section" | "div" | "article" | "aside" }) {
  return <Tag className={cn(panel, "p-5 sm:p-6", className)}>{children}</Tag>;
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "accent" | "positive" | "warn" | "outline" | "sprint" | "danger";
  className?: string;
}) {
  const tones = {
    neutral: "bg-bg-subtle text-ink-2",
    accent: "bg-accent-soft text-accent-ink",
    positive: "bg-positive-soft text-positive",
    warn: "bg-warn-soft text-warn",
    sprint: "bg-sprint-soft text-sprint-ink",
    danger: "bg-danger-soft text-danger",
    outline: "ring-1 ring-inset ring-line text-muted",
  };
  return <span className={cn("inline-flex h-6 items-center gap-1 rounded-full px-2.5 text-xs font-bold", tones[tone], className)}>{children}</span>;
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-surface px-1 font-sans text-[11px] font-semibold text-muted ring-1 ring-line">
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
      className={cn("inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold", className)}
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

export function ProgressBar({ value, className, tone = "accent" }: { value: number; className?: string; tone?: "accent" | "positive" | "sprint" }) {
  const fill = { accent: "bg-accent", positive: "bg-positive", sprint: "bg-sprint" }[tone];
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-line", className)} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value * 100)}>
      <div className={cn("h-full rounded-full transition-[width] duration-700 ease-out", fill)} style={{ width: `${Math.max(0, Math.min(100, value * 100))}%` }} />
    </div>
  );
}

export function Container({ children, className, size = "lg" }: { children: ReactNode; className?: string; size?: "sm" | "md" | "lg" | "xl" }) {
  const widths = { sm: "max-w-2xl", md: "max-w-3xl", lg: "max-w-6xl", xl: "max-w-7xl" };
  return <div className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", widths[size], className)}>{children}</div>;
}

/**
 * The one page header: optional back link or kicker, the title, a short lede, and actions.
 * Every page title in the app goes through here so they share a rhythm.
 */
export function PageHeader({
  title,
  lede,
  kicker,
  back,
  actions,
  icon,
  className,
}: {
  title: ReactNode;
  lede?: ReactNode;
  kicker?: ReactNode;
  back?: { href: string; label: string };
  actions?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("rise flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0">
        {back ? (
          <Link href={back.href} className="-ml-1 mb-3 inline-flex items-center gap-1 rounded-full px-1 text-[13px] font-medium text-muted transition-colors hover:text-ink">
            <span aria-hidden>←</span> {back.label}
          </Link>
        ) : null}
        {kicker ? <div className="mb-2 flex flex-wrap items-center gap-2">{kicker}</div> : null}
        <h1 className="headline flex items-center gap-3 text-[28px] text-ink sm:text-[34px]">
          {icon}
          <span className="min-w-0">{title}</span>
        </h1>
        {lede ? <p className="mt-2 max-w-2xl text-[15.5px] leading-relaxed text-muted">{lede}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function SectionHeading({
  title,
  description,
  action,
  className,
  as: Tag = "h2",
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  as?: "h2" | "h3";
}) {
  return (
    <div className={cn("mb-4 flex items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        <Tag className="headline flex items-center gap-2 text-[19px] text-ink">{title}</Tag>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/** Quiet text link with an arrow, for "See all" style actions. */
export function MoreLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-soft", className)}>
      {children}
      <span aria-hidden className="transition-transform duration-200 ease-out group-hover:translate-x-0.5">
        →
      </span>
    </Link>
  );
}

export function EmptyState({ title, body, action, icon }: { title: string; body: string; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="rounded-2xl bg-bg-subtle/60 px-6 py-12 text-center ring-1 ring-inset ring-line">
      {icon ? <div className="mx-auto mb-4 flex size-11 items-center justify-center rounded-full bg-surface text-muted ring-1 ring-line">{icon}</div> : null}
      <p className="text-[15px] font-semibold text-ink">{title}</p>
      <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-muted">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

/** Inline status message: success, info, warning, or error. */
export function Notice({ tone = "info", children, className, role }: { tone?: "info" | "success" | "warn" | "error"; children: ReactNode; className?: string; role?: "status" | "alert" }) {
  const t = {
    info: { cls: "bg-accent-soft text-ink", Icon: Info, icon: "text-accent-ink" },
    success: { cls: "bg-positive-soft text-ink", Icon: CircleCheck, icon: "text-positive" },
    warn: { cls: "bg-warn-soft text-ink", Icon: TriangleAlert, icon: "text-warn" },
    error: { cls: "bg-danger-soft text-ink", Icon: CircleAlert, icon: "text-danger" },
  }[tone];
  return (
    <div role={role ?? (tone === "error" ? "alert" : "status")} className={cn("fade flex items-start gap-3 rounded-2xl px-4 py-3.5 text-sm leading-relaxed", t.cls, className)}>
      <t.Icon className={cn("mt-0.5 size-[18px] shrink-0", t.icon)} strokeWidth={2} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

/** Pill segmented control built from links (tabs that change the URL). */
export function SegmentedLinks({ items, active, className, label }: { items: { key: string; label: ReactNode; href: string }[]; active: string; className?: string; label: string }) {
  return (
    <nav aria-label={label} className={cn("scrollbar-none -mx-1 flex overflow-x-auto px-1", className)}>
      <div className="flex shrink-0 gap-1 rounded-full bg-bg-subtle p-1">
        {items.map((t) => (
          <Link
            key={t.key}
            href={t.href}
            aria-current={active === t.key ? "page" : undefined}
            className={cn(
              "flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13.5px] font-semibold transition-[background-color,color,box-shadow] duration-200",
              active === t.key ? "bg-surface text-ink shadow-soft" : "text-muted hover:text-ink",
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

/** Round icon tile used to mark features and list items. */
export function IconTile({ children, tone = "accent", className }: { children: ReactNode; tone?: "accent" | "sprint" | "positive" | "neutral"; className?: string }) {
  const t = { accent: "bg-accent-soft text-accent-ink", sprint: "bg-sprint-soft text-sprint-ink", positive: "bg-positive-soft text-positive", neutral: "bg-bg-subtle text-ink-2" }[tone];
  return <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", t, className)}>{children}</span>;
}

export function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 tabular", className)}>
      <svg viewBox="0 0 12 12" className="size-3 fill-current text-[#d99a00]" aria-hidden>
        <path d="M6 .8l1.6 3.3 3.6.5-2.6 2.5.6 3.6L6 9l-3.2 1.7.6-3.6L.8 4.6l3.6-.5z" />
      </svg>
      {rating.toFixed(2)}
    </span>
  );
}

export function formatDuration(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.round(sec % 60);
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`;
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

/** "1.2M views", like YouTube. */
/** "1 lesson", "2 lessons", "1,350 topics": a count with the right word, always with thousands separators. */
export const plural = (n: number, one: string, many = `${one}s`) => `${n.toLocaleString("en-US")} ${n === 1 ? one : many}`;

export function formatViews(n: number) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1).replace(/\.0$/, "")}K`;
  return String(n);
}

/** "3 years ago", like YouTube. */
export function ago(iso: string, now = Date.now()) {
  const t = new Date(iso).getTime();
  if (!iso || Number.isNaN(t)) return "";
  const s = Math.max(0, (now - t) / 1000);
  const units: [number, string][] = [
    [31536000, "year"],
    [2592000, "month"],
    [604800, "week"],
    [86400, "day"],
    [3600, "hour"],
    [60, "minute"],
  ];
  for (const [secs, name] of units) {
    const n = Math.floor(s / secs);
    if (n >= 1) return `${n} ${name}${n > 1 ? "s" : ""} ago`;
  }
  return "just now";
}
