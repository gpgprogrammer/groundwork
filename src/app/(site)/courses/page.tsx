import type { Metadata } from "next";
import Link from "next/link";
import { ProgressBar, formatViews } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";
import { courseProgress } from "@/lib/recommend";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Courses" };

export default async function CoursesPage() {
  const [catalog, viewer] = await Promise.all([getCatalog(), getViewer()]);
  const mine = new Set(viewer?.state.profile.courseIds ?? []);
  const groups = [
    { label: "Advanced Placement", courses: catalog.courses.filter((c) => c.exam === "AP") },
    { label: "SAT", courses: catalog.courses.filter((c) => c.exam === "SAT") },
  ];

  return (
    <div className="mx-auto max-w-[1280px] px-4 pb-16 pt-6 sm:px-6">
      <h1 className="text-[28px] font-bold tracking-tight text-ink">Courses</h1>
      <p className="mt-1 max-w-2xl text-[15px] text-muted">
        Every course is organized the way the exam is: units, then concepts, then the exact topics you&apos;ll be tested on.
      </p>
      {groups.map((g) => (
        <section key={g.label} className="mt-10">
          <h2 className="mb-4 text-xl font-bold tracking-tight text-ink">{g.label}</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {g.courses.map((c) => {
              const videos = catalog.videosForCourse(c.id);
              const covered = catalog.topicsForCourse(c.id).filter((t) => catalog.videosForTopic(t.id).length).length;
              const thumbs = videos.filter((v) => !v.isShort).slice(0, 3);
              const prog = viewer ? courseProgress(catalog, viewer.state, c.id) : null;
              return (
                <Link key={c.id} href={`/courses/${c.slug}`} className="group overflow-hidden rounded-xl bg-bg-subtle transition-colors hover:bg-line">
                  <div className="grid aspect-[16/7] grid-cols-3 gap-0.5 overflow-hidden">
                    {thumbs.map((v) => (
                      <img key={v.id} src={v.thumbnail} alt="" loading="lazy" referrerPolicy="no-referrer" className="size-full object-cover" />
                    ))}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full" style={{ background: `oklch(0.6 0.14 ${c.hue})` }} />
                      <span className="text-xs font-medium text-muted">{c.exam} · {c.subject}</span>
                      {mine.has(c.id) ? <span className="ml-auto rounded bg-accent-soft px-1.5 py-0.5 text-[11px] font-medium text-accent">Studying</span> : null}
                    </div>
                    <h3 className="mt-2 text-lg font-bold tracking-tight text-ink">{c.title}</h3>
                    <p className="tabular mt-1 text-[13px] text-muted">
                      {catalog.unitsForCourse(c.id).length} units · {covered} topics · {formatViews(videos.length)} videos
                    </p>
                    {prog ? (
                      <div className="mt-3">
                        <ProgressBar value={prog.done / prog.total} />
                        <p className="tabular mt-1 text-xs text-muted">
                          {prog.done} of {prog.total} topics mastered
                        </p>
                      </div>
                    ) : null}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
