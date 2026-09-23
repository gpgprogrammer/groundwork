import { ArrowLeft, ArrowRight, Info } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LessonRow } from "@/components/lesson-cards";
import { Container, cn } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";
import { topicStatus } from "@/lib/recommend";
import type { VideoStyle } from "@/lib/types";
import { getViewer } from "@/lib/viewer";

const STYLES: VideoStyle[] = ["Concept", "Practice", "Common mistakes", "Exam strategy"];

export async function generateMetadata({ params }: PageProps<"/courses/[course]/[topic]">): Promise<Metadata> {
  const catalog = await getCatalog();
  const topic = catalog.topic((await params).topic);
  return topic ? { title: topic.title, description: topic.summary } : {};
}

export default async function TopicPage({ params, searchParams }: PageProps<"/courses/[course]/[topic]">) {
  const [{ course: courseSlug, topic: topicSlug }, sp, catalog, viewer] = await Promise.all([
    params,
    searchParams,
    getCatalog(),
    getViewer(),
  ]);
  const course = catalog.course(courseSlug);
  const topic = catalog.topic(topicSlug);
  if (!course || !topic || topic.courseId !== course.id) notFound();

  const unit = catalog.unit(topic.unitId)!;
  const concept = catalog.concept(topic.conceptId)!;
  const all = catalog.videosForTopic(topic.id);
  const style = STYLES.find((s) => s === sp.style);
  const lessons = style ? all.filter((v) => v.style === style) : all;
  const presentStyles = STYLES.filter((s) => all.some((v) => v.style === s));

  const courseTopics = catalog.topicsForCourse(course.id);
  const idx = courseTopics.findIndex((t) => t.id === topic.id);
  const prev = courseTopics[idx - 1];
  const next = courseTopics[idx + 1];
  const siblings = catalog.topicsForConcept(concept.id);
  const totalMinutes = Math.round(all.reduce((n, v) => n + v.durationSec, 0) / 60);

  return (
    <Container size="xl" className="py-10">
      <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted" aria-label="Breadcrumb">
        <Link href={`/courses/${course.slug}`} className="hover:text-ink">
          {course.title}
        </Link>
        <span className="text-faint">/</span>
        <Link href={`/courses/${course.slug}#${unit.slug}`} className="hover:text-ink">
          {unit.title}
        </Link>
        <span className="text-faint">/</span>
        <span className="text-ink-2">{concept.title}</span>
      </nav>

      <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_280px]">
        <div className="min-w-0">
          <header className="rise max-w-3xl">
            <h1 className="display text-4xl text-ink sm:text-[52px]">{topic.title}</h1>
            <p className="mt-5 text-[19px] leading-relaxed text-ink-2">{topic.summary}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {topic.keyPoints.map((k) => (
                <span key={k} className="rounded-full border border-line bg-surface px-3 py-1 text-[13px] text-ink-2">
                  {k}
                </span>
              ))}
            </div>
          </header>

          <section className="mt-12">
            <div className="flex flex-col gap-4 border-b border-line pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="headline text-[17px] text-ink">Best lessons</h2>
                <p className="tabular mt-1 text-[13px] text-muted">
                  {all.length} lessons · {totalMinutes} min total
                </p>
                <Link href="/how-ranking-works" className="mt-1 inline-flex items-center gap-1 text-[13px] text-muted hover:text-ink">
                  <Info className="size-3" /> Ranked by completion, helpfulness and saves
                </Link>
              </div>
              {presentStyles.length > 1 ? (
                <div className="scrollbar-none -mx-1 flex gap-1 overflow-x-auto px-1" role="tablist" aria-label="Filter by lesson type">
                  {[undefined, ...presentStyles].map((s) => (
                    <Link
                      key={s ?? "all"}
                      href={s ? `?style=${encodeURIComponent(s)}` : "?"}
                      scroll={false}
                      role="tab"
                      aria-selected={style === s}
                      className={cn(
                        "shrink-0 rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-colors",
                        style === s ? "bg-ink text-bg" : "text-muted hover:bg-bg-subtle hover:text-ink",
                      )}
                    >
                      {s ?? "All"}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="mt-4 space-y-2">
              {lessons.map((v) => {
                const p = viewer?.state.progress[v.id];
                return (
                  <LessonRow
                    key={v.id}
                    video={v}
                    catalog={catalog}
                    position={all.indexOf(v) + 1}
                    progress={p ? (p.completed ? 1 : p.position / p.duration) : undefined}
                    saved={Boolean(viewer?.state.saves[v.id])}
                  />
                );
              })}
            </div>
          </section>

          <div className="mt-14 grid gap-3 sm:grid-cols-2">
            {prev ? (
              <Link href={`/courses/${course.slug}/${prev.slug}`} className="group rounded-xl border border-line bg-surface p-4 transition-colors hover:border-line-strong">
                <span className="flex items-center gap-1.5 text-xs text-muted">
                  <ArrowLeft className="size-3.5" /> Previous topic
                </span>
                <span className="mt-1 block text-[15px] font-medium text-ink">{prev.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={`/courses/${course.slug}/${next.slug}`}
                className="group rounded-xl border border-line bg-surface p-4 text-right transition-colors hover:border-line-strong"
              >
                <span className="flex items-center justify-end gap-1.5 text-xs text-muted">
                  Next topic <ArrowRight className="size-3.5" />
                </span>
                <span className="mt-1 block text-[15px] font-medium text-ink">{next.title}</span>
              </Link>
            ) : null}
          </div>
        </div>

        <aside className="space-y-8 lg:pt-3">
          <div className="lg:sticky lg:top-24">
            <p className="eyebrow mb-3">{concept.title}</p>
            <ul className="space-y-0.5">
              {siblings.map((t) => {
                const status = viewer ? topicStatus(catalog, viewer.state, t.id) : "new";
                return (
                  <li key={t.id}>
                    <Link
                      href={`/courses/${course.slug}/${t.slug}`}
                      aria-current={t.id === topic.id ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-colors",
                        t.id === topic.id ? "bg-surface font-medium text-ink shadow-soft ring-1 ring-line" : "text-muted hover:text-ink",
                      )}
                    >
                      <span
                        className={cn(
                          "size-1.5 shrink-0 rounded-full",
                          status === "done" ? "bg-positive" : status === "started" ? "bg-accent" : "bg-line-strong",
                        )}
                      />
                      {t.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-8 rounded-xl border border-line bg-surface p-4">
              <p className="text-[13px] font-medium text-ink">Also called</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{topic.aliases.length ? topic.aliases.join(", ") : "No other names"}</p>
            </div>
          </div>
        </aside>
      </div>
    </Container>
  );
}
