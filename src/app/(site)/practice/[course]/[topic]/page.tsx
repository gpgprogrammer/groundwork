import { ArrowLeft, Timer } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CourseIcon } from "@/components/course-icon";
import { PracticeSession } from "@/components/practice/session";
import { cn } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";
import { hasPractice } from "@/lib/mathgen";
import { getViewer } from "@/lib/viewer";

export async function generateMetadata({ params }: PageProps<"/practice/[course]/[topic]">): Promise<Metadata> {
  const { course: c, topic: t } = await params;
  const catalog = await getCatalog();
  const course = catalog.course(c);
  const topic = course && t !== "mixed" ? catalog.topicIn(course.id, t) : undefined;
  return { title: topic ? `Practice: ${topic.title}` : course ? `Mixed practice: ${course.shortTitle}` : "Practice" };
}

/** A practice round for one topic, or a mixed round (`/practice/<course>/mixed?topics=a,b,c`). */
export default async function TopicPracticePage({ params, searchParams }: PageProps<"/practice/[course]/[topic]">) {
  const [{ course: c, topic: t }, sp, catalog, viewer] = await Promise.all([params, searchParams, getCatalog(), getViewer()]);
  const course = catalog.course(c);
  if (!course) notFound();
  const timed = sp.timed === "1";
  let topics;
  if (t === "mixed") {
    const ids = typeof sp.topics === "string" ? sp.topics.split(",").slice(0, 8) : [];
    topics = ids.map((id) => catalog.topic(id)).filter((x) => x && x.courseId === course.id && hasPractice(x.id));
  } else {
    const topic = catalog.topicIn(course.id, t);
    if (!topic || !hasPractice(topic.id)) notFound();
    topics = [topic];
  }
  if (!topics.length) notFound();
  const refs = topics.map((x) => ({ id: x!.id, title: x!.title, href: `/courses/${course.slug}/${x!.slug}` }));
  const label = t === "mixed" ? `Mixed review · ${refs.length} topics` : refs[0].title;
  const base = t === "mixed" ? `/practice/${course.slug}/mixed?topics=${refs.map((r) => r.id).join(",")}` : `/practice/${course.slug}/${t}`;
  const join = base.includes("?") ? "&" : "?";

  return (
    <div className="mx-auto max-w-3xl px-4 pb-10 pt-6 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href={`/practice?course=${course.slug}`} className="inline-flex min-w-0 items-center gap-2.5 font-brand text-[14px] font-extrabold text-muted hover:text-ink">
          <ArrowLeft className="size-4 shrink-0" />
          <CourseIcon id={course.id} size={26} />
          <span className="truncate">
            {course.shortTitle} · {label}
          </span>
        </Link>
        <div className="flex rounded-xl bg-bg-subtle p-1" role="group" aria-label="Mode">
          <Link href={base} aria-current={!timed ? "page" : undefined} className={cn("inline-flex h-8 items-center rounded-lg px-3 font-brand text-[13px] font-extrabold", !timed ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink")}>
            Practice
          </Link>
          <Link href={`${base}${join}timed=1`} aria-current={timed ? "page" : undefined} className={cn("inline-flex h-8 items-center gap-1 rounded-lg px-3 font-brand text-[13px] font-extrabold", timed ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink")}>
            <Timer className="size-3.5" /> Timed
          </Link>
        </div>
      </div>
      {timed ? <p className="mt-3 text-[13.5px] text-muted">Test conditions: 10 problems, 15 minutes, no hints. You&apos;ll see every solution at the end.</p> : null}
      <div className="mt-5">
        <PracticeSession key={`${base}:${timed}`} topics={refs} courseId={course.id} timed={timed} signedIn={Boolean(viewer)} />
      </div>
    </div>
  );
}
