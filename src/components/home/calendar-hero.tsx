import { CalendarClock } from "lucide-react";
import Link from "next/link";
import { CourseIcon } from "@/components/course-icon";
import { formatDuration } from "@/components/ui";
import type { IndexedCatalog } from "@/lib/catalog";

/** The sample week shown in the hero: what a student's calendar has, and what Merit lines up for it. */
const SAMPLE = [
  { day: "Wed", course: "ap-calculus-bc", topic: "chain-rule", label: "quiz" },
  { day: "Fri", course: "ap-biology", topic: "cellular-respiration", label: "unit test" },
  { day: "Mon", course: "ap-us-history", topic: null, label: "quiz" },
] as const;

/**
 * The homepage's lead: a calendar with real quizzes on it, and the lessons Merit queues up for each.
 * Each event lights up in turn and its lessons slide in; everything is shown at once with reduced motion.
 */
export function CalendarHeroVisual({ catalog }: { catalog: IndexedCatalog }) {
  const rows = SAMPLE.map((e) => {
    const course = catalog.course(e.course);
    if (!course) return null;
    const topic = e.topic ? catalog.topicIn(course.id, e.topic) : catalog.topicsForCourse(course.id).find((t) => catalog.videosForTopic(t.id).some((v) => !v.isShort));
    if (!topic) return null;
    const lessons = catalog.videosForTopic(topic.id).filter((v) => !v.isShort).slice(0, 2);
    return lessons.length ? { ...e, course, topic, lessons } : null;
  }).filter((r) => r !== null);
  if (!rows.length) return null;

  return (
    <div className="relative rounded-[28px] bg-surface p-4 text-ink shadow-[0_8px_0_0_rgb(0_0_0/0.18)] ring-2 ring-white/40 sm:p-5">
      <p className="flex items-center justify-between gap-2 font-brand text-[13px] font-extrabold text-muted">
        <span className="inline-flex items-center gap-1.5">
          <CalendarClock className="size-4 text-positive" /> Your class calendar
        </span>
        <span className="rounded-full bg-bg-subtle px-2.5 py-0.5 text-[11.5px]">Sample week</span>
      </p>
      <ol className="mt-3 space-y-3">
        {rows.map((r, i) => (
          <li key={r.topic.id} style={{ ["--s" as string]: i * 2 }}>
            <div className="event-ping flex items-center gap-3 rounded-2xl bg-bg-subtle px-3 py-2.5" style={{ ["--s" as string]: i * 2 }}>
              <span className="tabular w-9 shrink-0 font-brand text-[13px] font-black text-muted">{r.day}</span>
              <CourseIcon id={r.course.id} size={28} />
              <span className="min-w-0 flex-1 truncate font-brand text-[14.5px] font-extrabold">
                {r.course.shortTitle} {r.label}: {r.topic.title}
              </span>
            </div>
            <ul className="mt-1.5 space-y-1.5 border-l-2 border-dashed border-positive/40 pl-3 ml-[1.35rem]">
              {r.lessons.map((v, j) => (
                <li key={v.id} className="queue-in" style={{ ["--s" as string]: i * 2 + j * 0.5 + 0.6 }}>
                  <Link href={`/courses/${r.course.slug}/${r.topic.slug}?play=${v.id}`} className="group flex items-center gap-2.5 rounded-xl p-1 transition-colors hover:bg-bg-subtle">
                    <span className="relative aspect-video w-20 shrink-0 overflow-hidden rounded-lg bg-bg-subtle">
                      <img src={v.thumbnail} alt="" referrerPolicy="no-referrer" loading={i === 0 ? "eager" : "lazy"} className="absolute inset-0 size-full object-cover" />
                      <span className="tabular absolute bottom-0.5 right-0.5 rounded bg-black/75 px-1 text-[10px] font-bold text-white">{formatDuration(v.durationSec)}</span>
                    </span>
                    <span className="min-w-0">
                      <span className="line-clamp-1 text-[13px] font-bold leading-snug group-hover:underline">{v.title}</span>
                      <span className="block truncate text-[12px] text-muted">{v.channelTitle}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}
