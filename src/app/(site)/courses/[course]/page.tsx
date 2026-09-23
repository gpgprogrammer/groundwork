import { Check, Play } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Chips, FeedGrid, SortControls } from "@/components/feed";
import { ProgressBar, cn, formatViews } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";
import { pageOf, queryFeed } from "@/lib/feed";
import { courseProgress, nextTopicInCourse, topicStatus } from "@/lib/recommend";
import { getViewer } from "@/lib/viewer";

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
  const videos = catalog.videosForCourse(course.id);
  const prog = viewer ? courseProgress(catalog, viewer.state, course.id) : null;
  const next = viewer ? nextTopicInCourse(catalog, viewer.state, course.id) : catalog.topicsForCourse(course.id).find((t) => catalog.videosForTopic(t.id).length);
  const status = (topicId: string) => (viewer ? topicStatus(catalog, viewer.state, topicId) : "new");

  return (
    <div className="pb-16">
      <header className="border-b border-line px-4 pb-0 pt-8 sm:px-6 lg:px-10" style={{ background: `linear-gradient(180deg, oklch(0.6 0.14 ${course.hue} / 0.08), transparent)` }}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <nav className="text-[13px] text-muted">
              <Link href="/courses" className="hover:text-ink">Courses</Link> <span className="mx-1">›</span> {course.exam}
            </nav>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">{course.title}</h1>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">{course.description}</p>
            <p className="tabular mt-3 text-sm text-ink-2">
              {units.length} units · {catalog.topicsForCourse(course.id).length} topics · {formatViews(videos.length)} videos · Exam: {course.examMonth}
            </p>
          </div>
          <div className="w-full max-w-sm shrink-0 rounded-xl bg-bg p-4 ring-1 ring-line">
            {prog ? (
              <>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-medium text-ink">Course mastery</span>
                  <span className="tabular text-muted">
                    {prog.done}/{prog.total} topics
                  </span>
                </div>
                <ProgressBar value={prog.done / prog.total} className="mt-2 h-1.5" />
              </>
            ) : (
              <p className="text-sm font-medium text-ink">Start from the beginning</p>
            )}
            {next ? (
              <Link href={`/courses/${course.slug}/${next.slug}`} className="mt-3 flex items-center gap-3 rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-bg hover:bg-ink/85">
                <Play className="size-4 fill-current" />
                <span className="min-w-0 truncate">
                  {prog && prog.done ? "Up next" : "Start"}: {next.title}
                </span>
              </Link>
            ) : null}
          </div>
        </div>
        <div className="mt-6 flex gap-6">
          {[
            { key: "units", label: "Units" },
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
        <CourseVideos courseId={course.id} sp={sp} catalogUnits={units.map((u) => ({ key: u.id, label: `Unit ${u.order}` }))} />
      ) : (
        <div className="grid gap-10 px-4 pt-8 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-10">
          <aside className="hidden lg:block">
            <nav className="sticky top-20 space-y-0.5" aria-label="Units">
              {units.map((u) => {
                const ts = catalog.topicsForUnit(u.id);
                const done = ts.filter((t) => status(t.id) === "done").length;
                return (
                  <a key={u.id} href={`#${u.slug}`} className="block rounded-lg px-3 py-2 hover:bg-bg-subtle">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted">Unit {u.order}</p>
                    <p className="text-sm font-medium leading-snug text-ink">{u.title}</p>
                    {viewer ? <ProgressBar value={done / ts.length} className="mt-1.5" /> : null}
                  </a>
                );
              })}
            </nav>
          </aside>
          <div className="min-w-0 space-y-6">
            {units.map((u) => {
              const ts = catalog.topicsForUnit(u.id);
              return (
                <section key={u.id} id={u.slug} className="scroll-mt-20 overflow-hidden rounded-xl ring-1 ring-line">
                  <div className="flex flex-col gap-3 bg-bg-subtle/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted">Unit {u.order}</p>
                      <h2 className="text-lg font-bold tracking-tight text-ink">{u.title}</h2>
                      <p className="mt-0.5 text-sm text-muted">{u.summary}</p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-1" aria-label="Topic mastery">
                      {ts.map((t) => (
                        <span
                          key={t.id}
                          title={t.title}
                          className={cn(
                            "size-4 rounded-[4px]",
                            status(t.id) === "done" ? "bg-accent" : status(t.id) === "started" ? "bg-accent/35" : "bg-bg ring-1 ring-inset ring-line-strong",
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  <ul className="divide-y divide-line">
                    {catalog.conceptsForUnit(u.id).flatMap((c) =>
                      catalog.topicsForConcept(c.id).map((t) => {
                        const vids = catalog.videosForTopic(t.id).filter((v) => !v.isShort);
                        const s = status(t.id);
                        return (
                          <li key={t.id}>
                            <Link href={`/courses/${course.slug}/${t.slug}`} className="group flex items-center gap-4 px-5 py-3 transition-colors hover:bg-bg-subtle/60">
                              <span
                                className={cn(
                                  "flex size-6 shrink-0 items-center justify-center rounded-full",
                                  s === "done" ? "bg-accent text-white" : s === "started" ? "ring-2 ring-accent" : "ring-1 ring-line-strong",
                                )}
                              >
                                {s === "done" ? <Check className="size-3.5" strokeWidth={3} /> : null}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="text-[15px] font-medium text-ink group-hover:text-accent">{t.title}</p>
                                <p className="truncate text-[13px] text-muted">
                                  {c.title} · {vids.length} videos
                                </p>
                              </div>
                              {vids[0] ? (
                                <img src={vids[0].thumbnail} alt="" loading="lazy" referrerPolicy="no-referrer" className="hidden aspect-video w-28 shrink-0 rounded-lg object-cover sm:block" />
                              ) : null}
                            </Link>
                          </li>
                        );
                      }),
                    )}
                  </ul>
                </section>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

async function CourseVideos({ courseId, sp, catalogUnits }: { courseId: string; sp: Record<string, string | string[] | undefined>; catalogUnits: { key: string; label: string }[] }) {
  const catalog = await getCatalog();
  const str = (v: unknown) => (typeof v === "string" ? v : undefined);
  const unit = str(sp.unit) && catalog.unit(str(sp.unit)!) ? str(sp.unit)! : undefined;
  const result = queryFeed(catalog, null, { courseId, sort: str(sp.sort) ?? "helpful", length: str(sp.length) });
  if (unit) {
    const topicIds = new Set(catalog.topicsForUnit(unit).map((t) => t.id));
    result.ordered = result.ordered.filter((v) => v.topicId && topicIds.has(v.topicId));
  }
  const page = pageOf(catalog, result, 0, unit ? 400 : 24);
  const query = new URLSearchParams({ course: courseId, sort: result.sort, ...(result.length !== "any" ? { length: result.length } : {}) }).toString();
  return (
    <div className="px-4 sm:px-6 lg:px-10">
      <div className="sticky top-14 z-20 -mx-4 flex items-center gap-3 bg-bg/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
        <Chips chips={[{ key: "all", label: "All units" }, ...catalogUnits]} active={unit ?? "all"} param="unit" />
        <SortControls sort={result.sort} length={result.length} defaultSort="helpful" />
      </div>
      <div className="pt-4">
        <FeedGrid key={query + (unit ?? "")} initial={page.items} nextOffset={unit ? null : page.nextOffset} query={query} />
      </div>
    </div>
  );
}
