import { ArrowRight, Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, LinkButton, ProgressBar, cn } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";
import { courseProgress, nextTopicInCourse, topicStatus } from "@/lib/recommend";
import { getViewer } from "@/lib/viewer";

export async function generateMetadata({ params }: PageProps<"/courses/[course]">): Promise<Metadata> {
  const catalog = await getCatalog();
  const course = catalog.course((await params).course);
  return course ? { title: course.title, description: course.description } : {};
}

export default async function CoursePage({ params }: PageProps<"/courses/[course]">) {
  const { course: slug } = await params;
  const [catalog, viewer] = await Promise.all([getCatalog(), getViewer()]);
  const course = catalog.course(slug);
  if (!course) notFound();

  const units = catalog.unitsForCourse(course.id);
  const topics = catalog.topicsForCourse(course.id);
  const lessonCount = topics.reduce((n, t) => n + catalog.videosForTopic(t.id).length, 0);
  const minutes = Math.round(topics.reduce((n, t) => n + (catalog.videosForTopic(t.id)[0]?.durationSec ?? 0), 0) / 60);
  const prog = viewer ? courseProgress(catalog, viewer.state, course.id) : null;
  const next = viewer ? nextTopicInCourse(catalog, viewer.state, course.id) : topics[0];

  return (
    <div>
      <section className="relative overflow-hidden border-b border-line">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(60% 120% at 100% 0%, oklch(0.93 0.04 ${course.hue} / 0.45), transparent 60%)` }}
        />
        <Container size="xl" className="relative py-14">
          <nav className="text-[13px] text-muted" aria-label="Breadcrumb">
            <Link href="/courses" className="hover:text-ink">
              Courses
            </Link>
            <span className="mx-2 text-faint">/</span>
            <span className="text-ink-2">{course.shortTitle}</span>
          </nav>
          <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_340px] lg:items-end">
            <div className="rise max-w-2xl">
              <p className="eyebrow">
                {course.exam} · {course.subject} · Exam in {course.examMonth}
              </p>
              <h1 className="display mt-3 text-4xl text-ink sm:text-5xl">{course.title}</h1>
              <p className="mt-4 text-[16px] leading-relaxed text-muted">{course.description}</p>
              <div className="tabular mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-2">
                <span>
                  <strong className="font-semibold text-ink">{units.length}</strong> units
                </span>
                <span>
                  <strong className="font-semibold text-ink">{topics.length}</strong> topics
                </span>
                <span>
                  <strong className="font-semibold text-ink">{lessonCount}</strong> lessons
                </span>
                <span>
                  <strong className="font-semibold text-ink">~{Math.round(minutes / 60)}h</strong> to cover the top lesson in every topic
                </span>
              </div>
            </div>
            {next ? (
              <div className="rounded-2xl border border-line bg-surface p-5 shadow-soft">
                {prog ? (
                  <>
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="font-medium text-ink">Your progress</span>
                      <span className="tabular text-muted">
                        {prog.done} / {prog.total} topics
                      </span>
                    </div>
                    <ProgressBar value={prog.done / prog.total} className="mt-3" />
                  </>
                ) : (
                  <p className="text-sm font-medium text-ink">Start at the beginning</p>
                )}
                <p className="mt-4 text-xs text-muted">{prog && prog.done > 0 ? "Up next" : "First topic"}</p>
                <p className="mt-0.5 text-[15px] font-medium text-ink">{next.title}</p>
                <LinkButton href={`/courses/${course.slug}/${next.slug}`} className="mt-4 w-full">
                  {prog && prog.done > 0 ? "Continue" : "Start"} <ArrowRight className="size-4" />
                </LinkButton>
              </div>
            ) : null}
          </div>
        </Container>
      </section>

      <Container size="xl" className="grid gap-12 py-12 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <nav className="sticky top-24 space-y-1" aria-label="Units">
            <p className="eyebrow mb-3">Units</p>
            {units.map((u) => (
              <a key={u.id} href={`#${u.slug}`} className="flex gap-3 rounded-md py-1.5 text-[13px] text-muted transition-colors hover:text-ink">
                <span className="tabular w-4 shrink-0 text-faint">{u.order}</span>
                <span className="leading-snug">{u.title}</span>
              </a>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 space-y-14">
          {units.map((u) => (
            <section key={u.id} id={u.slug} className="scroll-mt-24">
              <div className="flex items-baseline gap-3">
                <span className="tabular font-mono text-xs text-faint">Unit {u.order}</span>
              </div>
              <h2 className="headline mt-1 text-2xl text-ink">{u.title}</h2>
              <p className="mt-1.5 text-sm text-muted">{u.summary}</p>

              <div className="mt-6 space-y-6">
                {catalog.conceptsForUnit(u.id).map((c) => (
                  <div key={c.id}>
                    <h3 className="mb-2 text-[13px] font-medium text-ink-2">{c.title}</h3>
                    <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
                      {catalog.topicsForConcept(c.id).map((t) => {
                        const vids = catalog.videosForTopic(t.id);
                        const status = viewer ? topicStatus(catalog, viewer.state, t.id) : "new";
                        return (
                          <li key={t.id}>
                            <Link
                              href={`/courses/${course.slug}/${t.slug}`}
                              className="group flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-bg"
                            >
                              <span
                                className={cn(
                                  "flex size-5 shrink-0 items-center justify-center rounded-full border",
                                  status === "done" && "border-positive bg-positive text-white",
                                  status === "started" && "border-accent",
                                  status === "new" && "border-line-strong",
                                )}
                                aria-label={status === "done" ? "Completed" : status === "started" ? "In progress" : "Not started"}
                              >
                                {status === "done" ? <Check className="size-3" strokeWidth={3} /> : null}
                                {status === "started" ? <span className="size-2 rounded-full bg-accent" /> : null}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="text-[15px] font-medium text-ink">{t.title}</p>
                                <p className="mt-0.5 hidden truncate text-[13px] text-muted sm:block">{t.summary}</p>
                              </div>
                              <span className="hidden max-w-32 shrink-0 truncate font-serif text-[15px] italic text-faint md:block">{t.glyph}</span>
                              <span className="tabular w-20 shrink-0 text-right text-xs text-muted">{vids.length} lessons</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </Container>
    </div>
  );
}
