import { CalendarDays, Radio, Sparkles, Target, Zap } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { money } from "@/components/booking-ui";
import { HeroKicker, WorldHero } from "@/components/marketing";
import { OnCallRequestForm } from "@/components/on-call-client";
import { Initials, RatingLine, V } from "@/components/tutoring-ui";
import { cn, panel, panelLink } from "@/components/ui";
import { allTutorMeta } from "@/lib/bookings";
import { getCatalog } from "@/lib/catalog";
import { getStore } from "@/lib/data/store";
import { ON_CALL_LENGTHS, onCallTutors, URGENCY, WAIT_MINUTES } from "@/lib/on-call";
import { rankTutors } from "@/lib/tutoring";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = {
  title: "On-call math tutors",
  description: "Stuck on math that's due tonight? Get an on-call tutor in minutes: one request goes to every tutor on call for your class, and the first one ready takes it.",
};

const time = (iso: string) => new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

export default async function OnCallPage({ searchParams }: PageProps<"/tutors/on-call">) {
  const [sp, catalog, viewer, store] = await Promise.all([searchParams, getCatalog(), getViewer(), getStore()]);
  const [tutors, reviews, meta] = await Promise.all([store.listTutors(), store.listReviews(), allTutorMeta()]);
  const ranked = rankTutors(tutors, reviews);
  const requested = typeof sp.course === "string" ? catalog.course(sp.course) : undefined;
  const course = requested ?? catalog.course(viewer?.state.profile.courseIds.find((id) => catalog.course(id)) ?? "") ?? catalog.courses[0];
  const topic = typeof sp.topic === "string" ? catalog.topic(sp.topic) : undefined;
  const here = onCallTutors(ranked, meta, course.id).filter((t) => t.userId !== viewer?.user.id);
  const anyOnCall = onCallTutors(ranked, meta).length;
  const isTutor = Boolean(viewer && tutors.some((t) => t.userId === viewer.user.id));
  const topics = Object.fromEntries(catalog.courses.map((c) => [c.id, catalog.topicsForCourse(c.id).map((t) => ({ id: t.id, title: t.title }))]));

  return (
    <div className="pb-20">
      <WorldHero world="violet" inner="pb-12 pt-8 lg:pb-14 lg:pt-10">
        <HeroKicker>
          <Radio className="size-4" /> On-call tutors
        </HeroKicker>
        <h1 className="display rise mt-4 max-w-3xl text-[38px] sm:text-5xl lg:text-[58px]">Stuck, and it&apos;s due tonight?</h1>
        <p className="rise mt-4 max-w-2xl text-[16.5px] leading-relaxed text-white/90" style={{ ["--i" as string]: 1 }}>
          Tell us what you&apos;re stuck on. Your request goes to every math tutor on call for your class, and the first one ready starts a video session with you, usually within minutes.
        </p>
        <p className="rise mt-6 inline-flex h-10 items-center gap-2 rounded-full bg-white/15 px-4 font-brand text-[14.5px] font-extrabold ring-1 ring-inset ring-white/25" style={{ ["--i" as string]: 2 }}>
          <span className="relative flex size-2.5">
            {anyOnCall ? <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#4ade80] opacity-70 motion-reduce:hidden" /> : null}
            <span className={cn("relative inline-flex size-2.5 rounded-full", anyOnCall ? "bg-[#4ade80]" : "bg-white/50")} />
          </span>
          <span className="tabular">{anyOnCall ? `${anyOnCall} ${anyOnCall === 1 ? "tutor" : "tutors"} on call now` : "No tutors on call right now"}</span>
        </p>
      </WorldHero>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 pt-10 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:px-8">
        <section className={cn(panel, "p-5 sm:p-7")}>
          <h2 className="headline text-[24px] text-ink">Get help now</h2>
          <p className="mt-1 text-[14px] text-muted">Nobody takes it within {WAIT_MINUTES} minutes? It expires, and you&apos;re never charged for a session that didn&apos;t happen.</p>
          <div className="mt-5">
            {viewer ? (
              <OnCallRequestForm
                courses={catalog.courses.map((c) => ({ id: c.id, title: c.title }))}
                topics={topics}
                defaultCourse={course.id}
                defaultTopic={topic?.courseId === course.id ? topic.id : undefined}
                urgency={URGENCY}
                lengths={ON_CALL_LENGTHS}
                disabled={!here.length}
              />
            ) : (
              <div className="rounded-2xl bg-bg-subtle p-5">
                <p className="text-[15px] text-ink-2">Sign in so your tutor knows who you are and can send you the session link.</p>
                <Link href={`/login?next=${encodeURIComponent(`/tutors/on-call?course=${course.id}`)}`} className={cn(V.btn, "mt-4 inline-flex h-11 items-center gap-2 rounded-2xl px-5 font-brand text-[15px] font-extrabold")}>
                  <Zap className="size-4" /> Sign in to get a tutor
                </Link>
              </div>
            )}
          </div>
        </section>

        <div className="min-w-0 space-y-6">
          <section>
            <h2 className="headline text-[22px] text-ink">On call for {course.shortTitle}</h2>
            {here.length ? (
              <ul className="mt-4 space-y-3">
                {here.map((t) => {
                  const m = meta.get(t.id)!;
                  return (
                    <li key={t.id}>
                      <Link href={`/tutors/${t.id}`} className={cn(panelLink, "flex items-center gap-4 p-4")}>
                        <span className="relative shrink-0">
                          <Initials name={t.name} size={52} />
                          <span className="absolute -bottom-0.5 -right-0.5 size-4 rounded-full bg-positive ring-[3px] ring-surface" aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-brand text-[16.5px] font-extrabold text-ink">{t.name}</span>
                          <span className="block truncate text-[13px] text-muted">{t.headline}</span>
                          <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px]">
                            <RatingLine rating={t.rating} count={t.reviewCount} />
                            <span className="font-bold text-positive">Until {time(m.onCall!.until)}</span>
                          </span>
                        </span>
                        <span className="tabular shrink-0 text-right font-brand text-[15px] font-black text-ink">
                          {t.hourlyRate ? `${money(t.hourlyRate)}/hr` : "Free"}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="mt-4 rounded-3xl border-2 border-dashed border-line bg-surface p-5">
                <p className="font-brand text-[16px] font-extrabold text-ink">Nobody&apos;s on call for {course.shortTitle} right now.</p>
                <p className="mt-1 text-[14px] text-muted">Here&apos;s the fastest help in the meantime:</p>
                <ul className="mt-4 grid gap-2">
                  <li>
                    <Link href={`/tutors/book?course=${course.id}`} className="flex items-center gap-3 rounded-2xl bg-bg-subtle px-4 py-3 font-bold text-ink hover:bg-line">
                      <CalendarDays className="size-5 text-[#7c3aed]" /> Book the soonest open tutor time
                    </Link>
                  </li>
                  <li>
                    <Link href="/ask" className="flex items-center gap-3 rounded-2xl bg-bg-subtle px-4 py-3 font-bold text-ink hover:bg-line">
                      <Sparkles className="size-5 text-[#db2777]" /> Ask Merit AI to walk you through it
                    </Link>
                  </li>
                  <li>
                    <Link href={`/practice?course=${course.slug}`} className="flex items-center gap-3 rounded-2xl bg-bg-subtle px-4 py-3 font-bold text-ink hover:bg-line">
                      <Target className="size-5 text-sprint" /> Practice problems with step-by-step solutions
                    </Link>
                  </li>
                </ul>
              </div>
            )}
          </section>

          <section className={cn(panel, "p-5")}>
            <h3 className="font-brand text-[16px] font-extrabold text-ink">How on-call tutoring works</h3>
            <ol className="mt-3 space-y-2.5 text-[14px] leading-relaxed text-ink-2">
              {[
                "Pick your class and tell us what's due. One request reaches every tutor on call for it.",
                "The first tutor ready accepts. Your screen updates on its own with their video link.",
                "Join, share the problem, and work through it together. You pay the tutor's posted rate for the length you picked.",
              ].map((s, i) => (
                <li key={s} className="flex gap-3">
                  <span className={cn("tabular flex size-7 shrink-0 items-center justify-center rounded-lg font-brand text-[13px] font-black", V.soft, V.ink)}>{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
          </section>

          <Link href={isTutor ? "/tutor" : "/tutors/join"} className={cn(panelLink, "flex items-center gap-4 p-5")}>
            <Radio className={cn("size-6 shrink-0", V.ink)} />
            <span className="min-w-0 flex-1">
              <span className="block font-brand text-[16px] font-extrabold text-ink">{isTutor ? "Go on call from your dashboard" : "Tutor math? Take on-call sessions"}</span>
              <span className="block text-[13px] text-muted">Pick a couple of hours, add your video link, and accept requests as they come in.</span>
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
