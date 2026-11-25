import { ArrowUpRight, BadgeCheck, MapPin, MonitorSmartphone, Star } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import type { CreatorStat, Service } from "@/lib/tutoring";
import { formatPlace } from "@/lib/tutoring";
import type { Course, TutorWithStats } from "@/lib/types";
import { Avatar, cn, formatViews, panel, panelLink, plural } from "./ui";
import { ChannelAvatar } from "./video-card";

/*
 * The Tutors world is violet. These class strings keep it consistent across
 * the tutors directory, profiles, bookings, and the tutor dashboard.
 */
export const V = {
  /** Solid violet fill with white text (passes AA). */
  solid: "bg-[#7c3aed] text-white",
  /** Solid violet button or tile on its darker ledge. */
  btn: "press bg-[#7c3aed] text-white [--ledge:#5b21b6] hover:brightness-110",
  /** Soft violet surface. */
  soft: "bg-[#f3edff] dark:bg-[#2a1f45]",
  /** Violet text that reads on surface and soft violet in both themes. */
  ink: "text-[#6d28d9] dark:text-[#c9b5ff]",
  ring: "ring-[#7c3aed]",
} as const;

/** Chunky violet button class, sized like buttonClass("primary", size). */
export function violetButton(size: "sm" | "md" | "lg" = "md", className?: string) {
  const sizes = { sm: "h-9 px-4 text-[13.5px]", md: "h-11 px-5 text-[15px]", lg: "h-[52px] px-7 text-[16.5px]" };
  return cn(
    "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-2xl font-brand font-extrabold tracking-[0.01em] disabled:pointer-events-none disabled:opacity-50",
    V.btn,
    sizes[size],
    className,
  );
}

/** A person's initials on a soft tint derived from their name, so the same person always gets the same color. */
export function Initials({ name, size = 56, className }: { name: string; size?: number; className?: string }) {
  const hue = [...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 11);
  return <Avatar name={name.toUpperCase()} hue={hue} size={size} className={cn("font-brand font-black!", className)} />;
}

export function RatingLine({ rating, count }: { rating: number | null; count: number }) {
  if (!count || rating == null) return <span className="font-semibold text-muted">New tutor</span>;
  return (
    <span className="tabular inline-flex items-center gap-1">
      <Star className="size-3.5 fill-[#f5b301] text-[#f5b301]" aria-hidden />
      <span className="font-bold text-ink">{rating.toFixed(1)}</span>
      <span className="text-muted">({count})</span>
    </span>
  );
}

/** Gold, silver, bronze for the top three; violet after that. */
export function RankMedal({ rank, className }: { rank: number; className?: string }) {
  const tone =
    rank === 1
      ? "bg-[#f5b301] text-[#3d2a00] [--ledge:#b98600]"
      : rank === 2
        ? "bg-[#cfd6e1] text-[#2b3340] [--ledge:#98a2b3]"
        : rank === 3
          ? "bg-[#e0915a] text-[#3a1a05] [--ledge:#a65f2c]"
          : "bg-[#7c3aed] text-white [--ledge:#5b21b6]";
  return (
    <span aria-label={`Rank ${rank}`} className={cn("press-sm tabular flex size-7 items-center justify-center rounded-full font-brand text-[13px] font-black ring-2 ring-surface", tone, className)}>
      {rank}
    </span>
  );
}

/** Price as a bold pill: "$55/hr" or "Free". */
export function PriceBadge({ rate, className }: { rate: number | null; className?: string }) {
  return (
    <span className={cn("tabular inline-flex h-8 shrink-0 items-center rounded-full px-3 font-brand text-[15px] font-black", V.soft, V.ink, className)}>
      {rate == null ? "Free" : `$${rate}`}
      {rate != null ? <span className="ml-0.5 text-[12px] font-extrabold opacity-75">/hr</span> : null}
    </span>
  );
}

export function TutorCard({ t, courses, rank, vetted }: { t: TutorWithStats; courses: Course[]; rank?: number; vetted?: boolean }) {
  const names = t.courseIds.map((id) => courses.find((c) => c.id === id)?.shortTitle).filter(Boolean);
  const place = t.inPerson ? formatPlace(t) : null;
  return (
    <Link href={`/tutors/${t.id}`} className={cn(panelLink, "group flex flex-col p-5 hover:ring-[#7c3aed]/40")}>
      <div className="flex items-start gap-4">
        <div className="relative shrink-0">
          <Initials name={t.name} size={68} className="ring-4 ring-[#f3edff] dark:ring-[#2a1f45]" />
          {rank ? <RankMedal rank={rank} className="absolute -left-1.5 -top-1.5" /> : null}
        </div>
        <div className="min-w-0 flex-1 pt-1">
          <p className="flex min-w-0 items-center gap-1.5 font-brand text-[17px] font-extrabold leading-tight text-ink">
            <span className="truncate">{t.name}</span>
            {vetted ? <BadgeCheck className={cn("size-[18px] shrink-0", V.ink)} aria-label="Merit Verified" /> : null}
          </p>
          <div className="mt-1.5 text-[13px]">
            <RatingLine rating={t.rating} count={t.reviewCount} />
          </div>
        </div>
        <PriceBadge rate={t.hourlyRate} />
      </div>
      <p className="mt-3.5 line-clamp-2 flex-1 text-[14px] leading-snug text-ink-2">{t.headline}</p>
      <div className="mt-4 flex flex-wrap items-center gap-1.5 text-[12.5px]">
        {place ? (
          <span className="inline-flex h-7 items-center gap-1 rounded-full bg-bg-subtle px-2.5 font-semibold text-ink-2">
            <MapPin className="size-3.5" aria-hidden /> {place}
          </span>
        ) : null}
        {t.online ? (
          <span className="inline-flex h-7 items-center gap-1 rounded-full bg-bg-subtle px-2.5 font-semibold text-ink-2">
            <MonitorSmartphone className="size-3.5" aria-hidden /> Online
          </span>
        ) : null}
        {names.length ? <span className="min-w-0 truncate px-1 text-faint">{names.join(" · ")}</span> : null}
      </div>
    </Link>
  );
}

/* Rotating bands for the creators row. Every one passes AA with white text. */
const CREATOR_BANDS = [
  "bg-[#7c3aed]",
  "bg-accent",
  "bg-sprint",
  "bg-positive",
  "bg-[#db2777]",
  "bg-[#0e7490]",
];

export function CreatorCard({ c, rank }: { c: CreatorStat; rank: number }) {
  const band = CREATOR_BANDS[(rank - 1) % CREATOR_BANDS.length];
  return (
    <Link href={`/channel/${c.channel.id}`} className={cn(panelLink, "group flex h-full flex-col items-center overflow-hidden pb-5 text-center")}>
      <div className={cn("relative h-14 w-full", band)}>
        <div aria-hidden className="absolute -right-6 -top-8 size-20 rounded-full border-[10px] border-white/15" />
        <RankMedal rank={rank} className="absolute left-3 top-3" />
      </div>
      {/* Above the band: the band is positioned, so without its own layer the avatar would paint underneath it. */}
      <div className="relative z-10 -mt-9 rounded-full bg-surface p-1 ring-2 ring-line">
        <ChannelAvatar title={c.channel.title} src={c.channel.thumbnail} size={68} />
      </div>
      <p className="mt-2.5 line-clamp-2 min-h-[2.5em] px-3 font-brand text-[15px] font-extrabold leading-tight text-ink">{c.channel.title}</p>
      <p className="tabular mt-1 px-3 text-[12.5px] font-semibold text-muted">
        {plural(c.lessons, "lesson")} · {plural(c.topics, "topic")}
      </p>
      {c.channel.subscribers ? <p className="tabular px-3 text-[12.5px] text-muted">{formatViews(c.channel.subscribers)} subscribers</p> : null}
    </Link>
  );
}

export function ServiceCard({ s, course, zip }: { s: Service; course: Course | null; zip: string | null }) {
  const qs = new URLSearchParams({ ...(course ? { course: course.id } : {}), ...(zip ? { zip } : {}) }).toString();
  return (
    <a href={`/r/${s.id}${qs ? `?${qs}` : ""}`} target="_blank" rel="noopener" className={cn(panelLink, "group flex flex-col p-5")}>
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 font-brand text-[17px] font-extrabold leading-tight text-ink">{s.name}</p>
        <span
          className={cn(
            "inline-flex h-6 shrink-0 items-center rounded-full px-2.5 font-brand text-[12px] font-extrabold",
            s.kind === "Free" ? "bg-positive-soft text-positive" : "bg-bg-subtle text-ink-2",
          )}
        >
          {s.kind}
        </span>
      </div>
      {s.partner ? (
        <span className={cn("mt-2 inline-flex h-6 w-fit items-center gap-1 rounded-full px-2.5 font-brand text-[12px] font-extrabold", V.soft, V.ink)}>
          <BadgeCheck className="size-3.5" aria-hidden /> Merit Partner
        </span>
      ) : null}
      <p className="mt-3 flex-1 text-[13.5px] leading-relaxed text-muted">{s.blurb}</p>
      <p className={cn("mt-4 flex items-center gap-1 font-brand text-[14px] font-extrabold", V.ink)}>
        {s.id === "wyzant" && zip ? `Tutors near ${zip}` : `Find ${course ? course.shortTitle : ""} tutors`.replace(/\s+/g, " ")}
        <ArrowUpRight className="size-4 transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
      </p>
    </a>
  );
}

/** A chunky number tile for dashboards: big figure, small label, optional world color. */
export function StatTile({
  label,
  value,
  sub,
  tone = "surface",
  icon,
  className,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  tone?: "surface" | "violet" | "soft";
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl p-5",
        tone === "violet" ? "bg-[#7c3aed] text-white shadow-[0_4px_0_0_#5b21b6]" : tone === "soft" ? cn(V.soft, "ring-2 ring-[#7c3aed]/15") : cn(panel),
        className,
      )}
    >
      <p className={cn("flex items-center gap-1.5 font-brand text-[13px] font-extrabold", tone === "violet" ? "text-white/85" : tone === "soft" ? V.ink : "text-muted")}>
        {icon}
        {label}
      </p>
      <p className={cn("tabular mt-2 font-brand text-[32px] font-black leading-none", tone === "violet" ? "text-white" : "text-ink")}>{value}</p>
      {sub ? <p className={cn("mt-2 text-[12.5px] leading-snug", tone === "violet" ? "text-white/80" : "text-muted")}>{sub}</p> : null}
    </div>
  );
}

export function VerifiedNote() {
  return (
    <p className="flex items-start gap-2 text-xs leading-relaxed text-muted">
      <BadgeCheck className="mt-0.5 size-3.5 shrink-0" aria-hidden />
      Tutor profiles are self-reported; Merit Verified tutors have been reviewed by our team. Reviews come from Merit students. Merit earns a share of sessions you book through Merit. Rankings are never paid for.
    </p>
  );
}
