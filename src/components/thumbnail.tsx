import type { CSSProperties } from "react";
import type { Course, Topic, VideoStyle } from "@/lib/types";
import { cn, formatDuration } from "./ui";

/**
 * Typographic lesson thumbnails. No stock imagery: just the topic's mark,
 * set in serif on a quiet, course-tinted ground.
 */
export function Thumbnail({
  topic,
  course,
  style,
  durationSec,
  progress,
  className,
  size = "md",
}: {
  topic: Pick<Topic, "glyph" | "title">;
  course: Pick<Course, "hue" | "shortTitle">;
  style?: VideoStyle;
  durationSec?: number;
  progress?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const glyphSize = { sm: "text-[14px]", md: "text-[26px]", lg: "text-[44px]" }[size];
  return (
    <div
      className={cn("thumb relative isolate aspect-video w-full overflow-hidden rounded-[10px]", className)}
      style={{ "--h": course.hue } as CSSProperties}
    >
      <div className="thumb-grid absolute inset-0" />
      <div className={cn("absolute inset-0 flex items-center justify-center", size === "sm" ? "px-2 pb-2" : "px-3")}>
        <span className={cn("max-w-full truncate font-serif italic leading-none tracking-[-0.01em] text-[var(--t-ink)]", glyphSize)}>
          {topic.glyph}
        </span>
      </div>
      {style && size !== "sm" ? (
        <span className="absolute left-2.5 top-2.5 rounded-[5px] bg-[var(--t-chip)] px-1.5 py-0.5 text-[10.5px] font-medium text-[var(--t-chip-ink)] backdrop-blur-sm">
          {style}
        </span>
      ) : null}
      {durationSec ? (
        <span
          className={cn(
            "tabular absolute rounded-[5px] bg-[#111113]/75 font-medium text-white backdrop-blur-sm",
            size === "sm" ? "bottom-1 right-1 px-1 py-px text-[9.5px]" : "bottom-2 right-2 px-1.5 py-0.5 text-[11px]",
          )}
        >
          {formatDuration(durationSec)}
        </span>
      ) : null}
      {progress !== undefined && progress > 0 ? (
        <div className="absolute inset-x-0 bottom-0 h-[3px] bg-black/10">
          <div className="h-full bg-accent" style={{ width: `${Math.min(100, progress * 100)}%` }} />
        </div>
      ) : null}
    </div>
  );
}
