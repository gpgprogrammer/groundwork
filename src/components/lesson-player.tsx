"use client";

import { ExternalLink, ThumbsDown, ThumbsUp, X } from "lucide-react";
import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { openLesson, vote } from "@/app/actions/learning";
import { ReportButton } from "./report-button";
import { cn } from "./ui";
import { useViewerMarks } from "./viewer-marks";

export type PlayableLesson = { id: string; title: string; channelTitle: string; topicTitle?: string | null; topicHref?: string | null };

type Ctx = { play: (v: PlayableLesson) => void };
const PlayerCtx = createContext<Ctx | null>(null);

/** Lessons play on Merit, in YouTube's privacy-enhanced embedded player. */
export const useLessonPlayer = () => useContext(PlayerCtx);

/**
 * Click handler for lesson links: plays the lesson here instead of leaving for YouTube.
 * Cmd/Ctrl/Shift/middle clicks keep the link's own behavior (a new tab on YouTube).
 */
export function usePlayOnClick(v: PlayableLesson) {
  const player = useLessonPlayer();
  return (e: React.MouseEvent) => {
    if (!player || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    player.play(v);
  };
}

const MIN_WATCH_FOR_PROMPT = 30; // seconds

export function LessonPlayerProvider({ children }: { children: ReactNode }) {
  const [lesson, setLesson] = useState<PlayableLesson | null>(null);
  const play = useCallback((v: PlayableLesson) => {
    setLesson(v);
    void openLesson(v.id);
  }, []);
  return (
    <PlayerCtx.Provider value={{ play }}>
      {children}
      {lesson ? <PlayerDialog key={lesson.id} lesson={lesson} onClose={() => setLesson(null)} /> : null}
    </PlayerCtx.Provider>
  );
}

function PlayerDialog({ lesson, onClose }: { lesson: PlayableLesson; onClose: () => void }) {
  const { signedIn, votes } = useViewerMarks();
  const frame = useRef<HTMLIFrameElement>(null);
  const [ended, setEnded] = useState(false);
  const [asking, setAsking] = useState(false);
  const [voted, setVoted] = useState<1 | -1 | 0>(votes[lesson.id] ?? 0);
  const [pending, start] = useTransition();
  const watched = useRef(0);
  const startedAt = useRef<number | null>(null);

  // YouTube's embed reports player state over postMessage once we say we're listening (no extra script).
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== "https://www.youtube-nocookie.com" && e.origin !== "https://www.youtube.com") return;
      let data: { event?: string; info?: unknown };
      try {
        data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
      } catch {
        return;
      }
      const state = data.event === "onStateChange" ? data.info : data.event === "infoDelivery" ? (data.info as { playerState?: number })?.playerState : undefined;
      if (state === 1) startedAt.current ??= Date.now();
      if (state === 2 || state === 0) {
        if (startedAt.current) watched.current += (Date.now() - startedAt.current) / 1000;
        startedAt.current = null;
      }
      if (state === 0) setEnded(true);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const listen = () => frame.current?.contentWindow?.postMessage(JSON.stringify({ event: "listening", id: lesson.id, channel: "widget" }), "*");

  // Closing after watching a while asks once whether it helped (when there's no vote yet).
  const close = useCallback(() => {
    if (startedAt.current) watched.current += (Date.now() - startedAt.current) / 1000;
    startedAt.current = null;
    if (!asking && !ended && signedIn && voted === 0 && watched.current >= MIN_WATCH_FOR_PROMPT) {
      setAsking(true);
      return;
    }
    onClose();
  }, [asking, ended, signedIn, voted, onClose]);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", esc);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", esc);
      document.body.style.overflow = prev;
    };
  }, [close]);

  const cast = (value: 1 | -1) =>
    start(async () => {
      const next = voted === value ? 0 : value;
      setVoted(next);
      await vote(lesson.id, next);
      if (asking) onClose();
    });

  const src = `https://www.youtube-nocookie.com/embed/${lesson.id}?autoplay=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(typeof window === "undefined" ? "" : window.location.origin)}`;
  const showPrompt = signedIn && (ended || asking);

  return createPortal(
    <div className="fade fixed inset-0 z-[60] flex items-end justify-center bg-black/70 backdrop-blur-[2px] sm:items-center sm:p-6" onClick={close}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={lesson.title}
        onClick={(e) => e.stopPropagation()}
        className="dialog-in w-full max-w-4xl overflow-hidden rounded-t-[28px] bg-surface shadow-lift ring-1 ring-line sm:rounded-[28px]"
      >
        <div className="relative aspect-video w-full bg-black">
          <iframe
            ref={frame}
            src={src}
            title={lesson.title}
            onLoad={listen}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 size-full"
          />
        </div>
        <div className="flex flex-wrap items-start gap-3 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:p-5">
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 font-brand text-[16.5px] font-extrabold leading-snug text-ink">{lesson.title}</p>
            <p className="mt-0.5 truncate text-[13px] text-muted">
              {lesson.channelTitle}
              {lesson.topicTitle && lesson.topicHref ? (
                <>
                  {" · "}
                  <Link href={lesson.topicHref} onClick={onClose} className="font-semibold text-accent-ink hover:underline">
                    {lesson.topicTitle}
                  </Link>
                </>
              ) : null}
            </p>
          </div>
          <button type="button" onClick={close} aria-label="Close" className="press-sm flex size-10 shrink-0 items-center justify-center rounded-full bg-bg-subtle text-ink-2 [--ledge:var(--line)] hover:text-ink">
            <X className="size-5" />
          </button>
          <div className={cn("flex w-full flex-wrap items-center gap-2", showPrompt && "rounded-2xl bg-accent-soft p-3")}>
            {signedIn ? (
              <>
                <span className={cn("font-brand text-[14px] font-extrabold", showPrompt ? "text-ink" : "text-muted")}>{showPrompt ? "Did this lesson help?" : "Helpful?"}</span>
                <button type="button" disabled={pending} onClick={() => cast(1)} aria-pressed={voted === 1} className={cn("press-sm inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 font-brand text-[13px] font-extrabold ring-2", voted === 1 ? "bg-positive text-white ring-positive" : "bg-surface text-ink-2 ring-line hover:text-ink")}>
                  <ThumbsUp className="size-4" /> Yes
                </button>
                <button type="button" disabled={pending} onClick={() => cast(-1)} aria-pressed={voted === -1} className={cn("press-sm inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 font-brand text-[13px] font-extrabold ring-2", voted === -1 ? "bg-ink text-bg ring-ink" : "bg-surface text-ink-2 ring-line hover:text-ink")}>
                  <ThumbsDown className="size-4" /> No
                </button>
              </>
            ) : (
              <Link href="/signup?as=student" onClick={onClose} className="font-brand text-[13.5px] font-extrabold text-accent-ink hover:underline">
                Sign up free to save lessons and rate them
              </Link>
            )}
            <span className="ml-auto flex items-center gap-3">
              <ReportButton kind="lesson" targetId={lesson.id} />
              <a href={`https://www.youtube.com/watch?v=${lesson.id}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-brand text-[13px] font-extrabold text-muted hover:text-ink">
                Watch on YouTube <ExternalLink className="size-3.5" />
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/**
 * A link to a lesson. Plays it on Merit when clicked; it's still a real link to /go/<id> (which records
 * the open and sends you to YouTube) for new tabs and visitors without JavaScript.
 */
export function LessonLink({
  v,
  children,
  className,
  onPlay,
  ...rest
}: { v: PlayableLesson; children: ReactNode; className?: string; onPlay?: () => void } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "onClick">) {
  const play = usePlayOnClick(v);
  return (
    <a
      href={`/go/${v.id}`}
      onClick={(e) => {
        onPlay?.();
        play(e);
      }}
      className={className}
      {...rest}
    >
      {children}
    </a>
  );
}

/** Opens a lesson as soon as the page loads (topic pages linked with ?play=<id>). */
export function AutoPlay({ v }: { v: PlayableLesson }) {
  const player = useLessonPlayer();
  const done = useRef(false);
  useEffect(() => {
    if (done.current || !player) return;
    done.current = true;
    player.play(v);
  }, [player, v]);
  return null;
}
