"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CourseIcon } from "./course-icon";
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
      {mine.length ? (
        <section className="mb-10 rounded-3xl bg-bg-subtle p-5 sm:p-6">
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h2 className="text-xl font-bold tracking-tight text-ink">
              My courses <span className="text-sm font-normal text-muted">{mine.length}</span>
            </h2>
            <Link href="/settings" className="text-sm font-medium text-accent hover:underline">
              Edit my courses
            </Link>
          </div>
          <Grid items={mine} />
        </section>
      ) : signedIn ? (
        <Link href="/settings" className="mb-10 flex items-center justify-between gap-4 rounded-3xl bg-accent-soft p-5 hover:opacity-90 sm:p-6">
          <span>
            <span className="block text-lg font-bold text-ink">My courses</span>
            <span className="block text-sm text-ink-2">Pick the courses you&apos;re taking and they&apos;ll live right here.</span>
          </span>
          <span className="shrink-0 text-sm font-semibold text-accent">Choose courses →</span>
        </Link>
      ) : null}
      <h2 className="mb-4 text-xl font-bold tracking-tight text-ink">All courses</h2>
      <div className="flex flex-col gap-4">
        <label className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Find a course"
            className="h-11 w-full rounded-full border border-line-strong bg-bg pl-11 pr-4 text-[15px] outline-none focus:border-accent"
            aria-label="Find a course"
          />
        </label>
        <div className="scrollbar-none flex gap-2 overflow-x-auto">
          {["All", ...categories].map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={cn("h-9 shrink-0 rounded-lg px-3 text-sm font-medium", cat === c ? "bg-ink text-bg" : "bg-bg-subtle text-ink hover:bg-line")}
            >
              {c}
            </button>
          ))}
        </div>
      </div>


      {groups.map(({ g, items }) => (
        <section key={g} className="mt-10">
          <h2 className="mb-4 flex items-baseline gap-2 text-lg font-bold tracking-tight text-ink">
            {g} <span className="text-sm font-normal text-muted">{items.length}</span>
          </h2>
          <Grid items={items} />
        </section>
      ))}
      {!filtered.length ? <p className="py-20 text-center text-muted">No courses match “{q}”.</p> : null}
    </div>
  );
}

function Grid({ items }: { items: CourseTile[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((c) => (
        <Link key={c.id} href={`/courses/${c.slug}`} className="group flex items-center gap-4 rounded-2xl p-4 ring-1 ring-line transition-colors hover:bg-bg-subtle/70">
          <CourseIcon id={c.id} size={52} />
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-[15px] font-semibold leading-snug text-ink group-hover:underline">{c.title}</p>
            <p className="tabular mt-0.5 text-[12.5px] text-muted">
              {c.units} units · {c.videos.toLocaleString()} videos
            </p>
            {c.progress !== null ? (
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-line">
                <div className="h-full rounded-full bg-accent" style={{ width: `${Math.round(c.progress * 100)}%` }} />
              </div>
            ) : null}
          </div>
        </Link>
      ))}
    </div>
  );
}
