"use client";

import { ArrowRight, CalendarClock, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { previewCalendarLink, type CalendarPreview } from "@/app/actions/try";
import { LessonLink } from "./lesson-player";
import { cn, formatDuration } from "./ui";

const day = (iso: string) => new Date(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

/**
 * Paste a calendar link and see what Merit would do with it, before making an account. Nothing is saved;
 * signing up keeps it.
 */
export function CalendarTry({ className }: { className?: string }) {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<CalendarPreview | null>(null);
  const [pending, start] = useTransition();
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    start(async () => setResult(await previewCalendarLink(url.trim())));
  };
  return (
    <section className={cn("rounded-3xl bg-surface p-5 ring-2 ring-line sm:p-6", className)} aria-labelledby="try-cal-h">
      <h2 id="try-cal-h" className="flex items-center gap-2 font-brand text-[18px] font-extrabold text-ink">
        <CalendarClock className="size-5 text-positive" /> Try it with your calendar
      </h2>
      <p className="mt-1 text-[14px] text-muted">Paste your class calendar&apos;s feed link to see what Merit would line up. Nothing is saved until you make an account.</p>
      <form onSubmit={submit} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <label className="min-w-0 flex-1">
          <span className="sr-only">Calendar link</span>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://… or webcal://…"
            inputMode="url"
            autoComplete="off"
            className="h-12 w-full rounded-2xl border-2 border-line-strong bg-surface px-4 text-[15px] text-ink outline-none placeholder:text-faint focus:border-positive"
          />
        </label>
        <button type="submit" disabled={pending || !url.trim()} className="press inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-positive px-5 font-brand text-[15px] font-extrabold text-white [--ledge:var(--positive-press)] disabled:opacity-60">
          {pending ? <Loader2 className="size-4 animate-spin" /> : null} Preview my week
        </button>
      </form>
      {result && !result.ok ? (
        <p className="fade mt-3 rounded-2xl bg-warn-soft px-4 py-3 text-[14px] text-ink" role="alert">
          {result.error}
        </p>
      ) : null}
      {result?.ok ? (
        <div className="fade mt-5">
          <p className="font-brand text-[13px] font-extrabold text-muted">
            Found {result.total} upcoming {result.total === 1 ? "item" : "items"}. Here&apos;s what Merit would prep first:
          </p>
          <ul className="mt-2 space-y-2">
            {result.items.map((it, i) => (
              <li key={`${it.start}-${i}`} className="rounded-2xl bg-bg-subtle p-3">
                <p className="flex flex-wrap items-center gap-x-2 text-[14px] font-bold text-ink">
                  <span className="tabular text-muted">{day(it.start)}</span>
                  {it.title}
                  {it.kind === "test" ? <span className="rounded-md bg-danger-soft px-1.5 py-0.5 text-[11px] font-black uppercase text-danger">Test</span> : null}
                </p>
                {it.topic && it.lesson ? (
                  <LessonLink v={{ id: it.lesson.id, title: it.lesson.title, channelTitle: it.lesson.channelTitle, topicTitle: it.topic.title, topicHref: it.topic.href }} className="mt-2 flex items-center gap-3 rounded-xl p-1 hover:bg-surface">
                    <span className="relative aspect-video w-20 shrink-0 overflow-hidden rounded-lg bg-surface">
                      <img src={it.lesson.thumbnail} alt="" loading="lazy" referrerPolicy="no-referrer" className="absolute inset-0 size-full object-cover" />
                      <span className="tabular absolute bottom-0.5 right-0.5 rounded bg-black/75 px-1 text-[10px] font-bold text-white">{formatDuration(it.lesson.durationSec)}</span>
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[12.5px] font-semibold text-positive">
                        {it.course} · {it.topic.title}
                      </span>
                      <span className="line-clamp-1 text-[13px] font-bold text-ink">{it.lesson.title}</span>
                    </span>
                  </LessonLink>
                ) : (
                  <p className="mt-1 text-[12.5px] text-muted">Merit will ask which topic this covers, then line up lessons.</p>
                )}
              </li>
            ))}
          </ul>
          <Link href="/signup?as=student&next=%2Fschedule" className="press mt-4 inline-flex h-12 items-center gap-2 rounded-2xl bg-positive px-6 font-brand text-[15.5px] font-extrabold text-white [--ledge:var(--positive-press)]">
            Save my calendar with a free account <ArrowRight className="size-4" />
          </Link>
        </div>
      ) : null}
    </section>
  );
}
