import type { ReactNode } from "react";
import { cn } from "./ui";

const TONES = {
  learn: "bg-[linear-gradient(135deg,#3b82f6,#1d4ed8)]",
  practice: "bg-[linear-gradient(135deg,#d9531c,#a8400f)]",
  plan: "bg-[linear-gradient(135deg,#16a34a,#15803d)]",
  tutors: "bg-[linear-gradient(135deg,#8b5cf6,#6d28d9)]",
  ask: "bg-[linear-gradient(135deg,#ec4899,#be185d)]",
} as const;

export type BandTone = keyof typeof TONES;

/** A world's page band: full-bleed section color, white display title, optional kicker, lede, and content. */
export function WorldBand({
  tone = "learn",
  title,
  kicker,
  lede,
  children,
  className,
  size = "md",
}: {
  tone?: BandTone;
  title: ReactNode;
  kicker?: ReactNode;
  lede?: ReactNode;
  children?: ReactNode;
  className?: string;
  size?: "md" | "lg";
}) {
  return (
    <header className={cn("relative overflow-hidden text-white", TONES[tone], className)}>
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-28 size-96 rounded-full border-[48px] border-white/[0.08]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-36 left-1/3 size-72 rounded-full border-[36px] border-white/[0.06]" />
      <div className={cn("relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", size === "lg" ? "pb-12 pt-12 lg:pb-16 lg:pt-16" : "pb-8 pt-9")}>
        {kicker ? <div className="rise mb-3 flex flex-wrap items-center gap-2 font-brand text-[14px] font-extrabold text-white/85">{kicker}</div> : null}
        <h1 className={cn("rise display", size === "lg" ? "text-[40px] sm:text-6xl" : "text-[34px] sm:text-5xl")}>{title}</h1>
        {lede ? (
          <p className="rise mt-3 max-w-2xl text-[16.5px] leading-relaxed text-white/90" style={{ ["--i" as string]: 1 }}>
            {lede}
          </p>
        ) : null}
        {children}
      </div>
    </header>
  );
}

/** The Learn world's band (Merit blue). */
export function LearnBand(props: Omit<Parameters<typeof WorldBand>[0], "tone">) {
  return <WorldBand tone="learn" {...props} />;
}

/** Chunky white call to action for use on a band. */
export const bandCta = "press inline-flex h-12 items-center gap-2 rounded-2xl bg-white px-5 font-brand text-[15.5px] font-extrabold text-[#0f1729] [--ledge:rgb(0_0_0/0.22)] hover:brightness-95";
/** Translucent secondary call to action for use on a band. */
export const bandCtaGhost = "press inline-flex h-12 items-center gap-2 rounded-2xl bg-white/15 px-5 font-brand text-[15.5px] font-extrabold text-white ring-2 ring-inset ring-white/30 [--ledge:rgb(0_0_0/0.18)] hover:bg-white/25";
