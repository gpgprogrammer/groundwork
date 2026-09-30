import type { UnitReadiness } from "@/lib/sprint";
import { cn } from "../ui";

/** Readiness color bands: strong, on track, shaky, weak. */
export function tone(score: number) {
  return score >= 0.75 ? "bg-positive" : score >= 0.55 ? "bg-accent" : score >= 0.4 ? "bg-warn" : "bg-danger";
}

/** Thick, colored bars: one per unit, labeled with the unit number in a chunky badge. */
export function ReadinessBars({ units, compact = false }: { units: UnitReadiness[]; compact?: boolean }) {
  return (
    <ul className={cn(compact ? "space-y-3" : "space-y-4")}>
      {units.map((u, i) => (
        <li key={u.unit.id} className="text-[13px]">
          <div className="flex items-center gap-3">
            <span className={cn("tabular flex size-7 shrink-0 items-center justify-center rounded-lg font-brand text-[12.5px] font-black text-white", tone(u.score))}>{u.unit.order}</span>
            <span className="min-w-0 flex-1 truncate font-semibold text-ink-2" title={u.unit.title}>
              {u.unit.title}
            </span>
            <span className="tabular shrink-0 font-brand text-[14px] font-black text-ink">{Math.round(u.score * 100)}%</span>
          </div>
          <span className="mt-1.5 block h-3 overflow-hidden rounded-full bg-bg-subtle">
            <span className={cn("rise block h-full origin-left rounded-full", tone(u.score))} style={{ width: `${Math.max(4, Math.round(u.score * 100))}%`, ["--i" as string]: i }} />
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Circular gauge for overall readiness. `onDark` draws it in white for colored heroes. */
export function Gauge({ value, label, sub, onDark = false, className }: { value: number; label: string; sub: string; onDark?: boolean; className?: string }) {
  const r = 50;
  const c = 2 * Math.PI * r;
  return (
    <div className={cn("relative size-36 shrink-0 sm:size-40", className)}>
      <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden>
        <circle cx="60" cy="60" r={r} fill="none" stroke="currentColor" strokeWidth="14" className={onDark ? "text-white/20" : "text-bg-subtle"} />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.max(0.001, Math.min(1, value)))}
          className={cn("transition-[stroke-dashoffset] duration-1000 ease-out", onDark ? "text-white" : "text-sprint")}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center" role="img" aria-label={`${label} ${sub}`}>
        <span className={cn("tabular font-brand text-4xl font-black tracking-tight", onDark ? "text-white" : "text-ink")}>{label}</span>
        <span className={cn("font-brand text-[11.5px] font-extrabold uppercase tracking-wide", onDark ? "text-white/80" : "text-muted")}>{sub}</span>
      </div>
    </div>
  );
}

/** Small readiness ring for tiles. */
export function Ring({ value, size = 56, className }: { value: number; size?: number; className?: string }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <span className={cn("relative inline-flex shrink-0", className)} style={{ width: size, height: size }} role="img" aria-label={`${pct}% ready`}>
      <svg viewBox="0 0 56 56" className="size-full -rotate-90" aria-hidden>
        <circle cx="28" cy="28" r={r} fill="none" stroke="currentColor" strokeWidth="7" className="text-bg-subtle" />
        <circle cx="28" cy="28" r={r} fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - Math.max(0.001, pct / 100))} className="text-sprint" />
      </svg>
      <span className="tabular absolute inset-0 flex items-center justify-center font-brand text-[13px] font-black text-ink">{pct}%</span>
    </span>
  );
}
