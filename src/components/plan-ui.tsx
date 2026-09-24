import { BookOpenCheck, CalendarClock, GraduationCap, Repeat, Timer } from "lucide-react";
import Link from "next/link";
import type { PlanDay, PlanTask, TaskKind } from "@/lib/plan";
import { dayLabel } from "@/lib/plan";
import { CourseIcon } from "./course-icon";
import { TaskCheck } from "./plan-client";
import { cn, formatDuration } from "./ui";

const KIND: Record<TaskKind, { label: string; icon: typeof Timer; cls: string }> = {
  test: { label: "Test prep", icon: CalendarClock, cls: "bg-[#fff1e8] text-[#c2410c] dark:bg-[#3a1d0c] dark:text-[#ffb489]" },
  class: { label: "In class", icon: GraduationCap, cls: "bg-accent-soft text-accent" },
  next: { label: "Next up", icon: BookOpenCheck, cls: "bg-positive-soft text-positive" },
  review: { label: "Review", icon: Repeat, cls: "bg-bg-subtle text-ink-2" },
};

export function TaskRow({ task, done, interactive }: { task: PlanTask; done: boolean; interactive: boolean }) {
  const k = KIND[task.kind];
  return (
    <li className={cn("flex gap-4 rounded-2xl p-4 ring-1 ring-line transition-opacity", done && "opacity-55")}>
      {interactive ? <TaskCheck id={task.id} done={done} /> : <CourseIcon id={task.course.id} size={28} />}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold", k.cls)}>
            <k.icon className="size-3" /> {k.label}
          </span>
          <span className="text-[12.5px] text-muted">
            {task.course.shortTitle} · {task.minutes} min
          </span>
        </div>
        <Link href={`/courses/${task.course.slug}/${task.topic.slug}`} className={cn("mt-1 block text-[16px] font-semibold text-ink hover:underline", done && "line-through")}>
          {task.topic.title}
        </Link>
        <p className="text-[13px] text-muted">{task.reason}</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {task.videos.map((v) => (
            <a key={v.id} href={`/go/${v.id}`} target="_blank" rel="noopener" className="group flex gap-3 rounded-xl p-1.5 hover:bg-bg-subtle">
              <span className="relative w-28 shrink-0 overflow-hidden rounded-lg bg-bg-subtle">
                <img src={v.thumbnail} alt="" className="aspect-video w-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
                <span className="tabular absolute bottom-1 right-1 rounded bg-black/80 px-1 text-[10.5px] font-medium text-white">{formatDuration(v.durationSec)}</span>
              </span>
              <span className="min-w-0">
                <span className="line-clamp-2 text-[13px] font-medium leading-snug text-ink group-hover:underline">{v.title}</span>
                <span className="mt-0.5 block truncate text-[12px] text-muted">{v.channelTitle}</span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </li>
  );
}

export function PlanWeek({ plan, done, interactive, skipFirst = false }: { plan: PlanDay[]; done: Record<string, string>; interactive: boolean; skipFirst?: boolean }) {
  return (
    <div className="space-y-8">
      {plan.slice(skipFirst ? 1 : 0).map((d) => (
        <section key={d.date}>
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-[17px] font-bold tracking-tight text-ink">{dayLabel(d.date)}</h3>
            <p className="tabular text-[13px] text-muted">{d.rest ? "Rest day" : d.tasks.length ? `${d.minutes} min` : "Nothing planned"}</p>
          </div>
          {d.events.length ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {d.events.map((e) => (
                <span key={e.uid} className="inline-flex items-center gap-1.5 rounded-full bg-[#fff1e8] px-2.5 py-1 text-[12px] font-medium text-[#c2410c] dark:bg-[#3a1d0c] dark:text-[#ffb489]">
                  <CalendarClock className="size-3.5" /> {e.title}
                </span>
              ))}
            </div>
          ) : null}
          {d.tasks.length ? (
            <ul className="mt-3 space-y-3">
              {d.tasks.map((t) => (
                <TaskRow key={t.id} task={t} done={Boolean(done[t.id])} interactive={interactive} />
              ))}
            </ul>
          ) : null}
        </section>
      ))}
    </div>
  );
}
