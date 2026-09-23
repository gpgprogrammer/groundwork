import type { Metadata } from "next";
import Link from "next/link";
import { Avatar, Container, Stars, cn, formatCount } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";

export const metadata: Metadata = { title: "Educators" };

export default async function EducatorsPage({ searchParams }: PageProps<"/educators">) {
  const [catalog, sp] = await Promise.all([getCatalog(), searchParams]);
  const courseFilter = typeof sp.course === "string" ? catalog.course(sp.course) : undefined;
  const educators = catalog.educators
    .filter((e) => !courseFilter || e.courseIds.includes(courseFilter.id))
    .map((e) => {
      const vids = catalog.videosForEducator(e.id);
      const avgScore = vids.length ? vids.reduce((n, v) => n + v.rank.score, 0) / vids.length : 0;
      return { e, lessons: vids.length, avgScore };
    })
    .sort((a, b) => b.avgScore - a.avgScore);

  return (
    <Container size="xl" className="py-14">
      <header className="rise max-w-2xl">
        <h1 className="headline text-4xl text-ink">Educators</h1>
        <p className="mt-3 text-[16px] leading-relaxed text-muted">
          Teachers, AP Readers, and tutors with years of exam prep behind them. Watch their lessons first, then book the ones who
          click for you.
        </p>
      </header>

      <div className="scrollbar-none -mx-1 mt-8 flex gap-1 overflow-x-auto px-1">
        {[undefined, ...catalog.courses].map((c) => (
          <Link
            key={c?.id ?? "all"}
            href={c ? `?course=${c.id}` : "?"}
            scroll={false}
            className={cn(
              "shrink-0 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors",
              courseFilter?.id === c?.id ? "bg-ink text-bg" : "text-muted hover:bg-bg-subtle hover:text-ink",
            )}
          >
            {c?.shortTitle ?? "All subjects"}
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {educators.map(({ e, lessons }) => (
          <Link
            key={e.id}
            href={`/educators/${e.handle}`}
            className="group flex flex-col rounded-2xl border border-line bg-surface p-6 transition-all hover:border-line-strong hover:shadow-soft"
          >
            <div className="flex items-start gap-4">
              <Avatar name={e.name} hue={e.hue} size={52} />
              <div className="min-w-0">
                <p className="text-[16px] font-semibold tracking-tight text-ink">{e.name}</p>
                <p className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-muted">{e.headline}</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-1.5">
              {e.subjects.map((s) => (
                <span key={s} className="rounded-full border border-line px-2 py-0.5 text-xs text-ink-2">
                  {s}
                </span>
              ))}
            </div>
            <div className="tabular mt-auto flex items-center gap-4 border-t border-line pt-4 text-[13px] text-muted [margin-top:1.5rem]">
              {e.ratingCount > 0 ? <Stars rating={e.rating} className="text-ink-2" /> : <span>New</span>}
              <span>{formatCount(e.ratingCount)} reviews</span>
              <span>{lessons} lessons</span>
              <span className="ml-auto font-medium text-ink">${e.hourlyRate}/hr</span>
            </div>
          </Link>
        ))}
      </div>
    </Container>
  );
}
