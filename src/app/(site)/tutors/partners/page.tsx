import { BadgeCheck, CircleCheck, Handshake, LineChart, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { HeroKicker } from "@/components/marketing";
import { cn, panel } from "@/components/ui";
import { PartnerForm } from "./partner-form";

export const metadata: Metadata = { title: "Partner with Merit", description: "Tutoring businesses: reach students studying your subjects. Pay only for the students we send you." };

const POINTS = [
  { Icon: Users, title: "Pay only for results", body: "No listing fees. Merit earns 10% of the first-term revenue from students we refer, as a revenue share or a flat lead fee we agree on." },
  { Icon: LineChart, title: "Tracked referrals", body: "Every click from Merit to your site is logged with the subject, so both of us can see exactly what Merit sends you." },
  { Icon: BadgeCheck, title: "Clearly labeled", body: "Partners carry a Merit Partner label. Rankings of tutors and lessons are never for sale." },
];

export default async function PartnersPage({ searchParams }: PageProps<"/tutors/partners">) {
  const sp = await searchParams;
  return (
    <div className="pb-20">
      <header className="relative overflow-hidden bg-[linear-gradient(135deg,#1e1b2e,#2e2748)] text-white">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-[420px] rounded-full border-[56px] border-[#7c3aed]/25" />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 right-40 size-72 rounded-full border-[40px] border-white/[0.05]" />
        <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8 lg:pb-14 lg:pt-12">
          <Link href="/tutors" className="-ml-1 inline-flex min-h-9 items-center gap-1 rounded-full px-1 font-brand text-[13.5px] font-extrabold text-white/75 transition-colors hover:text-white">
            <span aria-hidden>←</span> Tutors
          </Link>
          <div className="mt-4">
            <HeroKicker>
              <Handshake className="size-4" aria-hidden /> For tutoring businesses
            </HeroKicker>
          </div>
          <h1 className="display rise mt-4 max-w-3xl text-[36px] sm:text-5xl lg:text-[56px]">Meet students at the moment they need help.</h1>
          <p className="rise mt-4 max-w-2xl text-[16.5px] leading-relaxed text-white/85" style={{ ["--i" as string]: 1 }}>
            Merit students see tutoring options right where they study: on the topic they&apos;re stuck on, in their learning plan, and in their Exam Sprint. Partners are listed on the Tutors page for the subjects they cover.
          </p>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_460px] lg:gap-10 grid-cols-[minmax(0,1fr)]">
          <ul className="grid content-start gap-4">
            {POINTS.map(({ Icon, title, body }, i) => (
              <li key={title} className={cn("rise flex gap-4 rounded-3xl p-5 sm:p-6", TONES[i].wrap)} style={{ ["--i" as string]: i + 1 }}>
                <span className={cn("press-sm flex size-12 shrink-0 items-center justify-center rounded-2xl text-white", TONES[i].icon)}>
                  <Icon className="size-6" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block font-brand text-[18px] font-extrabold text-ink">{title}</span>
                  <span className="mt-1 block text-[14.5px] leading-relaxed text-ink-2">{body}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className={cn(panel, "rise relative overflow-hidden p-5 sm:p-7 lg:sticky lg:top-[calc(var(--nav-h)+16px)] lg:self-start")} style={{ ["--i" as string]: 2 }}>
            {sp.sent ? (
              <div className="py-10 text-center">
                <span className="check-pop mx-auto flex size-16 items-center justify-center rounded-full bg-positive text-white shadow-[0_4px_0_0_var(--positive-press)]">
                  <CircleCheck className="size-8" aria-hidden />
                </span>
                <p className="headline mt-5 text-[24px] text-ink">Application received.</p>
                <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-muted">We&apos;ll review it and reach out by email to set up tracking and terms.</p>
              </div>
            ) : (
              <PartnerForm />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const TONES = [
  { wrap: "bg-[#f3edff] dark:bg-[#2a1f45]", icon: "bg-[#7c3aed] [--ledge:#5b21b6]" },
  { wrap: "bg-accent-soft", icon: "bg-accent [--ledge:var(--accent-press)]" },
  { wrap: "bg-positive-soft", icon: "bg-positive [--ledge:var(--positive-press)]" },
];
