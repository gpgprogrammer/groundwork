import type { Metadata } from "next";
import Link from "next/link";
import { clearHistory } from "@/app/actions/learning";
import { LessonCard } from "@/components/lesson-cards";
import { Thumbnail } from "@/components/thumbnail";
import { Button, Container, EmptyState, LinkButton, cn, timeAgo } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";
import { history } from "@/lib/recommend";
import { requireViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Library" };

export default async function LibraryPage({ searchParams }: PageProps<"/library">) {
  const [viewer, catalog, sp] = await Promise.all([requireViewer("/library"), getCatalog(), searchParams]);
  const tab = sp.tab === "history" ? "history" : "saved";

  const saved = Object.entries(viewer.state.saves)
    .sort((a, b) => b[1].localeCompare(a[1]))
    .map(([id]) => catalog.video(id))
    .filter((v) => v !== undefined);
  const hist = history(catalog, viewer.state);

  return (
    <Container size="xl" className="py-12">
      <h1 className="headline text-3xl text-ink">Library</h1>
      <div className="mt-6 flex gap-1 border-b border-line">
        {[
          { key: "saved", label: "Saved", count: saved.length },
          { key: "history", label: "History", count: hist.length },
        ].map((t) => (
          <Link
            key={t.key}
            href={`/library${t.key === "history" ? "?tab=history" : ""}`}
            className={cn(
              "-mb-px border-b-2 px-3 pb-3 text-sm font-medium transition-colors",
              tab === t.key ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink",
            )}
          >
            {t.label} <span className="tabular ml-1 text-xs text-faint">{t.count}</span>
          </Link>
        ))}
      </div>

      {tab === "saved" ? (
        <div className="mt-8">
          {saved.length ? (
            <div className="grid gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
              {saved.map((v) => {
                const p = viewer.state.progress[v.id];
                return <LessonCard key={v.id} video={v} catalog={catalog} progress={p ? (p.completed ? 1 : p.position / p.duration) : undefined} />;
              })}
            </div>
          ) : (
            <EmptyState
              title="Nothing saved yet"
              body="Save a lesson you want to come back to before the exam. It will show up here."
              action={<LinkButton href="/courses" variant="secondary">Browse courses</LinkButton>}
            />
          )}
        </div>
      ) : (
        <div className="mt-6">
          {hist.length ? (
            <>
              <div className="flex justify-end">
                <form action={clearHistory}>
                  <Button variant="ghost" size="sm">
                    Clear history
                  </Button>
                </form>
              </div>
              <ul className="mt-2 divide-y divide-line">
                {hist.map(({ video, progress }) => {
                  const topic = catalog.topic(video.topicId)!;
                  const course = catalog.course(topic.courseId)!;
                  const educator = catalog.educator(video.educatorId)!;
                  const frac = progress.completed ? 1 : progress.position / progress.duration;
                  return (
                    <li key={video.id}>
                      <Link href={`/watch/${video.id}`} className="group flex items-center gap-5 py-4">
                        <div className="w-32 shrink-0 sm:w-40">
                          <Thumbnail topic={topic} course={course} size="sm" durationSec={video.durationSec} progress={frac} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[15px] font-medium text-ink group-hover:underline group-hover:underline-offset-4">{video.title}</p>
                          <p className="mt-0.5 truncate text-[13px] text-muted">
                            {educator.name} · {course.shortTitle} · {topic.title}
                          </p>
                          <p className="mt-1.5 text-xs text-faint">
                            {progress.completed ? <span className="text-positive">Finished</span> : `${Math.round(frac * 100)}% watched`} ·{" "}
                            {timeAgo(progress.updatedAt)}
                          </p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : (
            <EmptyState title="No history" body="Lessons you watch will appear here so you can pick up where you left off." />
          )}
        </div>
      )}
    </Container>
  );
}
