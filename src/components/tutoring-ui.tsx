import { BadgeCheck, ExternalLink, MapPin, MonitorSmartphone, Star } from "lucide-react";
import Link from "next/link";
import type { CreatorStat, Service } from "@/lib/tutoring";
import { formatPlace } from "@/lib/tutoring";
import type { Course, TutorWithStats } from "@/lib/types";
import { cn, formatViews } from "./ui";
import { ChannelAvatar } from "./video-card";

export function Initials({ name, size = 56 }: { name: string; size?: number }) {
  const hue = [...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 11);
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{ width: size, height: size, fontSize: size * 0.36, background: `linear-gradient(145deg, oklch(0.62 0.13 ${hue}), oklch(0.5 0.13 ${hue + 30}))` }}
    >
      {initials}
    </span>
  );
}

export function RatingLine({ rating, count }: { rating: number | null; count: number }) {
  if (!count || rating == null) return <span className="text-muted">New tutor</span>;
  return (
    <span className="tabular inline-flex items-center gap-1">
      <Star className="size-3.5 fill-[#f5b301] text-[#f5b301]" />
      <span className="font-medium text-ink">{rating.toFixed(1)}</span>
      <span className="text-muted">({count})</span>
    </span>
  );
}

export function TutorCard({ t, courses, rank, vetted }: { t: TutorWithStats; courses: Course[]; rank?: number; vetted?: boolean }) {
  const names = t.courseIds.map((id) => courses.find((c) => c.id === id)?.shortTitle).filter(Boolean);
  return (
    <Link href={`/tutors/${t.id}`} className="group flex gap-4 rounded-2xl p-4 ring-1 ring-line transition-colors hover:bg-bg-subtle/60">
      <div className="relative">
        <Initials name={t.name} />
        {rank ? <span className="tabular absolute -left-1 -top-1 flex size-6 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-bg">{rank}</span> : null}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className="flex min-w-0 items-center gap-1.5 text-[16px] font-semibold text-ink">
            <span className="truncate group-hover:underline">{t.name}</span>
            {vetted ? <BadgeCheck className="size-4 shrink-0 text-accent" aria-label="Merit Verified" /> : null}
          </p>
          <p className="tabular shrink-0 text-[15px] font-semibold text-ink">{t.hourlyRate == null ? "Free" : `$${t.hourlyRate}/hr`}</p>
        </div>
        <p className="line-clamp-2 text-[13.5px] leading-snug text-ink-2">{t.headline}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px]">
          <RatingLine rating={t.rating} count={t.reviewCount} />
          {t.inPerson && formatPlace(t) ? (
            <span className="flex items-center gap-1 text-muted">
              <MapPin className="size-3.5" /> {formatPlace(t)}
            </span>
          ) : null}
          {t.online ? (
            <span className="flex items-center gap-1 text-muted">
              <MonitorSmartphone className="size-3.5" /> Online
            </span>
          ) : null}
        </div>
        {names.length ? <p className="mt-1.5 truncate text-[12.5px] text-muted">{names.join(" · ")}</p> : null}
      </div>
    </Link>
  );
}

export function CreatorCard({ c, rank }: { c: CreatorStat; rank: number }) {
  return (
    <Link href={`/channel/${c.channel.id}`} className="group flex flex-col items-center rounded-2xl p-5 text-center ring-1 ring-line transition-colors hover:bg-bg-subtle/60">
      <div className="relative">
        <ChannelAvatar title={c.channel.title} src={c.channel.thumbnail} size={72} />
        <span
          className={cn(
            "tabular absolute -right-1 -top-1 flex size-7 items-center justify-center rounded-full text-[12px] font-bold ring-2 ring-bg",
            rank === 1 ? "bg-[#f5b301] text-black" : rank === 2 ? "bg-[#c0c4cc] text-black" : rank === 3 ? "bg-[#d38b52] text-black" : "bg-ink text-bg",
          )}
        >
          {rank}
        </span>
      </div>
      <p className="mt-3 line-clamp-2 min-h-[2.5em] text-[15px] font-semibold leading-tight text-ink group-hover:underline">{c.channel.title}</p>
      <p className="tabular mt-0.5 text-[12.5px] text-muted">
        {c.lessons} lessons · {formatViews(c.views)} views
      </p>
      {c.channel.subscribers ? <p className="tabular text-[12.5px] text-muted">{formatViews(c.channel.subscribers)} subscribers</p> : null}
    </Link>
  );
}

export function ServiceCard({ s, course, zip }: { s: Service; course: Course | null; zip: string | null }) {
  const qs = new URLSearchParams({ ...(course ? { course: course.id } : {}), ...(zip ? { zip } : {}) }).toString();
  return (
    <a
      href={`/r/${s.id}${qs ? `?${qs}` : ""}`}
      target="_blank"
      rel="noopener"
      className="group flex flex-col rounded-2xl p-5 ring-1 ring-line transition-colors hover:bg-bg-subtle/60"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="flex min-w-0 items-center gap-1.5 text-[16px] font-semibold text-ink">
          <span className="truncate">{s.name}</span>
          {s.partner ? <span className="shrink-0 rounded-full bg-accent-soft px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide text-accent">Merit Partner</span> : null}
        </p>
        <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold", s.kind === "Free" ? "bg-positive-soft text-positive" : "bg-bg-subtle text-ink-2")}>{s.kind}</span>
      </div>
      <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-muted">{s.blurb}</p>
      <p className="mt-4 flex items-center gap-1.5 text-sm font-medium text-accent">
        {s.id === "wyzant" && zip ? `Tutors near ${zip}` : `Find ${course ? course.shortTitle : ""} tutors`.replace(/\s+/g, " ")} <ExternalLink className="size-3.5" />
      </p>
    </a>
  );
}

export function VerifiedNote() {
  return (
    <p className="flex items-start gap-2 text-xs leading-relaxed text-muted">
      <BadgeCheck className="mt-0.5 size-3.5 shrink-0" />
      Tutor profiles are self-reported; Merit Verified tutors have been reviewed by our team. Reviews come from Merit students. Merit may earn a referral fee when you book through Merit or a partner link. Rankings are never paid for.
    </p>
  );
}
