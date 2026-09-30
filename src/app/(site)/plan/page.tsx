import { ArrowRight, Bell, Check, CalendarDays, ChartColumn, Moon, Play, Settings2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CopyField, PlanSettings } from "@/components/plan-client";
import { HeroPill, heroGlass, heroWhite, minutesLabel, PlanHero, TaskPath, WeekStrip } from "@/components/plan-ui";
import { CourseIcon } from "@/components/course-icon";
import { ExamCta, PlusBadge, PlusLocked } from "@/components/upgrade";
import { cn } from "@/components/ui";
import { hasPlus } from "@/lib/billing/access";
import { getCatalog } from "@/lib/catalog";
import { daysUntil, examDateFor } from "@/lib/exams";
import { requestOrigin } from "@/lib/origin";
import { buildPlan, DEFAULT_PREFS } from "@/lib/plan";
import { getDoneTasks, getPlanPrefs } from "@/lib/plan-store";
import { sampleState } from "@/lib/sample";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Study plan", description: "Know what to study tonight: a plan built from your calendar, exam date, and progress." };

export default async function PlanPage() {
  const [viewer, catalog, origin] = await Promise.all([getViewer(), getCatalog(), requestOrigin()]);

  if (!viewer || !hasPlus(viewer.plus)) {
    const sample = buildPlan(catalog, sampleState(catalog), DEFAULT_PREFS, 5);
    const first = sample.find((d) => d.tasks.length);
    return (
      <div className="pb-16">
        <PlanHero
          kicker={
            <HeroPill>
              <CalendarDays className="size-3.5" /> Plan
            </HeroPill>
          }
          aside={
            first ? (
              <div className="rotate-[1.5deg] rounded-3xl bg-surface p-4 text-ink shadow-[0_8px_0_0_rgb(0_0_0/0.18)] ring-2 ring-white/40">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-brand text-[15px] font-extrabold">A night on Merit</p>
                  <span className="rounded-full bg-bg-subtle px-2.5 py-1 font-brand text-[11.5px] font-extrabold text-muted">Example</span>
                </div>
                <ul className="mt-3 space-y-2">
                  {first.tasks.slice(0, 3).map((t, i) => (
                    <li key={t.id} className="flex items-center gap-3 rounded-2xl bg-bg-subtle/70 p-2.5">
                      <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full", i === 0 ? "bg-[#15803d] text-white" : "ring-[3px] ring-inset ring-line-strong")}>
                        {i === 0 ? <Check className="size-4" strokeWidth={3.5} /> : null}
                      </span>
                      <CourseIcon id={t.course.id} size={28} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-bold">{t.topic.title}</span>
                        <span className="block text-[12px] text-muted">
                          {t.course.shortTitle} · {t.minutes} min
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
            Your study plan
          </h1>
          <p className="rise mt-3 max-w-xl text-[17px] leading-relaxed text-white/90" style={{ ["--i" as string]: 2 }}>
            Your calendar, exam date, and progress become one short list for each night: the exact lessons to watch, in order, sized to the time you have.
          </p>
        </PlanHero>
        <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:px-8">
          <PlusLocked access={viewer?.plus ?? { kind: "anonymous" }} feature="Your study plan" returnTo="/plan" />
          <div className="mt-12 flex flex-wrap items-center gap-3">
            <h2 className="headline text-[24px] text-ink">What a week looks like</h2>
            <span className="rounded-full bg-positive-soft px-3 py-1 font-brand text-[12.5px] font-extrabold text-positive">Example · AP Bio + Calc BC</span>
          </div>
          <p className="mt-1 text-[14.5px] text-muted">A Calc quiz tomorrow and a Bio unit test Thursday. Merit schedules the right lessons around both.</p>
          <div className="mt-5">
            <WeekStrip plan={sample} done={{}} interactive={false} />
          </div>
        </div>
      </div>
    );
  }

  const [prefs, done] = await Promise.all([getPlanPrefs(viewer.user.id), getDoneTasks(viewer.user.id)]);
  const plan = buildPlan(catalog, viewer.state, prefs, 7);
  const tonight = plan[0];
  const doneTonight = tonight.tasks.filter((t) => done[t.id]).length;
  const left = tonight.tasks.find((t) => !done[t.id]);
  const pct = tonight.tasks.length ? Math.round((doneTonight / tonight.tasks.length) * 100) : 0;
  const feed = `${origin}/api/plan/feed/${prefs.feedToken}.ics`;
  const webcal = feed.replace(/^https?:/, "webcal:");
  const apCourses = viewer.state.profile.courseIds.map((id) => catalog.course(id)).filter((c) => c && c.exam === "AP");
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
          tonight.tasks.length ? (
            <div className="flex items-stretch gap-3">
              <div className="flex-1 rounded-3xl bg-white/15 p-3.5 ring-2 ring-inset ring-white/25 sm:p-4">
                <p className="tabular display text-[40px] leading-none sm:text-[56px]">{tonight.minutes}</p>
                <p className="mt-1 font-brand text-[14px] font-extrabold text-white/85">minutes</p>
              </div>
              <div className="flex-1 rounded-3xl bg-white/15 p-3.5 ring-2 ring-inset ring-white/25 sm:p-4">
                <p className="tabular display text-[40px] leading-none sm:text-[56px]">
                  {doneTonight}
                  <span className="text-[26px] text-white/70">/{tonight.tasks.length}</span>
                </p>
                <p className="mt-1 font-brand text-[14px] font-extrabold text-white/85">done</p>
              </div>
            </div>
          ) : null
        }
      >
        <h1 className="display rise text-[56px] sm:text-[80px]" style={{ ["--i" as string]: 1 }}>
          Tonight
        </h1>
        <p className="rise mt-2 font-brand text-[18px] font-bold text-white/90 sm:text-[20px]" style={{ ["--i" as string]: 2 }}>
          {tonight.tasks.length
            ? `${tonight.tasks.length} ${tonight.tasks.length === 1 ? "thing" : "things"}, about ${tonight.minutes < 60 ? `${tonight.minutes} minutes` : `${Math.floor(tonight.minutes / 60)} hr${tonight.minutes % 60 ? ` ${tonight.minutes % 60} min` : ""}`}. ${doneTonight ? `${doneTonight} done.` : ""}`
            : tonight.rest
              ? "Rest day. You earned it."
              : "Nothing planned tonight."}
        </p>
        {tonight.tasks.length ? (
          <div className="rise mt-5 max-w-xl" style={{ ["--i" as string]: 3 }}>
            <div className="h-5 overflow-hidden rounded-full bg-black/20 p-1" role="progressbar" aria-label="Tonight's progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
              <div className="h-full min-w-3 rounded-full bg-white transition-[width] duration-700 ease-out" style={{ width: `${Math.max(pct, 4)}%` }} />
            </div>
          </div>
        ) : null}
        <div className="rise mt-6 flex flex-wrap gap-2.5" style={{ ["--i" as string]: 4 }}>
          {left ? (
            <Link href={`/courses/${left.course.slug}/${left.topic.slug}`} className={heroWhite}>
              <Play className="size-4 shrink-0 fill-current" />
              <span className="truncate">Start: {left.topic.title}</span>
            </Link>
          ) : null}
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
            {!viewer.state.profile.courseIds.length ? (
              <div className="rounded-3xl bg-positive-soft p-6 ring-2 ring-positive/20">
                <p className="headline text-[20px] text-ink">Pick your courses to get a plan.</p>
                <Link href="/onboarding" className="press mt-4 inline-flex h-11 items-center gap-2 rounded-2xl bg-[#15803d] px-5 font-brand text-[15px] font-extrabold text-white [--ledge:#0f5c2b] hover:brightness-110">
                  Choose courses <ArrowRight className="size-4" />
                </Link>
              </div>
            ) : null}
            {tonight.tasks.length ? (
              <>
                <h2 className="headline mb-4 text-[22px] text-ink">Your checklist</h2>
                <TaskPath tasks={tonight.tasks} done={done} interactive />
              </>
            ) : viewer.state.profile.courseIds.length ? (
              <div className="flex items-center gap-4 rounded-3xl bg-surface p-6 ring-2 ring-line">
                <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-positive-soft text-positive">
                  <Moon className="size-7" />
                </span>
                <p className="text-[15px] text-ink-2">{tonight.rest ? "Tonight is a rest day. Your plan picks back up tomorrow." : "Nothing is due soon. Check the week ahead, or pick a lesson from your courses."}</p>
              </div>
            ) : null}
            {!viewer.state.schedule ? (
              <Link href="/schedule" className="press mt-6 flex items-center gap-4 rounded-3xl bg-accent p-5 text-white [--ledge:var(--accent-press)] hover:brightness-110">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/20">
                  <CalendarDays className="size-6" />
                </span>
                <span className="min-w-0 flex-1 text-[14.5px] leading-snug text-white/90">
                  <span className="block font-brand text-[17px] font-extrabold text-white">Connect your class calendar</span>
                  and your plan will prep you for every quiz and test automatically.
                </span>
                <ArrowRight className="size-5 shrink-0" />
              </Link>
            ) : null}
            <section className="mt-12">
              <div className="mb-4 flex items-end justify-between gap-4">
                <h2 className="headline text-[24px] text-ink">The week ahead</h2>
                <p className="tabular hidden font-brand text-[14px] font-bold text-muted sm:block">
                  {minutesLabel(plan.slice(1).reduce((n, d) => n + d.minutes, 0))} planned
                </p>
              </div>
              <WeekStrip plan={plan} done={done} interactive skipFirst flush />
            </section>
          </div>

          <aside className="space-y-5">
            {soonest ? <ExamCta daysLeft={examDate ? daysUntil(examDate) : null} courseId={soonest.id} courseTitle={soonest.shortTitle} /> : null}
            <section className="overflow-hidden rounded-3xl bg-surface ring-2 ring-line">
              <div className="flex items-center gap-3 bg-positive-soft px-5 py-4">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-[#15803d] text-white">
                  <Bell className="size-5" />
                </span>
                <h2 className="headline text-[19px] text-ink">Reminders</h2>
              </div>
              <div className="p-5">
                <p className="text-[13.5px] leading-relaxed text-muted">
                  Add your plan to the calendar you already use. Each study session shows up at your reminder time with an alert and the exact lessons.
                </p>
                <a href={webcal} className="press mt-4 flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#15803d] font-brand text-[15px] font-extrabold text-white [--ledge:#0f5c2b] hover:brightness-110">
                  <CalendarDays className="size-4" /> Add to Apple or Outlook
                </a>
                <a
                  href={`https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcal)}`}
                  target="_blank"
                  rel="noopener"
                  className="press mt-3 flex h-12 items-center justify-center gap-2 rounded-2xl bg-surface font-brand text-[15px] font-extrabold text-ink border-2 border-line [--ledge:var(--line)] hover:bg-bg-subtle"
                >
                  Add to Google Calendar
                </a>
                <p className="mt-4 text-[12.5px] font-semibold text-muted">Or paste this private link into any calendar app:</p>
                <div className="mt-2">
                  <CopyField value={feed} label="Private calendar link" />
                </div>
              </div>
            </section>
            <section className="overflow-hidden rounded-3xl bg-surface ring-2 ring-line">
              <div className="flex items-center gap-3 bg-positive-soft px-5 py-4">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-[#15803d] text-white">
                  <Settings2 className="size-5" />
                </span>
                <h2 className="headline text-[19px] text-ink">Plan settings</h2>
              </div>
              <div className="p-5">
                <PlanSettings minutesPerDay={prefs.minutesPerDay} reminderHour={prefs.reminderHour} studyDays={prefs.studyDays} />
              </div>
            </section>
          </aside>
        </div>

      </div>
    </div>
  );
}
