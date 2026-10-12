import { ArrowRight, CalendarCheck, CalendarDays, Check, Lock, NotebookPen, Play, Sparkles, Target, Users, Zap } from "lucide-react";
import Link from "next/link";
import { CalendarNudge, wantsCalendar } from "@/components/calendar-nudge";
import { CourseIcon, courseColors } from "@/components/course-icon";
import { cn, panel, panelLink, plural } from "@/components/ui";
import { hasPlus } from "@/lib/billing/access";
import type { IndexedCatalog } from "@/lib/catalog";
import { learningPlan } from "@/lib/learning-plan";
import { courseProgress, nextTopicInCourse, startedCourse, topicStatus, whenLabel } from "@/lib/recommend";
import { upcomingTests } from "@/lib/schedule-model";
import type { Viewer } from "@/lib/viewer";
import { greetingName } from "@/lib/names";

/** Home for a signed-in student: your course worlds, your learning plan, and what's coming. */
export async function SignedInHome({ viewer, catalog }: { viewer: Viewer; catalog: IndexedCatalog }) {
  const first = greetingName(viewer.user.name);
  const plus = hasPlus(viewer.plus);
  const mine = viewer.state.profile.courseIds.map((id) => catalog.course(id)).filter((c) => c !== undefined);
  const courses = mine.length ? mine : [...catalog.courses].sort((a, b) => catalog.videosForCourse(b.id).length - catalog.videosForCourse(a.id).length).slice(0, 4);
  // Plus: the first few videos from the learning plan.
  const planVideos = plus ? learningPlan(catalog, viewer.state, 3).flatMap((g) => g.videos.map((v) => ({ v, topic: `${g.course.shortTitle} · ${g.topic.title}` }))) : [];
  const tests = upcomingTests(viewer.state.schedule, 3);
  const teacher = viewer.user.accountType === "teacher";
  // A quick session on the next topic in your first course, or the topic picker.
  const quickTopic = mine[0] ? nextTopicInCourse(catalog, viewer.state, mine[0].id) : undefined;

  return (
    <div className="pb-8">
      <header className="relative overflow-hidden bg-[linear-gradient(135deg,#3b82f6,#1d4ed8)] text-white">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-[420px] rounded-full border-[56px] border-white/[0.08]" />
        <div aria-hidden className="pointer-events-none absolute -bottom-40 left-1/2 size-80 rounded-full border-[40px] border-white/[0.06]" />
        <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-9 sm:px-6 lg:px-8 lg:pt-12">
          <p className="rise font-brand text-[16px] font-extrabold text-white/85">Welcome back, {first}</p>
          <h1 className="rise display mt-2 max-w-3xl text-[38px] sm:text-6xl" style={{ ["--i" as string]: 1 }}>
            Understand what you&apos;re studying tonight.
          </h1>
          <div className="rise mt-7 flex flex-wrap gap-2.5" style={{ ["--i" as string]: 2 }}>
            <Link href="/lessons" className="press flex h-12 items-center gap-2 rounded-2xl bg-white px-5 font-brand text-[15.5px] font-extrabold text-[#1d4ed8] [--ledge:rgb(0_0_0/0.22)] hover:brightness-95">
              Go to my lessons <ArrowRight className="size-4" />
            </Link>
            <Link href="/ask" className="press flex h-12 items-center gap-2 rounded-2xl bg-white/15 px-5 font-brand text-[15.5px] font-extrabold text-white ring-2 ring-inset ring-white/30 [--ledge:rgb(0_0_0/0.18)] hover:bg-white/25">
              <Sparkles className="size-4" /> Ask Merit AI
            </Link>
            <Link href="/tutors" className="press flex h-12 items-center gap-2 rounded-2xl bg-white/15 px-5 font-brand text-[15.5px] font-extrabold text-white ring-2 ring-inset ring-white/30 [--ledge:rgb(0_0_0/0.18)] hover:bg-white/25">
              <Users className="size-4" /> Find a tutor
            </Link>
          </div>
        </div>
      </header>

      {wantsCalendar(viewer) ? (
        <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:px-8">
          <CalendarNudge variant="banner" signedIn className="rise" />
        </div>
      ) : null}

      <div className="mx-auto grid max-w-6xl gap-8 px-4 pt-8 sm:px-6 lg:grid-cols-[1fr_340px] lg:px-8 grid-cols-[minmax(0,1fr)]">
        <section className="min-w-0">
          <div className="flex items-end justify-between gap-4">
            <h2 className="headline text-[26px] text-ink">{mine.length ? "Your courses" : "Popular courses"}</h2>
            <Link href={mine.length ? "/settings" : "/courses"} className="font-brand text-[14px] font-extrabold text-accent-ink hover:underline">
              {mine.length ? "Edit" : "All courses"}
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2">
            {courses.map((c, idx) => {
              const { from, to } = courseColors(c.id);
              const next = nextTopicInCourse(catalog, viewer.state, c.id);
              const p = courseProgress(catalog, viewer.state, c.id);
              const units = catalog.unitsForCourse(c.id);
              return (
                <article
                  key={c.id}
                  style={{ ["--c" as string]: from, ["--c2" as string]: to, ["--i" as string]: idx }}
                  className="rise relative flex min-w-0 flex-col overflow-hidden rounded-3xl bg-[linear-gradient(145deg,var(--c),var(--c2))] p-5 text-white shadow-[0_5px_0_0_var(--c2)]"
                >
                  <div aria-hidden className="pointer-events-none absolute -right-10 -top-12 size-44 rounded-full border-[24px] border-white/10" />
                  <Link href={`/courses/${c.slug}`} className="relative flex items-center gap-3">
                    <span className="rounded-2xl bg-white/20 p-1 ring-2 ring-white/30">
                      <CourseIcon id={c.id} size={40} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-brand text-[18px] font-black leading-tight">{c.title}</span>
                      <span className="tabular block text-[12.5px] font-bold text-white/80">
                        {p.done}/{plural(p.total, "topic")} understood
                      </span>
                    </span>
                  </Link>
                  {/* Unit path */}
                  <ol className="relative mt-5 flex items-center" aria-label={`${c.shortTitle} units`}>
                    {units.map((u, i) => {
                      const ts = catalog.topicsForUnit(u.id);
                      const d = ts.filter((t) => topicStatus(catalog, viewer.state, t.id) === "done").length;
                      const full = ts.length > 0 && d === ts.length;
                      const here = next ? catalog.topic(next.id)?.unitId === u.id : false;
                      return (
                        <li key={u.id} className="flex min-w-0 flex-1 items-center last:flex-none" title={`Unit ${u.order}: ${u.title}`}>
                          <span
                            className={cn(
                              "flex size-7 shrink-0 items-center justify-center rounded-full font-brand text-[12px] font-black",
                              full ? "bg-white text-[var(--c2)]" : here ? "bg-white text-[var(--c2)] ring-4 ring-white/35" : "bg-white/20 text-white",
                            )}
                          >
                            {full ? <Check className="size-3.5" strokeWidth={3.5} /> : u.order}
                          </span>
                          {i < units.length - 1 ? <span aria-hidden className={cn("mx-0.5 h-1 min-w-1 flex-1 rounded-full sm:mx-1", full ? "bg-white" : "bg-white/25")} /> : null}
                        </li>
                      );
                    })}
                  </ol>
                  {next ? (
                    <Link
                      href={`/courses/${c.slug}/${next.slug}`}
                      className="press relative mt-5 flex items-center gap-3 rounded-2xl bg-white p-3 pr-4 text-[color-mix(in_oklab,var(--c2)_85%,black)] [--ledge:rgb(0_0_0/0.22)] hover:brightness-95"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[var(--c)] text-white">
                        <Play className="size-4 fill-current" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-brand text-[12px] font-extrabold text-muted">{startedCourse(catalog, viewer.state, c.id) ? "Continue" : "Where most classes are now"}</span>
                        <span className="block truncate font-brand text-[15.5px] font-extrabold">{next.title}</span>
                      </span>
                      <ArrowRight className="size-4 shrink-0" />
                    </Link>
                  ) : null}
                </article>
              );
            })}
          </div>
          {!mine.length ? (
            <Link href="/onboarding" className="mt-4 inline-flex font-brand text-sm font-extrabold text-accent-ink hover:underline">
              Choose your courses →
            </Link>
          ) : null}
        </section>

        <aside className="space-y-4">
          <section className="rise overflow-hidden rounded-3xl bg-positive text-white shadow-[0_5px_0_0_var(--positive-press)]" style={{ ["--i" as string]: 1 }}>
            <div className="p-5">
              <h2 className="flex items-center gap-2 font-brand text-[18px] font-black">
                {plus ? <CalendarCheck className="size-5" /> : <Lock className="size-5" />} Your learning plan
              </h2>
              <p className="mt-1 text-[14px] leading-relaxed text-white/85">
                {!plus
                  ? "Unlock your learning plan with Merit Plus: videos picked for what you're learning in class."
                  : planVideos.length
                    ? "Videos for what you're learning in class."
                    : "Tell us what you're covering in class and your plan fills in."}
              </p>
            </div>
            {planVideos.length ? (
              <ul className="space-y-2 bg-white/10 p-3">
                {planVideos.map(({ v, topic }) => (
                  <li key={v.id}>
                    <a href={`/go/${v.id}`} target="_blank" rel="noopener" className="flex items-center gap-3 rounded-2xl bg-white p-2 text-[#0f1729] transition-transform active:scale-[0.98]">
                      <span className="relative aspect-video w-20 shrink-0 overflow-hidden rounded-xl bg-[#f2f4f7]">
                        <img src={v.thumbnail} alt="" loading="lazy" referrerPolicy="no-referrer" className="absolute inset-0 size-full object-cover" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-2 text-[13.5px] font-bold leading-snug">{v.title}</span>
                        <span className="block truncate text-[12px] text-[#5b6475]">{topic}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="p-3 pt-2">
              <Link href="/plan" className="press flex h-11 items-center justify-center gap-2 rounded-2xl bg-white font-brand text-[15px] font-extrabold text-positive [--ledge:rgb(0_0_0/0.2)]">
                {plus ? "Open my learning plan" : "Unlock with Merit Plus"} <ArrowRight className="size-4" />
              </Link>
            </div>
          </section>

          {!wantsCalendar(viewer) ? (
          <section className={cn(panel, "rise p-5")} style={{ ["--i" as string]: 2 }}>
            <h2 className="flex items-center gap-2 font-brand text-[18px] font-black text-ink">
              <CalendarDays className="size-5 text-sprint" /> Coming up
            </h2>
            {tests.length ? (
              <ul className="mt-3 space-y-2">
                {tests.map((e) => {
                  const d = new Date(e.start);
                  return (
                    <li key={e.uid}>
                      <Link href={`/sprint/new?event=${encodeURIComponent(e.uid)}`} className="group flex items-center gap-3 rounded-2xl p-1.5 transition-colors hover:bg-bg-subtle">
                        <span className="flex size-12 shrink-0 flex-col items-center justify-center rounded-2xl bg-sprint-soft text-sprint-ink">
                          <span className="font-brand text-[10px] font-black uppercase leading-none">{d.toLocaleDateString("en-US", { month: "short" })}</span>
                          <span className="tabular font-brand text-[18px] font-black leading-tight">{d.getDate()}</span>
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[14px] font-bold text-ink">{e.title}</span>
                          <span className="block text-[12.5px] text-muted">{whenLabel(e.start)}</span>
                        </span>
                        <span className="shrink-0 rounded-full bg-sprint-soft px-2.5 py-1 font-brand text-[12px] font-extrabold text-sprint-ink">Sprint</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-2 text-[14px] leading-relaxed text-muted">
                {viewer.state.schedule ? "No tests on your calendar right now." : "Connect your class calendar and every quiz and test shows up here with its lessons."}
              </p>
            )}
            <Link href="/schedule" className="mt-3 inline-flex font-brand text-[14px] font-extrabold text-accent-ink hover:underline">
              {viewer.state.schedule ? "My schedule →" : "Connect my calendar →"}
            </Link>
          </section>
          ) : null}

          <Link
            href={quickTopic && mine[0] ? `/master/${mine[0].slug}/${quickTopic.slug}` : "/master"}
            className={cn(panelLink, "rise flex items-center gap-4 p-5")}
            style={{ ["--i" as string]: 3 }}
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-white">
              <Zap className="size-6" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-brand text-[17px] font-black text-ink">Quick session</span>
              <span className="block text-[13px] text-muted">{quickTopic ? `Master ${quickTopic.title} in about 15 minutes.` : "Master one topic in about 15 minutes."}</span>
            </span>
            <ArrowRight className="size-5 shrink-0 text-muted" />
          </Link>

          <Link href="/sprint" className="press rise flex items-center gap-4 rounded-3xl bg-sprint p-5 text-white [--ledge:var(--sprint-press)]" style={{ ["--i" as string]: 3 }}>
            <Target className="size-7 shrink-0" />
            <span className="min-w-0 flex-1">
              <span className="block font-brand text-[17px] font-black">Exam Sprint</span>
              <span className="block text-[13px] text-white/85">A day-by-day plan to test day, starting with a free diagnostic.</span>
            </span>
            <ArrowRight className="size-5 shrink-0" />
          </Link>

          {teacher ? (
            <Link href="/studio" className={cn(panelLink, "flex items-center gap-4 p-5")}>
              <NotebookPen className="size-6 shrink-0 text-accent-ink" />
              <span className="min-w-0 flex-1">
                <span className="block font-brand text-[16px] font-extrabold text-ink">Teacher studio</span>
                <span className="block text-[13px] text-muted">Add lessons, write study guides, and upload videos.</span>
              </span>
            </Link>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
