import type { Booking } from "@/lib/types";
import { Badge, cn } from "./ui";

const LABEL: Record<Booking["status"], string> = { requested: "Waiting for tutor", confirmed: "Confirmed", declined: "Declined", completed: "Completed", canceled: "Canceled" };
const TONE: Record<Booking["status"], "warn" | "positive" | "accent" | "neutral"> = {
  requested: "warn",
  confirmed: "positive",
  completed: "accent",
  declined: "neutral",
  canceled: "neutral",
};

export function BookingStatus({ b, className }: { b: Booking; className?: string }) {
  return (
    <Badge tone={TONE[b.status]} className={cn("h-7 px-3 font-brand text-[12.5px] font-extrabold", className)}>
      <span aria-hidden className="size-1.5 rounded-full bg-current opacity-80" />
      {LABEL[b.status]}
    </Badge>
  );
}

export const money = (n: number) => `$${n.toFixed(2).replace(/\.00$/, "")}`;

/** "Mon, Sep 28 · 4:00 PM" in the viewer's locale-neutral US format. */
export function sessionWhen(iso: string) {
  const d = new Date(iso);
  return {
    day: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
    time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    month: d.toLocaleDateString("en-US", { month: "short" }),
    date: d.getDate(),
  };
}

/** A chunky calendar-page tile: a colored month strip over a big day number. */
export function DateTile({ iso, muted, size = "md" }: { iso: string; muted?: boolean; size?: "md" | "lg" }) {
  const w = sessionWhen(iso);
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 flex-col overflow-hidden rounded-2xl bg-surface text-center ring-2",
        size === "lg" ? "w-[72px]" : "w-14",
        muted ? "ring-line" : "ring-[#7c3aed] shadow-[0_3px_0_0_#5b21b6]",
      )}
    >
      <span className={cn("py-0.5 font-brand text-[10.5px] font-black uppercase tracking-wide", muted ? "bg-bg-subtle text-muted" : "bg-[#7c3aed] text-white")}>{w.month}</span>
      <span className={cn("tabular flex flex-1 items-center justify-center font-brand font-black leading-none", size === "lg" ? "py-2.5 text-[30px]" : "py-1.5 text-[22px]", muted ? "text-muted" : "text-ink")}>
        {w.date}
      </span>
    </span>
  );
}
