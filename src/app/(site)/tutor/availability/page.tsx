import { ArrowLeft, CalendarClock } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AvailabilityGrid } from "@/components/availability-grid";
import { HeroKicker, WorldHero } from "@/components/marketing";
import { cn, Notice, panel } from "@/components/ui";
import { getTutorMeta } from "@/lib/bookings";
import { getStore } from "@/lib/data/store";
import { requireViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Your free times" };

/** Where a tutor sets the hours students can book: a weekly grid of free times plus days away. */
export default async function AvailabilityPage({ searchParams }: PageProps<"/tutor/availability">) {
  const [viewer, sp, store] = await Promise.all([requireViewer("/tutor/availability"), searchParams, getStore()]);
  const mine = (await store.listTutors()).find((t) => t.userId === viewer.user.id);
  if (!mine) redirect("/tutors/join");
  const meta = await getTutorMeta(mine.id);
  const welcome = sp.welcome === "1";

  return (
    <div className="pb-20">
      <WorldHero world="violet" inner="pb-10 pt-6 lg:pb-12 lg:pt-8">
        <Link href="/tutor" className="-ml-1 inline-flex min-h-9 items-center gap-1 rounded-full px-1 font-brand text-[13.5px] font-extrabold text-white/80 transition-colors hover:text-white">
          <ArrowLeft className="size-4" aria-hidden /> Tutor dashboard
        </Link>
        <div className="mt-3">
          <HeroKicker>
            <CalendarClock className="size-4" /> Your free times
          </HeroKicker>
        </div>
        <h1 className="display rise mt-4 max-w-3xl text-[34px] sm:text-5xl">{welcome ? "Your listing is live. Now, when are you free?" : "When can students book you?"}</h1>
        <p className="rise mt-3 max-w-2xl text-[16px] leading-relaxed text-white/90" style={{ ["--i" as string]: 1 }}>
          Mark the times you&apos;re free each week. That&apos;s all it takes to show up on Book a tutor. No school calendar, tests, or assignments needed.
        </p>
      </WorldHero>
      <div className="mx-auto max-w-4xl px-4 pt-8 sm:px-6">
        {!mine.online ? (
          <Notice tone="warn" className="mb-5">
            Sessions booked on Merit happen online. Turn on online tutoring in{" "}
            <Link href="/tutors/join" className="font-bold underline">
              your listing
            </Link>{" "}
            so students can book these times.
          </Notice>
        ) : null}
        <div className={cn(panel, "p-5 sm:p-7")}>
          <AvailabilityGrid initial={meta.availability} timezone={meta.timezone} hasSaved={meta.availability.length > 0} timeOff={meta.timeOff ?? []} profileHref={`/tutors/${mine.id}`} />
        </div>
      </div>
    </div>
  );
}
