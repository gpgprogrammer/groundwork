import type { ReactNode } from "react";
import { cn } from "./ui";

/*
 * The Plan world (Learning plan, My schedule, Progress) is green.
 * White text sits on a fixed deep green in both themes so it always passes contrast.
 */
export const planGreen = "bg-[linear-gradient(135deg,#17913f,#12722f)]";
/** Chunky white button for use on the green hero. */
export const heroWhite =
  "press flex h-12 max-w-full items-center gap-2 rounded-2xl bg-white px-5 font-brand text-[15.5px] font-extrabold text-[#12722f] [--ledge:rgb(0_0_0/0.22)] hover:brightness-95";
/** Translucent secondary button for use on the green hero. */
export const heroGlass =
  "press flex h-12 items-center gap-2 rounded-2xl bg-white/15 px-5 font-brand text-[15.5px] font-extrabold text-white border-2 border-white/30 [--ledge:rgb(0_0_0/0.18)] hover:bg-white/25";

/** Full-bleed green hero shared by the Plan pages. */
export function PlanHero({ kicker, children, aside, className }: { kicker?: ReactNode; children: ReactNode; aside?: ReactNode; className?: string }) {
  return (
    <header className={cn("relative overflow-hidden text-white", planGreen, className)}>
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-[420px] rounded-full border-[56px] border-white/[0.08]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-36 right-48 size-72 rounded-full border-[40px] border-white/[0.06]" />
      <div aria-hidden className="pointer-events-none absolute -left-20 bottom-10 size-40 rounded-full border-[24px] border-white/[0.05]" />
      <div className={cn("relative mx-auto grid max-w-6xl gap-8 px-4 pb-10 pt-8 sm:px-6 lg:px-8 lg:pt-10", aside && "lg:grid-cols-[1fr_380px] lg:items-center")}>
        <div className="min-w-0">
          {kicker ? <div className="rise mb-4 flex flex-wrap items-center gap-2">{kicker}</div> : null}
          {children}
        </div>
        {aside ? <div className="rise min-w-0" style={{ ["--i" as string]: 3 }}>{aside}</div> : null}
      </div>
    </header>
  );
}

/** Pill for the hero kicker row. */
export function HeroPill({ children }: { children: ReactNode }) {
  return <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-white/20 px-3 font-brand text-[12.5px] font-extrabold text-white">{children}</span>;
}
