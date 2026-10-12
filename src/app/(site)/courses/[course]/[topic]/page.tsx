import { ArrowRight, Check, Play } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarNudge, wantsCalendar } from "@/components/calendar-nudge";
import { CourseSearch } from "@/components/course-search";
import { FeedGrid, SortControls } from "@/components/feed";
import { MasteryButton } from "@/components/mastery-button";
import { cn, EmptyState, panel, panelLink, plural } from "@/components/ui";
import { courseColors } from "@/components/course-icon";
import { getCatalog } from "@/lib/catalog";
import { pageOf, queryFeed } from "@/lib/feed";
import { topicStatus } from "@/lib/recommend";
import { topCreators } from "@/lib/tutoring";
import { ChannelAvatar } from "@/components/video-card";
import { FileText, Sparkles, Users, Zap } from "lucide-react";
import { guidesForTopic } from "@/lib/educators";
import { UploadCard } from "@/components/upload-card";
import { listUploads, toUploadCards } from "@/lib/uploads";
import { OpenAskButton } from "@/components/ask/quick-ask";
import { ExamCta } from "@/components/upgrade";
import { daysUntil, examDateFor } from "@/lib/exams";
import { sessionMinutes } from "@/lib/quick";
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
  const examDate = examDateFor(course, viewer?.state.profile ?? null);
  const [guides, uploads] = await Promise.all([guidesForTopic(topic.id), listUploads({ topicId: topic.id }).then(toUploadCards)]);
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

  const { from, to } = courseColors(course.id);
  const top = page.items[0];
  const status = (id: string) => (viewer ? topicStatus(catalog, viewer.state, id) : "new");
  const calendarNudge = wantsCalendar(viewer);

  return (
    <div className="pb-16" style={{ ["--c" as string]: from, ["--c2" as string]: to }}>
      {/* Topic hero in the course's colors */}
      <header className="relative overflow-hidden bg-[linear-gradient(135deg,var(--c),var(--c2))] text-white">
        <div aria-hidden className="pointer-events-none absolute -right-20 -top-28 size-96 rounded-full border-[48px] border-white/[0.08]" />
        <div className="relative mx-auto max-w-6xl px-4 pb-8 pt-7 sm:px-6 lg:px-8">
          <nav className="flex flex-wrap items-center gap-x-1.5 font-brand text-[13.5px] font-bold text-white/75" aria-label="Breadcrumb">
            <Link href={`/courses/${course.slug}`} className="hover:text-white">
              {course.title}
            </Link>
            <span aria-hidden>›</span>
            <Link href={`/courses/${course.slug}#${unit.slug}`} className="hover:text-white">
              Unit {unit.order}: {unit.title}
            </Link>
            <span aria-hidden>›</span>
            <span>{concept.title}</span>
          </nav>
          <h1 className="rise display mt-3 text-[36px] sm:text-5xl lg:text-[56px]">{topic.title}</h1>
          <p className="rise mt-3 max-w-3xl text-[16.5px] leading-relaxed text-white/90" style={{ ["--i" as string]: 1 }}>
            {topic.summary}
          </p>
          {topic.keyPoints.length ? (
            <ul className="rise mt-4 flex flex-wrap gap-2" style={{ ["--i" as string]: 2 }} aria-label="Key ideas">
              {topic.keyPoints.map((k) => (
                <li key={k} className="rounded-full bg-white/15 px-3 py-1.5 font-brand text-[13px] font-bold ring-1 ring-inset ring-white/25">
                  {k}
                </li>
              ))}
            </ul>
          ) : null}

          <Link
            href={`/master/${course.slug}/${topic.slug}`}
            className="rise press mt-7 flex items-center gap-3.5 rounded-2xl bg-white p-3 pr-5 text-[#0f1729] [--ledge:rgb(0_0_0/0.22)] hover:brightness-95 sm:w-fit"
            style={{ ["--i" as string]: 3 }}
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--c),var(--c2))] text-white">
              <Zap className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-brand text-[16.5px] font-black leading-tight">{viewer?.state.mastered[topic.id] ? "Practice it again" : "Master this topic"}</span>
              <span className="block text-[13px] font-semibold text-[#5b6475]">Quick session · about {sessionMinutes(top?.durationSec)} min</span>
            </span>
            <ArrowRight className="size-5 shrink-0 text-[#5b6475]" />
          </Link>

          {/* What you can do with this topic */}
          <div className="rise mt-3 grid grid-cols-2 gap-2.5 lg:grid-cols-4" style={{ ["--i" as string]: 3 }}>
            {top ? (
              <a
                href={`/go/${top.id}`}
                target="_blank"
                rel="noopener"
                className="press flex items-center gap-3 rounded-2xl bg-white p-2.5 pr-4 text-[color-mix(in_oklab,var(--c2)_85%,black)] [--ledge:rgb(0_0_0/0.22)] hover:brightness-95 col-span-2 lg:col-span-1"
              >
                <span className="relative w-20 shrink-0 overflow-hidden rounded-xl bg-bg-subtle">
                  <img src={top.thumbnail} alt="" referrerPolicy="no-referrer" className="aspect-video w-full object-cover" />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                    <Play className="size-5 fill-white text-white" />
                  </span>
                </span>
                <span className="min-w-0">
                  <span className="block font-brand text-[15px] font-extrabold leading-tight">Watch the top lesson</span>
                  <span className="block truncate text-[12.5px] font-medium text-muted">{top.channelTitle}</span>
                </span>
              </a>
            ) : null}
            <OpenAskButton className="press flex h-full min-h-14 items-center gap-3 rounded-2xl bg-white/15 px-4 text-left font-brand text-[15px] font-extrabold text-white ring-2 ring-inset ring-white/30 [--ledge:rgb(0_0_0/0.18)] hover:bg-white/25">
              <Sparkles className="size-5 shrink-0" /> Ask Merit AI
            </OpenAskButton>
            <MasteryButton topicId={topic.id} mastered={Boolean(viewer?.state.mastered[topic.id])} signedIn={Boolean(viewer)} onColor />
            <Link
              href={`/tutors?course=${course.id}`}
              className="press flex min-h-14 items-center gap-3 rounded-2xl bg-white/15 px-4 font-brand text-[15px] font-extrabold text-white ring-2 ring-inset ring-white/30 [--ledge:rgb(0_0_0/0.18)] hover:bg-white/25"
            >
              <Users className="size-5 shrink-0" /> Find a tutor
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 pt-8 sm:px-6 lg:px-8 xl:grid-cols-[1fr_320px] grid-cols-[minmax(0,1fr)]">
        <div className="min-w-0">
          <CourseSearch courseId={course.id} courseTitle={course.shortTitle} className="mb-8" />
          {calendarNudge ? (
            <CalendarNudge variant="strip" signedIn={Boolean(viewer)} title="Quiz coming up?" body="Connect your calendar: Merit preps you for every quiz and test." className="-mt-4 mb-8 xl:hidden" />
          ) : null}
          {guides.length ? (
            <section className="mb-8">
              <h2 className="headline flex items-center gap-2 text-[20px] text-ink">
                <FileText className="size-5 text-[var(--c)]" /> Study guides from teachers
              </h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {guides.map((g) => (
                  <Link key={g.id} href={`/guides/${g.id}`} className={cn(panelLink, "p-5")}>
                    <p className="font-brand text-[16px] font-extrabold text-ink">{g.title}</p>
                    <p className="mt-1 line-clamp-2 text-[13.5px] text-muted">{(g.body ?? "").replace(/[#*`>\[\]()-]/g, "").slice(0, 160)}</p>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {uploads.length ? (
            <section className="mb-8">
              <h2 className="headline text-[20px] text-ink">From Merit tutors</h2>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {uploads.slice(0, 6).map((u) => (
                  <UploadCard key={u.id} u={u} />
                ))}
              </div>
            </section>
          ) : null}

          <div className="sticky top-[var(--nav-h)] z-20 -mx-4 flex items-center justify-between gap-3 border-b-2 border-line bg-bg/90 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            <h2 className="headline text-[18px] text-ink">
              {plural(total, "lesson")} <span className="hidden font-brand text-[14px] font-bold text-muted sm:inline">ranked by how well they teach</span>
            </h2>
            <SortControls sort={result.sort} length={result.length} />
          </div>
          <div className="space-y-4 pt-6">
            <FeedGrid
              key={query}
              layout="list"
              ranked={result.sort === "best"}
              initial={page.items}
              nextOffset={page.nextOffset}
              query={query}
              empty={<EmptyState title={total ? "No videos match these filters yet." : "No lessons for this exact topic yet."} body={total ? "Try a different length or sort." : "The best lessons from the rest of the unit are below."} />}
            />
          </div>
          {fallback ? (
            <section className="mt-10">
              <h2 className="headline text-[20px] text-ink">{fallback.title}</h2>
              <p className="mt-1 text-sm text-muted">{fallback.note}</p>
              <div className="pt-5">
                <FeedGrid layout="list" initial={fallback.items} nextOffset={null} query="" />
              </div>
            </section>
          ) : null}
        </div>

        <aside className="space-y-4">
          {calendarNudge ? (
            <CalendarNudge
              variant="card"
              signedIn={Boolean(viewer)}
              title={`Quiz on ${topic.title} soon?`}
              body="Connect your class calendar and Merit lines up the lessons for every quiz and test, days before it's due."
              className="hidden xl:block"
            />
          ) : null}
          <div className={cn(panel, "overflow-hidden")}>
            <p className="flex items-center gap-2 border-b-2 border-line px-4 py-3.5 font-brand text-[15px] font-extrabold text-ink">
              <span className="flex size-7 items-center justify-center rounded-lg bg-[var(--c)] text-[13px] font-black text-white">{unit.order}</span>
              {unit.title}
            </p>
            <ol className="relative px-3 py-2">
              <span aria-hidden className="absolute bottom-6 left-[calc(0.75rem+15px)] top-6 w-1 rounded-full bg-bg-subtle" />
              {unitTopics.map((t) => {
                const s = status(t.id);
                const here = t.id === topic.id;
                return (
                  <li key={t.id} className="relative">
                    <Link
                      href={`/courses/${course.slug}/${t.slug}`}
                      aria-current={here ? "page" : undefined}
                      className={cn("flex items-center gap-3 rounded-2xl py-1.5 pr-2 text-[14px] transition-colors hover:bg-bg-subtle", here ? "font-extrabold text-ink" : "font-semibold text-ink-2")}
                    >
                      <span
                        className={cn(
                          "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full",
                          s === "done" ? "bg-[var(--c)] text-white" : here ? "bg-surface ring-4 ring-[var(--c)]" : s === "started" ? "bg-surface ring-2 ring-[var(--c)]" : "bg-surface ring-2 ring-line",
                        )}
                      >
                        {s === "done" ? <Check className="size-3.5" strokeWidth={3.5} /> : here ? <span className="size-2.5 rounded-full bg-[var(--c)]" /> : null}
                      </span>
                      <span className="truncate">{t.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </div>
          {next ? (
            <Link href={`/courses/${course.slug}/${next.slug}`} className={cn(panelLink, "group flex items-center justify-between gap-3 p-4")}>
              <div className="min-w-0">
                <p className="font-brand text-[12.5px] font-extrabold text-muted">Next topic</p>
                <p className="truncate font-brand text-[16px] font-extrabold text-ink">{next.title}</p>
              </div>
              <span className="press-sm flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--c)] text-white [--ledge:var(--c2)]">
                <ArrowRight className="size-5" />
              </span>
            </Link>
          ) : null}
          <ExamCta isClass={course.exam === "Class"} daysLeft={examDate ? daysUntil(examDate) : null} courseId={course.id} courseTitle={course.shortTitle} />
          <TopicCreators catalog={catalog} topicId={topic.id} courseId={course.id} courseShort={course.shortTitle} />
          <Link href="/studio/video" className="block px-1 text-[13px] text-muted hover:text-ink">
            Teacher? <span className="font-bold text-accent-ink">Add a lesson or guide for this topic</span>
          </Link>
          {topic.aliases.length ? (
            <p className="px-1 text-[13px] leading-relaxed text-muted">
              <span className="font-bold text-ink-2">Also called:</span> {topic.aliases.join(", ")}
            </p>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

function TopicCreators({ catalog, topicId, courseId, courseShort }: { catalog: Awaited<ReturnType<typeof getCatalog>>; topicId: string; courseId: string; courseShort: string }) {
  const forTopic = topCreators(catalog, { topicId }, 4);
  const creators = forTopic.length ? forTopic : topCreators(catalog, { courseId }, 4);
  return (
    <div className="rounded-xl p-4 bg-surface ring-1 ring-line">
      <p className="font-brand text-[15px] font-extrabold text-ink">{forTopic.length ? "Best teachers for this topic" : `Best ${courseShort} teachers`}</p>
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
