import { BadgeCheck, Play } from "lucide-react";
import Link from "next/link";
import type { UploadCardData } from "@/lib/uploads";
import { CourseIcon } from "./course-icon";
import { ago, cn, formatDuration, formatViews } from "./ui";

function Poster({ u, compact }: { u: UploadCardData; compact?: boolean }) {
  return (
    <span className="relative block aspect-video overflow-hidden rounded-xl bg-bg-subtle ring-1 ring-inset ring-black/5">
      {u.posterUrl ? (
        <img src={u.posterUrl} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]" />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center bg-accent-soft">
          <span className="flex size-11 items-center justify-center rounded-full bg-surface/90 text-accent-ink shadow-soft">
            <Play className="ml-0.5 size-5 fill-current" />
          </span>
        </span>
      )}
      {!compact ? (
        <span className="absolute left-1.5 top-1.5 inline-flex h-5 items-center rounded-full bg-accent px-2 text-[11px] font-semibold text-white shadow-soft">Merit exclusive</span>
      ) : null}
      <span className="tabular absolute bottom-1.5 right-1.5 rounded-md bg-black/75 px-1.5 py-px text-[12px] font-semibold text-white backdrop-blur-sm">{formatDuration(u.durationSec)}</span>
    </span>
  );
}

/** A video published on Merit (not YouTube). Opens Merit's own player. */
export function UploadCard({ u, hideBy }: { u: UploadCardData; hideBy?: boolean }) {
  return (
    <div className="group min-w-0">
      <Link href={`/videos/${u.id}`} className="block" tabIndex={-1} aria-hidden>
        <Poster u={u} />
      </Link>
      <div className="mt-3 flex gap-3">
        {u.course ? <CourseIcon id={u.course.id} size={36} /> : null}
        <div className="min-w-0 flex-1">
          <Link href={`/videos/${u.id}`}>
            <h3 className="line-clamp-2 text-[15px] font-semibold leading-[1.35] text-ink" title={u.title}>
              {u.title}
            </h3>
          </Link>
          <div className="mt-1 text-[13px] leading-5 text-muted">
            {!hideBy ? (
              <Link href={u.by.href} className="flex items-center gap-1 truncate hover:text-ink">
                {u.by.name} <BadgeCheck className="size-3.5 shrink-0 text-accent-ink" />
              </Link>
            ) : null}
            <p className="tabular truncate">
              {formatViews(u.views)} {u.views === 1 ? "view" : "views"} · {ago(u.createdAt)}
              {u.course ? ` · ${u.course.title}` : ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Compact row for side lists (up-next on the watch page). */
export function UploadRow({ u, className }: { u: UploadCardData; className?: string }) {
  return (
    <Link href={`/videos/${u.id}`} className={cn("group -mx-2 flex gap-3 rounded-xl p-2 transition-colors duration-150 hover:bg-bg-subtle", className)}>
      <span className="w-40 shrink-0 sm:w-44">
        <Poster u={u} compact />
      </span>
      <span className="min-w-0 flex-1 py-0.5">
        <span className="line-clamp-2 text-[14px] font-semibold leading-snug text-ink" title={u.title}>
          {u.title}
        </span>
        <span className="mt-1 flex items-center gap-1 truncate text-[12.5px] text-muted">
          {u.by.name} <BadgeCheck className="size-3 shrink-0 text-accent-ink" />
        </span>
        <span className="tabular block truncate text-[12.5px] text-muted">
          {formatViews(u.views)} {u.views === 1 ? "view" : "views"} · {ago(u.createdAt)}
        </span>
      </span>
    </Link>
  );
}

export function UploadGrid({ items, hideBy }: { items: UploadCardData[]; hideBy?: boolean }) {
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 sm:gap-y-10 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((u) => (
        <UploadCard key={u.id} u={u} hideBy={hideBy} />
      ))}
    </div>
  );
}
