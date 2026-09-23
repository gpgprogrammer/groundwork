"use client";

import { ArrowDownUp, Check, ChevronLeft, ChevronRight, Timer } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { FeedVideo } from "@/lib/feed";
import { LENGTHS, SORTS, type LengthKey, type SortKey } from "@/lib/ranking";
import { cn } from "./ui";
import { ShortCard, VideoCard, VideoRow } from "./video-card";

function useQueryUpdater() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  return (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v === null) next.delete(k);
      else next.set(k, v);
    }
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };
}

/** YouTube's horizontally scrolling chip bar. */
export function Chips({ chips, active, param = "chip" }: { chips: { key: string; label: string }[]; active: string; param?: string }) {
  const update = useQueryUpdater();
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });
  const measure = () => {
    const el = ref.current;
    if (!el) return;
    setEdges({ left: el.scrollLeft > 4, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
  };
  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  const scroll = (dir: number) => ref.current?.scrollBy({ left: dir * 320, behavior: "smooth" });

  return (
    <div className="relative min-w-0 flex-1">
      {edges.left ? (
        <div className="absolute inset-y-0 left-0 z-10 flex items-center bg-gradient-to-r from-bg from-60% to-transparent pr-8">
          <button onClick={() => scroll(-1)} className="flex size-8 items-center justify-center rounded-full hover:bg-bg-subtle" aria-label="Scroll left">
            <ChevronLeft className="size-5" />
          </button>
        </div>
      ) : null}
      <div ref={ref} onScroll={measure} className="scrollbar-none flex gap-3 overflow-x-auto" role="tablist">
        {chips.map((c) => (
          <button
            key={c.key}
            role="tab"
            aria-selected={active === c.key}
            onClick={() => update({ [param]: c.key === "all" ? null : c.key })}
            className={cn(
              "h-8 shrink-0 rounded-lg px-3 text-sm font-medium transition-colors",
              active === c.key ? "bg-ink text-bg" : "bg-bg-subtle text-ink hover:bg-line",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>
      {edges.right ? (
        <div className="absolute inset-y-0 right-0 z-10 flex items-center bg-gradient-to-l from-bg from-60% to-transparent pl-8">
          <button onClick={() => scroll(1)} className="flex size-8 items-center justify-center rounded-full hover:bg-bg-subtle" aria-label="Scroll right">
            <ChevronRight className="size-5" />
          </button>
        </div>
      ) : null}
    </div>
  );
}

function Dropdown<K extends string>({
  label,
  icon,
  value,
  options,
  onChange,
  align = "right",
}: {
  label: string;
  icon: ReactNode;
  value: K;
  options: Record<K, string>;
  onChange: (k: K) => void;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);
  const isDefault = value === (Object.keys(options)[0] as K);
  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={cn(
          "flex h-8 items-center gap-1.5 rounded-lg px-3 text-sm font-medium",
          isDefault ? "bg-bg-subtle text-ink hover:bg-line" : "bg-accent-soft text-accent",
        )}
      >
        {icon}
        <span className="hidden sm:inline">{isDefault ? label : options[value]}</span>
      </button>
      {open ? (
        <div className={cn("fade absolute top-10 z-30 w-52 rounded-xl bg-surface py-2 shadow-lift ring-1 ring-line", align === "right" ? "right-0" : "left-0")}>
          <p className="px-4 pb-1 pt-1 text-xs font-medium text-muted">{label}</p>
          {(Object.keys(options) as K[]).map((k) => (
            <button
              key={k}
              onClick={() => {
                onChange(k);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-ink hover:bg-bg-subtle"
            >
              {options[k]}
              {k === value ? <Check className="size-4 text-accent" /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** Sort + length filters. `defaultSort` is what "no ?sort" means on this page. */
export function SortControls({ sort, length, defaultSort = "best" }: { sort: SortKey; length: LengthKey; defaultSort?: SortKey }) {
  const update = useQueryUpdater();
  const sorts = { [defaultSort]: SORTS[defaultSort], ...SORTS } as Record<SortKey, string>;
  return (
    <div className="flex shrink-0 items-center gap-2">
      <Dropdown
        label="Sort by"
        icon={<ArrowDownUp className="size-4" />}
        value={sort}
        options={sorts}
        onChange={(k) => update({ sort: k === defaultSort ? null : k })}
      />
      <Dropdown
        label="Length"
        icon={<Timer className="size-4" />}
        value={length}
        options={LENGTHS}
        onChange={(k) => update({ length: k === "any" ? null : k })}
      />
    </div>
  );
}

type GridProps = {
  initial: FeedVideo[];
  nextOffset: number | null;
  /** Query string for /api/feed (chip, sort, length, course, topic, channel). */
  query: string;
  layout?: "grid" | "list" | "shorts";
  empty?: ReactNode;
  ranked?: boolean;
};

/** Infinite-scrolling video grid backed by /api/feed. */
export function FeedGrid({ initial, nextOffset, query, layout = "grid", empty, ranked }: GridProps) {
  const [items, setItems] = useState(initial);
  const [offset, setOffset] = useState(nextOffset);
  const [loading, setLoading] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || offset === null) return;
    const io = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting || loading) return;
        setLoading(true);
        try {
          const res = await fetch(`/api/feed?${query}&offset=${offset}&limit=24`);
          const page = (await res.json()) as { items: FeedVideo[]; nextOffset: number | null };
          setItems((prev) => {
            const seen = new Set(prev.map((p) => p.id));
            return [...prev, ...page.items.filter((p) => !seen.has(p.id))];
          });
          setOffset(page.nextOffset);
        } finally {
          setLoading(false);
        }
      },
      { rootMargin: "800px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [offset, query, loading]);

  if (!items.length) return <>{empty}</>;

  return (
    <>
      {layout === "list" ? (
        <div className="space-y-5">
          {items.map((v, i) => (
            <VideoRow key={v.id} v={v} rank={ranked ? i + 1 : undefined} />
          ))}
        </div>
      ) : layout === "shorts" ? (
        <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6">
          {items.map((v) => (
            <ShortCard key={v.id} v={v} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {items.map((v) => (
            <VideoCard key={v.id} v={v} />
          ))}
        </div>
      )}
      <div ref={sentinel} className="flex h-20 items-center justify-center" aria-hidden={offset === null}>
        {offset !== null ? <span className="size-6 animate-spin rounded-full border-2 border-line-strong border-t-ink" /> : null}
      </div>
    </>
  );
}

/** Horizontal shelf of videos with a heading, like YouTube's rows. */
export function Shelf({ title, icon, action, children }: { title: ReactNode; icon?: ReactNode; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="border-b border-line pb-8 pt-2">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-ink">
          {icon}
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
