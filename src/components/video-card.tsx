"use client";

import { Bookmark, BookmarkCheck, GraduationCap, EllipsisVertical, Link2, ListVideo, ThumbsDown, ThumbsUp, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { toggleSave, vote } from "@/app/actions/learning";
import type { FeedVideo } from "@/lib/feed";
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
    <div className={cn("relative aspect-video w-full overflow-hidden rounded-xl bg-bg-subtle", className)}>
      <img
        src={v.thumbnail}
        alt=""
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
      />
      <span className="tabular absolute bottom-1.5 right-1.5 rounded bg-black/80 px-1 py-px text-[12px] font-medium text-white">
        {formatDuration(v.durationSec)}
      </span>
    </div>
  );
}

export const videoHref = (v: Pick<FeedVideo, "id">) => `/go/${v.id}`;

/** YouTube-style grid card. Opens the video on YouTube in a new tab. */
export function VideoCard({ v }: { v: FeedVideo }) {
  return (
    <div className="group relative min-w-0">
      <a href={videoHref(v)} target="_blank" rel="noopener" className="block" aria-label={`${v.title} (opens on YouTube)`}>
        <Thumb v={v} />
      </a>
      <div className="relative mt-3 flex gap-3 pr-7">
        <Link href={`/channel/${v.channelId}`} className="mt-0.5" aria-label={v.channelTitle}>
          <ChannelAvatar title={v.channelTitle} src={v.channelThumb} />
        </Link>
        <div className="min-w-0 flex-1">
          <a href={videoHref(v)} target="_blank" rel="noopener">
            <h3 className="line-clamp-2 text-[15px] font-medium leading-[1.35] text-ink" title={v.title}>
              {v.title}
            </h3>
          </a>
          <div className="mt-1 text-[13.5px] leading-5 text-muted">
            <Link href={`/channel/${v.channelId}`} className="block truncate hover:text-ink">
              {v.channelTitle}
            </Link>
            <p className="tabular truncate">
              {formatViews(v.views)} views{ago(v.publishedAt) ? ` · ${ago(v.publishedAt)}` : ""}
            </p>
            {v.addedBy ? (
              <Link href={v.addedBy.href} className="mt-0.5 flex items-center gap-1 truncate text-[12.5px] font-medium text-positive hover:underline">
                <GraduationCap className="size-3.5 shrink-0" /> Picked by {v.addedBy.name}
              </Link>
            ) : null}
            {v.reason ? (
              <p className="mt-0.5 truncate text-[12.5px] font-medium text-accent">{v.reason}</p>
            ) : v.topicTitle ? (
              <Link href={v.topicHref!} className="mt-0.5 block truncate text-[12.5px] hover:text-ink">
                {v.courseShort} · {v.topicTitle}
              </Link>
            ) : null}
          </div>
        </div>
        <VideoMenu v={v} className="absolute -right-2 -top-1 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100" />
      </div>
    </div>
  );
}

/** Search/topic list row: big thumbnail left, details right. */
export function VideoRow({ v, rank, extra }: { v: FeedVideo; rank?: number; extra?: ReactNode }) {
  return (
    <div className="group relative flex gap-4">
      {rank ? <span className="tabular hidden w-6 shrink-0 pt-2 text-right text-sm font-medium text-faint md:block">{rank}</span> : null}
      <a href={videoHref(v)} target="_blank" rel="noopener" className="w-40 shrink-0 sm:w-[260px] lg:w-[340px]" aria-label={`${v.title} (opens on YouTube)`}>
        <Thumb v={v} />
      </a>
      <div className="min-w-0 flex-1 pr-8">
        <a href={videoHref(v)} target="_blank" rel="noopener">
          <h3 className="line-clamp-2 text-[15px] font-medium leading-snug text-ink sm:text-[17px]" title={v.title}>
            {v.title}
          </h3>
        </a>
        <p className="tabular mt-1 text-[12.5px] text-muted">
          {formatViews(v.views)} views{ago(v.publishedAt) ? ` · ${ago(v.publishedAt)}` : ""}
          {v.likes != null ? <> · {formatViews(v.likes)} likes</> : null}
        </p>
        <Link href={`/channel/${v.channelId}`} className="mt-2 flex items-center gap-2 text-[12.5px] text-muted hover:text-ink sm:mt-3">
          <ChannelAvatar title={v.channelTitle} src={v.channelThumb} size={24} />
          <span className="truncate">{v.channelTitle}</span>
        </Link>
        <div className="mt-2 hidden flex-wrap items-center gap-1.5 sm:flex">
          {v.topicTitle ? (
            <Link href={v.topicHref!} className="rounded bg-bg-subtle px-1.5 py-0.5 text-[12px] font-medium text-ink-2 hover:bg-line">
              {v.topicTitle}
            </Link>
          ) : null}
          <span className="rounded bg-bg-subtle px-1.5 py-0.5 text-[12px] text-ink-2">{v.helpfulPct}% helpful</span>
          {v.addedBy ? (
            <Link href={v.addedBy.href} className="inline-flex items-center gap-1 rounded bg-positive-soft px-1.5 py-0.5 text-[12px] font-medium text-positive hover:underline">
              <GraduationCap className="size-3" /> Picked by {v.addedBy.name}
            </Link>
          ) : null}
          {extra}
        </div>
      </div>
      <VideoMenu v={v} className="absolute right-0 top-0" />
    </div>
  );
}

/** Vertical card for Shorts. */
export function ShortCard({ v }: { v: FeedVideo }) {
  return (
    <a href={videoHref(v)} target="_blank" rel="noopener" className="group block min-w-0">
      <div className="relative aspect-[9/16] overflow-hidden rounded-xl bg-bg-subtle">
        <img src={v.thumbnail} alt="" loading="lazy" referrerPolicy="no-referrer" className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
      </div>
      <h3 className="mt-2 line-clamp-2 text-[14px] font-medium leading-snug text-ink">{v.title}</h3>
      <p className="tabular mt-0.5 text-[13px] text-muted">{formatViews(v.views)} views</p>
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
        className="flex size-8 items-center justify-center rounded-full text-ink hover:bg-bg-subtle"
        aria-label="More actions"
        aria-expanded={open}
      >
        <EllipsisVertical className="size-[18px]" />
      </button>
      {open ? (
        <div className="fade absolute right-0 top-9 w-60 rounded-xl bg-surface py-2 shadow-lift ring-1 ring-line">
          <MenuButton onClick={doSave} icon={saved ? <BookmarkCheck className="size-5" /> : <Bookmark className="size-5" />}>
            {saved ? "Remove from Watch later" : "Save to Watch later"}
          </MenuButton>
          <MenuButton onClick={() => doVote(1)} icon={<ThumbsUp className={cn("size-5", myVote === 1 && "fill-current")} />}>
            {myVote === 1 ? "Marked helpful" : "Helpful for studying"}
          </MenuButton>
          <MenuButton onClick={() => doVote(-1)} icon={<ThumbsDown className={cn("size-5", myVote === -1 && "fill-current")} />}>
            Not helpful
          </MenuButton>
          <div className="my-1.5 h-px bg-line" />
          {v.topicHref ? (
            <MenuLink href={v.topicHref} icon={<ListVideo className="size-5" />}>
              More on {v.topicTitle}
            </MenuLink>
          ) : null}
          <MenuLink href={`/channel/${v.channelId}`} icon={<UserRound className="size-5" />}>
            Go to channel
          </MenuLink>
          <MenuButton onClick={copy} icon={<Link2 className="size-5" />}>
            Copy link
          </MenuButton>
        </div>
      ) : null}
      {toast ? (
        <div className="fade fixed bottom-6 left-6 z-50 rounded-lg bg-ink px-4 py-3 text-sm text-bg shadow-lift" role="status">
          {toast}
        </div>
      ) : null}
    </div>
  );
}

function MenuButton({ onClick, icon, children }: { onClick: () => void; icon: ReactNode; children: ReactNode }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-4 px-4 py-2 text-left text-sm text-ink hover:bg-bg-subtle">
      {icon}
      <span className="truncate">{children}</span>
    </button>
  );
}

function MenuLink({ href, icon, children }: { href: string; icon: ReactNode; children: ReactNode }) {
  return (
    <Link href={href} className="flex w-full items-center gap-4 px-4 py-2 text-sm text-ink hover:bg-bg-subtle">
      {icon}
      <span className="truncate">{children}</span>
    </Link>
  );
}
