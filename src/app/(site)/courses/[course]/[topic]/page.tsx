import { ArrowRight, Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FeedGrid, SortControls } from "@/components/feed";
import { MasteryButton } from "@/components/mastery-button";
import { cn } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";
import { pageOf, queryFeed } from "@/lib/feed";
import { topicStatus } from "@/lib/recommend";
import { topCreators } from "@/lib/tutoring";
import { ChannelAvatar } from "@/components/video-card";
import { Users } from "lucide-react";
import { getViewer } from "@/lib/viewer";

export async function generateMetadata({ params }: PageProps<"/courses/[course]/[topic]">): Promise<Metadata> {
  const { course, topic: slug } = await params;
  const topic = (await getCatalog()).topicIn(course, slug);
  return topic ? { title: topic.title, description: topic.summary } : {};
}

export default async function TopicPage({ params, searchParams }: PageProps<"/courses/[course]/[topic]">) {
  const [{ course: courseSlug, topic: topicSlug }, sp, catalog, viewer] = await Promise.all([params, searchParams, getCatalog(), getViewer()]);
  const course = catalog.course(courseSlug);
  const topic = course ? catalog.topicIn(course.id, topicSlug) : undefined;
  if (!course || !topic || topic.courseId !== course.id) notFound();

  const unit = catalog.unit(topic.unitId)!;
  const concept = catalog.concept(topic.conceptId)!;
  const str = (v: unknown) => (typeof v === "string" ? v : undefined);
  const result = queryFeed(catalog, null, { topicId: topic.id, sort: str(sp.sort), length: str(sp.length) });
  const page = pageOf(catalog, result, 0, 20);
  const query = new URLSearchParams({ topic: topic.id, sort: result.sort, ...(result.length !== "any" ? { length: result.length } : {}) }).toString();
  const total = catalog.videosForTopic(topic.id).filter((v) => !v.isShort).length;

  const courseTopics = catalog.topicsForCourse(course.id);
  const next = courseTopics.slice(courseTopics.findIndex((t) => t.id === topic.id) + 1).find((t) => catalog.videosForTopic(t.id).length);
  const unitTopics = catalog.topicsForUnit(unit.id);
  // Thin topics (mostly niche language and portfolio themes) borrow the best lessons from the rest of their unit.
  const fallback = (() => {
    if (total >= 4) return null;
    const ids = new Set(unitTopics.filter((t) => t.id !== topic.id).flatMap((t) => catalog.videosForTopic(t.id).map((v) => v.id)));
    const ordered = catalog.videos.filter((v) => !v.isShort && (ids.has(v.id) || (!ids.size && v.courseId === course.id && v.topicId !== topic.id)));
    if (!ordered.length) return null;
    return {
      title: ids.size ? `More lessons from Unit ${unit.order}: ${unit.title}` : `More ${course.shortTitle} lessons`,
      note: ids.size ? "The best-ranked videos for the rest of this unit." : `The best-ranked videos across ${course.title}.`,
      items: pageOf(catalog, { ordered, reasons: new Map(), sort: "best", length: "any" }, 0, 12).items,
    };
  })();

  return (
    <div className="mx-auto grid max-w-[1400px] gap-10 px-4 pb-16 pt-6 sm:px-6 lg:px-10 xl:grid-cols-[1fr_320px]">
      <div className="min-w-0">
        <nav className="flex flex-wrap items-center gap-x-1.5 text-[13px] text-muted" aria-label="Breadcrumb">
          <Link href={`/courses/${course.slug}`} className="hover:text-ink">
            {course.title}
          </Link>
          <span>›</span>
          <Link href={`/courses/${course.slug}#${unit.slug}`} className="hover:text-ink">
            Unit {unit.order}: {unit.title}
          </Link>
          <span>›</span>
          <span>{concept.title}</span>
        </nav>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-[34px]">{topic.title}</h1>
          <MasteryButton topicId={topic.id} mastered={Boolean(viewer?.state.mastered[topic.id])} signedIn={Boolean(viewer)} />
        </div>
        <p className="mt-3 max-w-3xl text-[17px] leading-relaxed text-ink-2">{topic.summary}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {topic.keyPoints.map((k) => (
            <span key={k} className="rounded-lg bg-bg-subtle px-3 py-1.5 text-[13px] font-medium text-ink-2">
              {k}
            </span>
          ))}
        </div>

        <div className="sticky top-14 z-20 -mx-4 mt-8 flex items-center justify-between gap-3 border-b border-line bg-bg/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
          <p className="text-[15px] font-medium text-ink">
            {total} videos <span className="hidden font-normal text-muted sm:inline">· ranked by how well they teach</span>
          </p>
          <SortControls sort={result.sort} length={result.length} />
        </div>
        <div className="pt-5">
          <FeedGrid
            key={query}
            layout="list"
            ranked={result.sort === "best"}
            initial={page.items}
            nextOffset={page.nextOffset}
            query={query}
            empty={<p className={total ? "py-16 text-center text-muted" : "py-8 text-center text-muted"}>{total ? "No videos match these filters yet." : "No lessons for this exact topic yet."}</p>}
          />
        </div>
        {fallback ? (
          <section className="mt-10">
            <h2 className="text-lg font-bold tracking-tight text-ink">{fallback.title}</h2>
            <p className="mt-1 text-sm text-muted">{fallback.note}</p>
            <div className="pt-5">
              <FeedGrid layout="list" initial={fallback.items} nextOffset={null} query="" />
            </div>
          </section>
        ) : null}
      </div>

      <aside className="space-y-6 xl:pt-8">
        <div className="rounded-xl ring-1 ring-line">
          <p className="border-b border-line px-4 py-3 text-sm font-medium text-ink">
            Unit {unit.order}: {unit.title}
          </p>
          <ul className="py-1.5">
            {unitTopics.map((t) => {
              const s = viewer ? topicStatus(catalog, viewer.state, t.id) : "new";
              return (
                <li key={t.id}>
                  <Link
                    href={`/courses/${course.slug}/${t.slug}`}
                    aria-current={t.id === topic.id ? "page" : undefined}
                    className={cn("flex items-center gap-3 px-4 py-2 text-sm hover:bg-bg-subtle", t.id === topic.id ? "bg-bg-subtle font-medium text-ink" : "text-ink-2")}
                  >
                    <span
                      className={cn(
                        "flex size-4 shrink-0 items-center justify-center rounded-full",
                        s === "done" ? "bg-accent text-white" : s === "started" ? "ring-2 ring-accent" : "ring-1 ring-line-strong",
                      )}
                    >
                      {s === "done" ? <Check className="size-2.5" strokeWidth={3.5} /> : null}
                    </span>
                    <span className="truncate">{t.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        {next ? (
          <Link href={`/courses/${course.slug}/${next.slug}`} className="group flex items-center justify-between gap-3 rounded-xl bg-bg-subtle px-4 py-3.5 hover:bg-line">
            <div className="min-w-0">
              <p className="text-xs text-muted">Next topic</p>
              <p className="truncate text-[15px] font-medium text-ink">{next.title}</p>
            </div>
            <ArrowRight className="size-5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
          </Link>
        ) : null}
        <TopicCreators catalog={catalog} topicId={topic.id} courseId={course.id} courseShort={course.shortTitle} />
        {topic.aliases.length ? (
          <p className="px-1 text-[13px] leading-relaxed text-muted">
            <span className="font-medium text-ink-2">Also called:</span> {topic.aliases.join(", ")}
          </p>
        ) : null}
      </aside>
    </div>
  );
}

function TopicCreators({ catalog, topicId, courseId, courseShort }: { catalog: Awaited<ReturnType<typeof getCatalog>>; topicId: string; courseId: string; courseShort: string }) {
  const forTopic = topCreators(catalog, { topicId }, 4);
  const creators = forTopic.length ? forTopic : topCreators(catalog, { courseId }, 4);
  return (
    <div className="rounded-xl p-4 ring-1 ring-line">
      <p className="text-sm font-semibold text-ink">{forTopic.length ? "Best teachers for this topic" : `Best ${courseShort} teachers`}</p>
      <ol className="mt-2 space-y-0.5">
        {creators.map((c, i) => (
          <li key={c.channel.id}>
            <Link href={`/channel/${c.channel.id}`} className="flex items-center gap-3 rounded-lg px-1 py-1.5 hover:bg-bg-subtle">
              <span className="tabular w-3 text-xs font-semibold text-muted">{i + 1}</span>
              <ChannelAvatar title={c.channel.title} src={c.channel.thumbnail} size={28} />
              <span className="truncate text-sm text-ink">{c.channel.title}</span>
            </Link>
          </li>
        ))}
      </ol>
      <Link href={`/tutors?course=${courseId}`} className="mt-3 flex h-9 items-center justify-center gap-2 rounded-full bg-bg-subtle text-sm font-medium text-ink hover:bg-line">
        <Users className="size-4" /> Get a {courseShort} tutor
      </Link>
    </div>
  );
}
