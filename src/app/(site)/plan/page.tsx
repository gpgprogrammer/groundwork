import { ArrowRight, BookOpenCheck, CalendarDays, ChartColumn, Lock, Sparkles, Zap } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CourseIcon } from "@/components/course-icon";
import { FocusPicker } from "@/components/focus-picker";
import { heroGlass, heroWhite, HeroPill, PlanHero } from "@/components/plan-ui";
import { ExamCta, PlusBadge, PlusLocked } from "@/components/upgrade";
import { cn, formatDuration } from "@/components/ui";
import { VideoCard } from "@/components/video-card";
import { hasPlus } from "@/lib/billing/access";
import { getCatalog } from "@/lib/catalog";
import { daysUntil, examDateFor } from "@/lib/exams";
import { toFeedVideo } from "@/lib/feed";
import { focusCourses } from "@/lib/focus";
import { fromClasses, learningPlan, planVideoCount, type PlanGroup, type PlanSource } from "@/lib/learning-plan";
import { sampleState } from "@/lib/sample";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Learning plan", description: "Videos picked for what you're learning in class: every quiz and test on your calendar, and the topics you're covering now." };

const SOURCE: Record<PlanSource, { label: string; cls: string }> = {
  test: { label: "On your calendar", cls: "bg-sprint-soft text-sprint-ink" },
  class: { label: "In class now", cls: "bg-accent-soft text-accent-ink" },
  next: { label: "Up next", cls: "bg-positive-soft text-positive" },
};

/** The learning plan: videos for what you're covering in class. Merit Plus. */
export default async function PlanPage() {
  const [viewer, catalog] = await Promise.all([getViewer(), getCatalog()]);

  if (!viewer || !hasPlus(viewer.plus)) {
    const sample = learningPlan(catalog, sampleState(catalog), 6);
    return (
      <div className="pb-16">
        <PlanHero
          kicker={
            <HeroPill>
              <Lock className="size-3.5" /> Merit Plus
            </HeroPill>
          }
          aside={
            sample.length ? (
              <div className="rotate-[1.5deg] rounded-3xl bg-surface p-4 text-ink shadow-[0_8px_0_0_rgb(0_0_0/0.18)] ring-2 ring-white/40">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-brand text-[15px] font-extrabold">A learning plan</p>
                  <span className="rounded-full bg-bg-subtle px-2.5 py-1 font-brand text-[11.5px] font-extrabold text-muted">Example</span>
                </div>
                <ul className="mt-3 space-y-2">
                  {sample.slice(0, 3).map((g) => (
                    <li key={g.key} className="flex items-center gap-3 rounded-2xl bg-bg-subtle/70 p-2.5">
                      <CourseIcon id={g.course.id} size={28} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-bold">{g.topic.title}</span>
                        <span className="block truncate text-[12px] text-muted">
                          {g.reason} · {g.videos.length} {g.videos.length === 1 ? "video" : "videos"}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null
          }
        >
          <h1 className="display rise text-[44px] sm:text-[64px]" style={{ ["--i" as string]: 1 }}>
            Your learning plan
          </h1>
          <p className="rise mt-3 max-w-xl text-[17px] leading-relaxed text-white/90" style={{ ["--i" as string]: 2 }}>
            Videos picked for what you&apos;re learning in class right now: every quiz and test on your class calendar, and the topics you&apos;re covering this week.
          </p>
        </PlanHero>
        <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:px-8">
          <PlusLocked access={viewer?.plus ?? { kind: "anonymous" }} feature="Your learning plan" returnTo="/plan" title="Unlock your learning plan with Merit Plus." />
          {sample.length ? (
            <section className="mt-12" aria-label="Example learning plan">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="headline text-[24px] text-ink">What a learning plan looks like</h2>
                <span className="rounded-full bg-positive-soft px-3 py-1 font-brand text-[12.5px] font-extrabold text-positive">Example · AP Bio + Calc BC</span>
              </div>
              <p className="mt-1 text-[14.5px] text-muted">A Calc quiz this week and a Bio unit test coming up. Your plan lines up the best videos for both.</p>
              <div className="relative mt-5">
                <div aria-hidden className="pointer-events-none select-none space-y-6 opacity-60 blur-[2px]">
                  {sample.slice(0, 2).map((g) => (
                    <div key={g.key}>
                      <GroupHeader g={g} />
                      <div className="mt-3 grid gap-3 sm:grid-cols-3 grid-cols-[minmax(0,1fr)]">
                        {g.videos.map((v) => (
                          <div key={v.id} className="rounded-3xl bg-surface p-2 ring-2 ring-line">
                            <span className="relative block aspect-video overflow-hidden rounded-2xl bg-bg-subtle">
                              <img src={v.thumbnail} alt="" loading="lazy" referrerPolicy="no-referrer" className="absolute inset-0 size-full object-cover" />
                              <span className="tabular absolute bottom-1.5 right-1.5 rounded-md bg-black/75 px-1.5 text-[11px] font-bold text-white">{formatDuration(v.durationSec)}</span>
                            </span>
                            <span className="mt-2 line-clamp-2 px-1 pb-1 text-[14px] font-bold leading-snug text-ink">{v.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 font-brand text-[14px] font-extrabold text-bg shadow-lg">
                    <Lock className="size-4" /> Unlock with Merit Plus
                  </span>
                </div>
              </div>
            </section>
          ) : null}
        </div>
      </div>
    );
  }

  const plan = learningPlan(catalog, viewer.state);
  const count = planVideoCount(plan);
  const classes = fromClasses(plan);
  const courses = viewer.state.profile.courseIds;
  const apCourses = courses.map((id) => catalog.course(id)).filter((c) => c && c.exam === "AP");
  const soonest = apCourses[0];
  const examDate = soonest ? examDateFor(soonest, viewer.state.profile) : null;

  return (
    <div className="pb-16">
      <PlanHero
        kicker={
          <>
            <PlusBadge onDark />
            {viewer.plus.kind === "trial" ? <span className="font-brand text-[13px] font-bold text-white/80">Free for {viewer.plus.daysLeft} more days</span> : null}
          </>
        }
        aside={
          count ? (
            <div className="flex items-stretch gap-3">
              <div className="flex-1 rounded-3xl bg-white/15 p-3.5 ring-2 ring-inset ring-white/25 sm:p-4">
                <p className="tabular display text-[40px] leading-none sm:text-[56px]">{count}</p>
                <p className="mt-1 font-brand text-[14px] font-extrabold text-white/85">{count === 1 ? "video" : "videos"}</p>
              </div>
              <div className="flex-1 rounded-3xl bg-white/15 p-3.5 ring-2 ring-inset ring-white/25 sm:p-4">
                <p className="tabular display text-[40px] leading-none sm:text-[56px]">{plan.length}</p>
                <p className="mt-1 font-brand text-[14px] font-extrabold text-white/85">{plan.length === 1 ? "topic" : "topics"}</p>
              </div>
            </div>
          ) : null
        }
      >
        <h1 className="display rise text-[44px] sm:text-[64px]" style={{ ["--i" as string]: 1 }}>
          Your learning plan
        </h1>
        <p className="rise mt-3 max-w-xl text-[17px] leading-relaxed text-white/90" style={{ ["--i" as string]: 2 }}>
          {!count
            ? "Tell us what you're covering in class and your plan fills in with the best videos for it."
            : classes
              ? "The best videos for what you're learning in class right now."
              : "A start from your courses. Tell us what you're covering in class, or connect your class calendar, and the plan follows your classes."}
        </p>
        <div className="rise mt-6 flex flex-wrap gap-2.5" style={{ ["--i" as string]: 3 }}>
          <a href="#covering" className={heroWhite}>
            <BookOpenCheck className="size-4" /> What we&apos;re covering
          </a>
          <Link href="/schedule" className={heroGlass}>
            <CalendarDays className="size-4" /> My schedule
          </Link>
          <Link href="/progress" className={heroGlass}>
            <ChartColumn className="size-4" /> Progress
          </Link>
        </div>
      </PlanHero>

      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px] grid-cols-[minmax(0,1fr)]">
          <div className="min-w-0">
            {!courses.length ? (
              <div className="rounded-3xl bg-positive-soft p-6 ring-2 ring-positive/20">
                <p className="headline text-[20px] text-ink">Pick your courses to get a learning plan.</p>
                <Link href="/onboarding" className="press mt-4 inline-flex h-11 items-center gap-2 rounded-2xl bg-[#15803d] px-5 font-brand text-[15px] font-extrabold text-white [--ledge:#0f5c2b] hover:brightness-110">
                  Choose courses <ArrowRight className="size-4" />
                </Link>
              </div>
            ) : plan.length ? (
              <div className="space-y-10">
                {plan.map((g, i) => (
                  <section key={g.key} className="rise" style={{ ["--i" as string]: Math.min(i, 6) }}>
                    <GroupHeader g={g} link />
                    <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 grid-cols-[minmax(0,1fr)]">
                      {g.videos.map((v) => (
                        <VideoCard key={v.id} v={toFeedVideo(catalog, v)} />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl bg-surface p-6 ring-2 ring-line">
                <p className="headline text-[20px] text-ink">Nothing to suggest yet.</p>
                <p className="mt-1 text-[15px] text-muted">Pick the topics you&apos;re covering in class and your plan fills in.</p>
              </div>
            )}
            {!viewer.state.schedule && courses.length ? (
              <Link href="/schedule" className="press mt-10 flex items-center gap-4 rounded-3xl bg-accent p-5 text-white [--ledge:var(--accent-press)] hover:brightness-110">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/20">
                  <CalendarDays className="size-6" />
                </span>
                <span className="min-w-0 flex-1 text-[14.5px] leading-snug text-white/90">
                  <span className="block font-brand text-[17px] font-extrabold text-white">Connect your class calendar</span>
                  and every quiz and test gets its videos in your plan, days before it&apos;s due.
                </span>
                <ArrowRight className="size-5 shrink-0" />
              </Link>
            ) : null}
          </div>

          <aside className="space-y-5">
            {courses.length ? (
              <section id="covering" className="scroll-mt-28 overflow-hidden rounded-3xl bg-surface ring-2 ring-line">
                <div className="flex items-center gap-3 bg-accent-soft px-5 py-4">
                  <span className="flex size-10 items-center justify-center rounded-2xl bg-accent text-white">
                    <BookOpenCheck className="size-5" />
                  </span>
                  <h2 className="headline text-[19px] leading-tight text-ink">What are you covering in class?</h2>
                </div>
                <div className="p-5">
                  <p className="mb-4 text-[13.5px] leading-relaxed text-muted">Pick the topics you&apos;re on this week. Your plan updates right away.</p>
                  <FocusPicker courses={focusCourses(catalog, courses)} initial={viewer.state.profile.focusTopicIds} />
                </div>
              </section>
            ) : null}
            <Link href="/master" className="press flex items-center gap-4 rounded-3xl bg-surface p-5 ring-2 ring-line [--ledge:var(--line)] hover:bg-bg-subtle">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-white">
                <Zap className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-brand text-[16px] font-black text-ink">Quick session</span>
                <span className="block text-[13px] text-muted">Master one topic in about 15 minutes.</span>
              </span>
            </Link>
            {soonest ? <ExamCta daysLeft={examDate ? daysUntil(examDate) : null} courseId={soonest.id} courseTitle={soonest.shortTitle} /> : null}
          </aside>
        </div>
      </div>
    </div>
  );
}

function GroupHeader({ g, link = false }: { g: PlanGroup; link?: boolean }) {
  const s = SOURCE[g.source];
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <CourseIcon id={g.course.id} size={40} />
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2">
          <span className={cn("rounded-full px-2.5 py-0.5 font-brand text-[12px] font-extrabold", s.cls)}>{g.source === "class" ? s.label : g.reason}</span>
          <span className="font-brand text-[13px] font-bold text-muted">{g.course.shortTitle}</span>
        </p>
        {link ? (
          <Link href={`/courses/${g.course.slug}/${g.topic.slug}`} className="headline mt-1 block text-[21px] leading-snug text-ink decoration-2 underline-offset-4 hover:underline">
            {g.topic.title}
          </Link>
        ) : (
          <p className="headline mt-1 text-[21px] leading-snug text-ink">{g.topic.title}</p>
        )}
      </div>
      {link ? (
        <Link href={`/master/${g.course.slug}/${g.topic.slug}`} className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-bg-subtle px-3 font-brand text-[13px] font-extrabold text-ink-2 transition-colors hover:bg-line hover:text-ink">
          <Sparkles className="size-3.5" /> Quick session
        </Link>
      ) : null}
    </div>
  );
}
