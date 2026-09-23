"use client";

import { ArrowRight, BookOpen, CornerDownLeft, GraduationCap, PlayCircle, Search, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { SearchResult } from "@/app/api/search/route";
import { cn, Kbd } from "./ui";

type Ctx = { open: () => void };
const PaletteContext = createContext<Ctx>({ open: () => {} });
export const usePalette = () => useContext(PaletteContext);

export type Suggestion = { href: string; title: string; subtitle: string };

const ICONS = { topic: BookOpen, video: PlayCircle, educator: UserRound, course: GraduationCap } as const;
const LABELS = { course: "Courses", topic: "Topics", video: "Lessons", educator: "Educators" } as const;

export function CommandPaletteProvider({ children, suggestions }: { children: ReactNode; suggestions: Suggestion[] }) {
  const [isOpen, setOpen] = useState(false);
  const open = useCallback(() => setOpen(true), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <PaletteContext.Provider value={{ open }}>
      {children}
      {isOpen ? <Palette onClose={() => setOpen(false)} suggestions={suggestions} /> : null}
    </PaletteContext.Provider>
  );
}

function Palette({ onClose, suggestions }: { onClose: () => void; suggestions: Suggestion[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const query = q.trim();
    if (!query) return;
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=12`, { signal: ctrl.signal });
        const data = (await res.json()) as { results: SearchResult[] };
        setResults(data.results);
        setActive(0);
      } catch {
        /* aborted */
      } finally {
        setLoading(false);
      }
    }, 110);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  const showingSuggestions = !q.trim();
  const items: (SearchResult | (Suggestion & { kind: "suggestion" }))[] = useMemo(
    () => (showingSuggestions ? suggestions.map((s) => ({ ...s, kind: "suggestion" as const })) : results),
    [showingSuggestions, suggestions, results],
  );

  const go = (href: string) => {
    onClose();
    router.push(href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(items.length, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = items[active];
      if (item) go(item.href);
      else if (q.trim()) go(`/search?q=${encodeURIComponent(q.trim())}`);
    }
  };

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]" role="dialog" aria-modal aria-label="Search">
      <div className="fade absolute inset-0 bg-[#0d0d0f]/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="rise relative w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-surface shadow-lift" onKeyDown={onKeyDown}>
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="size-4 shrink-0 text-muted" />
          <input
            autoFocus
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              if (!e.target.value.trim()) setResults([]);
            }}
            placeholder="Search topics, lessons, educators…"
            className="h-14 w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-faint"
            aria-label="Search"
          />
          {loading ? <span className="size-3.5 shrink-0 animate-spin rounded-full border-2 border-line-strong border-t-muted" /> : <Kbd>esc</Kbd>}
        </div>
        <div ref={listRef} className="max-h-[min(60vh,440px)] overflow-y-auto p-2">
          {showingSuggestions ? <p className="px-3 pb-1.5 pt-2 text-xs font-medium text-muted">Popular right now</p> : null}
          {!showingSuggestions && !loading && results.length === 0 ? (
            <p className="px-3 py-10 text-center text-sm text-muted">No matches for “{q}”. Try a topic like “chain rule”.</p>
          ) : null}
          {items.map((item, i) => {
            const prev = items[i - 1];
            const header = item.kind !== "suggestion" && item.kind !== prev?.kind ? LABELS[item.kind] : null;
            const Icon = item.kind === "suggestion" ? ArrowRight : ICONS[item.kind];
            return (
              <div key={item.href + i}>
                {header ? <p className="px-3 pb-1.5 pt-3 text-xs font-medium text-muted first:pt-2">{header}</p> : null}
                <button
                  data-index={i}
                  onMouseMove={() => setActive(i)}
                  onClick={() => go(item.href)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                    active === i ? "bg-bg-subtle" : "",
                  )}
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-line bg-bg text-muted">
                    {"glyph" in item && item.glyph ? (
                      <span className="max-w-7 truncate font-serif text-[11px] italic text-ink-2">{item.glyph}</span>
                    ) : (
                      <Icon className="size-4" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">{item.title}</span>
                    <span className="block truncate text-xs text-muted">{item.subtitle}</span>
                  </span>
                  {active === i ? <CornerDownLeft className="size-3.5 shrink-0 text-faint" /> : null}
                </button>
              </div>
            );
          })}
          {!showingSuggestions && q.trim() ? (
            <button
              data-index={items.length}
              onMouseMove={() => setActive(items.length)}
              onClick={() => go(`/search?q=${encodeURIComponent(q.trim())}`)}
              className={cn(
                "mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-ink-2",
                active === items.length ? "bg-bg-subtle" : "",
              )}
            >
              <Search className="size-4 text-muted" /> See all results for “{q.trim()}”
            </button>
          ) : null}
        </div>
        <div className="flex items-center gap-4 border-t border-line bg-bg px-4 py-2.5 text-[11px] text-muted">
          <span className="flex items-center gap-1.5">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd> navigate
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>↵</Kbd> open
          </span>
          <span className="ml-auto">
            Tip: press <Kbd>/</Kbd> anywhere
          </span>
        </div>
      </div>
    </div>
  );
}

export function SearchTrigger({ className, wide }: { className?: string; wide?: boolean }) {
  const { open } = usePalette();
  return (
    <button
      onClick={open}
      className={cn(
        "flex h-8 items-center gap-2 rounded-lg border border-line bg-surface pl-2.5 pr-1.5 text-[13px] text-muted transition-colors hover:border-line-strong hover:text-ink-2",
        wide ? "w-full max-w-md" : "w-56",
        className,
      )}
      aria-label="Search (Command K)"
    >
      <Search className="size-3.5" />
      <span className="flex-1 text-left">Search</span>
      <span className="flex gap-0.5">
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </span>
    </button>
  );
}
