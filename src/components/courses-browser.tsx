"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CourseIcon, courseColors } from "./course-icon";
import { cn } from "./ui";

export type CourseTile = {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  category: string;
  hue: number;
  units: number;
  videos: number;
  studying: boolean;
  progress: number | null;
};

/** The course catalog: a Learn-blue hero with search and categories, then every course as a color tile. */
export function CoursesBrowser({ courses, categories, signedIn }: { courses: CourseTile[]; categories: string[]; signedIn: boolean }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return courses.filter((c) => (cat === "All" || c.category === cat) && (!needle || `${c.title} ${c.shortTitle}`.toLowerCase().includes(needle)));
  }, [courses, q, cat]);
  const mine = courses.filter((c) => c.studying);
  const groups = categories.map((g) => ({ g, items: filtered.filter((c) => c.category === g) })).filter((x) => x.items.length);

  return (
    <div>
      <header className="relative overflow-hidden bg-[linear-gradient(135deg,#3b82f6,#1d4ed8)] text-white">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-[420px] rounded-full border-[56px] border-white/[0.08]" />
        <div aria-hidden className="pointer-events-none absolute -bottom-40 left-1/3 size-80 rounded-full border-[40px] border-white/[0.06]" />
        <div className="relative mx-auto max-w-6xl px-4 pb-8 pt-9 sm:px-6 lg:px-8 lg:pt-12">
          <h1 className="rise display text-[40px] sm:text-6xl">Courses</h1>
          <p className="rise mt-3 max-w-2xl text-[17px] leading-relaxed text-white/90" style={{ ["--i" as string]: 1 }}>
            High school and honors classes, every AP course, and the SAT, organized the way they&apos;re taught: units, then the exact topics you&apos;ll be tested on.
          </p>
          <label className="rise mt-6 flex h-14 w-full max-w-xl items-center gap-3 rounded-2xl bg-white px-4 text-ink shadow-[0_4px_0_0_rgb(0_0_0/0.18)]" style={{ ["--i" as string]: 2 }}>
            <Search className="size-5 shrink-0 text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Find a course"
              className="h-full min-w-0 flex-1 bg-transparent text-[16px] text-[#0f1729] outline-none placeholder:text-[#5b6475] focus-visible:outline-none"
              aria-label="Find a course"
              autoComplete="off"
            />
          </label>
          <div className="scrollbar-none -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0" role="group" aria-label="Category">
            {["All", ...categories].map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                aria-pressed={cat === c}
                className={cn(
                  "h-10 shrink-0 rounded-2xl px-4 font-brand text-[14px] font-extrabold transition-[background-color,color,transform] duration-150 active:scale-[0.96]",
                  cat === c ? "bg-white text-[#1d4ed8]" : "bg-white/15 text-white ring-2 ring-inset ring-white/25 hover:bg-white/25",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 pb-4 pt-8 sm:px-6 lg:px-8">
        {mine.length ? (
          <section className="mb-12">
            <div className="mb-4 flex items-baseline justify-between gap-3">
              <h2 className="headline text-[24px] text-ink">
                My courses <span className="font-brand text-[15px] font-bold text-muted">{mine.length}</span>
              </h2>
              <Link href="/settings" className="font-brand text-[14px] font-extrabold text-accent-ink hover:underline">
                Edit my courses
              </Link>
            </div>
            <Grid items={mine} big />
          </section>
        ) : signedIn ? (
          <Link href="/settings" className="press mb-12 flex items-center justify-between gap-4 rounded-3xl bg-accent-soft p-5 ring-2 ring-accent/20 [--ledge:color-mix(in_oklab,var(--accent)_25%,transparent)] sm:p-6">
            <span>
              <span className="block font-brand text-lg font-extrabold text-ink">My courses</span>
              <span className="block text-sm text-ink-2">Pick the courses you&apos;re taking and they&apos;ll live right here.</span>
            </span>
            <span className="shrink-0 font-brand text-sm font-extrabold text-accent-ink">Choose courses →</span>
          </Link>
        ) : null}

        <h2 className="sr-only">All courses</h2>
        {groups.map(({ g, items }) => (
          <section key={g} className="mb-10">
            <h3 className="mb-4 flex items-baseline gap-2 font-brand text-[20px] font-extrabold text-ink">
              {g} <span className="text-[14px] font-bold text-muted">{items.length}</span>
            </h3>
            <Grid items={items} />
          </section>
        ))}
        {!filtered.length ? <p className="py-20 text-center text-muted">No courses match “{q}”.</p> : null}
      </div>
    </div>
  );
}

function Grid({ items, big = false }: { items: CourseTile[]; big?: boolean }) {
  return (
    <div className={cn("grid gap-4", big ? "sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4")}>
      {items.map((c) => {
        const { from, to } = courseColors(c.id);
        return (
          <Link
            key={c.id}
            href={`/courses/${c.slug}`}
            style={{ ["--c" as string]: from, ["--c2" as string]: to }}
            className="press group flex flex-col overflow-hidden rounded-3xl bg-surface ring-2 ring-line [--ledge:var(--line)]"
          >
            <span className={cn("relative flex items-end overflow-hidden bg-[linear-gradient(135deg,var(--c),var(--c2))] px-4", big ? "h-28 pb-4" : "h-20 pb-3 sm:h-24")}>
              <span aria-hidden className="pointer-events-none absolute -right-8 -top-10 size-32 rounded-full border-[18px] border-white/15 transition-transform duration-500 ease-out group-hover:scale-110" />
              <span className="relative rounded-2xl bg-white/20 p-1 ring-2 ring-white/30">
                <CourseIcon id={c.id} size={big ? 48 : 40} />
              </span>
            </span>
            <span className="flex flex-1 flex-col p-4">
              <span className={cn("line-clamp-2 font-brand font-extrabold leading-snug text-ink", big ? "text-[18px]" : "text-[15px] sm:text-[16px]")}>{c.title}</span>
              <span className="tabular mt-1 text-[12.5px] font-semibold text-muted">
                {c.units} units · {c.videos.toLocaleString()} videos
              </span>
              {c.progress !== null ? (
                <span className="mt-auto pt-3">
                  <span className="block h-2.5 overflow-hidden rounded-full bg-bg-subtle">
                    <span className="block h-full rounded-full bg-[var(--c)]" style={{ width: `${Math.max(3, Math.round(c.progress * 100))}%` }} />
                  </span>
                  <span className="tabular mt-1 block text-[12px] font-bold text-muted">{Math.round(c.progress * 100)}% understood</span>
                </span>
              ) : null}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
