import type { UnitReadiness } from "@/lib/sprint";
import { cn } from "../ui";

export function tone(score: number) {
  return score >= 0.75 ? "bg-positive" : score >= 0.55 ? "bg-[#3b82f6]" : score >= 0.4 ? "bg-[#f5a524]" : "bg-[#e5484d]";
}

export function ReadinessBars({ units, compact = false }: { units: UnitReadiness[]; compact?: boolean }) {
  return (
    <ul className="space-y-2.5">
      {units.map((u) => (
        <li key={u.unit.id} className="flex items-center gap-3 text-[13px]">
          <span className={cn("truncate text-ink-2", compact ? "w-32" : "w-44 sm:w-56")} title={u.unit.title}>
            <span className="tabular mr-1.5 text-muted">{u.unit.order}</span>
            {u.unit.title}
          </span>
          <span className="h-2 flex-1 overflow-hidden rounded-full bg-line">
            <span className={cn("block h-full rounded-full transition-all", tone(u.score))} style={{ width: `${Math.round(u.score * 100)}%` }} />
          </span>
          <span className="tabular w-10 text-right font-medium text-ink">{Math.round(u.score * 100)}%</span>
        </li>
      ))}
    </ul>
  );
}

/** Circular gauge for overall readiness. */
export function Gauge({ value, label, sub }: { value: number; label: string; sub: string }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative size-40">
      <svg viewBox="0 0 120 120" className="size-40 -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="currentColor" strokeWidth="10" className="text-white/15" />
        <circle cx="60" cy="60" r={r} fill="none" stroke="url(#gauge)" strokeWidth="10" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value)} />
        <defs>
          <linearGradient id="gauge" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffd08a" />
            <stop offset="1" stopColor="#ffffff" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="tabular text-4xl font-extrabold">{label}</span>
        <span className="text-[11px] font-medium uppercase tracking-wide text-white/75">{sub}</span>
      </div>
    </div>
  );
}
