"use client";

import { Gauge, ListVideo, Maximize, Minimize, Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { Chapter } from "@/lib/types";
import { buttonClass, cn, formatDuration } from "./ui";

export type PlayerGate = "none" | "preview" | "expired";

type Props = {
  videoId: string;
  durationSec: number;
  chapters: Chapter[];
  mediaUrl: string | null;
  hue: number;
  glyph: string;
  topicTitle: string;
  educatorName: string;
  initialPosition: number;
  signedIn: boolean;
  gate: PlayerGate;
  previewSeconds?: number;
  next?: { href: string; title: string } | null;
  endCard?: ReactNode;
};

const SPEEDS = [1, 1.25, 1.5, 1.75, 2];
const REPORT_EVERY = 12;

export function LessonPlayer(props: Props) {
  const { videoId, durationSec, chapters, hue, gate, previewSeconds = 90, signedIn } = props;
  const [time, setTime] = useState(props.initialPosition);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [ended, setEnded] = useState(false);
  const [gated, setGated] = useState(gate === "expired");
  const [showChapters, setShowChapters] = useState(false);
  const [showSpeed, setShowSpeed] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [resumed, setResumed] = useState(props.initialPosition > 5);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [controlsVisible, setControlsVisible] = useState(true);

  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timeRef = useRef(time);
  const unreported = useRef(0);
  const lastTick = useRef<number | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    timeRef.current = time;
  }, [time]);

  const limit = gate === "preview" ? Math.min(previewSeconds, durationSec) : durationSec;

  const report = useCallback(
    (beacon = false) => {
      if (!signedIn || gate !== "none") return;
      const watchedDelta = Math.round(unreported.current);
      unreported.current = 0;
      const body = JSON.stringify({ videoId, position: Math.round(timeRef.current), watchedDelta });
      if (beacon && navigator.sendBeacon) {
        navigator.sendBeacon("/api/progress", new Blob([body], { type: "application/json" }));
      } else {
        fetch("/api/progress", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
      }
    },
    [signedIn, gate, videoId],
  );

  // Clock for the built-in lesson player.
  useEffect(() => {
    if (!playing || props.mediaUrl) return;
    lastTick.current = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      const dt = ((now - (lastTick.current ?? now)) / 1000) * speed;
      lastTick.current = now;
      unreported.current += dt;
      setTime((t) => {
        const nt = Math.min(limit, t + dt);
        if (nt >= limit) {
          setPlaying(false);
          if (limit < durationSec) setGated(true);
          else setEnded(true);
        }
        return nt;
      });
    }, 200);
    return () => clearInterval(id);
  }, [playing, speed, limit, durationSec, props.mediaUrl]);

  // Periodic reporting while playing.
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => report(), REPORT_EVERY * 1000);
    return () => clearInterval(id);
  }, [playing, report]);

  useEffect(() => {
    if (ended) report();
  }, [ended, report]);

  useEffect(() => {
    const onHide = () => document.visibilityState === "hidden" && unreported.current > 1 && report(true);
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, [report]);

  const play = useCallback(() => {
    if (gated) return;
    setResumed(false);
    if (ended || timeRef.current >= durationSec - 0.5) {
      setEnded(false);
      setTime(0);
      if (videoRef.current) videoRef.current.currentTime = 0;
    }
    setPlaying(true);
    videoRef.current?.play().catch(() => setPlaying(false));
  }, [gated, ended, durationSec]);

  const pause = useCallback(() => {
    setPlaying(false);
    videoRef.current?.pause();
    if (unreported.current > 1) report();
  }, [report]);

  const seek = useCallback(
    (t: number) => {
      const clamped = Math.max(0, Math.min(limit, t));
      setTime(clamped);
      setEnded(false);
      setResumed(false);
      if (videoRef.current) videoRef.current.currentTime = clamped;
    },
    [limit],
  );

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) rootRef.current?.requestFullscreen?.().catch(() => {});
    else document.exitFullscreen?.().catch(() => {});
  }, []);

  useEffect(() => {
    const onFs = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      if (document.querySelector("[role=dialog]")) return;
      if (e.key === " " || e.key === "k") {
        e.preventDefault();
        if (playing) pause();
        else play();
      } else if (e.key === "ArrowRight" || e.key === "l") {
        e.preventDefault();
        seek(timeRef.current + (e.key === "l" ? 10 : 5));
      } else if (e.key === "ArrowLeft" || e.key === "j") {
        e.preventDefault();
        seek(timeRef.current - (e.key === "j" ? 10 : 5));
      } else if (e.key === "f") {
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [playing, play, pause, seek, toggleFullscreen]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = speed;
  }, [speed]);

  const nudgeControls = () => {
    setControlsVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setControlsVisible(false), 2600);
  };

  const chapterIndex = Math.max(0, chapters.findLastIndex((c) => c.t <= time + 0.01));
  const chapter = chapters[chapterIndex];
  const chapterEnd = chapters[chapterIndex + 1]?.t ?? durationSec;
  const chapterProgress = chapter ? (time - chapter.t) / Math.max(1, chapterEnd - chapter.t) : 0;
  const pct = (time / durationSec) * 100;
  const showControls = !playing || controlsVisible || showChapters || showSpeed;

  return (
    <div
      ref={rootRef}
      className={cn(
        "group/player relative isolate w-full select-none overflow-hidden bg-[#0e0f12] text-white",
        fullscreen ? "flex h-screen items-center" : "rounded-2xl shadow-lift",
      )}
      onMouseMove={nudgeControls}
      onMouseLeave={() => playing && setControlsVisible(false)}
      style={{ "--h": hue } as CSSProperties}
    >
      <div className="relative aspect-video w-full">
        {props.mediaUrl ? (
          <video
            ref={videoRef}
            src={props.mediaUrl}
            className="absolute inset-0 size-full bg-black object-contain"
            playsInline
            preload="metadata"
            onLoadedMetadata={(e) => {
              if (props.initialPosition > 0) e.currentTarget.currentTime = props.initialPosition;
            }}
            onTimeUpdate={(e) => {
              const t = e.currentTarget.currentTime;
              const dt = t - timeRef.current;
              if (dt > 0 && dt < 2) unreported.current += dt;
              if (t >= limit && limit < durationSec) {
                e.currentTarget.pause();
                setGated(true);
              }
              setTime(t);
            }}
            onEnded={() => {
              setPlaying(false);
              setEnded(true);
            }}
            onClick={() => (playing ? pause() : play())}
          />
        ) : (
          <LessonCanvas
            chapters={chapters}
            chapterIndex={chapterIndex}
            chapterProgress={chapterProgress}
            glyph={props.glyph}
            topicTitle={props.topicTitle}
            educatorName={props.educatorName}
            playing={playing}
            onClick={() => (playing ? pause() : play())}
          />
        )}

        {/* Big play button */}
        {!playing && !ended && !gated ? (
          <button
            onClick={play}
            className="absolute right-[9%] top-1/2 z-10 flex size-14 -translate-y-1/2 items-center sm:size-16 justify-center rounded-full bg-white/95 text-[#111113] shadow-2xl transition-transform hover:scale-105"
            aria-label={time > 0 ? "Resume" : "Play"}
          >
            <Play className="ml-1 size-6 fill-current" />
          </button>
        ) : null}

        {resumed ? (
          <div className="fade absolute left-4 top-4 z-10 flex items-center gap-3 rounded-lg bg-black/60 px-3 py-2 text-xs backdrop-blur-md">
            <span className="text-white/80">Resuming at {formatDuration(time)}</span>
            <button onClick={() => seek(0)} className="font-medium text-white hover:underline">
              Start over
            </button>
          </div>
        ) : null}

        {ended ? (
          <Overlay>
            <p className="text-xs font-medium uppercase tracking-wider text-white/50">Lesson complete</p>
            {props.next ? (
              <>
                <p className="mt-3 text-sm text-white/70">Up next</p>
                <p className="mt-1 max-w-md text-xl font-semibold tracking-tight">{props.next.title}</p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                  <Link href={props.next.href} className={buttonClass("secondary", "md", "border-transparent")}>
                    <SkipForward className="size-4" /> Play next
                  </Link>
                  <button onClick={play} className={buttonClass("ghost", "md", "text-white/80 hover:bg-white/10 hover:text-white")}>
                    <RotateCcw className="size-4" /> Replay
                  </button>
                </div>
              </>
            ) : (
              <button onClick={play} className={buttonClass("secondary", "md", "mt-5 border-transparent")}>
                <RotateCcw className="size-4" /> Replay
              </button>
            )}
            {props.endCard ? <div className="mt-8 w-full max-w-md">{props.endCard}</div> : null}
          </Overlay>
        ) : null}

        {gated ? (
          <Overlay>
            {gate === "expired" ? (
              <>
                <p className="text-xl font-semibold tracking-tight">Your free month has ended</p>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/65">
                  Continue with every lesson, your history, and your saved lessons for $10 a month. Cancel anytime.
                </p>
                <form action="/api/billing/checkout" method="post" className="mt-6">
                  <button className={buttonClass("secondary", "lg", "border-transparent")}>Continue for $10/month</button>
                </form>
              </>
            ) : (
              <>
                <p className="text-xl font-semibold tracking-tight">Keep watching free for 30 days</p>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/65">
                  Create a free account to finish this lesson, save your place, and see what to study next. No card needed.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                  <Link href={`/signup?next=/watch/${videoId}`} className={buttonClass("secondary", "lg", "border-transparent")}>
                    Start free
                  </Link>
                  <Link href={`/login?next=/watch/${videoId}`} className={buttonClass("ghost", "lg", "text-white/80 hover:bg-white/10 hover:text-white")}>
                    Sign in
                  </Link>
                </div>
              </>
            )}
          </Overlay>
        ) : null}

        {/* Chapters panel */}
        {showChapters ? (
          <div className="fade absolute bottom-16 right-3 z-20 max-h-[70%] w-72 overflow-y-auto rounded-xl bg-[#17181c]/95 p-1.5 shadow-2xl ring-1 ring-white/10 backdrop-blur-md">
            {chapters.map((c, i) => (
              <button
                key={c.t}
                onClick={() => {
                  seek(c.t);
                  setShowChapters(false);
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[13px] hover:bg-white/10",
                  i === chapterIndex && "bg-white/10",
                )}
              >
                <span className="tabular w-9 shrink-0 text-white/50">{formatDuration(c.t)}</span>
                <span className="truncate">{c.title}</span>
              </button>
            ))}
          </div>
        ) : null}
        {showSpeed ? (
          <div className="fade absolute bottom-16 right-14 z-20 w-32 rounded-xl bg-[#17181c]/95 p-1.5 shadow-2xl ring-1 ring-white/10 backdrop-blur-md">
            {SPEEDS.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSpeed(s);
                  setShowSpeed(false);
                }}
                className={cn("tabular flex w-full rounded-lg px-3 py-1.5 text-left text-[13px] hover:bg-white/10", s === speed && "bg-white/10")}
              >
                {s}×
              </button>
            ))}
          </div>
        ) : null}

        {/* Control bar */}
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-3 pb-2.5 pt-10 transition-opacity duration-300 sm:px-4",
            showControls ? "opacity-100" : "opacity-0",
          )}
        >
          <div
            className="group/bar relative h-4 cursor-pointer"
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setHoverTime(((e.clientX - r.left) / r.width) * durationSec);
            }}
            onMouseLeave={() => setHoverTime(null)}
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              seek(((e.clientX - r.left) / r.width) * durationSec);
            }}
            role="slider"
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={durationSec}
            aria-valuenow={Math.round(time)}
            aria-valuetext={formatDuration(time)}
            tabIndex={0}
          >
            <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/20 transition-[height] group-hover/bar:h-1.5">
              {gate === "preview" ? (
                <div className="absolute inset-y-0 rounded-full bg-white/15" style={{ left: 0, width: `${(limit / durationSec) * 100}%` }} />
              ) : null}
              <div className="absolute inset-y-0 left-0 rounded-full bg-white" style={{ width: `${pct}%` }} />
              {chapters.slice(1).map((c) => (
                <span key={c.t} className="absolute inset-y-0 w-[3px] bg-[#0e0f12]/70" style={{ left: `${(c.t / durationSec) * 100}%` }} />
              ))}
            </div>
            <span
              className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 shadow transition-opacity group-hover/bar:opacity-100"
              style={{ left: `${pct}%` }}
            />
            {hoverTime !== null ? (
              <span
                className="tabular pointer-events-none absolute -top-8 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-[11px]"
                style={{ left: `${Math.min(96, Math.max(4, (hoverTime / durationSec) * 100))}%` }}
              >
                {formatDuration(hoverTime)} · {chapters[Math.max(0, chapters.findLastIndex((c) => c.t <= hoverTime))]?.title}
              </span>
            ) : null}
          </div>
          <div className="mt-1.5 flex items-center gap-1">
            <CtrlButton onClick={() => (playing ? pause() : play())} label={playing ? "Pause (k)" : "Play (k)"}>
              {playing ? <Pause className="size-[18px] fill-current" /> : <Play className="size-[18px] fill-current" />}
            </CtrlButton>
            <span className="tabular ml-1 text-[12.5px] text-white/85">
              {formatDuration(time)} <span className="text-white/45">/ {formatDuration(durationSec)}</span>
            </span>
            <span className="ml-3 hidden truncate text-[12.5px] text-white/60 sm:block">{chapter?.title}</span>
            <div className="ml-auto flex items-center gap-0.5">
              <CtrlButton
                onClick={() => {
                  setShowSpeed((s) => !s);
                  setShowChapters(false);
                }}
                label="Playback speed"
              >
                {speed === 1 ? <Gauge className="size-[18px]" /> : <span className="tabular text-xs font-semibold">{speed}×</span>}
              </CtrlButton>
              <CtrlButton
                onClick={() => {
                  setShowChapters((s) => !s);
                  setShowSpeed(false);
                }}
                label="Chapters"
              >
                <ListVideo className="size-[18px]" />
              </CtrlButton>
              <CtrlButton onClick={toggleFullscreen} label="Fullscreen (f)">
                {fullscreen ? <Minimize className="size-[18px]" /> : <Maximize className="size-[18px]" />}
              </CtrlButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CtrlButton({ children, onClick, label }: { children: ReactNode; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} aria-label={label} title={label} className="flex size-9 items-center justify-center rounded-lg text-white/90 transition-colors hover:bg-white/10">
      {children}
    </button>
  );
}

function Overlay({ children }: { children: ReactNode }) {
  return (
    <div className="fade absolute inset-0 z-20 flex flex-col items-center justify-center overflow-y-auto bg-[#0e0f12]/85 px-6 py-8 text-center backdrop-blur-md">
      {children}
    </div>
  );
}

/** The built-in lesson canvas: one chapter at a time, set like a lecture slide. */
function LessonCanvas({
  chapters,
  chapterIndex,
  chapterProgress,
  glyph,
  topicTitle,
  educatorName,
  playing,
  onClick,
}: {
  chapters: Chapter[];
  chapterIndex: number;
  chapterProgress: number;
  glyph: string;
  topicTitle: string;
  educatorName: string;
  playing: boolean;
  onClick: () => void;
}) {
  const chapter = chapters[chapterIndex];
  return (
    <div
      className="absolute inset-0 cursor-pointer overflow-hidden"
      onClick={onClick}
      style={{
        background: "radial-gradient(90% 80% at 80% 0%, oklch(0.32 0.06 var(--h) / 0.55), transparent 60%), linear-gradient(180deg, #121318, #0e0f12)",
      }}
    >
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div
        aria-hidden
        className={cn(
          "absolute -right-6 bottom-2 font-serif italic leading-none text-white/[0.05] transition-transform duration-[4000ms] ease-out",
          playing && "translate-x-[-12px]",
        )}
        style={{ fontSize: "clamp(80px, 18vw, 220px)" }}
      >
        {glyph}
      </div>
      <div className="absolute left-[6%] top-[9%] flex items-center gap-2 text-[11px] font-medium tracking-wide text-white/45 sm:text-xs">
        <span className="tabular">
          {String(chapterIndex + 1).padStart(2, "0")} / {String(chapters.length).padStart(2, "0")}
        </span>
        <span className="h-px w-6 bg-white/25" />
        <span className="truncate">{topicTitle}</span>
      </div>
      <div key={chapterIndex} className="rise absolute left-[6%] right-[26%] top-[44%] -translate-y-1/2">
        {chapterIndex === 0 ? (
          <p className="font-serif text-[clamp(20px,5vw,64px)] italic leading-none" style={{ color: "oklch(0.9 0.06 var(--h))" }}>
            {glyph}
          </p>
        ) : null}
        <h3 className={cn("font-semibold tracking-[-0.03em] text-white", chapterIndex === 0 ? "mt-2 text-[clamp(15px,3vw,34px)] sm:mt-4" : "text-[clamp(17px,4vw,48px)] leading-[1.08]")}>
          {chapter?.title}
        </h3>
        <div className="mt-3 h-[2px] w-24 overflow-hidden sm:mt-5 rounded-full bg-white/10 sm:w-56">
          <div className="h-full rounded-full" style={{ width: `${Math.min(100, chapterProgress * 100)}%`, background: "oklch(0.8 0.1 var(--h))" }} />
        </div>
      </div>
      <div className="absolute left-[6%] top-[9%] mt-7 hidden text-xs text-white/35 sm:block">{educatorName}</div>
    </div>
  );
}
