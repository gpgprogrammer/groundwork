import { CalendarDays, EyeOff, Link2, Lock, Target, Trash2, Unlink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { clearMatch, hideEvent, removeSource } from "@/app/actions/schedule";
import { beginSprintTrial } from "@/app/actions/sprint";
import { FocusPicker } from "@/components/focus-picker";
import { ResyncButton } from "@/components/resync-button";
import { ScheduleConnect } from "@/components/schedule-connect";
import { ago, cn } from "@/components/ui";
import { BuyButton } from "@/components/upgrade";
import { VideoCard } from "@/components/video-card";
import { calendarAccess } from "@/lib/billing/access";
import { PLUS, SPRINT, usd } from "@/lib/billing/plans";
import { getCatalog, type IndexedCatalog } from "@/lib/catalog";
import { toFeedVideo } from "@/lib/feed";
import { focusCourses } from "@/lib/focus";
import { futureEvents, whenLabel } from "@/lib/recommend";
import { sampleState } from "@/lib/sample";
import { refreshStaleSources } from "@/lib/schedule-refresh";
import { visibleEvents } from "@/lib/schedule-model";
import type { ScheduleEvent } from "@/lib/types";
import { getViewer, type Viewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "My schedule" };

const KIND: Record<ScheduleEvent["kind"], string> = { test: "Test", assignment: "Due", class: "Class", other: "Event" };
const SOURCE_KIND = { "ics-url": "Linked calendar", "ics-file": "Uploaded .ics", document: "Imported file", text: "Pasted list" } as const;

export default async function SchedulePage() {
  const [viewer, catalog] = await Promise.all([getViewer(), getCatalog()]);
  if (!viewer || !calendarAccess(viewer)) return <SchedulePreview catalog={catalog} viewer={viewer} />;
  const schedule = (await refreshStaleSources(viewer)) ?? viewer.state.schedule;
  const upcoming = futureEvents(visibleEvents(schedule)).slice(0, 60);
  const hiddenCount = schedule?.hidden.length ?? 0;

  const days = new Map<string, ScheduleEvent[]>();
  for (const e of upcoming) {
    const key = new Date(e.start).toDateString();
    days.set(key, [...(days.get(key) ?? []), e]);
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-16 pt-6 sm:px-6">
      <h1 className="flex items-center gap-3 text-[28px] font-bold tracking-tight text-ink">
        <CalendarDays className="size-7 text-accent" /> My schedule
      </h1>
      <p className="mt-1 max-w-2xl text-[15px] text-muted">Your tests and assignments from every calendar you connect, with the right lessons and a Sprint for each test.</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_420px]">
        <section className="min-w-0">
          {schedule?.sources.length ? (
            <>
              <h2 className="text-xl font-bold tracking-tight text-ink">Coming up</h2>
              {days.size ? (
                <div className="mt-4 space-y-8">
                  {[...days.entries()].map(([day, events]) => (
                    <div key={day}>
                      <p className="text-sm font-medium text-ink">
                        {whenLabel(events[0].start)}{" "}
                        <span className="font-normal text-muted">· {new Date(events[0].start).toLocaleDateString("en-US", { month: "long", day: "numeric" })}</span>
                      </p>
                      <div className="mt-3 space-y-4">
                        {events.map((e) => (
                          <EventBlock key={e.uid} e={e} catalog={catalog} interactive />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 rounded-xl bg-bg-subtle px-5 py-6 text-sm text-muted">
                  No upcoming tests or assignments on your calendars. If your assignments live somewhere else (like Blackbaud or Canvas), connect that calendar too.
                </p>
              )}
              {hiddenCount ? <p className="mt-6 text-[12.5px] text-muted">{hiddenCount} hidden {hiddenCount === 1 ? "event" : "events"}.</p> : null}
            </>
          ) : (
            <div className="rounded-xl ring-1 ring-line">
              <div className="border-b border-line px-5 py-4">
                <h2 className="text-lg font-bold tracking-tight text-ink">Connect your calendars</h2>
                <p className="mt-0.5 text-sm text-muted">Blackbaud, Canvas, Schoology, Veracross, Google, Outlook, Apple, or a PDF or pasted list.</p>
              </div>
              <div className="p-5">
                <ScheduleConnect />
              </div>
            </div>
          )}
        </section>

        <aside className="space-y-6">
          {schedule?.sources.length ? (
            <div className="rounded-xl ring-1 ring-line">
              <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
                <p className="text-[15px] font-bold text-ink">Your calendars</p>
                {schedule.sources.some((s) => s.kind === "ics-url") ? <ResyncButton /> : null}
              </div>
              <ul className="divide-y divide-line">
                {schedule.sources.map((s) => (
                  <li key={s.id} className="flex items-center gap-3 px-5 py-3">
                    <Link2 className="size-4 shrink-0 text-muted" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{s.label}</p>
                      <p className="text-xs text-muted">
                        {SOURCE_KIND[s.kind]} · {s.count} {s.count === 1 ? "item" : "items"} · {s.kind === "ics-url" ? `synced ${ago(s.syncedAt)}` : `added ${ago(s.syncedAt)}`}
                      </p>
                    </div>
                    <form action={removeSource.bind(null, s.id)}>
                      <button className="flex size-8 items-center justify-center rounded-full text-muted hover:bg-bg-subtle hover:text-ink" aria-label={`Remove ${s.label}`} title="Remove">
                        <Trash2 className="size-4" />
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
              <details className="border-t border-line px-5 py-3">
                <summary className="cursor-pointer text-sm font-medium text-accent">+ Add another calendar</summary>
                <div className="pt-4">
                  <ScheduleConnect compact />
                </div>
              </details>
            </div>
          ) : null}
          <div className="rounded-xl ring-1 ring-line">
            <div className="border-b border-line px-5 py-4">
              <h2 className="text-[15px] font-bold text-ink">What are you covering in class?</h2>
              <p className="mt-0.5 text-sm text-muted">Pick the topics you&apos;re on right now and your plan leads with them.</p>
            </div>
            <div className="p-5">
              <FocusPicker courses={focusCourses(catalog, viewer.state.profile.courseIds)} initial={viewer.state.profile.focusTopicIds} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function EventBlock({ e, catalog, interactive }: { e: ScheduleEvent; catalog: IndexedCatalog; interactive: boolean }) {
  const course = e.courseId ? catalog.course(e.courseId) : undefined;
  const topics = e.topicIds.map((id) => catalog.topic(id)).filter((t) => t !== undefined);
  // Lessons only when the event itself names the topic. No guessing.
  const videos = topics.flatMap((t) => catalog.videosForTopic(t.id).filter((v) => !v.isShort).slice(0, 2)).slice(0, 3);
  return (
    <div className="rounded-xl ring-1 ring-line">
      <div className="flex flex-wrap items-center gap-2 px-4 py-3">
        <span className={cn("rounded px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide", e.kind === "test" ? "bg-[#fde8e8] text-[#b42318]" : "bg-bg-subtle text-ink-2")}>{KIND[e.kind]}</span>
        <p className="min-w-0 flex-1 truncate text-[15px] font-medium text-ink">{e.title}</p>
        {!e.allDay ? <span className="text-[12.5px] text-muted">{new Date(e.start).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span> : null}
      </div>
      <div className="border-t border-line px-4 pb-4 pt-3">
        <p className="text-[13px] text-muted">
          {topics.length ? (
            <>
              Topics:{" "}
              {topics.map((t, i) => (
                <span key={t.id}>
                  {i ? ", " : ""}
                  <Link href={`/courses/${catalog.course(t.courseId)!.slug}/${t.slug}`} className="font-medium text-accent hover:underline">
                    {t.title}
                  </Link>
                </span>
              ))}
            </>
          ) : course ? (
            <>
              Class:{" "}
              <Link href={`/courses/${course.slug}`} className="font-medium text-accent hover:underline">
                {course.title}
              </Link>
              . Add the topic to the event name for matched lessons.
            </>
          ) : (
            "Not matched to a class."
          )}
        </p>
        {videos.length ? (
          <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {videos.map((v) => (
              <VideoCard key={v.id} v={toFeedVideo(catalog, v)} />
            ))}
          </div>
        ) : null}
        {interactive ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {e.kind === "test" ? (
              <Link href={`/sprint/new?event=${encodeURIComponent(e.uid)}`} className="inline-flex h-8 items-center gap-1.5 rounded-full bg-gradient-to-r from-[#ff8a3d] to-[#e0531c] px-3 text-[12.5px] font-semibold text-white">
                <Target className="size-3.5" /> Sprint for this test
              </Link>
            ) : null}
            {course || topics.length ? (
              <form action={clearMatch.bind(null, e.uid)}>
                <button className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[12.5px] font-medium text-muted ring-1 ring-line hover:text-ink">
                  <Unlink className="size-3.5" /> Wrong match
                </button>
              </form>
            ) : null}
            <form action={hideEvent.bind(null, e.uid, true)}>
              <button className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[12.5px] font-medium text-muted ring-1 ring-line hover:text-ink">
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
    <div className="mx-auto max-w-[1100px] px-4 pb-16 pt-6 sm:px-6">
      <h1 className="flex items-center gap-3 text-[28px] font-bold tracking-tight text-ink">
        <CalendarDays className="size-7 text-accent" /> My schedule
      </h1>
      <p className="mt-1 max-w-2xl text-[15px] text-muted">Connect your school calendar. When a quiz or test is coming, Merit lines up the exact lessons and a Sprint for it, days ahead.</p>
      <div className="mt-6 flex items-center gap-2">
        <span className="rounded-full bg-bg-subtle px-2.5 py-1 text-[12px] font-medium text-muted">Sample week</span>
        <span className="text-[13px] text-muted">A student taking AP Biology and AP Calculus BC</span>
      </div>
      <div className="mt-4 space-y-4">
        {events.map((e) => (
          <div key={e.uid}>
            <p className="mb-2 text-sm font-medium text-ink">
              {whenLabel(e.start)} <span className="font-normal text-muted">· {new Date(e.start).toLocaleDateString("en-US", { month: "long", day: "numeric" })}</span>
            </p>
            <EventBlock e={e} catalog={catalog} interactive={false} />
          </div>
        ))}
      </div>
      <section className="mt-10 rounded-3xl bg-[#0b1530] p-8 text-white">
        <p className="flex items-center gap-2 text-[13px] font-semibold text-[#9cc0ff]">
          <Lock className="size-4" /> Calendar sync comes with Merit Plus or Exam Sprint
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight">Connect Blackbaud, Canvas, Schoology, Google, or a PDF.</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-white/10 p-5">
            <p className="font-semibold">Merit Plus</p>
            <p className="mt-1 text-sm text-white/75">
              Calendar sync, a nightly plan, reminders, and progress. {usd(PLUS.monthly)}/month; your first month is free.
            </p>
            <div className="mt-4">
              {viewer ? (
                <BuyButton product="plus-month" returnTo="/schedule" variant="light">
                  Get Plus
                </BuyButton>
              ) : (
                <Link href="/signup?next=/schedule" className="inline-flex h-11 items-center rounded-full bg-white px-5 text-sm font-semibold text-[#0f172a]">
                  Start your free month
                </Link>
              )}
            </div>
          </div>
          <div className="rounded-2xl bg-white/10 p-5">
            <p className="font-semibold">Exam Sprint</p>
            <p className="mt-1 text-sm text-white/75">Calendar sync plus a Sprint for every test, forever. Free for 7 days, then {usd(SPRINT.price)} once.</p>
            <div className="mt-4">
              {viewer && !viewer.billing.sprintTrialEndsAt ? (
                <form action={beginSprintTrial.bind(null, "/schedule")}>
                  <button className="inline-flex h-11 items-center rounded-full bg-gradient-to-r from-[#ff8a3d] to-[#e0531c] px-5 text-sm font-semibold text-white">Try it free for 7 days</button>
                </form>
              ) : viewer ? (
                <BuyButton product="sprint" returnTo="/schedule" variant="sprint">
                  Unlock for {usd(SPRINT.price)}
                </BuyButton>
              ) : (
                <Link href="/signup?next=/sprint" className="inline-flex h-11 items-center rounded-full bg-gradient-to-r from-[#ff8a3d] to-[#e0531c] px-5 text-sm font-semibold text-white">
                  Try the free diagnostic
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
