import { BadgeCheck, Clock, GraduationCap, MapPin } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonCard } from "@/components/lesson-cards";
import { TutoringDialogButton } from "@/components/tutoring";
import { Avatar, Container, Stars, formatCount } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";
import { completionRate, helpfulRate } from "@/lib/ranking";
import { getViewer } from "@/lib/viewer";

export async function generateMetadata({ params }: PageProps<"/educators/[handle]">): Promise<Metadata> {
  const catalog = await getCatalog();
  const e = catalog.educatorByHandle((await params).handle);
  return e ? { title: e.name, description: e.headline } : {};
}

export default async function EducatorPage({ params }: PageProps<"/educators/[handle]">) {
  const { handle } = await params;
  const [catalog, viewer] = await Promise.all([getCatalog(), getViewer()]);
  const e = catalog.educatorByHandle(handle);
  if (!e) notFound();

  const lessons = catalog.videosForEducator(e.id);
  const totals = lessons.reduce(
    (acc, v) => ({ views: acc.views + v.stats.views, completion: acc.completion + completionRate(v.stats), helpful: acc.helpful + helpfulRate(v.stats) }),
    { views: 0, completion: 0, helpful: 0 },
  );
  const n = Math.max(1, lessons.length);
  const byCourse = e.courseIds
    .map((id) => ({ course: catalog.course(id)!, lessons: lessons.filter((v) => catalog.topic(v.topicId)?.courseId === id) }))
    .filter((g) => g.course && g.lessons.length);

  return (
    <div>
      <section className="border-b border-line">
        <Container size="xl" className="grid gap-10 py-14 lg:grid-cols-[1fr_340px]">
          <div className="rise">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <Avatar name={e.name} hue={e.hue} size={88} />
              <div>
                <h1 className="display flex items-center gap-2 text-4xl text-ink">
                  {e.name}
                  <BadgeCheck className="size-6 text-accent" aria-label="Verified educator" />
                </h1>
                <p className="mt-2 text-[17px] text-ink-2">{e.headline}</p>
                <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted">
                  {e.ratingCount > 0 ? (
                    <span className="flex items-center gap-1">
                      <Stars rating={e.rating} className="font-medium text-ink" /> ({formatCount(e.ratingCount)} reviews)
                    </span>
                  ) : (
                    <span>New educator</span>
                  )}
                  {e.location ? (
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3.5" /> {e.location}
                    </span>
                  ) : null}
                  {e.yearsTeaching ? (
                    <span className="flex items-center gap-1">
                      <GraduationCap className="size-3.5" /> {e.yearsTeaching} years teaching
                    </span>
                  ) : null}
                </p>
              </div>
            </div>
            <p className="mt-8 max-w-2xl text-[16px] leading-relaxed text-ink-2">{e.bio}</p>
            {e.credentials.length ? (
              <ul className="mt-6 space-y-1.5">
                {e.credentials.map((c) => (
                  <li key={c} className="flex items-center gap-2 text-sm text-ink-2">
                    <span className="size-1 rounded-full bg-faint" /> {c}
                  </li>
                ))}
              </ul>
            ) : null}
            <dl className="tabular mt-10 grid max-w-xl grid-cols-2 gap-6 sm:grid-cols-4">
              {[
                ["Lessons", String(lessons.length)],
                ["Views", formatCount(totals.views)],
                ["Avg. finish rate", `${Math.round((totals.completion / n) * 100)}%`],
                ["Found helpful", `${Math.round((totals.helpful / n) * 100)}%`],
              ].map(([k, v]) => (
                <div key={k}>
                  <dd className="text-2xl font-semibold tracking-tight text-ink">{v}</dd>
                  <dt className="mt-0.5 text-xs text-muted">{k}</dt>
                </div>
              ))}
            </dl>
          </div>

          <aside id="book" className="scroll-mt-24">
            <div className="rounded-2xl border border-line bg-surface p-6 shadow-soft lg:sticky lg:top-24">
              <p className="text-[15px] font-semibold text-ink">Tutoring with {e.firstName}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-muted">
                One-on-one online sessions. Send a note about what you&apos;re working on and {e.firstName} will reply to set up a time.
              </p>
              <p className="mt-5 flex items-baseline gap-1">
                <span className="tabular text-3xl font-semibold tracking-tight text-ink">${e.hourlyRate}</span>
                <span className="text-sm text-muted">/ hour</span>
              </p>
              <ul className="mt-4 space-y-2 text-[13px] text-ink-2">
                <li className="flex items-center gap-2">
                  <Clock className="size-3.5 text-muted" /> {e.responseTime}
                </li>
                <li className="flex items-center gap-2">
                  <GraduationCap className="size-3.5 text-muted" /> {e.subjects.join(", ")}
                </li>
              </ul>
              <TutoringDialogButton
                educator={e}
                courseId={e.courseIds[0] ?? null}
                prefill={viewer ? { name: viewer.user.name, email: viewer.user.email } : undefined}
                className="mt-6 w-full"
              >
                Request a session
              </TutoringDialogButton>
              {!e.acceptingStudents ? (
                <p className="mt-3 text-center text-xs text-muted">{e.firstName}&apos;s schedule is full. Their lessons are still available.</p>
              ) : null}
            </div>
          </aside>
        </Container>
      </section>

      <Container size="xl" className="space-y-14 py-14">
        {byCourse.map(({ course, lessons }) => (
          <section key={course.id}>
            <h2 className="headline mb-5 text-[17px] text-ink">
              {course.title} <span className="tabular ml-1 text-sm font-normal text-muted">{lessons.length}</span>
            </h2>
            <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
              {lessons.slice(0, 12).map((v) => (
                <LessonCard key={v.id} video={v} catalog={catalog} showTopic={false} />
              ))}
            </div>
          </section>
        ))}
        {!byCourse.length ? <p className="text-sm text-muted">{e.firstName} hasn&apos;t published any lessons yet.</p> : null}
      </Container>
    </div>
  );
}
