import Link from "next/link";
import type { ReactNode } from "react";
import { PLUS, SPRINT, usd, PAID_PLANS } from "@/lib/billing/plans";
import { cn } from "./ui";

/*
 * Section-world heroes: a full-bleed color band with white text and decorative rings.
 * Only world colors that pass AA with white text are offered.
 */
export type World = "violet" | "accent" | "positive" | "sprint" | "ink";
const WORLD_BG: Record<World, string> = {
  violet: "bg-[linear-gradient(135deg,#7c3aed,#6d28d9)]",
  accent: "bg-[linear-gradient(135deg,var(--accent),var(--accent-press))]",
  positive: "bg-[linear-gradient(135deg,var(--positive),var(--positive-press))]",
  sprint: "bg-[linear-gradient(135deg,var(--sprint),var(--sprint-press))]",
  ink: "bg-[linear-gradient(135deg,#1e1b2e,#2e2748)]",
};
/** Text color for a white button sitting on each world. */
export const WORLD_ON_WHITE: Record<World, string> = {
  violet: "text-[#6d28d9]",
  accent: "text-accent-press",
  positive: "text-positive-press",
  sprint: "text-sprint-press",
  ink: "text-[#1e1b2e]",
};

/** Chunky white CTA for use on a world hero. */
export const heroBtn = "press inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 font-brand text-[15.5px] font-extrabold [--ledge:rgb(0_0_0/0.22)] hover:brightness-95";
/** Translucent secondary CTA for use on a world hero. */
export const heroBtnGhost =
  "press inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white/15 px-5 font-brand text-[15.5px] font-extrabold text-white ring-2 ring-inset ring-white/30 [--ledge:rgb(0_0_0/0.18)] hover:bg-white/25";

export function WorldHero({ world, children, className, inner, narrow }: { world: World; children: ReactNode; className?: string; inner?: string; narrow?: boolean }) {
  return (
    <header className={cn("relative overflow-hidden text-white", WORLD_BG[world], className)}>
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-[420px] rounded-full border-[56px] border-white/[0.08]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 right-40 size-72 rounded-full border-[40px] border-white/[0.06]" />
      <div aria-hidden className="pointer-events-none absolute -left-16 bottom-6 size-32 rounded-full border-[18px] border-white/[0.06]" />
      <div className={cn("relative mx-auto px-4 sm:px-6 lg:px-8", narrow ? "max-w-3xl" : "max-w-6xl", inner ?? "pb-10 pt-8 lg:pb-12 lg:pt-10")}>{children}</div>
    </header>
  );
}

/** A small uppercase pill that sits above a hero title. */
export function HeroKicker({ children }: { children: ReactNode }) {
  return <p className="inline-flex h-8 items-center gap-1.5 rounded-full bg-white/15 px-3 font-brand text-[13px] font-extrabold text-white ring-1 ring-inset ring-white/25">{children}</p>;
}

const DEFAULT_FAQS: [string, string][] = [
  [
    "What is Merit?",
    "Merit is where high schoolers learn their classes, every AP course, and the SAT: ranked lessons for every topic, an AI study partner, a learning plan that follows your class calendar, and Exam Sprints before big tests. It's free for students.",
  ],
  [
    "Where do the lessons come from?",
    "From teachers and educators students already trust. Merit sorts every lesson into the course, unit, and topic it teaches and ranks it on how well it teaches. Teachers can also add lessons and study guides directly.",
  ],
  [
    "How does calendar sync work?",
    "Paste the private calendar link from Canvas, Schoology, Blackbaud, Google Calendar, Apple Calendar, or Outlook, or upload a file. Merit matches quizzes and tests to topics and lines up lessons for each one in your learning plan, days before it happens.",
  ],
  [
    "What's free and what's paid?",
    PAID_PLANS
      ? `Courses, lessons, tutor search, and the AI study partner are free. Merit Plus (learning plan, calendar sync, progress) has a free ${PLUS.trialDays}-day trial, then ${usd(PLUS.monthly)}/month. An Exam Sprint is ${usd(SPRINT.price)} once.`
      : "Everything on Merit is free: courses, lessons, Merit AI, your learning plan, calendar sync, progress, and Exam Sprint. The only thing you pay for is a tutor, if you choose to book one.",
  ],
  ["Which courses are covered?", "High school classes like Algebra 1, Geometry, and Algebra 2 (regular and honors), every AP course from Calculus and Biology to Art History and Japanese, and SAT Math and Reading and Writing. More high school classes are added as their lessons come in."],
  ["How is Merit free? Why .org?", "Merit is free for students and funded by tutoring: tutors and tutoring services pay Merit a share of sessions students book through Merit, never students. Merit is a company, not a nonprofit; the .org is about the mission, free learning for every student."],
];

export function Faq({ items = DEFAULT_FAQS }: { items?: [string, string][] }) {
  return (
    <div className="space-y-3">
      {items.map(([q, a]) => (
        <details
          key={q}
          className="group rounded-3xl bg-surface px-5 ring-2 ring-line transition-colors open:ring-accent/40 [interpolate-size:allow-keywords] [&::details-content]:h-0 [&::details-content]:overflow-hidden [&::details-content]:transition-[height,content-visibility] [&::details-content]:duration-250 [&::details-content]:ease-out [&::details-content]:[transition-behavior:allow-discrete] open:[&::details-content]:h-auto [&_summary::-webkit-details-marker]:hidden"
        >
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 font-brand text-[16px] font-extrabold text-ink transition-colors duration-150 hover:text-accent-ink sm:text-[16px]">
            <span className="min-w-0">{q}</span>
            <span
              aria-hidden
              className="relative flex size-8 shrink-0 items-center justify-center rounded-full bg-bg-subtle text-muted transition-[transform,background-color,color] duration-200 ease-out group-open:rotate-45 group-open:bg-accent-soft group-open:text-accent-ink"
            >
              <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                <path d="M6 1.5v9M1.5 6h9" />
              </svg>
            </span>
          </summary>
          <p className="fade max-w-2xl pb-5 pr-10 text-[15px] leading-relaxed text-muted">{a}</p>
        </details>
      ))}
    </div>
  );
}

/** A compact world-colored page hero: back link, big icon tile, title, and lede. */
export function PageHero({
  world,
  title,
  lede,
  back,
  icon,
  kicker,
  narrow = true,
  children,
}: {
  world: World;
  title: ReactNode;
  lede?: ReactNode;
  back?: { href: string; label: string };
  icon?: ReactNode;
  kicker?: ReactNode;
  narrow?: boolean;
  children?: ReactNode;
}) {
  return (
    <WorldHero world={world} narrow={narrow} inner="pb-9 pt-6 lg:pb-10 lg:pt-8">
      {back ? (
        <Link href={back.href} className="-ml-1 inline-flex min-h-9 items-center gap-1 rounded-full px-1 font-brand text-[13.5px] font-extrabold text-white/80 transition-colors hover:text-white">
          <span aria-hidden>←</span> {back.label}
        </Link>
      ) : null}
      <div className={cn("rise flex items-center gap-4", back ? "mt-4" : "")}>
        {icon ? <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-2 ring-inset ring-white/25 sm:size-16 [&>svg]:size-7">{icon}</span> : null}
        <div className="min-w-0">
          {kicker ? <p className="font-brand text-[14px] font-extrabold text-white/80">{kicker}</p> : null}
          <h1 className="display text-[32px] sm:text-[44px]">{title}</h1>
        </div>
      </div>
      {lede ? (
        <p className="rise mt-3 max-w-2xl text-[16px] leading-relaxed text-white/90" style={{ ["--i" as string]: 1 }}>
          {lede}
        </p>
      ) : null}
      {children}
    </WorldHero>
  );
}
