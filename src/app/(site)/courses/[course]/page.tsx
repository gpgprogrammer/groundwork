import { CourseIcon, courseColors } from "@/components/course-icon";
import { ArrowRight, Check, ChevronDown, Lock, Play, Target, Users } from "lucide-react";
import { ExamCta } from "@/components/upgrade";
import { daysUntil, examDateFor } from "@/lib/exams";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Chips, FeedGrid, SortControls } from "@/components/feed";
import { ChannelAvatar } from "@/components/video-card";
import { cn, panel } from "@/components/ui";
import { getCatalog, type IndexedCatalog } from "@/lib/catalog";
import { pageOf, queryFeed } from "@/lib/feed";
import { courseProgress, nextTopicInCourse, topicStatus } from "@/lib/recommend";
import { topCreators } from "@/lib/tutoring";
import type { Course } from "@/lib/types";
import { getViewer, type Viewer } from "@/lib/viewer";
import { CourseSearch } from "@/components/course-search";

export async function generateMetadata({ params }: PageProps<"/courses/[course]">): Promise<Metadata> {
  const course = (await getCatalog()).course((await params).course);
  return course ? { title: course.title, description: course.description } : {};
}

export default async function CoursePage({ params, searchParams }: PageProps<"/courses/[course]">) {
  const [{ course: slug }, sp, catalog, viewer] = await Promise.all([params, searchParams, getCatalog(), getViewer()]);
  const course = catalog.course(slug);
  if (!course) notFound();

  const view = sp.view === "videos" ? "videos" : "units";
  const units = catalog.unitsForCourse(course.id);
  const topics = catalog.topicsForCourse(course.id);
  const videoCount = catalog.videosForCourse(course.id).length;
  const prog = viewer ? courseProgress(catalog, viewer.state, course.id) : null;
  const next = viewer ? nextTopicInCourse(catalog, viewer.state, course.id) : topics.find((t) => catalog.videosForTopic(t.id).length);
  const examDate = examDateFor(course, viewer?.state.profile ?? null);
  const started = Boolean(prog && (prog.done || topics.some((t) => topicStatus(catalog, viewer!.state, t.id) !== "new")));
  const { from, to } = courseColors(course.id);
  const status = (id: string) => (viewer ? topicStatus(catalog, viewer.state, id) : "new");
  const currentUnit = next ? catalog.topic(next.id)?.unitId : units[0]?.id;
  const unitState = units.map((u) => {
    const ts = catalog.topicsForUnit(u.id);
    const done = ts.filter((t) => status(t.id) === "done").length;
    return { u, total: ts.length, done, state: ts.length && done === ts.length ? "done" : u.id === currentUnit ? "current" : "todo" };
  });

  return (
    <div className="pb-16" style={{ ["--c" as string]: from, ["--c2" as string]: to }}>
      {/* Course world: full-bleed in the course's own colors */}
      <header className="relative overflow-hidden bg-[linear-gradient(135deg,var(--c),var(--c2))] text-white">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-[420px] rounded-full border-[56px] border-white/[0.08]" />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 right-40 size-72 rounded-full border-[40px] border-white/[0.06]" />
        <div className="relative mx-auto max-w-6xl px-4 pb-8 pt-8 sm:px-6 lg:px-8 lg:pt-10">
          <nav className="flex items-center gap-1.5 font-brand text-[13.5px] font-bold text-white/75" aria-label="Breadcrumb">
            <Link href="/courses" className="hover:text-white">
              Courses
            </Link>
            <span aria-hidden>›</span>
            <span>{course.category}</span>
          </nav>
          <div className="rise mt-4 flex items-center gap-4 sm:gap-5">
            <span className="flex size-16 shrink-0 items-center justify-center rounded-3xl bg-white/15 ring-2 ring-white/25 sm:size-20">
              <CourseIcon id={course.id} size={52} className="sm:scale-110" />
            </span>
            <div className="min-w-0">
              <h1 className="display text-[34px] sm:text-5xl lg:text-[56px]">{course.title}</h1>
              <p className="tabular mt-1 font-brand text-[14px] font-bold text-white/80">
                {units.length} units · {topics.length} topics · {videoCount.toLocaleString()} videos · Exam: {course.examMonth}
              </p>
            </div>
          </div>
          <p className="rise mt-5 max-w-2xl text-[16.5px] leading-relaxed text-white/90" style={{ ["--i" as string]: 1 }}>
            {course.description}
          </p>
          <div className="rise mt-6 flex flex-wrap gap-2.5" style={{ ["--i" as string]: 2 }}>
            {next ? (
              <Link
                href={`/courses/${course.slug}/${next.slug}`}
                className="press flex h-12 max-w-full items-center gap-2 rounded-2xl bg-white px-5 font-brand text-[15.5px] font-extrabold text-[color-mix(in_oklab,var(--c2)_85%,black)] [--ledge:rgb(0_0_0/0.22)] hover:brightness-95"
              >
                <Play className="size-4 shrink-0 fill-current" />
                <span className="truncate">
                  {started ? "Continue" : "Start"}: {next.title}
                </span>
              </Link>
            ) : null}
            <Link href={`/tutors?course=${course.id}`} className="press flex h-12 items-center gap-2 rounded-2xl bg-white/15 px-5 font-brand text-[15.5px] font-extrabold text-white ring-2 ring-inset ring-white/30 [--ledge:rgb(0_0_0/0.18)] hover:bg-white/25">
              <Users className="size-4" /> Find a tutor
            </Link>
            <Link href={`/sprint?course=${course.id}`} className="press flex h-12 items-center gap-2 rounded-2xl bg-white/15 px-5 font-brand text-[15.5px] font-extrabold text-white ring-2 ring-inset ring-white/30 [--ledge:rgb(0_0_0/0.18)] hover:bg-white/25">
              <Target className="size-4" /> Exam Sprint
            </Link>
          </div>

          {/* Unit path */}
          <ol className="scrollbar-none -mx-4 mt-9 flex items-start overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0" aria-label="Units">
            {unitState.map(({ u, total, done, state }, i) => (
              <li key={u.id} className="flex shrink-0 items-start">
                <a href={`#${u.slug}`} className="group flex w-[92px] flex-col items-center text-center sm:w-[108px]" title={u.title}>
                  <span
                    className={cn(
                      "press-sm flex size-12 items-center justify-center rounded-full font-brand text-[18px] font-black transition-transform group-hover:-translate-y-0.5 sm:size-14",
                      state === "done" && "bg-white text-[var(--c2)] [--ledge:rgb(0_0_0/0.25)]",
                      state === "current" && "bg-white text-[var(--c2)] ring-4 ring-white/40 [--ledge:rgb(0_0_0/0.25)]",
                      state === "todo" && "bg-white/15 text-white ring-2 ring-inset ring-white/35 [--ledge:rgb(0_0_0/0.15)]",
                    )}
                  >
                    {state === "done" ? <Check className="size-6" strokeWidth={3.5} /> : u.order}
                  </span>
                  <span className="mt-2 line-clamp-2 font-brand text-[12.5px] font-bold leading-tight text-white/90">{u.title}</span>
                  {viewer ? (
                    <span className="tabular mt-0.5 text-[11.5px] font-semibold text-white/65">
                      {done}/{total}
                    </span>
                  ) : null}
                </a>
                {i < unitState.length - 1 ? <span aria-hidden className={cn("mt-6 h-1 w-6 shrink-0 rounded-full sm:mt-7 sm:w-8", state === "done" ? "bg-white" : "bg-white/25")} /> : null}
              </li>
            ))}
          </ol>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b-2 border-line bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            {[
              { key: "units", label: "Course path" },
              { key: "videos", label: "All videos" },
            ].map((t) => (
              <Link
                key={t.key}
                href={t.key === "units" ? `/courses/${course.slug}` : `/courses/${course.slug}?view=videos`}
                aria-current={view === t.key ? "page" : undefined}
                className={cn("relative flex h-14 items-center px-3 font-brand text-[15px] font-extrabold", view === t.key ? "text-ink" : "text-muted hover:text-ink")}
              >
                {t.label}
                {view === t.key ? <span className="absolute inset-x-3 -bottom-[2px] h-[3px] rounded-full bg-[var(--c)]" aria-hidden /> : null}
              </Link>
            ))}
          </div>
          <CourseSearch courseId={course.id} courseTitle={course.shortTitle} className="hidden w-full max-w-sm md:block" />
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 pt-5 sm:px-6 md:hidden">
        <CourseSearch courseId={course.id} courseTitle={course.shortTitle} />
      </div>

      {view === "videos" ? (
        <CourseVideos course={course} catalog={catalog} sp={sp} />
      ) : (
        <div className="mx-auto grid max-w-6xl gap-8 px-4 pt-8 sm:px-6 lg:grid-cols-[1fr_320px] lg:px-8 grid-cols-[minmax(0,1fr)]">
          <Outline course={course} catalog={catalog} viewer={viewer} nextTopicId={next?.id} openUnit={currentUnit} />
          <aside className="space-y-4">
            {prog ? (
              <div className={cn(panel, "p-5")}>
                <p className="font-brand text-[15px] font-extrabold text-ink">Your progress</p>
                <p className="tabular mt-2 font-brand text-4xl font-black text-ink">
                  {prog.done}
                  <span className="text-base font-bold text-muted"> / {prog.total} topics understood</span>
                </p>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-bg-subtle">
                  <div className="h-full rounded-full bg-[var(--c)] transition-[width] duration-700" style={{ width: `${(prog.done / Math.max(1, prog.total)) * 100}%` }} />
                </div>
                <p className="mt-3 text-[13px] leading-relaxed text-muted">Mark a topic “I understand this” on its page to fill your path.</p>
              </div>
            ) : null}
            <ExamCta daysLeft={examDate ? daysUntil(examDate) : null} courseId={course.id} courseTitle={course.shortTitle} />
            <TopCreators course={course} catalog={catalog} />
          </aside>
        </div>
      )}
    </div>
  );
}

function Outline({ course, catalog, viewer, nextTopicId, openUnit }: { course: Course; catalog: IndexedCatalog; viewer: Viewer | null; nextTopicId?: string; openUnit?: string }) {
  const units = catalog.unitsForCourse(course.id);
  const status = (id: string) => (viewer ? topicStatus(catalog, viewer.state, id) : "new");
  return (
    <div className="min-w-0 space-y-4">
      {units.map((u) => {
        const ts = catalog.topicsForUnit(u.id);
        const done = ts.filter((t) => status(t.id) === "done").length;
        return (
          <details key={u.id} id={u.slug} open={u.id === openUnit} className={cn(panel, "group scroll-mt-[calc(var(--nav-h)+16px)] overflow-hidden [&_summary::-webkit-details-marker]:hidden")}>
            <summary className="flex cursor-pointer list-none items-center gap-4 px-4 py-4 sm:px-5">
              <span className="press-sm tabular flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--c)] font-brand text-lg font-black text-white [--ledge:var(--c2)]">{u.order}</span>
              <div className="min-w-0 flex-1">
                <p className="font-brand text-[17px] font-extrabold leading-snug text-ink">{u.title}</p>
                <p className="mt-0.5 line-clamp-1 text-[13.5px] text-muted">{u.summary}</p>
              </div>
              <span className="tabular hidden shrink-0 rounded-full bg-bg-subtle px-3 py-1 font-brand text-[13px] font-bold text-ink-2 sm:block">
                {viewer ? `${done}/${ts.length}` : `${ts.length} topics`}
              </span>
              <ChevronDown className="size-5 shrink-0 text-muted transition-transform duration-200 group-open:rotate-180" />
            </summary>
            {/* Topic path: nodes on a vertical line */}
            <ol className="relative border-t-2 border-line px-4 py-3 sm:px-5">
              <span aria-hidden className="absolute bottom-7 left-[calc(1rem+19px)] top-7 w-1 rounded-full bg-bg-subtle sm:left-[calc(1.25rem+19px)]" />
              {ts.map((t, i) => {
                const s = status(t.id);
                const count = catalog.videosForTopic(t.id).filter((v) => !v.isShort).length;
                const upNext = t.id === nextTopicId;
                return (
                  <li key={t.id} className="relative">
                    <Link href={`/courses/${course.slug}/${t.slug}`} className="group/row flex items-center gap-4 rounded-2xl py-2 pr-2 transition-colors hover:bg-bg-subtle/70">
                      <span
                        className={cn(
                          "tabular relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full font-brand text-[14px] font-black transition-transform group-hover/row:scale-105",
                          s === "done" ? "bg-[var(--c)] text-white" : upNext ? "bg-surface text-[var(--c)] ring-4 ring-[var(--c)]" : s === "started" ? "bg-surface text-[var(--c)] ring-2 ring-[var(--c)]" : "bg-surface text-muted ring-2 ring-line",
                        )}
                      >
                        {s === "done" ? <Check className="size-4" strokeWidth={3.5} /> : count ? i + 1 : <Lock className="size-3.5" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15.5px] font-bold text-ink">{t.title}</span>
                        {upNext ? <span className="font-brand text-[12.5px] font-extrabold text-[var(--c)]">Up next</span> : null}
                      </span>
                      <span className="tabular shrink-0 text-[13px] font-semibold text-muted">{count ? `${count} videos` : "Coming soon"}</span>
                      <ArrowRight className="size-4 shrink-0 text-faint transition-transform group-hover/row:translate-x-0.5" />
                    </Link>
                  </li>
                );
              })}
            </ol>
          </details>
        );
      })}
    </div>
  );
}

function TopCreators({ course, catalog }: { course: Course; catalog: IndexedCatalog }) {
  const creators = topCreators(catalog, { courseId: course.id }, 5);
  return (
    <div className={cn(panel, "p-5")}>
      <p className="font-brand text-[15px] font-extrabold text-ink">Best teachers for {course.shortTitle}</p>
      <ol className="mt-3 space-y-1">
        {creators.map((c, i) => (
          <li key={c.channel.id}>
            <Link href={`/channel/${c.channel.id}`} className="flex items-center gap-3 rounded-2xl px-1.5 py-1.5 transition-colors hover:bg-bg-subtle">
              <span className="tabular w-4 text-center font-brand text-[13px] font-black text-muted">{i + 1}</span>
              <ChannelAvatar title={c.channel.title} src={c.channel.thumbnail} size={34} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-ink">{c.channel.title}</span>
                <span className="tabular block text-xs text-muted">
                  {c.lessons} lessons · {c.topics} topics
                </span>
              </span>
            </Link>
          </li>
        ))}
        {!creators.length ? <li className="text-sm text-muted">Coming soon.</li> : null}
      </ol>
      <Link href={`/tutors?course=${course.id}`} className="press mt-4 flex h-11 items-center justify-center gap-2 rounded-2xl bg-surface font-brand text-[14.5px] font-extrabold text-ink ring-2 ring-inset ring-line [--ledge:var(--line)] hover:bg-bg-subtle">
        <Users className="size-4" /> Tutors for {course.shortTitle}
      </Link>
    </div>
  );
}

function CourseVideos({ course, catalog, sp }: { course: Course; catalog: IndexedCatalog; sp: Record<string, string | string[] | undefined> }) {
  const str = (v: unknown) => (typeof v === "string" ? v : undefined);
  const units = catalog.unitsForCourse(course.id);
  const unit = str(sp.unit) && catalog.unit(str(sp.unit)!) ? str(sp.unit)! : undefined;
  const result = queryFeed(catalog, null, { courseId: course.id, sort: str(sp.sort) ?? "helpful", length: str(sp.length) });
  if (unit) {
    const topicIds = new Set(catalog.topicsForUnit(unit).flatMap((t) => [t.id, t.sameAs ?? ""]));
    result.ordered = result.ordered.filter((v) => v.topicId && topicIds.has(v.topicId));
  }
  const page = pageOf(catalog, result, 0, unit ? 400 : 24);
  const query = new URLSearchParams({ course: course.id, sort: result.sort, ...(result.length !== "any" ? { length: result.length } : {}) }).toString();
  return (
    <div className="px-4 sm:px-6 lg:px-10">
      <div className="sticky top-[var(--nav-h)] z-20 -mx-4 flex items-center gap-3 bg-bg/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
        <Chips chips={[{ key: "all", label: "All units" }, ...units.map((u) => ({ key: u.id, label: `Unit ${u.order}` }))]} active={unit ?? "all"} param="unit" />
        <SortControls sort={result.sort} length={result.length} defaultSort="helpful" />
      </div>
      <div className="pt-4">
        <FeedGrid key={query + (unit ?? "")} initial={page.items} nextOffset={unit ? null : page.nextOffset} query={query} />
      </div>
    </div>
  );
}
