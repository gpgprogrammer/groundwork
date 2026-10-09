"use client";

import { ArrowRight, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { CourseIcon } from "../course-icon";
import { cn } from "../ui";

export type FinderCourse = { id: string; slug: string; title: string; shortTitle: string; category: string };

/**
 * "Which course are you taking?" The first thing a visitor can do on Merit: type a course and land on it.
 * A real combobox: arrow keys move, Enter opens, Escape closes.
 */
export function CourseFinder({ courses, popular }: { courses: FinderCourse[]; popular: string[] }) {
  const router = useRouter();
  const listId = useId();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase().replace(/^ap\s+/, "");
    if (!needle) return popular.map((id) => courses.find((c) => c.id === id)).filter((c): c is FinderCourse => Boolean(c));
    const words = needle.split(/\s+/);
    return courses
      .map((c) => {
        const hay = `${c.title} ${c.shortTitle} ${c.category}`.toLowerCase();
        if (!words.every((w) => hay.includes(w))) return null;
        const score = c.title.toLowerCase().replace(/^ap\s+/, "").startsWith(needle) || c.shortTitle.toLowerCase().includes(needle) ? 0 : 1;
        return { c, score };
      })
      .filter((x): x is { c: FinderCourse; score: number } => Boolean(x))
      .sort((a, b) => a.score - b.score)
      .slice(0, 7)
      .map((x) => x.c);
  }, [q, courses, popular]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => boxRef.current && !boxRef.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const go = (c: FinderCourse | undefined) => {
    if (!c) return;
    setOpen(false);
    router.push(`/courses/${c.slug}`);
  };

  return (
    <div ref={boxRef} className="relative w-full max-w-xl">
      <div className="group flex h-14 items-center gap-3 rounded-2xl bg-surface pl-4 pr-2 shadow-soft ring-2 ring-line-strong transition-[box-shadow] duration-200 focus-within:ring-2 focus-within:ring-accent">
        <Search className="size-5 shrink-0 text-muted" />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
            setActive(0);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
              setActive((a) => Math.min(results.length - 1, a + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(0, a - 1));
            } else if (e.key === "Enter") {
              e.preventDefault();
              go(results[active]);
            } else if (e.key === "Escape") setOpen(false);
          }}
          aria-label="Find your course"
          placeholder="Which course are you taking?"
          autoComplete="off"
          spellCheck={false}
          role="combobox"
          aria-expanded={open && results.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && results[active] ? `${listId}-${results[active].id}` : undefined}
          className="h-full min-w-0 flex-1 bg-transparent text-[16px] text-ink outline-none placeholder:text-muted focus-visible:outline-none"
        />
        <button
          type="button"
          onClick={() => (results.length && q.trim() ? go(results[active]) : setOpen(true))}
          className="flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-accent px-4 text-[14px] font-semibold text-white transition-[background-color,transform] duration-150 hover:bg-accent-hover active:scale-[0.97]"
        >
          Go <ArrowRight className="size-4" aria-hidden />
        </button>
      </div>
      {open && results.length ? (
        <ul id={listId} role="listbox" aria-label="Courses" className="pop absolute inset-x-0 top-16 z-30 origin-top rounded-2xl bg-surface p-1.5 shadow-lift ring-2 ring-line">
          {!q.trim() ? <li className="px-3 pb-1 pt-2 text-[12px] font-semibold text-muted">Popular courses</li> : null}
          {results.map((c, i) => (
            <li key={c.id} id={`${listId}-${c.id}`} role="option" aria-selected={i === active}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(c)}
                className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors", i === active && "bg-bg-subtle")}
              >
                <CourseIcon id={c.id} size={30} />
                <span className="min-w-0 flex-1 truncate text-[15px] font-medium text-ink">{c.title}</span>
                <span className="hidden shrink-0 text-[12px] text-muted sm:block">{c.category}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : open && q.trim() ? (
        <p className="pop absolute inset-x-0 top-16 z-30 origin-top rounded-2xl bg-surface px-4 py-3 text-sm text-muted shadow-lift ring-2 ring-line">
          No course matches “{q.trim()}”. Merit covers high school classes, every AP course, and the SAT.
        </p>
      ) : null}
    </div>
  );
}
