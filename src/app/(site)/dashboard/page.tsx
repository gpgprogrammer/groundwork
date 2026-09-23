import { ArrowRight, Flame } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LessonCard } from "@/components/lesson-cards";
import { Container, EmptyState, LinkButton, ProgressBar, SectionHeading } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";
import { PLAN } from "@/lib/env";
import { continueWatching, courseProgress, nextTopicInCourse, recommend } from "@/lib/recommend";
import type { Progress } from "@/lib/types";
import { requireViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Home" };

function daysUntil(iso: string | null) {
  return iso ? Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000) : null;
}

function studyStats(progress: Progress[]) {
  const weekAgo = Date.now() - 7 * 86400000;
  const recent = progress.filter((p) => new Date(p.updatedAt).getTime() > weekAgo);
  const minutes = Math.round(recent.reduce((n, p) => n + Math.min(p.secondsWatched, p.duration), 0) / 60);
  const finished = recent.filter((p) => p.completed).length;
  const days = new Set(progress.map((p) => p.updatedAt.slice(0, 10)));
  let streak = 0;
  for (let d = 0; d < 365; d++) {
    const key = new Date(Date.now() - d * 86400000).toISOString().slice(0, 10);
    if (days.has(key)) streak++;
    else if (d > 0) break;
  }
  return { minutes, finished, streak };
}

export default async function DashboardPage() {
  const viewer = await requireViewer("/dashboard");
  if (!viewer.state.profile.onboarded) redirect("/onboarding");
  const catalog = await getCatalog();
  const { profile } = viewer.state;

  const resume = continueWatching(catalog, viewer.state, 4);
  const recs = recommend(catalog, viewer.state, 8);
  const stats = studyStats(Object.values(viewer.state.progress));
  const courses = profile.courseIds.map((id) => catalog.course(id)).filter((c) => c !== undefined);
  const daysToExam = daysUntil(profile.examDate);
  const firstName = profile.name.split(" ")[0];
  const access = viewer.access;

  return (
    <Container size="xl" className="py-10 sm:py-12">
      <header className="rise flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="headline text-3xl text-ink sm:text-[34px]">
            Welcome back, {firstName}.
          </h1>
          <p className="mt-2 text-[15px] text-muted">
            {daysToExam !== null && daysToExam > 0 ? (
              <>
                {daysToExam} days until your exam
                {profile.dailyMinutes ? <> · {profile.dailyMinutes} minutes a day keeps you on track</> : null}
              </>
            ) : (
              "Pick up where you left off, or try something new."
            )}
          </p>
        </div>
        <dl className="tabular flex gap-8">
          <div>
            <dd className="flex items-center gap-1.5 text-2xl font-semibold tracking-tight text-ink">
              {stats.streak}
              {stats.streak > 0 ? <Flame className="size-5 text-[#d97706]" /> : null}
            </dd>
            <dt className="text-xs text-muted">day streak</dt>
          </div>
          <div>
            <dd className="text-2xl font-semibold tracking-tight text-ink">{stats.minutes}</dd>
            <dt className="text-xs text-muted">minutes this week</dt>
          </div>
          <div>
            <dd className="text-2xl font-semibold tracking-tight text-ink">{stats.finished}</dd>
            <dt className="text-xs text-muted">lessons finished</dt>
          </div>
        </dl>
      </header>

      {access.kind === "trial" && access.daysLeft <= 7 ? (
        <div className="mt-8 flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-ink-2">
            Your free month ends in <strong className="font-semibold text-ink">{access.daysLeft} days</strong>. Keep going for $
            {PLAN.priceMonthly}/month, and your saved lessons and history come with you.
          </p>
          <LinkButton href="/settings/billing" size="sm" variant="secondary">
            Choose plan
          </LinkButton>
        </div>
      ) : null}

      {resume.length ? (
        <section className="mt-12">
          <SectionHeading title="Continue watching" />
          <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {resume.map(({ video, progress }) => (
              <LessonCard key={video.id} video={video} catalog={catalog} progress={progress.position / progress.duration} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-14">
        <SectionHeading
          title="Your courses"
          action={
            <Link href="/settings" className="text-[13px] text-muted hover:text-ink">
              Edit
            </Link>
          }
        />
        {courses.length ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => {
              const prog = courseProgress(catalog, viewer.state, c.id);
              const next = nextTopicInCourse(catalog, viewer.state, c.id);
              return (
                <div key={c.id} className="flex flex-col rounded-2xl border border-line bg-surface p-5">
                  <div className="flex items-center justify-between">
                    <Link href={`/courses/${c.slug}`} className="font-medium text-ink hover:underline">
                      {c.title}
                    </Link>
                    <span className="tabular text-xs text-muted">
                      {prog.done}/{prog.total}
                    </span>
                  </div>
                  <ProgressBar value={prog.done / prog.total} className="mt-3" />
                  {next ? (
                    <Link
                      href={`/courses/${c.slug}/${next.slug}`}
                      className="group mt-5 flex items-center justify-between gap-3 rounded-xl bg-bg p-3 ring-1 ring-line transition-colors hover:bg-bg-subtle"
                    >
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium text-muted">Up next</p>
                        <p className="truncate text-sm font-medium text-ink">{next.title}</p>
                      </div>
                      <ArrowRight className="size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  ) : (
                    <p className="mt-5 text-sm text-positive">You&apos;ve covered every topic. Time for practice exams.</p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState title="No courses yet" body="Choose the courses you're studying to get a personalized plan." action={<LinkButton href="/onboarding">Pick courses</LinkButton>} />
        )}
      </section>

      <section className="mt-14">
        <SectionHeading title="Recommended for you" description="Based on what you've finished, saved, and what comes next in your courses." />
        {recs.length ? (
          <div className="grid gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
            {recs.map(({ video, reason }) => (
              <LessonCard key={video.id} video={video} catalog={catalog} reason={reason} />
            ))}
          </div>
        ) : (
          <EmptyState title="Nothing to recommend yet" body="Watch a lesson or two and we'll suggest what to study next." />
        )}
      </section>
    </Container>
  );
}
