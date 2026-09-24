import { BadgeCheck, Play } from "lucide-react";
import Link from "next/link";
import type { UploadCardData } from "@/lib/uploads";
import { CourseIcon } from "./course-icon";
import { ago, formatDuration, formatViews } from "./ui";

/** A video published on Merit (not YouTube). Opens Merit's own player. */
export function UploadCard({ u, hideBy }: { u: UploadCardData; hideBy?: boolean }) {
  return (
    <div className="group min-w-0">
      <Link href={`/videos/${u.id}`} className="relative block aspect-video overflow-hidden rounded-xl bg-bg-subtle">
        {u.posterUrl ? (
          <img src={u.posterUrl} alt="" loading="lazy" className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center bg-accent-soft">
            <Play className="size-10 text-accent" />
          </span>
        )}
        <span className="absolute left-1.5 top-1.5 rounded bg-accent px-1.5 py-px text-[11px] font-semibold text-white">Merit exclusive</span>
        <span className="tabular absolute bottom-1.5 right-1.5 rounded bg-black/80 px-1 py-px text-[12px] font-medium text-white">{formatDuration(u.durationSec)}</span>
      </Link>
      <div className="mt-3 flex gap-3">
        {u.course ? <CourseIcon id={u.course.id} size={36} /> : null}
        <div className="min-w-0 flex-1">
          <Link href={`/videos/${u.id}`}>
            <h3 className="line-clamp-2 text-[15px] font-medium leading-[1.35] text-ink" title={u.title}>
              {u.title}
            </h3>
          </Link>
          <div className="mt-1 text-[13.5px] leading-5 text-muted">
            {!hideBy ? (
              <Link href={u.by.href} className="flex items-center gap-1 truncate hover:text-ink">
                {u.by.name} <BadgeCheck className="size-3.5 shrink-0 text-accent" />
              </Link>
            ) : null}
            <p className="truncate">
              {formatViews(u.views)} {u.views === 1 ? "view" : "views"} · {ago(u.createdAt)}
              {u.course ? ` · ${u.course.title}` : ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function UploadGrid({ items, hideBy }: { items: UploadCardData[]; hideBy?: boolean }) {
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((u) => (
        <UploadCard key={u.id} u={u} hideBy={hideBy} />
      ))}
    </div>
  );
}
