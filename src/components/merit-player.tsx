"use client";

import { useRef } from "react";
import { recordUploadView } from "@/app/actions/uploads";
import { trackPlay } from "./tracker";

/** Merit's own player for tutor uploads. A view counts once per page load, on first play. */
export function MeritPlayer({ id, src, poster }: { id: string; src: string; poster: string | null }) {
  const counted = useRef(false);
  return (
    <video
      src={src}
      poster={poster ?? undefined}
      controls
      playsInline
      preload="metadata"
      controlsList="nodownload"
      onPlay={() => {
        if (counted.current) return;
        counted.current = true;
        void recordUploadView(id);
        trackPlay(id);
      }}
      className="aspect-video w-full rounded-2xl bg-black"
    />
  );
}
