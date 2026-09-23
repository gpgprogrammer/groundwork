import Link from "next/link";
import type { IndexedCatalog, RankedVideo } from "@/lib/catalog";
import { completionRate, helpfulRate } from "@/lib/ranking";
import { Thumbnail } from "./thumbnail";
import { Avatar, cn, formatCount } from "./ui";

/** Grid card for a lesson. */
export function LessonCard({
  video,
  catalog,
  progress,
  reason,
  showTopic = true,
}: {
  video: RankedVideo;
  catalog: IndexedCatalog;
  progress?: number;
  reason?: string;
  showTopic?: boolean;
}) {
  const topic = catalog.topic(video.topicId)!;
  const course = catalog.course(topic.courseId)!;
  const educator = catalog.educator(video.educatorId)!;
  return (
    <Link href={`/watch/${video.id}`} className="group block min-w-0">
      <Thumbnail
        topic={topic}
        course={course}
        style={video.style}
        durationSec={video.durationSec}
        progress={progress}
        className="transition-transform duration-300 group-hover:-translate-y-0.5"
      />
      <div className="mt-3 min-w-0">
        {reason ? <p className="mb-1 truncate text-xs font-medium text-accent">{reason}</p> : null}
        <p className="line-clamp-2 text-[14px] font-medium leading-snug text-ink group-hover:underline group-hover:decoration-line-strong group-hover:underline-offset-4">
          {video.title}
        </p>
        <p className="mt-1 truncate text-[13px] text-muted">
          {educator.name}
          {showTopic ? <> · {course.shortTitle}</> : null}
        </p>
      </div>
    </Link>
  );
}

/** Ranked row used on topic pages: shows why a lesson ranks where it does. */
export function LessonRow({
  video,
  catalog,
  position,
  progress,
  saved,
}: {
  video: RankedVideo;
  catalog: IndexedCatalog;
  position: number;
  progress?: number;
  saved?: boolean;
}) {
  const topic = catalog.topic(video.topicId)!;
  const course = catalog.course(topic.courseId)!;
  const educator = catalog.educator(video.educatorId)!;
  const completion = completionRate(video.stats);
  const helpful = helpfulRate(video.stats);
  return (
    <Link
      href={`/watch/${video.id}`}
      className={cn(
        "group grid grid-cols-[112px_1fr] items-start gap-4 rounded-xl p-2 transition-colors hover:bg-surface sm:grid-cols-[28px_200px_1fr] sm:gap-5 sm:p-3",
        position === 1 && "bg-surface shadow-soft ring-1 ring-line",
      )}
    >
      <span className="tabular hidden pt-1 text-center text-[13px] font-medium text-faint sm:block">{position}</span>
      <Thumbnail topic={topic} course={course} style={video.style} durationSec={video.durationSec} progress={progress} size="md" />
      <div className="min-w-0 py-0.5">
        {position === 1 || saved ? (
          <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            {position === 1 ? (
              <span className="rounded-md bg-ink px-1.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-bg">Top pick</span>
            ) : null}
            {saved ? <span className="text-xs font-medium text-accent">Saved</span> : null}
          </div>
        ) : null}
        <p className="line-clamp-2 text-[15px] font-medium leading-snug text-ink">{video.title}</p>
        <div className="mt-2 flex items-center gap-2">
          <Avatar name={educator.name} hue={educator.hue} size={20} />
          <span className="truncate text-[13px] text-ink-2">{educator.name}</span>
        </div>
        <dl className="tabular mt-3 hidden flex-wrap gap-x-5 gap-y-1 text-xs text-muted sm:flex">
          <div className="flex gap-1">
            <dt>Finished by</dt>
            <dd className="font-medium text-ink-2">{Math.round(completion * 100)}%</dd>
          </div>
          <div className="flex gap-1">
            <dt>Helpful</dt>
            <dd className="font-medium text-ink-2">{Math.round(helpful * 100)}%</dd>
          </div>
          <div className="flex gap-1">
            <dt>Saves</dt>
            <dd className="font-medium text-ink-2">{formatCount(video.stats.saves)}</dd>
          </div>
          <div className="flex gap-1">
            <dt>Views</dt>
            <dd className="font-medium text-ink-2">{formatCount(video.stats.views)}</dd>
          </div>
        </dl>
      </div>
    </Link>
  );
}

/** Compact list item (sidebars, "up next"). */
export function LessonListItem({
  video,
  catalog,
  progress,
  active,
  label,
}: {
  video: RankedVideo;
  catalog: IndexedCatalog;
  progress?: number;
  active?: boolean;
  label?: string;
}) {
  const topic = catalog.topic(video.topicId)!;
  const course = catalog.course(topic.courseId)!;
  const educator = catalog.educator(video.educatorId)!;
  return (
    <Link
      href={`/watch/${video.id}`}
      aria-current={active ? "page" : undefined}
      className={cn("group grid grid-cols-[128px_1fr] gap-3 rounded-xl p-2 transition-colors hover:bg-bg-subtle", active && "bg-bg-subtle")}
    >
      <Thumbnail topic={topic} course={course} durationSec={video.durationSec} progress={progress} size="sm" className="rounded-lg" />
      <div className="min-w-0 py-0.5">
        {label ? <p className="truncate text-[11px] font-medium text-accent">{label}</p> : null}
        <p className="line-clamp-2 text-[13px] font-medium leading-snug text-ink">{video.title}</p>
        <p className="mt-1 truncate text-xs text-muted">
          {educator.name} · {video.style}
        </p>
      </div>
    </Link>
  );
}
