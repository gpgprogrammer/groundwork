"use client";

import { Bookmark, BookmarkCheck, GraduationCap, EllipsisVertical, Link2, ListVideo, ThumbsDown, ThumbsUp, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { toggleSave, vote } from "@/app/actions/learning";
import type { FeedVideo } from "@/lib/feed";
import { courseColor } from "./course-icon";
import { ago, cn, formatDuration, formatViews } from "./ui";
import { useViewerMarks } from "./viewer-marks";

export function ChannelAvatar({ title, src, size = 36 }: { title: string; src: string | null; size?: number }) {
  const [failed, setFailed] = useState(false);
  if (src && !failed)
    return (
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className="shrink-0 rounded-full bg-bg-subtle object-cover"
        style={{ width: size, height: size }}
      />
    );
  const hue = [...title].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);
  return (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-full font-medium text-white"
      style={{ width: size, height: size, fontSize: size * 0.42, background: `oklch(0.55 0.12 ${hue})` }}
    >
      {title.trim()[0]?.toUpperCase()}
    </span>
  );
}

function Thumb({ v, className }: { v: FeedVideo; className?: string }) {
  return (
    <div className={cn("relative aspect-video w-full overflow-hidden rounded-2xl bg-bg-subtle", className)}>
      <img
        src={v.thumbnail}
        alt=""
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
      />
      <span className="tabular absolute bottom-2 right-2 rounded-lg bg-black/75 px-1.5 py-0.5 text-[12px] font-bold text-white backdrop-blur-sm">{formatDuration(v.durationSec)}</span>
    </div>
  );
}

/** Course-colored tag: "Calc BC · Chain Rule". Each course has its own color world. */
export function TopicTag({ v, className }: { v: Pick<FeedVideo, "courseId" | "courseShort" | "topicTitle" | "topicHref">; className?: string }) {
  if (!v.topicTitle || !v.topicHref) return null;
  const c = v.courseId ? courseColor(v.courseId) : "#2563eb";
  return (
    <Link
      href={v.topicHref}
      style={{ ["--c" as string]: c }}
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 truncate rounded-full bg-[color-mix(in_oklab,var(--c)_13%,var(--surface))] px-2.5 py-1 text-[12px] font-bold text-[color-mix(in_oklab,var(--c)_72%,var(--ink))] transition-[filter] hover:brightness-95",
        className,
      )}
    >
      <span className="size-1.5 shrink-0 rounded-full bg-[var(--c)]" aria-hidden />
      <span className="truncate">
        {v.courseShort} · {v.topicTitle}
      </span>
    </Link>
  );
}

export const videoHref = (v: Pick<FeedVideo, "id">) => `/go/${v.id}`;

/** Lesson tile. Opens the video on YouTube in a new tab. */
export function VideoCard({ v }: { v: FeedVideo }) {
  return (
    <div className="group relative flex min-w-0 flex-col rounded-3xl bg-surface p-2 ring-2 ring-line transition-[box-shadow] duration-200 hover:shadow-[0_5px_0_0_var(--line-strong)] hover:ring-line-strong">
      <a href={videoHref(v)} target="_blank" rel="noopener" className="block" aria-label={`${v.title} (opens on YouTube)`}>
        <Thumb v={v} />
      </a>
      <div className="relative flex flex-1 flex-col px-2 pb-2 pt-3">
        {v.reason ? (
          <p className="truncate text-[12.5px] font-bold text-accent-ink">{v.reason}</p>
        ) : (
          <TopicTag v={v} className="self-start" />
        )}
        <a href={videoHref(v)} target="_blank" rel="noopener" className="mt-2 pr-8">
          <h3 className="line-clamp-2 text-[15.5px] font-bold leading-snug text-ink" title={v.title}>
            {v.title}
          </h3>
        </a>
        <div className="mt-auto pt-3">
          <Link href={`/channel/${v.channelId}`} className="flex items-center gap-2 text-[13px] font-medium text-ink-2 hover:text-ink">
            <ChannelAvatar title={v.channelTitle} src={v.channelThumb} size={22} />
            <span className="truncate">{v.channelTitle}</span>
          </Link>
          <p className="tabular mt-1.5 truncate text-[12.5px] text-muted">
            {formatViews(v.views)} views on YouTube{ago(v.publishedAt) ? ` · ${ago(v.publishedAt)}` : ""}
          </p>
          {v.addedBy ? (
            <Link href={v.addedBy.href} className="mt-1.5 flex items-center gap-1 truncate text-[12.5px] font-bold text-positive hover:underline">
              <GraduationCap className="size-3.5 shrink-0" /> Picked by {v.addedBy.name}
            </Link>
          ) : null}
        </div>
        <VideoMenu v={v} className="absolute -right-0.5 top-9 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100" />
      </div>
    </div>
  );
}

/** Search/topic list row: a wide tile with the thumbnail on the left. */
export function VideoRow({ v, rank, extra }: { v: FeedVideo; rank?: number; extra?: ReactNode }) {
  return (
    <div className="group relative flex gap-3 rounded-3xl bg-surface p-2 ring-2 ring-line transition-[box-shadow] duration-200 hover:shadow-[0_5px_0_0_var(--line-strong)] hover:ring-line-strong sm:gap-4">
      {rank ? (
        <span className="tabular absolute -left-2 -top-2 z-10 flex size-8 items-center justify-center rounded-full bg-ink font-brand text-[14px] font-black text-bg ring-4 ring-bg">{rank}</span>
      ) : null}
      <a href={videoHref(v)} target="_blank" rel="noopener" className="w-36 shrink-0 sm:w-[240px] lg:w-[300px]" aria-label={`${v.title} (opens on YouTube)`}>
        <Thumb v={v} />
      </a>
      <div className="min-w-0 flex-1 py-1 pr-9">
        <a href={videoHref(v)} target="_blank" rel="noopener">
          <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-ink sm:text-[17px]" title={v.title}>
            {v.title}
          </h3>
        </a>
        <p className="tabular mt-1 text-[12.5px] text-muted">
          {formatViews(v.views)} views on YouTube{ago(v.publishedAt) ? ` · ${ago(v.publishedAt)}` : ""}
        </p>
        <Link href={`/channel/${v.channelId}`} className="mt-2 flex items-center gap-2 text-[13px] font-medium text-ink-2 hover:text-ink sm:mt-3">
          <ChannelAvatar title={v.channelTitle} src={v.channelThumb} size={22} />
          <span className="truncate">{v.channelTitle}</span>
        </Link>
        <div className="mt-2.5 hidden flex-wrap items-center gap-1.5 sm:flex">
          <TopicTag v={v} />
          {v.helpfulPct != null ? (
            <span className="rounded-full bg-positive-soft px-2.5 py-1 text-[12px] font-bold text-positive" title="From Merit students' votes">
              {v.helpfulPct}% helpful on Merit
            </span>
          ) : null}
          {v.addedBy ? (
            <Link href={v.addedBy.href} className="inline-flex items-center gap-1 rounded-full bg-positive-soft px-2.5 py-1 text-[12px] font-bold text-positive hover:underline">
              <GraduationCap className="size-3" /> Picked by {v.addedBy.name}
            </Link>
          ) : null}
          {extra}
        </div>
      </div>
      <VideoMenu v={v} className="absolute right-2 top-2" />
    </div>
  );
}

/** Vertical card for quick lessons (YouTube Shorts). */
export function ShortCard({ v }: { v: FeedVideo }) {
  return (
    <a href={videoHref(v)} target="_blank" rel="noopener" className="group block min-w-0 rounded-3xl bg-surface p-1.5 ring-2 ring-line transition-[box-shadow] duration-200 hover:shadow-[0_5px_0_0_var(--line-strong)]">
      <div className="relative aspect-[9/16] overflow-hidden rounded-[18px] bg-bg-subtle">
        <img src={v.thumbnail} alt="" loading="lazy" referrerPolicy="no-referrer" className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]" />
      </div>
      <div className="px-1.5 pb-1.5">
        <h3 className="mt-2 line-clamp-2 text-[14px] font-bold leading-snug text-ink">{v.title}</h3>
        <p className="tabular mt-0.5 text-[12.5px] text-muted">{formatViews(v.views)} views on YouTube</p>
      </div>
    </a>
  );
}

function VideoMenu({ v, className }: { v: FeedVideo; className?: string }) {
  const router = useRouter();
  const marks = useViewerMarks();
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(marks.saved.includes(v.id));
  const [myVote, setMyVote] = useState<1 | -1 | 0>(marks.votes[v.id] ?? 0);
  const [toast, setToast] = useState<string | null>(null);
  const [, start] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  };
  const needAuth = () => {
    if (marks.signedIn) return false;
    router.push("/login");
    return true;
  };

  const doSave = () => {
    setOpen(false);
    if (needAuth()) return;
    const next = !saved;
    setSaved(next);
    start(async () => {
      const r = await toggleSave(v.id);
      if ("saved" in r) {
        setSaved(r.saved);
        flash(r.saved ? "Saved to Watch later" : "Removed from Watch later");
      }
    });
  };
  const doVote = (value: 1 | -1) => {
    setOpen(false);
    if (needAuth()) return;
    const next = myVote === value ? 0 : value;
    setMyVote(next);
    start(async () => {
      await vote(v.id, next);
      flash(next === 1 ? "Marked helpful. Thanks!" : next === -1 ? "Got it. We'll show this less." : "Vote removed");
    });
  };
  const copy = async () => {
    setOpen(false);
    await navigator.clipboard.writeText(`https://www.youtube.com/watch?v=${v.id}`).catch(() => {});
    flash("Link copied");
  };

  return (
    <div ref={ref} className={cn("z-10", className)} style={open ? { opacity: 1 } : undefined}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex size-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-bg-subtle hover:text-ink"
        aria-label="More actions"
        aria-expanded={open}
      >
        <EllipsisVertical className="size-[18px]" />
      </button>
      {open ? (
        <div className="pop absolute right-0 top-10 w-60 origin-top-right rounded-2xl bg-surface p-1.5 shadow-lift ring-2 ring-line">
          <MenuButton onClick={doSave} icon={saved ? <BookmarkCheck className="size-[18px]" /> : <Bookmark className="size-[18px]" />}>
            {saved ? "Remove from Watch later" : "Save to Watch later"}
          </MenuButton>
          <MenuButton onClick={() => doVote(1)} icon={<ThumbsUp className={cn("size-[18px]", myVote === 1 && "fill-current")} />}>
            {myVote === 1 ? "Marked helpful" : "Helpful for studying"}
          </MenuButton>
          <MenuButton onClick={() => doVote(-1)} icon={<ThumbsDown className={cn("size-[18px]", myVote === -1 && "fill-current")} />}>
            Not helpful
          </MenuButton>
          <div className="mx-2 my-1.5 h-px bg-line" />
          {v.topicHref ? (
            <MenuLink href={v.topicHref} icon={<ListVideo className="size-[18px]" />}>
              More on {v.topicTitle}
            </MenuLink>
          ) : null}
          <MenuLink href={`/channel/${v.channelId}`} icon={<UserRound className="size-[18px]" />}>
            Go to channel
          </MenuLink>
          <MenuButton onClick={copy} icon={<Link2 className="size-[18px]" />}>
            Copy link
          </MenuButton>
        </div>
      ) : null}
      {toast ? (
        <div className="toast-in fixed inset-x-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-50 mx-auto w-fit rounded-full bg-ink px-5 py-3 text-sm font-medium text-bg shadow-lift md:bottom-6 md:left-6 md:right-auto md:mx-0" role="status">
          {toast}
        </div>
      ) : null}
    </div>
  );
}

function MenuButton({ onClick, icon, children }: { onClick: () => void; icon: ReactNode; children: ReactNode }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-[14px] font-medium text-ink transition-colors hover:bg-bg-subtle [&>svg]:text-muted">
      {icon}
      <span className="truncate">{children}</span>
    </button>
  );
}

function MenuLink({ href, icon, children }: { href: string; icon: ReactNode; children: ReactNode }) {
  return (
    <Link href={href} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[14px] font-medium text-ink transition-colors hover:bg-bg-subtle [&>svg]:text-muted">
      {icon}
      <span className="truncate">{children}</span>
    </Link>
  );
}

/** Compact lesson row for plans, schedules, and Sprint tasks: small thumbnail, title, channel. Opens on YouTube. */
export function LessonMini({ v }: { v: Pick<FeedVideo, "id" | "title" | "thumbnail" | "durationSec" | "channelTitle"> }) {
  return (
    <a href={videoHref(v)} target="_blank" rel="noopener" className="group flex items-center gap-3 rounded-2xl p-1.5 transition-colors hover:bg-bg-subtle" aria-label={`${v.title} (opens on YouTube)`}>
      <span className="relative w-28 shrink-0 overflow-hidden rounded-xl bg-bg-subtle ring-1 ring-inset ring-black/5">
        <img src={v.thumbnail} alt="" className="aspect-video w-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
        <span className="tabular absolute bottom-1 right-1 rounded-md bg-black/75 px-1 text-[10.5px] font-semibold text-white">{formatDuration(v.durationSec)}</span>
      </span>
      <span className="min-w-0">
        <span className="line-clamp-2 text-[13.5px] font-semibold leading-snug text-ink group-hover:underline">{v.title}</span>
        <span className="mt-0.5 block truncate text-[12px] text-muted">{v.channelTitle}</span>
      </span>
    </a>
  );
}
