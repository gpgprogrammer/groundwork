import { BookOpenCheck, CalendarClock, GraduationCap, Moon, Play, Repeat, Timer } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { LessonMini } from "@/components/video-card";
import type { PlanDay, PlanTask, TaskKind } from "@/lib/plan";
import { dayLabel } from "@/lib/plan";
import { CourseIcon } from "./course-icon";
import { TaskCheck } from "./plan-client";
import { cn } from "./ui";

/*
 * The Plan world (Tonight, My schedule, Progress) is green.
 * White text sits on a fixed deep green in both themes so it always passes contrast.
 */
export const planGreen = "bg-[linear-gradient(135deg,#17913f,#12722f)]";
/** A chunky solid green button or tile on its ledge. */
export const greenPress = "press bg-[#15803d] text-white [--ledge:#0f5c2b] hover:brightness-110";
/** Chunky white button for use on the green hero. */
export const heroWhite =
  "press flex h-12 max-w-full items-center gap-2 rounded-2xl bg-white px-5 font-brand text-[15.5px] font-extrabold text-[#12722f] [--ledge:rgb(0_0_0/0.22)] hover:brightness-95";
/** Translucent secondary button for use on the green hero. */
export const heroGlass =
  "press flex h-12 items-center gap-2 rounded-2xl bg-white/15 px-5 font-brand text-[15.5px] font-extrabold text-white border-2 border-white/30 [--ledge:rgb(0_0_0/0.18)] hover:bg-white/25";

/** Full-bleed green hero shared by the Plan pages. */
export function PlanHero({ kicker, children, aside, className }: { kicker?: ReactNode; children: ReactNode; aside?: ReactNode; className?: string }) {
  return (
    <header className={cn("relative overflow-hidden text-white", planGreen, className)}>
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-[420px] rounded-full border-[56px] border-white/[0.08]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-36 right-48 size-72 rounded-full border-[40px] border-white/[0.06]" />
      <div aria-hidden className="pointer-events-none absolute -left-20 bottom-10 size-40 rounded-full border-[24px] border-white/[0.05]" />
      <div className={cn("relative mx-auto grid max-w-6xl gap-8 px-4 pb-10 pt-8 sm:px-6 lg:px-8 lg:pt-10", aside && "lg:grid-cols-[1fr_380px] lg:items-center")}>
        <div className="min-w-0">
          {kicker ? <div className="rise mb-4 flex flex-wrap items-center gap-2">{kicker}</div> : null}
          {children}
        </div>
        {aside ? <div className="rise min-w-0" style={{ ["--i" as string]: 3 }}>{aside}</div> : null}
      </div>
    </header>
  );
}

/** Pill for the hero kicker row. */
export function HeroPill({ children }: { children: ReactNode }) {
  return <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-white/20 px-3 font-brand text-[12.5px] font-extrabold text-white">{children}</span>;
}

export const KIND: Record<TaskKind, { label: string; icon: typeof Timer; cls: string }> = {
  test: { label: "Test prep", icon: CalendarClock, cls: "bg-sprint-soft text-sprint-ink" },
  class: { label: "In class", icon: GraduationCap, cls: "bg-accent-soft text-accent-ink" },
  next: { label: "Next up", icon: BookOpenCheck, cls: "bg-positive-soft text-positive" },
  review: { label: "Review", icon: Repeat, cls: "bg-bg-subtle text-ink-2" },
};

export function KindBadge({ kind, className }: { kind: TaskKind; className?: string }) {
  const k = KIND[kind];
  return (
    <span className={cn("inline-flex h-7 items-center gap-1.5 rounded-full px-3 font-brand text-[12.5px] font-extrabold", k.cls, className)}>
      <k.icon className="size-3.5" strokeWidth={2.5} /> {k.label}
    </span>
  );
}

export const minutesLabel = (m: number) => (m < 60 ? `${m} min` : `${Math.floor(m / 60)} hr${m % 60 ? ` ${m % 60} min` : ""}`);

/**
 * Tonight's checklist: a vertical path of chunky tiles, each hanging off a big round check.
 * Without `interactive` (the sample plan), the node shows the course icon instead.
 */
export function TaskPath({ tasks, done, interactive }: { tasks: PlanTask[]; done: Record<string, string>; interactive: boolean }) {
  return (
    <ol className="relative space-y-4">
      <span aria-hidden className="absolute bottom-10 left-[23px] top-10 w-1.5 rounded-full bg-line sm:left-[27px]" />
      {tasks.map((t, i) => {
        const isDone = Boolean(done[t.id]);
        return (
          <li key={t.id} className="rise relative flex gap-3 sm:gap-4" style={{ ["--i" as string]: i }}>
            <div className="relative z-10 flex w-12 shrink-0 justify-center pt-5 sm:w-14">
              {interactive ? <TaskCheck id={t.id} done={isDone} size="lg" /> : <CourseIcon id={t.course.id} size={44} />}
            </div>
            <div className={cn("min-w-0 flex-1 rounded-3xl bg-surface p-4 ring-2 ring-line transition-opacity sm:p-5", isDone && "opacity-60")}>
              <div className="flex flex-wrap items-center gap-2">
                <KindBadge kind={t.kind} />
                <span className="tabular inline-flex h-7 items-center gap-1.5 rounded-full bg-bg-subtle px-3 font-brand text-[12.5px] font-extrabold text-ink-2">
                  <Timer className="size-3.5" /> {t.minutes} min
                </span>
              </div>
              <div className="mt-3 flex items-start gap-3">
                <CourseIcon id={t.course.id} size={40} className="hidden sm:flex" />
                <div className="min-w-0">
                  <Link
                    href={`/courses/${t.course.slug}/${t.topic.slug}`}
                    className={cn("headline block text-[20px] text-ink decoration-2 underline-offset-4 hover:underline sm:text-[22px]", isDone && "line-through")}
                  >
                    {t.topic.title}
                  </Link>
                  <p className="mt-0.5 text-[13.5px] text-muted">
                    <span className="font-semibold text-ink-2">{t.course.shortTitle}</span> · {t.reason}
                  </p>
                </div>
              </div>
              {t.videos.length ? (
                <div className="mt-3 grid gap-1 rounded-2xl bg-bg-subtle/70 p-1.5 sm:grid-cols-2">
                  {t.videos.map((v) => (
                    <LessonMini key={v.id} v={v} />
                  ))}
                </div>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** The week ahead as a horizontal strip of day cards. */
export function WeekStrip({ plan, done, interactive, skipFirst = false, flush = false }: { plan: PlanDay[]; done: Record<string, string>; interactive: boolean; skipFirst?: boolean; flush?: boolean }) {
  const days = plan.slice(skipFirst ? 1 : 0);
  return (
    <ol className={cn("scrollbar-none -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 pt-1 sm:-mx-6 sm:px-6", flush ? "lg:mx-0 lg:px-0.5" : "lg:-mx-8 lg:px-8")} aria-label="The week ahead">
      {days.map((d, i) => {
        const date = new Date(`${d.date}T12:00:00`);
        const label = dayLabel(d.date);
        const finished = d.tasks.length > 0 && d.tasks.every((t) => done[t.id]);
        return (
          <li key={d.date} className="rise flex w-[272px] shrink-0 snap-start flex-col rounded-3xl bg-surface ring-2 ring-line sm:w-[300px]" style={{ ["--i" as string]: i }}>
            <div className="flex items-center gap-3 border-b-2 border-line p-4">
              <span
                className={cn(
                  "press-sm flex size-14 shrink-0 flex-col items-center justify-center rounded-2xl",
                  d.rest ? "bg-bg-subtle text-muted [--ledge:var(--line-strong)]" : "bg-[#15803d] text-white [--ledge:#0f5c2b]",
                )}
              >
                <span className="font-brand text-[11px] font-extrabold uppercase leading-none tracking-wide opacity-85">{date.toLocaleDateString("en-US", { weekday: "short" })}</span>
                <span className="tabular font-brand text-[22px] font-black leading-none">{date.getDate()}</span>
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-brand text-[16.5px] font-extrabold text-ink">{/^[A-Z][a-z]+,/.test(label) ? label.split(",")[0] : label}</h3>
                <p className="tabular text-[13px] font-semibold text-muted">
                  {d.rest ? "Rest day" : d.tasks.length ? `${d.tasks.length} ${d.tasks.length === 1 ? "task" : "tasks"} · ${minutesLabel(d.minutes)}` : "Nothing planned"}
                </p>
              </div>
              {finished ? <span className="rounded-full bg-positive-soft px-2.5 py-1 font-brand text-[12px] font-extrabold text-positive">Done</span> : null}
            </div>
            <div className="flex flex-1 flex-col gap-3 p-3">
              {d.events.map((e) => (
                <p key={e.uid} className="flex items-start gap-2 rounded-2xl bg-sprint-soft px-3 py-2 text-[13px] font-semibold leading-snug text-sprint-ink">
                  <CalendarClock className="mt-0.5 size-4 shrink-0" /> <span className="min-w-0">{e.title}</span>
                </p>
              ))}
              {d.tasks.map((t) => {
                const isDone = Boolean(done[t.id]);
                return (
                  <div key={t.id} className={cn("rounded-2xl bg-bg-subtle/70 p-3 transition-opacity", isDone && "opacity-60")}>
                    <div className="flex items-start gap-3">
                      {interactive ? <TaskCheck id={t.id} done={isDone} /> : <CourseIcon id={t.course.id} size={32} />}
                      <div className="min-w-0 flex-1">
                        <Link href={`/courses/${t.course.slug}/${t.topic.slug}`} className={cn("block font-brand text-[15px] font-extrabold leading-snug text-ink hover:underline", isDone && "line-through")}>
                          {t.topic.title}
                        </Link>
                        <p className="mt-0.5 text-[12.5px] text-muted">
                          {t.course.shortTitle} · {KIND[t.kind].label} · {t.minutes} min
                        </p>
                      </div>
                    </div>
                    {t.videos.length ? (
                      <ul className="mt-2 space-y-1">
                        {t.videos.map((v) => (
                          <li key={v.id}>
                            <a
                              href={`/go/${v.id}`}
                              target="_blank"
                              rel="noopener"
                              aria-label={`${v.title} (opens on YouTube)`}
                              className="flex items-center gap-2 rounded-xl px-1.5 py-1 text-[12.5px] font-semibold text-ink-2 transition-colors hover:bg-surface hover:text-ink"
                            >
                              <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-surface text-positive ring-1 ring-line">
                                <Play className="size-3 fill-current" />
                              </span>
                              <span className="truncate">{v.title}</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                );
              })}
              {d.rest || !d.tasks.length ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl bg-bg-subtle/60 px-4 py-6 text-center">
                  <Moon className="size-6 text-faint" />
                  <p className="text-[13px] font-semibold text-muted">{d.rest ? "Take the night off." : "Nothing on the list."}</p>
                </div>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
