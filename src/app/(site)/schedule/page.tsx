import { ArrowRight, CalendarDays, CalendarPlus, Check, ChevronDown, EyeOff, Link2, Lock, Sparkles, Target, Trash2, Unlink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { clearMatch, hideEvent, removeSource } from "@/app/actions/schedule";
import { beginSprintTrial } from "@/app/actions/sprint";
import { FocusPicker } from "@/components/focus-picker";
import { ResyncButton } from "@/components/resync-button";
import { CalendarBenefits } from "@/components/calendar-benefits";
import { ScheduleSetup } from "@/components/schedule-setup";
import { CourseIcon } from "@/components/course-icon";
import { HeroPill, PlanHero } from "@/components/plan-ui";
import { googleCalendarEnabled } from "@/lib/google-calendar";
import { ago, cn } from "@/components/ui";
import { BuyButton } from "@/components/upgrade";
import { LessonMini } from "@/components/video-card";
import { calendarAccess } from "@/lib/billing/access";
import { PLUS, SPRINT, usd } from "@/lib/billing/plans";
import { getCatalog, type IndexedCatalog } from "@/lib/catalog";
import { focusCourses } from "@/lib/focus";
import { futureEvents, whenLabel } from "@/lib/recommend";
import { sampleState } from "@/lib/sample";
import { refreshStaleSources } from "@/lib/schedule-refresh";
import { visibleEvents } from "@/lib/schedule-model";
import type { ScheduleEvent } from "@/lib/types";
import { getViewer, type Viewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "My schedule" };

const KIND: Record<ScheduleEvent["kind"], string> = { test: "Test", assignment: "Due", class: "Class", other: "Event" };
const KIND_CLS: Record<ScheduleEvent["kind"], string> = {
  test: "bg-sprint-soft text-sprint-ink",
  assignment: "bg-accent-soft text-accent-ink",
  class: "bg-positive-soft text-positive",
  other: "bg-bg-subtle text-ink-2",
};
const SOURCE_KIND = { "ics-url": "Syncs on its own", "ics-file": "Uploaded .ics", document: "Imported file", text: "Pasted", google: "Syncs on its own" } as const;
const GOOGLE_NOTE: Record<string, string> = {
  connected: "Google Calendar is connected.",
  canceled: "Google Calendar wasn't connected. You can try again anytime.",
  error: "We couldn't connect Google Calendar. Please try again.",
};

/** Upcoming events grouped by day, in order. */
function byDay(events: ScheduleEvent[]) {
  const days = new Map<string, ScheduleEvent[]>();
  for (const e of events) {
    const key = new Date(e.start).toDateString();
    days.set(key, [...(days.get(key) ?? []), e]);
  }
  return [...days.values()];
}

function HeroNote({ children }: { children: React.ReactNode }) {
  return (
    <p role="status" className="fade mb-5 flex items-start gap-2.5 rounded-2xl bg-white px-4 py-3 text-[14px] font-semibold text-[#12722f] shadow-[0_4px_0_0_rgb(0_0_0/0.18)]">
      <Check className="mt-0.5 size-4 shrink-0" strokeWidth={3} /> {children}
    </p>
  );
}

function StatTile({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex-1 rounded-3xl bg-white/15 p-3.5 ring-2 ring-inset ring-white/25 sm:p-4">
      <p className="tabular display text-[40px] leading-none sm:text-[52px]">{value}</p>
      <p className="mt-1 font-brand text-[13.5px] font-extrabold text-white/85">{label}</p>
    </div>
  );
}

export default async function SchedulePage({ searchParams }: PageProps<"/schedule">) {
  const [viewer, catalog, sp] = await Promise.all([getViewer(), getCatalog(), searchParams]);
  const added = typeof sp.added === "string" ? Number(sp.added) : null;
  const googleNote =
    typeof sp.google === "string"
      ? sp.google === "connected" && typeof sp.added === "string"
        ? `Google Calendar is connected. Added ${sp.added} ${sp.added === "1" ? "test or assignment" : "tests and assignments"}.`
        : GOOGLE_NOTE[sp.google]
      : added !== null && typeof sp.from === "string"
        ? `Added ${added} ${added === 1 ? "test or assignment" : "tests and assignments"} from ${sp.from.slice(0, 60)}.`
        : undefined;
  if (!viewer || !calendarAccess(viewer)) return <SchedulePreview catalog={catalog} viewer={viewer} />;
  const schedule = (await refreshStaleSources(viewer)) ?? viewer.state.schedule;
  const upcoming = futureEvents(visibleEvents(schedule)).slice(0, 60);
  const hiddenCount = schedule?.hidden.length ?? 0;
  const days = byDay(upcoming);

  if (!schedule?.sources.length) {
    return (
      <div className="pb-16">
        <PlanHero
          kicker={
            <HeroPill>
              <CalendarDays className="size-3.5" /> My schedule
            </HeroPill>
          }
        >
          {googleNote ? <HeroNote>{googleNote}</HeroNote> : null}
          <h1 className="display rise text-[40px] sm:text-[60px]" style={{ ["--i" as string]: 1 }}>
            Connect your schedule
          </h1>
          <p className="rise mt-3 max-w-2xl text-[17px] leading-relaxed text-white/90" style={{ ["--i" as string]: 2 }}>
            It takes about a minute, and everything on Merit starts following what you&apos;re learning in class.
          </p>
        </PlanHero>
        <div className="mx-auto max-w-4xl px-4 pt-8 sm:px-6">
          <section className="rise rounded-3xl bg-surface p-4 ring-2 ring-line sm:p-7" style={{ ["--i" as string]: 3 }}>
            <ScheduleSetup googleEnabled={googleCalendarEnabled} />
          </section>
          <section className="mt-12">
            <h2 className="headline text-[24px] text-ink">What connecting does</h2>
            <CalendarBenefits className="mt-5" />
          </section>
          <details className="group mt-10 overflow-hidden rounded-3xl bg-surface ring-2 ring-line [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-positive-soft text-positive">
                <Sparkles className="size-5" />
              </span>
              <span className="min-w-0 flex-1 font-brand text-[16px] font-extrabold text-ink">No calendar? Just pick the topics you&apos;re covering in class</span>
              <ChevronDown className="size-5 shrink-0 text-muted transition-transform group-open:rotate-180" />
            </summary>
            <div className="border-t-2 border-line px-5 pb-5 pt-4">
              <FocusPicker courses={focusCourses(catalog, viewer.state.profile.courseIds)} initial={viewer.state.profile.focusTopicIds} />
            </div>
          </details>
        </div>
      </div>
    );
  }

  const tests = upcoming.filter((e) => e.kind === "test").length;
  return (
    <div className="pb-16">
      <PlanHero
        kicker={
          <HeroPill>
            <CalendarDays className="size-3.5" /> {schedule.sources.length} {schedule.sources.length === 1 ? "calendar" : "calendars"} connected
          </HeroPill>
        }
        aside={
          <div className="flex gap-3">
            <StatTile value={tests} label={tests === 1 ? "test coming up" : "tests coming up"} />
            <StatTile value={upcoming.length - tests} label="other items" />
          </div>
        }
      >
        {googleNote ? <HeroNote>{googleNote}</HeroNote> : null}
        <h1 className="display rise text-[44px] sm:text-[64px]" style={{ ["--i" as string]: 1 }}>
          My schedule
        </h1>
        <p className="rise mt-3 max-w-2xl text-[17px] leading-relaxed text-white/90" style={{ ["--i" as string]: 2 }}>
          Your tests and assignments from every calendar you connect, with the right lessons and a Sprint for each test.
        </p>
      </PlanHero>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 pt-8 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8 grid-cols-[minmax(0,1fr)]">
        <section className="min-w-0">
          <h2 className="headline text-[24px] text-ink">Coming up</h2>
          {days.length ? (
            <Timeline days={days} catalog={catalog} interactive />
          ) : (
            <div className="mt-4 flex items-center gap-4 rounded-3xl bg-surface p-6 ring-2 ring-line">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-positive-soft text-positive">
                <CalendarPlus className="size-7" />
              </span>
              <p className="text-[14.5px] leading-relaxed text-ink-2">
                No upcoming tests or assignments yet. If your assignments live somewhere else (like Blackbaud or Canvas), add that calendar too.
              </p>
            </div>
          )}
          {hiddenCount ? <p className="mt-6 font-brand text-[13px] font-bold text-muted">{hiddenCount} hidden {hiddenCount === 1 ? "event" : "events"}.</p> : null}
        </section>

        <aside className="space-y-6">
          <section className="overflow-hidden rounded-3xl bg-surface ring-2 ring-line">
            <div className="flex items-center justify-between gap-3 bg-positive-soft px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-[#15803d] text-white">
                  <Link2 className="size-5" />
                </span>
                <h2 className="headline text-[19px] text-ink">Your calendars</h2>
              </div>
              {schedule.sources.some((s) => s.kind === "ics-url" || s.kind === "google") ? <ResyncButton /> : null}
            </div>
            <ul className="space-y-2 p-3">
              {schedule.sources.map((s) => (
                <li key={s.id} className="flex items-center gap-3 rounded-2xl bg-bg-subtle/70 px-3 py-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface text-positive ring-2 ring-line">
                    <CalendarDays className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-brand text-[15px] font-extrabold text-ink">{s.label}</p>
                    <p className="text-[12.5px] text-muted">
                      {SOURCE_KIND[s.kind]} · {s.count} {s.count === 1 ? "item" : "items"} · {s.kind === "ics-url" || s.kind === "google" ? `synced ${ago(s.syncedAt)}` : `added ${ago(s.syncedAt)}`}
                    </p>
                  </div>
                  <form action={removeSource.bind(null, s.id)}>
                    <button className="flex size-10 items-center justify-center rounded-xl text-muted transition-colors hover:bg-danger-soft hover:text-danger" aria-label={`Remove ${s.label}`} title="Remove">
                      <Trash2 className="size-4" />
                    </button>
                  </form>
                </li>
              ))}
            </ul>
            <details className="group border-t-2 border-line [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center gap-2 px-5 py-4 font-brand text-[15px] font-extrabold text-positive">
                <CalendarPlus className="size-4" /> Add or update a calendar
                <ChevronDown className="ml-auto size-4 transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-4 pb-5">
                <ScheduleSetup googleEnabled={googleCalendarEnabled} />
              </div>
            </details>
          </section>
          <section className="overflow-hidden rounded-3xl bg-surface ring-2 ring-line">
            <div className="bg-positive-soft px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-[#15803d] text-white">
                  <Sparkles className="size-5" />
                </span>
                <h2 className="headline text-[19px] text-ink">What are you covering in class?</h2>
              </div>
              <p className="mt-2 text-[13.5px] text-ink-2">Pick the topics you&apos;re on right now and your plan leads with them.</p>
            </div>
            <div className="p-5">
              <FocusPicker courses={focusCourses(catalog, viewer.state.profile.courseIds)} initial={viewer.state.profile.focusTopicIds} />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

/** Days down a vertical line: a big date block, then that day's event tiles. */
function Timeline({ days, catalog, interactive }: { days: ScheduleEvent[][]; catalog: IndexedCatalog; interactive: boolean }) {
  return (
    <ol className="relative mt-5 space-y-6">
      <span aria-hidden className="absolute bottom-8 left-[27px] top-8 w-1.5 rounded-full bg-line sm:left-[31px]" />
      {days.map((events, i) => {
        const d = new Date(events[0].start);
        const rel = whenLabel(events[0].start);
        const when = /^[A-Z][a-z]{2} \d/.test(rel) ? d.toLocaleDateString("en-US", { weekday: "long" }) : rel;
        const soon = rel === "Today" || rel === "Tomorrow";
        return (
          <li key={d.toDateString()} className="rise relative flex gap-3 sm:gap-4" style={{ ["--i" as string]: Math.min(i, 8) }}>
            <div className="relative z-10 shrink-0">
              <span
                className={cn(
                  "press-sm flex size-14 flex-col items-center justify-center rounded-2xl sm:size-16",
                  soon ? "bg-[#15803d] text-white [--ledge:#0f5c2b]" : "border-2 border-line bg-surface text-ink [--ledge:var(--line)]",
                )}
              >
                <span className={cn("font-brand text-[11px] font-extrabold uppercase leading-none tracking-wide", soon ? "text-white/85" : "text-muted")}>
                  {d.toLocaleDateString("en-US", { weekday: "short" })}
                </span>
                <span className="tabular font-brand text-[24px] font-black leading-none sm:text-[26px]">{d.getDate()}</span>
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex h-14 items-center font-brand text-[16px] font-extrabold text-ink sm:h-16">
                {when}
                <span className="ml-2 font-semibold text-muted">{d.toLocaleDateString("en-US", { month: "long", day: "numeric" })}</span>
              </p>
              <div className="space-y-3">
                {events.map((e) => (
                  <EventBlock key={e.uid} e={e} catalog={catalog} interactive={interactive} />
                ))}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function EventBlock({ e, catalog, interactive }: { e: ScheduleEvent; catalog: IndexedCatalog; interactive: boolean }) {
  const course = e.courseId ? catalog.course(e.courseId) : undefined;
  const topics = e.topicIds.map((id) => catalog.topic(id)).filter((t) => t !== undefined);
  // Lessons only when the event itself names the topic. No guessing.
  const videos = topics.flatMap((t) => catalog.videosForTopic(t.id).filter((v) => !v.isShort).slice(0, 2)).slice(0, 3);
  const iconId = course?.id ?? topics[0]?.courseId;
  return (
    <div className={cn("rounded-3xl bg-surface p-4 ring-2 sm:p-5", e.kind === "test" ? "ring-sprint/35" : "ring-line")}>
      <div className="flex items-start gap-3">
        {iconId ? <CourseIcon id={iconId} size={40} /> : null}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("inline-flex h-6 items-center rounded-full px-2.5 font-brand text-[12px] font-extrabold", KIND_CLS[e.kind])}>{KIND[e.kind]}</span>
            {!e.allDay ? <span className="tabular font-brand text-[12.5px] font-bold text-muted">{new Date(e.start).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span> : null}
          </div>
          <p className="headline mt-1.5 text-[18px] text-ink sm:text-[19px]">{e.title}</p>
        </div>
      </div>
      <div className="mt-3">
        {topics.length ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-brand text-[13px] font-bold text-muted">Topics:</span>
            {topics.map((t) => (
              <Link
                key={t.id}
                href={`/courses/${catalog.course(t.courseId)!.slug}/${t.slug}`}
                className="inline-flex h-8 items-center rounded-full bg-positive-soft px-3 font-brand text-[13px] font-extrabold text-positive transition-colors hover:bg-positive/15"
              >
                {t.title}
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-muted">
            {course ? (
              <>
                Class:{" "}
                <Link href={`/courses/${course.slug}`} className="font-bold text-positive hover:underline">
                  {course.title}
                </Link>
                . Add the topic to the event name for matched lessons.
              </>
            ) : (
              "Not matched to a class."
            )}
          </p>
        )}
        {videos.length ? (
          <div className="mt-3 grid gap-1 rounded-2xl bg-bg-subtle/70 p-1.5 sm:grid-cols-2">
            {videos.map((v) => (
              <LessonMini key={v.id} v={v} />
            ))}
          </div>
        ) : null}
        {interactive ? (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {e.kind === "test" ? (
              <Link
                href={`/sprint/new?event=${encodeURIComponent(e.uid)}`}
                className="press-sm inline-flex h-10 items-center gap-1.5 rounded-xl bg-sprint px-4 font-brand text-[13.5px] font-extrabold text-white [--ledge:var(--sprint-press)] hover:brightness-110"
              >
                <Target className="size-4" /> Sprint for this test
              </Link>
            ) : null}
            {course || topics.length ? (
              <form action={clearMatch.bind(null, e.uid)}>
                <button className="press-sm inline-flex h-10 items-center gap-1.5 rounded-xl border-2 border-line bg-surface px-3.5 font-brand text-[13px] font-extrabold text-ink-2 [--ledge:var(--line)] hover:bg-bg-subtle">
                  <Unlink className="size-3.5" /> Wrong match
                </button>
              </form>
            ) : null}
            <form action={hideEvent.bind(null, e.uid, true)}>
              <button className="press-sm inline-flex h-10 items-center gap-1.5 rounded-xl border-2 border-line bg-surface px-3.5 font-brand text-[13px] font-extrabold text-ink-2 [--ledge:var(--line)] hover:bg-bg-subtle">
                <EyeOff className="size-3.5" /> Hide
              </button>
            </form>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** Without Plus or Exam Sprint: a sample week first, then both ways to unlock it. */
function SchedulePreview({ catalog, viewer }: { catalog: IndexedCatalog; viewer: Viewer | null }) {
  const events = futureEvents(sampleState(catalog).schedule!.events);
  return (
    <div className="pb-16">
      <PlanHero
        kicker={
          <HeroPill>
            <Lock className="size-3.5" /> Plus or Exam Sprint
          </HeroPill>
        }
      >
        <h1 className="display rise text-[44px] sm:text-[64px]" style={{ ["--i" as string]: 1 }}>
          My schedule
        </h1>
        <p className="rise mt-3 max-w-2xl text-[17px] leading-relaxed text-white/90" style={{ ["--i" as string]: 2 }}>
          Connect your school calendar and everything on Merit starts following what you&apos;re learning in class.
        </p>
        <div className="rise mt-6 flex flex-wrap gap-2.5" style={{ ["--i" as string]: 3 }}>
          <a href="#unlock" className="press flex h-12 items-center gap-2 rounded-2xl bg-white px-5 font-brand text-[15.5px] font-extrabold text-[#12722f] [--ledge:rgb(0_0_0/0.22)] hover:brightness-95">
            See how to unlock it <ArrowRight className="size-4" />
          </a>
        </div>
      </PlanHero>
      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:px-8">
        <CalendarBenefits />
        <div className="mt-12 flex flex-wrap items-center gap-3">
          <h2 className="headline text-[24px] text-ink">A week on My schedule</h2>
          <span className="rounded-full bg-positive-soft px-3 py-1 font-brand text-[12.5px] font-extrabold text-positive">Sample week</span>
        </div>
        <p className="mt-1 text-[14.5px] text-muted">Example: what it looks like for a student taking AP Biology and AP Calculus BC.</p>
        <div className="max-w-3xl">
          <Timeline days={byDay(events)} catalog={catalog} interactive={false} />
        </div>

        <section id="unlock" className="mt-12 scroll-mt-[calc(var(--nav-h)+16px)]">
          <p className="flex items-center gap-2 font-brand text-[15px] font-extrabold text-ink">
            <Lock className="size-4 text-positive" /> Calendar sync comes with Merit Plus or Exam Sprint
          </p>
          <h2 className="headline mt-2 text-[26px] text-ink sm:text-[30px]">Connect Blackbaud, Canvas, Schoology, Google, or a PDF.</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="relative overflow-hidden rounded-3xl bg-accent p-6 text-white shadow-[0_4px_0_0_var(--accent-press)]">
              <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 size-44 rounded-full border-[28px] border-white/10" />
              <span className="relative inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 font-brand text-[12.5px] font-extrabold">
                <Sparkles className="size-3.5" /> Merit Plus
              </span>
              <p className="relative mt-4 text-[15px] leading-relaxed text-white/90">
                Calendar sync, a nightly plan, reminders, and progress. {usd(PLUS.monthly)}/month; your first month is free.
              </p>
              <div className="relative mt-5">
                {viewer ? (
                  <BuyButton product="plus-month" returnTo="/schedule" variant="light">
                    Get Plus
                  </BuyButton>
                ) : (
                  <Link href="/signup?next=/schedule" className="press inline-flex h-12 items-center gap-2 rounded-2xl bg-white px-5 font-brand text-[15px] font-extrabold text-[#1a45b5] [--ledge:rgb(0_0_0/0.22)] hover:brightness-95">
                    Start your free month <ArrowRight className="size-4" />
                  </Link>
                )}
              </div>
            </div>
            <div className="relative overflow-hidden rounded-3xl bg-sprint p-6 text-white shadow-[0_4px_0_0_var(--sprint-press)]">
              <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 size-44 rounded-full border-[28px] border-white/10" />
              <span className="relative inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 font-brand text-[12.5px] font-extrabold">
                <Target className="size-3.5" /> Exam Sprint
              </span>
              <p className="relative mt-4 text-[15px] leading-relaxed text-white/90">Calendar sync plus a Sprint for every test, forever. Free for 7 days, then {usd(SPRINT.price)} once.</p>
              <div className="relative mt-5">
                {viewer && !viewer.billing.sprintTrialEndsAt ? (
                  <form action={beginSprintTrial.bind(null, "/schedule")}>
                    <button className="press inline-flex h-12 items-center gap-2 rounded-2xl bg-white px-5 font-brand text-[15px] font-extrabold text-[#93350c] [--ledge:rgb(0_0_0/0.22)] hover:brightness-95">
                      Try it free for 7 days
                    </button>
                  </form>
                ) : viewer ? (
                  <BuyButton product="sprint" returnTo="/schedule" variant="light">
                    Unlock for {usd(SPRINT.price)}
                  </BuyButton>
                ) : (
                  <Link href="/signup?next=/sprint" className="press inline-flex h-12 items-center gap-2 rounded-2xl bg-white px-5 font-brand text-[15px] font-extrabold text-[#93350c] [--ledge:rgb(0_0_0/0.22)] hover:brightness-95">
                    Try the free diagnostic <ArrowRight className="size-4" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
