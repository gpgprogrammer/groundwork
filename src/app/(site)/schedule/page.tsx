import { CalendarDays, RefreshCw } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { disconnectCalendar } from "@/app/actions/learning";
import { FocusPicker } from "@/components/focus-picker";
import { ScheduleConnect } from "@/components/schedule-connect";
import { ResyncButton } from "@/components/resync-button";
import { VideoCard } from "@/components/video-card";
import { ago, cn } from "@/components/ui";
import { getCatalog, type IndexedCatalog } from "@/lib/catalog";
import { focusCourses } from "@/lib/focus";
import { toFeedVideo } from "@/lib/feed";
import { futureEvents, whenLabel } from "@/lib/recommend";
import type { ScheduleEvent } from "@/lib/types";
import { getViewer } from "@/lib/viewer";
import { hasPlus } from "@/lib/billing/access";
import { sampleState } from "@/lib/sample";
import { PlusLocked } from "@/components/upgrade";
import type { PlusAccess } from "@/lib/types";

export const metadata: Metadata = { title: "My schedule" };

const KIND: Record<ScheduleEvent["kind"], string> = { test: "Test", assignment: "Due", class: "Class", other: "Event" };

export default async function SchedulePage() {
  const [viewer, catalog] = await Promise.all([getViewer(), getCatalog()]);
  if (!viewer || !hasPlus(viewer.plus)) return <SchedulePreview catalog={catalog} access={viewer?.plus ?? { kind: "anonymous" }} />;
  const schedule = viewer.state.schedule;
  const upcoming = futureEvents(schedule?.events ?? []).slice(0, 40);

  // Group by day.
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
      <p className="mt-1 max-w-2xl text-[15px] text-muted">
        Your class calendar, matched to lessons. Every quiz and test gets the right videos days before it happens.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_420px]">
        <section className="min-w-0">
          {schedule ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-bold tracking-tight text-ink">Coming up</h2>
                <p className="text-[13px] text-muted">
                  {schedule.label} · synced {ago(schedule.syncedAt)}
                </p>
              </div>
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
                          <EventBlock key={e.uid} e={e} catalog={catalog} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 rounded-xl bg-bg-subtle px-5 py-6 text-sm text-muted">
                  Nothing school-related in the next few months on this calendar. If your tests are on a different calendar, connect that one instead.
                </p>
              )}
            </>
          ) : (
            <div className="rounded-xl ring-1 ring-line">
              <div className="border-b border-line px-5 py-4">
                <h2 className="text-lg font-bold tracking-tight text-ink">Connect a calendar</h2>
                <p className="mt-0.5 text-sm text-muted">Google Calendar, Canvas, Schoology, Apple Calendar, Outlook, or any .ics file.</p>
              </div>
              <div className="p-5">
                <ScheduleConnect />
              </div>
            </div>
          )}
        </section>

        <aside className="space-y-6">
          {schedule ? (
            <div className="rounded-xl ring-1 ring-line">
              <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-ink">{schedule.label}</p>
                  <p className="text-xs text-muted">
                    {schedule.events.length} school events · {schedule.events.filter((e) => e.topicIds.length).length} matched to topics
                  </p>
                </div>
                {schedule.url ? <ResyncButton /> : null}
              </div>
              <details className="group px-5 py-3">
                <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-accent">
                  <RefreshCw className="size-4" /> Connect a different calendar
                </summary>
                <div className="pt-4">
                  <ScheduleConnect compact />
                </div>
              </details>
              <form action={disconnectCalendar} className="border-t border-line px-5 py-3">
                <button className="text-sm text-muted hover:text-ink">Disconnect calendar</button>
              </form>
            </div>
          ) : null}
          <div className="rounded-xl ring-1 ring-line">
            <div className="border-b border-line px-5 py-4">
              <h2 className="text-[15px] font-bold text-ink">What are you covering in class?</h2>
              <p className="mt-0.5 text-sm text-muted">No calendar? Pick the topics you&apos;re on right now and your feed leads with them.</p>
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

function EventBlock({ e, catalog }: { e: ScheduleEvent; catalog: IndexedCatalog }) {
  const course = e.courseId ? catalog.course(e.courseId) : undefined;
  const topics = e.topicIds.map((id) => catalog.topic(id)).filter((t) => t !== undefined);
  const videos = (topics.length ? topics.flatMap((t) => catalog.videosForTopic(t.id).filter((v) => !v.isShort).slice(0, 2)) : course ? catalog.videosForCourse(course.id).filter((v) => !v.isShort).slice(0, 2) : []).slice(0, 3);
  return (
    <div className="rounded-xl ring-1 ring-line">
      <div className="flex flex-wrap items-center gap-2 px-4 py-3">
        <span className={cn("rounded px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide", e.kind === "test" ? "bg-[#fde8e8] text-[#b42318]" : "bg-bg-subtle text-ink-2")}>
          {KIND[e.kind]}
        </span>
        <p className="min-w-0 flex-1 truncate text-[15px] font-medium text-ink">{e.title}</p>
      </div>
      {topics.length || course ? (
        <div className="border-t border-line px-4 pb-4 pt-3">
          <p className="text-[13px] text-muted">
            {topics.length ? (
              <>
                Matched:{" "}
                {topics.map((t, i) => (
                  <span key={t.id}>
                    {i ? ", " : ""}
                    <Link href={`/courses/${catalog.course(t.courseId)!.slug}/${t.slug}`} className="font-medium text-accent hover:underline">
                      {t.title}
                    </Link>
                  </span>
                ))}
              </>
            ) : (
              <>
                Course: <span className="font-medium text-ink-2">{course!.title}</span>. Add the topic to the event title for sharper matches.
              </>
            )}
          </p>
          {videos.length ? (
            <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {videos.map((v) => (
                <VideoCard key={v.id} v={toFeedVideo(catalog, v)} />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/** Signed-out (or lapsed) visitors see a sample week first, then the offer. */
function SchedulePreview({ catalog, access }: { catalog: IndexedCatalog; access: PlusAccess }) {
  const events = futureEvents(sampleState(catalog).schedule!.events);
  return (
    <div className="mx-auto max-w-[1100px] px-4 pb-16 pt-6 sm:px-6">
      <h1 className="flex items-center gap-3 text-[28px] font-bold tracking-tight text-ink">
        <CalendarDays className="size-7 text-accent" /> My schedule
      </h1>
      <p className="mt-1 max-w-2xl text-[15px] text-muted">
        Connect the calendar your class uses. When a quiz or test is coming, Merit lines up the exact lessons for it, days ahead.
      </p>
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
            <EventBlock e={e} catalog={catalog} />
          </div>
        ))}
      </div>
      <div className="mt-10">
        <PlusLocked access={access} feature="Calendar sync" returnTo="/schedule" />
      </div>
    </div>
  );
}
