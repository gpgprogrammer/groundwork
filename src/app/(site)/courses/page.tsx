import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container, ProgressBar } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";
import { courseProgress } from "@/lib/recommend";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Courses" };

export default async function CoursesPage() {
  const [catalog, viewer] = await Promise.all([getCatalog(), getViewer()]);
  const mine = new Set(viewer?.state.profile.courseIds ?? []);
  const groups = [
    { label: "AP", courses: catalog.courses.filter((c) => c.exam === "AP") },
    { label: "SAT", courses: catalog.courses.filter((c) => c.exam === "SAT") },
  ];

  return (
    <Container size="xl" className="py-14">
      <header className="rise max-w-2xl">
        <h1 className="headline text-4xl text-ink">Courses</h1>
        <p className="mt-3 text-[16px] leading-relaxed text-muted">
          Every course follows the exam&apos;s own structure: units, then concepts, then the specific topics you&apos;ll be tested on.
        </p>
      </header>

      {groups.map((g) => (
        <section key={g.label} className="mt-14">
          <h2 className="eyebrow mb-4">{g.label === "AP" ? "Advanced Placement" : "SAT"}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {g.courses.map((c) => {
              const units = catalog.unitsForCourse(c.id);
              const topics = catalog.topicsForCourse(c.id);
              const lessons = topics.reduce((n, t) => n + catalog.videosForTopic(t.id).length, 0);
              const prog = viewer ? courseProgress(catalog, viewer.state, c.id) : null;
              return (
                <Link
                  key={c.id}
                  href={`/courses/${c.slug}`}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface p-6 transition-all hover:border-line-strong hover:shadow-soft"
                >
                  <div
                    className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full opacity-60 blur-2xl"
                    style={{ background: `oklch(0.9 0.05 ${c.hue} / 0.5)` }}
                  />
                  <div className="relative flex items-start justify-between">
                    <span className="text-xs font-medium text-muted">
                      {c.exam} · {c.subject}
                    </span>
                    <ArrowUpRight className="size-4 text-faint transition-colors group-hover:text-ink" />
                  </div>
                  <h3 className="headline relative mt-8 text-2xl text-ink">{c.title}</h3>
                  <p className="relative mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted">{c.description}</p>
                  <div className="tabular relative mt-6 flex items-center gap-4 text-xs text-muted">
                    <span>{units.length} units</span>
                    <span>{topics.length} topics</span>
                    <span>{lessons} lessons</span>
                    {mine.has(c.id) ? <span className="ml-auto font-medium text-accent">Studying</span> : null}
                  </div>
                  {prog && prog.done > 0 ? (
                    <div className="relative mt-4">
                      <ProgressBar value={prog.done / prog.total} />
                    </div>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </Container>
  );
}
