import { Check, Clock, Zap } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { wantsCalendar } from "@/components/calendar-nudge";
import { CourseIcon, courseColors } from "@/components/course-icon";
import { QuickSession } from "@/components/quick/session";
import { getCatalog } from "@/lib/catalog";
import { sessionMinutes } from "@/lib/quick";
import { requireViewer } from "@/lib/viewer";

export async function generateMetadata({ params }: PageProps<"/master/[course]/[topic]">): Promise<Metadata> {
  const { course, topic: slug } = await params;
  const topic = (await getCatalog()).topicIn(course, slug);
  return topic ? { title: `Master ${topic.title}`, robots: { index: false } } : {};
}

/** A quick session on one topic. */
export default async function QuickSessionPage({ params }: PageProps<"/master/[course]/[topic]">) {
  const { course: courseSlug, topic: topicSlug } = await params;
  const viewer = await requireViewer(`/master/${courseSlug}/${topicSlug}`);
  const catalog = await getCatalog();
  const course = catalog.course(courseSlug);
  const topic = course ? catalog.topicIn(course.id, topicSlug) : undefined;
  if (!course || !topic || topic.courseId !== course.id) notFound();
  const unit = catalog.unit(topic.unitId)!;

  // The best-ranked full lessons for the topic; thin topics borrow from the rest of their unit.
  let lessons = catalog.videosForTopic(topic.id).filter((v) => !v.isShort);
  if (!lessons.length) lessons = catalog.topicsForUnit(unit.id).flatMap((t) => catalog.videosForTopic(t.id).filter((v) => !v.isShort));
  const picks = lessons.slice(0, 3).map((v) => ({ id: v.id, title: v.title, thumbnail: v.thumbnail, durationSec: v.durationSec, channelTitle: v.channelTitle }));

  const topics = catalog.topicsForCourse(course.id);
  const after = topics.slice(topics.findIndex((t) => t.id === topic.id) + 1);
  const nextTopic = after.find((t) => !viewer.state.mastered[t.id]) ?? topics.find((t) => t.id !== topic.id && !viewer.state.mastered[t.id]);
  const { from, to } = courseColors(course.id);
  const mastered = Boolean(viewer.state.mastered[topic.id]);

  return (
    <div style={{ ["--c" as string]: from, ["--c2" as string]: to }}>
      <header className="relative overflow-hidden bg-[linear-gradient(135deg,var(--c),var(--c2))] text-white">
        <div aria-hidden className="pointer-events-none absolute -right-20 -top-28 size-80 rounded-full border-[44px] border-white/[0.08]" />
        <div className="relative mx-auto max-w-3xl px-4 pb-7 pt-6 sm:px-6">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-brand text-[13.5px] font-bold text-white/80">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 font-extrabold text-white ring-1 ring-inset ring-white/25">
              <Zap className="size-3.5" /> Quick session
            </span>
            <Link href={`/courses/${course.slug}`} className="inline-flex items-center gap-1.5 hover:text-white">
              <CourseIcon id={course.id} size={20} /> {course.shortTitle}
            </Link>
            <span aria-hidden>›</span>
            <span>
              Unit {unit.order}: {unit.title}
            </span>
          </p>
          <h1 className="display mt-3 text-[32px] leading-tight sm:text-[44px]">{topic.title}</h1>
          <p className="mt-3 flex flex-wrap gap-2">
            <span className="tabular inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 font-brand text-[13px] font-extrabold ring-1 ring-inset ring-white/25">
              <Clock className="size-3.5" /> About {sessionMinutes(picks[0]?.durationSec)} min
            </span>
            {mastered ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 font-brand text-[13px] font-extrabold text-positive">
                <Check className="size-3.5" strokeWidth={3} /> Already mastered
              </span>
            ) : null}
          </p>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-4 pb-10 pt-6 sm:px-6">
        <QuickSession
          topic={{ id: topic.id, title: topic.title, summary: topic.summary, keyPoints: topic.keyPoints }}
          course={{ id: course.id, slug: course.slug, title: course.title, shortTitle: course.shortTitle }}
          topicHref={`/courses/${course.slug}/${topic.slug}`}
          lessons={picks}
          next={nextTopic ? { href: `/master/${course.slug}/${nextTopic.slug}`, title: nextTopic.title } : null}
          alreadyMastered={mastered}
          calendarNudge={wantsCalendar(viewer)}
        />
      </div>
    </div>
  );
}
