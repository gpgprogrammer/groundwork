import { Search as SearchIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Thumbnail } from "@/components/thumbnail";
import { Avatar, Container, cn, formatDuration } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";
import { search, type SearchHit } from "@/lib/search";

export async function generateMetadata({ searchParams }: PageProps<"/search">): Promise<Metadata> {
  const q = (await searchParams).q;
  return { title: typeof q === "string" && q ? `“${q}”` : "Search" };
}

const TABS = [
  { key: "all", label: "All" },
  { key: "topic", label: "Topics" },
  { key: "video", label: "Lessons" },
  { key: "educator", label: "Educators" },
] as const;

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const [sp, catalog] = await Promise.all([searchParams, getCatalog()]);
  const q = typeof sp.q === "string" ? sp.q.slice(0, 120) : "";
  const tab = TABS.find((t) => t.key === sp.type)?.key ?? "all";
  const courseId = typeof sp.course === "string" && catalog.course(sp.course) ? sp.course : undefined;
  const hits = q ? search(catalog, q, { courseId }, 80) : [];
  const shown = tab === "all" ? hits : hits.filter((h) => h.kind === tab);
  const counts = Object.fromEntries(TABS.map((t) => [t.key, t.key === "all" ? hits.length : hits.filter((h) => h.kind === t.key).length]));

  const qs = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { q, type: tab === "all" ? undefined : tab, course: courseId, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    return `?${p.toString()}`;
  };

  return (
    <Container size="lg" className="py-12">
      <form action="/search" className="relative">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" />
        <input
          name="q"
          defaultValue={q}
          autoFocus={!q}
          placeholder="Search a topic, like “related rates” or “Mansa Musa”"
          className="h-14 w-full rounded-2xl border border-line-strong bg-surface pl-12 pr-4 text-[17px] text-ink shadow-soft outline-none transition placeholder:text-faint focus:border-accent focus:ring-4 focus:ring-accent/10"
          aria-label="Search"
        />
        {courseId ? <input type="hidden" name="course" value={courseId} /> : null}
      </form>

      {q ? (
        <>
          <div className="mt-6 flex flex-col gap-3 border-b border-line pb-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="scrollbar-none flex gap-1 overflow-x-auto">
              {TABS.map((t) => (
                <Link
                  key={t.key}
                  href={qs({ type: t.key === "all" ? undefined : t.key })}
                  className={cn(
                    "shrink-0 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors",
                    tab === t.key ? "bg-ink text-bg" : "text-muted hover:bg-bg-subtle hover:text-ink",
                  )}
                >
                  {t.label} <span className="tabular opacity-60">{counts[t.key]}</span>
                </Link>
              ))}
            </div>
            <div className="scrollbar-none flex gap-1 overflow-x-auto text-[13px]">
              <Link href={qs({ course: undefined })} className={cn("shrink-0 rounded-md px-2 py-1", !courseId ? "text-ink" : "text-muted hover:text-ink")}>
                Any course
              </Link>
              {catalog.courses.map((c) => (
                <Link
                  key={c.id}
                  href={qs({ course: c.id })}
                  className={cn("shrink-0 rounded-md px-2 py-1", courseId === c.id ? "font-medium text-ink" : "text-muted hover:text-ink")}
                >
                  {c.shortTitle}
                </Link>
              ))}
            </div>
          </div>

          {shown.length ? (
            <ul className="mt-4 divide-y divide-line">
              {shown.map((h, i) => (
                <li key={i}>
                  <Result hit={h} catalog={catalog} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-20 text-center">
              <p className="text-[15px] font-medium text-ink">Nothing matched “{q}”</p>
              <p className="mt-2 text-sm text-muted">
                Try a broader term, check the spelling, or{" "}
                <Link href="/courses" className="text-ink underline underline-offset-4">
                  browse by course
                </Link>
                .
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="mt-12">
          <p className="eyebrow mb-4">Try searching for</p>
          <div className="flex flex-wrap gap-2">
            {["chain rule", "champa rice", "le chatelier", "semicolons", "hardy weinberg", "vertex form", "mansa musa", "lagrange error"].map((s) => (
              <Link key={s} href={`/search?q=${encodeURIComponent(s)}`} className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm text-ink-2 hover:border-line-strong hover:text-ink">
                {s}
              </Link>
            ))}
          </div>
        </div>
      )}
    </Container>
  );
}

function Result({ hit, catalog }: { hit: SearchHit; catalog: Awaited<ReturnType<typeof getCatalog>> }) {
  switch (hit.kind) {
    case "topic":
      return (
        <Link href={`/courses/${hit.course.slug}/${hit.topic.slug}`} className="group flex gap-5 py-5">
          <div className="w-36 shrink-0">
            <Thumbnail topic={hit.topic} course={hit.course} size="sm" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted">Topic · {hit.course.title}</p>
            <p className="mt-1 text-[17px] font-semibold tracking-tight text-ink group-hover:underline group-hover:underline-offset-4">{hit.topic.title}</p>
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">{hit.topic.summary}</p>
            <p className="tabular mt-2 text-xs text-faint">{hit.lessons} lessons</p>
          </div>
        </Link>
      );
    case "video": {
      const course = catalog.course(hit.topic.courseId)!;
      return (
        <Link href={`/watch/${hit.video.id}`} className="group flex gap-5 py-5">
          <div className="w-36 shrink-0">
            <Thumbnail topic={hit.topic} course={course} size="sm" durationSec={hit.video.durationSec} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted">
              Lesson · {hit.video.style} · {formatDuration(hit.video.durationSec)}
            </p>
            <p className="mt-1 text-[15px] font-medium text-ink group-hover:underline group-hover:underline-offset-4">{hit.video.title}</p>
            <p className="mt-1 text-sm text-muted">
              {hit.educator.name} · {hit.topic.title}
            </p>
          </div>
        </Link>
      );
    }
    case "educator":
      return (
        <Link href={`/educators/${hit.educator.handle}`} className="group flex items-center gap-5 py-5">
          <div className="flex w-36 shrink-0 justify-center">
            <Avatar name={hit.educator.name} hue={hit.educator.hue} size={52} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted">Educator · {hit.educator.subjects.join(", ")}</p>
            <p className="mt-1 text-[15px] font-medium text-ink group-hover:underline group-hover:underline-offset-4">{hit.educator.name}</p>
            <p className="mt-0.5 text-sm text-muted">{hit.educator.headline}</p>
          </div>
        </Link>
      );
    case "course":
      return (
        <Link href={`/courses/${hit.course.slug}`} className="group flex items-center gap-5 py-5">
          <div className="flex w-36 shrink-0 justify-center">
            <span className="size-3 rounded-full" style={{ background: `oklch(0.62 0.12 ${hit.course.hue})` }} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted">Course</p>
            <p className="mt-1 text-[15px] font-medium text-ink group-hover:underline group-hover:underline-offset-4">{hit.course.title}</p>
            <p className="mt-0.5 line-clamp-1 text-sm text-muted">{hit.course.description}</p>
          </div>
        </Link>
      );
  }
}
