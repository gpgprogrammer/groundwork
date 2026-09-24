import { ArrowRight, Check, ChevronDown, Play, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Chips, FeedGrid, SortControls } from "@/components/feed";
import { ChannelAvatar } from "@/components/video-card";
import { cn, formatViews } from "@/components/ui";
import { getCatalog, type IndexedCatalog } from "@/lib/catalog";
import { pageOf, queryFeed } from "@/lib/feed";
import { courseProgress, nextTopicInCourse, topicStatus } from "@/lib/recommend";
import { topCreators } from "@/lib/tutoring";
import type { Course } from "@/lib/types";
import { getViewer, type Viewer } from "@/lib/viewer";

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
  const started = Boolean(prog && (prog.done || topics.some((t) => topicStatus(catalog, viewer!.state, t.id) !== "new")));

  return (
    <div className="pb-20">
      <header className="border-b border-line px-4 pt-8 sm:px-6 lg:px-10" style={{ background: `linear-gradient(180deg, oklch(0.62 0.14 ${course.hue} / 0.1), transparent 85%)` }}>
        <nav className="text-[13px] text-muted">
          <Link href="/courses" className="hover:text-ink">
            Courses
          </Link>
          <span className="mx-1.5">›</span>
          {course.category}
        </nav>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-[40px]">{course.title}</h1>
        <p className="mt-2 max-w-3xl text-[16px] leading-relaxed text-ink-2">{course.description}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-[13px]">
          {[`${units.length} units`, `${topics.length} topics`, `${videoCount.toLocaleString()} videos`, `Exam: ${course.examMonth}`].map((p) => (
            <span key={p} className="tabular rounded-full bg-bg px-3 py-1 font-medium text-ink-2 ring-1 ring-line">
              {p}
            </span>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {next ? (
            <Link href={`/courses/${course.slug}/${next.slug}`} className="flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-bg hover:bg-ink/85">
              <Play className="size-4 fill-current" />
              {started ? "Continue" : "Start"}: {next.title}
            </Link>
          ) : null}
          <Link href={`/tutors?course=${course.id}`} className="flex h-11 items-center gap-2 rounded-full bg-bg px-5 text-sm font-medium text-ink ring-1 ring-line hover:bg-bg-subtle">
            <Users className="size-4" /> Find a tutor
          </Link>
        </div>
        <div className="mt-8 flex gap-6">
          {[
            { key: "units", label: "Course outline" },
            { key: "videos", label: "All videos" },
          ].map((t) => (
            <Link
              key={t.key}
              href={t.key === "units" ? `/courses/${course.slug}` : `/courses/${course.slug}?view=videos`}
              className={cn("-mb-px border-b-2 pb-3 text-[15px] font-medium", view === t.key ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink")}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </header>

      {view === "videos" ? (
        <CourseVideos course={course} catalog={catalog} sp={sp} />
      ) : (
        <div className="mx-auto grid max-w-[1400px] gap-8 px-4 pt-8 sm:px-6 lg:grid-cols-[1fr_320px] lg:px-10">
          <Outline course={course} catalog={catalog} viewer={viewer} nextTopicId={next?.id} />
          <aside className="space-y-6">
            {prog ? (
              <div className="rounded-2xl p-5 ring-1 ring-line">
                <p className="text-sm font-semibold text-ink">Your progress</p>
                <p className="tabular mt-3 text-3xl font-bold text-ink">
                  {prog.done}
                  <span className="text-base font-medium text-muted"> / {prog.total} topics understood</span>
                </p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-line">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${(prog.done / prog.total) * 100}%` }} />
                </div>
                <p className="mt-3 text-xs leading-relaxed text-muted">Mark a topic “I understand this” on its page to track it here.</p>
              </div>
            ) : null}
            <TopCreators course={course} catalog={catalog} />
          </aside>
        </div>
      )}
    </div>
  );
}

function Outline({ course, catalog, viewer, nextTopicId }: { course: Course; catalog: IndexedCatalog; viewer: Viewer | null; nextTopicId?: string }) {
  const units = catalog.unitsForCourse(course.id);
  const status = (id: string) => (viewer ? topicStatus(catalog, viewer.state, id) : "new");
  const openUnit = nextTopicId ? catalog.topic(nextTopicId)?.unitId : units[0]?.id;
  return (
    <div className="min-w-0 space-y-3">
      {units.map((u) => {
        const ts = catalog.topicsForUnit(u.id);
        const done = ts.filter((t) => status(t.id) === "done").length;
        return (
          <details key={u.id} id={u.slug} open={u.id === openUnit} className="group scroll-mt-20 overflow-hidden rounded-2xl ring-1 ring-line [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-4 hover:bg-bg-subtle/60">
              <span className="tabular flex size-10 shrink-0 items-center justify-center rounded-xl bg-bg-subtle text-sm font-bold text-ink">{u.order}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[16px] font-semibold leading-snug text-ink">{u.title}</p>
                <p className="mt-0.5 truncate text-[13px] text-muted">{u.summary}</p>
              </div>
              <span className="tabular hidden shrink-0 text-[13px] text-muted sm:block">
                {viewer ? `${done}/${ts.length} understood` : `${ts.length} topics`}
              </span>
              <ChevronDown className="size-5 shrink-0 text-muted transition-transform group-open:rotate-180" />
            </summary>
            <ol className="border-t border-line">
              {ts.map((t, i) => {
                const s = status(t.id);
                const count = catalog.videosForTopic(t.id).filter((v) => !v.isShort).length;
                return (
                  <li key={t.id} className="border-b border-line last:border-0">
                    <Link href={`/courses/${course.slug}/${t.slug}`} className="group/row flex items-center gap-4 px-5 py-3 hover:bg-bg-subtle/60">
                      <span
                        className={cn(
                          "tabular flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                          s === "done" ? "bg-accent text-white" : s === "started" ? "bg-accent-soft text-accent" : "bg-bg-subtle text-muted",
                        )}
                      >
                        {s === "done" ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] font-medium text-ink group-hover/row:text-accent">{t.title}</span>
                        {t.id === nextTopicId ? <span className="text-xs font-medium text-accent">Up next</span> : null}
                      </span>
                      <span className="tabular shrink-0 text-[13px] text-muted">{count ? `${count} videos` : "Coming soon"}</span>
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
    <div className="rounded-2xl p-5 ring-1 ring-line">
      <p className="text-sm font-semibold text-ink">Best teachers for {course.shortTitle}</p>
      <ol className="mt-3 space-y-1">
        {creators.map((c, i) => (
          <li key={c.channel.id}>
            <Link href={`/channel/${c.channel.id}`} className="flex items-center gap-3 rounded-lg px-1 py-1.5 hover:bg-bg-subtle">
              <span className="tabular w-4 text-center text-xs font-semibold text-muted">{i + 1}</span>
              <ChannelAvatar title={c.channel.title} src={c.channel.thumbnail} size={32} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-ink">{c.channel.title}</span>
                <span className="tabular block text-xs text-muted">
                  {c.lessons} lessons · {formatViews(c.views)} views
                </span>
              </span>
            </Link>
          </li>
        ))}
        {!creators.length ? <li className="text-sm text-muted">Coming soon.</li> : null}
      </ol>
      <Link href={`/tutors?course=${course.id}`} className="mt-4 flex h-10 items-center justify-center gap-2 rounded-full bg-bg-subtle text-sm font-medium text-ink hover:bg-line">
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
      <div className="sticky top-14 z-20 -mx-4 flex items-center gap-3 bg-bg/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
        <Chips chips={[{ key: "all", label: "All units" }, ...units.map((u) => ({ key: u.id, label: `Unit ${u.order}` }))]} active={unit ?? "all"} param="unit" />
        <SortControls sort={result.sort} length={result.length} defaultSort="helpful" />
      </div>
      <div className="pt-4">
        <FeedGrid key={query + (unit ?? "")} initial={page.items} nextOffset={unit ? null : page.nextOffset} query={query} />
      </div>
    </div>
  );
}
