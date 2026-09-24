import { Bell, CalendarDays, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CopyField, PlanSettings } from "@/components/plan-client";
import { PlanWeek, TaskRow } from "@/components/plan-ui";
import { ExamCta, PlusBadge, PlusLocked } from "@/components/upgrade";
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
    return (
      <div className="mx-auto max-w-[1100px] px-4 pb-16 pt-8 sm:px-6">
        <PlusLocked access={viewer?.plus ?? { kind: "anonymous" }} feature="Your study plan" returnTo="/plan" />
        <div className="mt-10 flex items-center gap-3">
          <h2 className="text-xl font-bold tracking-tight text-ink">What a week looks like</h2>
          <span className="rounded-full bg-bg-subtle px-2.5 py-1 text-[12px] font-medium text-muted">Sample student · AP Bio + Calc BC</span>
        </div>
        <p className="mt-1 text-[14px] text-muted">A Calc quiz tomorrow and a Bio unit test Thursday. Merit schedules the right lessons around both.</p>
        <div className="mt-6">
          <PlanWeek plan={sample} done={{}} interactive={false} />
        </div>
      </div>
    );
  }

  const [prefs, done] = await Promise.all([getPlanPrefs(viewer.user.id), getDoneTasks(viewer.user.id)]);
  const plan = buildPlan(catalog, viewer.state, prefs, 7);
  const tonight = plan[0];
  const doneTonight = tonight.tasks.filter((t) => done[t.id]).length;
  const feed = `${origin}/api/plan/feed/${prefs.feedToken}.ics`;
  const webcal = feed.replace(/^https?:/, "webcal:");
  const apCourses = viewer.state.profile.courseIds.map((id) => catalog.course(id)).filter((c) => c && c.exam === "AP");
  const soonest = apCourses[0];
  const examDate = soonest ? examDateFor(soonest, viewer.state.profile) : null;

  return (
    <div className="mx-auto grid max-w-[1200px] gap-10 px-4 pb-16 pt-8 sm:px-6 lg:grid-cols-[1fr_340px]">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <PlusBadge />
          {viewer.plus.kind === "trial" ? <span className="text-[12.5px] text-muted">Free for {viewer.plus.daysLeft} more days</span> : null}
        </div>
        <h1 className="mt-3 text-[34px] font-bold tracking-tight text-ink">Tonight</h1>
        <p className="mt-1 text-[15px] text-muted">
          {tonight.tasks.length
            ? `${tonight.tasks.length} ${tonight.tasks.length === 1 ? "thing" : "things"}, about ${tonight.minutes} minutes. ${doneTonight ? `${doneTonight} done.` : ""}`
            : tonight.rest
              ? "Rest day. You earned it."
              : "Nothing planned tonight."}
        </p>
        {!viewer.state.profile.courseIds.length ? (
          <div className="mt-6 rounded-2xl bg-bg-subtle p-6">
            <p className="font-medium text-ink">Pick your courses to get a plan.</p>
            <Link href="/onboarding" className="mt-3 inline-flex h-10 items-center rounded-full bg-ink px-4 text-sm font-medium text-bg">
              Choose courses
            </Link>
          </div>
        ) : null}
        {tonight.tasks.length ? (
          <>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-positive transition-all" style={{ width: `${(doneTonight / tonight.tasks.length) * 100}%` }} />
            </div>
            <ul className="mt-6 space-y-3">
              {tonight.tasks.map((t) => (
                <TaskRow key={t.id} task={t} done={Boolean(done[t.id])} interactive />
              ))}
            </ul>
          </>
        ) : null}
        {!viewer.state.schedule ? (
          <Link href="/schedule" className="mt-6 flex items-center gap-4 rounded-2xl bg-accent-soft p-4 hover:opacity-90">
            <CalendarDays className="size-6 shrink-0 text-accent" />
            <span className="text-sm text-ink">
              <span className="font-semibold">Connect your class calendar</span> and your plan will prep you for every quiz and test automatically.
            </span>
          </Link>
        ) : null}
        <h2 className="mt-12 text-xl font-bold tracking-tight text-ink">The week ahead</h2>
        <div className="mt-5">
          <PlanWeek plan={plan} done={done} interactive skipFirst />
        </div>
      </div>

      <aside className="space-y-5 lg:pt-14">
        {soonest ? <ExamCta daysLeft={examDate ? daysUntil(examDate) : null} courseId={soonest.id} courseTitle={soonest.shortTitle} /> : null}
        <section className="rounded-2xl p-5 ring-1 ring-line">
          <h2 className="flex items-center gap-2 text-[15px] font-semibold text-ink">
            <Bell className="size-4 text-accent" /> Reminders
          </h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
            Add your plan to the calendar you already use. Each study session shows up at your reminder time with an alert and the exact lessons.
          </p>
          <a href={webcal} className="mt-3 flex h-10 items-center justify-center gap-2 rounded-full bg-accent text-sm font-semibold text-white hover:brightness-110">
            <CalendarDays className="size-4" /> Add to Apple or Outlook
          </a>
          <a
            href={`https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcal)}`}
            target="_blank"
            rel="noopener"
            className="mt-2 flex h-10 items-center justify-center gap-2 rounded-full bg-bg text-sm font-semibold text-ink ring-1 ring-line-strong hover:bg-bg-subtle"
          >
            Add to Google Calendar
          </a>
          <p className="mt-3 text-[12px] text-muted">Or paste this private link into any calendar app:</p>
          <div className="mt-1.5">
            <CopyField value={feed} label="Private calendar link" />
          </div>
        </section>
        <section className="rounded-2xl p-5 ring-1 ring-line">
          <h2 className="flex items-center gap-2 text-[15px] font-semibold text-ink">
            <Sparkles className="size-4 text-accent" /> Plan settings
          </h2>
          <div className="mt-4">
            <PlanSettings minutesPerDay={prefs.minutesPerDay} reminderHour={prefs.reminderHour} studyDays={prefs.studyDays} />
          </div>
        </section>
        <Link href="/progress" className="block rounded-2xl p-5 text-sm font-medium text-accent ring-1 ring-line hover:bg-bg-subtle">
          See your progress →
        </Link>
      </aside>
    </div>
  );
}
