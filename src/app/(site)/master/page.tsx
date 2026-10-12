import { ArrowRight, Check, Clock, Search, Zap } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CourseIcon, courseColors } from "@/components/course-icon";
import { WorldBand } from "@/components/learn-band";
import { buttonClass, cn, plural } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";
import { sessionMinutes } from "@/lib/quick";
import { nextTopicInCourse } from "@/lib/recommend";
import type { Topic } from "@/lib/types";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = {
  title: "Quick session: master a topic",
  description: "Pick one topic. Learn the key ideas, watch the best lesson, and pass a short check to master it, in about 15 minutes.",
};

const STEPS = [
  { title: "Learn the key ideas", body: "The handful of things the exam expects you to know." },
  { title: "Watch the top lesson", body: "The video ranked best for teaching this exact topic." },
  { title: "Pass a short check", body: "Get 3 of 4 exam-style questions right and the topic is mastered." },
];

/** Quick sessions: choose one topic to master. */
export default async function MasterPage({ searchParams }: PageProps<"/master">) {
  const [sp, catalog, viewer] = await Promise.all([searchParams, getCatalog(), getViewer()]);
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const mine = viewer ? viewer.state.profile.courseIds.map((id) => catalog.course(id)).filter((c) => c !== undefined) : [];
  const selected = catalog.course(str(sp.course));
  const q = str(sp.q).toLowerCase();
  const mastered = viewer?.state.mastered ?? {};
  const href = (t: Topic) => `/master/${catalog.course(t.courseId)!.slug}/${t.slug}`;
  const minutes = (t: Topic) => sessionMinutes(catalog.videosForTopic(t.id).find((v) => !v.isShort)?.durationSec);

  const suggestions = viewer
    ? mine
        .map((c) => ({ course: c, topic: nextTopicInCourse(catalog, viewer.state, c.id) }))
        .filter((x): x is { course: typeof x.course; topic: Topic } => Boolean(x.topic))
        .slice(0, 4)
    : [];

  const others = [...catalog.courses].filter((c) => !mine.some((m) => m.id === c.id));

  return (
    <div className="pb-20">
      <WorldBand
        kicker={
          <>
            <Zap className="size-4" /> Quick session
          </>
        }
        title="Master one topic, start to finish."
        lede="Pick a topic. Learn the key ideas, watch the best lesson for it, and pass a short check. Most sessions take about 15 minutes."
      >
        <ol className="rise mt-6 grid gap-2.5 sm:grid-cols-3 grid-cols-[minmax(0,1fr)]" style={{ ["--i" as string]: 2 }}>
          {STEPS.map((s, i) => (
            <li key={s.title} className="flex gap-3 rounded-2xl bg-white/15 p-3.5 ring-1 ring-inset ring-white/25">
              <span className="tabular flex size-8 shrink-0 items-center justify-center rounded-xl bg-white font-brand text-[15px] font-black text-[#1d4ed8]">{i + 1}</span>
              <span className="min-w-0">
                <span className="block font-brand text-[15px] font-extrabold">{s.title}</span>
                <span className="block text-[13px] leading-snug text-white/80">{s.body}</span>
              </span>
            </li>
          ))}
        </ol>
      </WorldBand>

      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:px-8">
        {suggestions.length && !selected ? (
          <section className="mb-10">
            <h2 className="headline text-[24px] text-ink">Up next for you</h2>
            <p className="mt-1 text-[15px] text-muted">The next topic you haven&apos;t mastered in each of your courses.</p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 grid-cols-[minmax(0,1fr)]">
              {suggestions.map(({ course, topic }) => {
                const { from, to } = courseColors(course.id);
                return (
                  <li key={course.id}>
                    <Link
                      href={href(topic)}
                      style={{ ["--c" as string]: from, ["--c2" as string]: to }}
                      className="press group flex items-center gap-4 rounded-3xl bg-[linear-gradient(135deg,var(--c),var(--c2))] p-4 text-white [--ledge:color-mix(in_oklab,var(--c2)_70%,black)] sm:p-5"
                    >
                      <span className="rounded-2xl bg-white/20 p-1 ring-2 ring-white/25">
                        <CourseIcon id={course.id} size={44} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-brand text-[13px] font-extrabold text-white/80">{course.title}</span>
                        <span className="block font-brand text-[19px] font-black leading-snug">{topic.title}</span>
                        <span className="mt-0.5 inline-flex items-center gap-1 font-brand text-[12.5px] font-bold text-white/80">
                          <Clock className="size-3.5" /> About {minutes(topic)} min
                        </span>
                      </span>
                      <ArrowRight className="size-5 shrink-0 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        {selected ? (
          <CoursePicker catalog={catalog} courseId={selected.id} q={q} mastered={mastered} href={href} minutes={minutes} />
        ) : (
          <section>
            <h2 className="headline text-[24px] text-ink">Choose a course</h2>
            {mine.length ? (
              <>
                <p className="mt-4 font-brand text-[14px] font-extrabold text-muted">Your courses</p>
                <CourseChips courses={mine} />
              </>
            ) : null}
            <p className="mt-6 font-brand text-[14px] font-extrabold text-muted">{mine.length ? "Every other course" : "Every course on Merit"}</p>
            <CourseChips courses={others} />
          </section>
        )}
      </div>
    </div>
  );
}

function CourseChips({ courses }: { courses: { id: string; slug: string; title: string }[] }) {
  return (
    <ul className="mt-3 flex flex-wrap gap-2.5">
      {courses.map((c) => (
        <li key={c.id}>
          <Link
            href={`/master?course=${c.slug}`}
            className="press flex h-12 items-center gap-2.5 rounded-2xl bg-surface pl-1.5 pr-4 font-brand text-[14.5px] font-extrabold text-ink ring-2 ring-inset ring-line [--ledge:var(--line)] hover:bg-bg-subtle"
          >
            <CourseIcon id={c.id} size={36} />
            {c.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function CoursePicker({
  catalog,
  courseId,
  q,
  mastered,
  href,
  minutes,
}: {
  catalog: Awaited<ReturnType<typeof getCatalog>>;
  courseId: string;
  q: string;
  mastered: Record<string, unknown>;
  href: (t: Topic) => string;
  minutes: (t: Topic) => number;
}) {
  const course = catalog.course(courseId)!;
  const { from, to } = courseColors(course.id);
  const match = (t: Topic) => !q || [t.title, t.summary, ...t.aliases, ...t.keyPoints].some((s) => s.toLowerCase().includes(q));
  const units = catalog
    .unitsForCourse(course.id)
    .map((u) => ({ unit: u, topics: catalog.topicsForUnit(u.id).filter(match) }))
    .filter((x) => x.topics.length);
  const total = catalog.topicsForCourse(course.id);
  const done = total.filter((t) => mastered[t.id]).length;

  return (
    <section style={{ ["--c" as string]: from, ["--c2" as string]: to }}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <CourseIcon id={course.id} size={48} />
          <div className="min-w-0">
            <h2 className="headline text-[24px] leading-tight text-ink">{course.title}</h2>
            <p className="tabular text-[14px] text-muted">
              {done} of {plural(total.length, "topic")} mastered
            </p>
          </div>
        </div>
        <Link href="/master" className={buttonClass("outline", "md")}>
          Change course
        </Link>
      </div>

      <form action="/master" role="search" className="mt-5 max-w-xl">
        <input type="hidden" name="course" value={course.slug} />
        <label className="press font-brand flex h-12 items-center gap-2 rounded-2xl bg-surface px-4 ring-2 ring-inset ring-line focus-within:ring-accent font-extrabold [--ledge:var(--line)]">
          <Search className="size-4 shrink-0 text-muted" />
          <span className="sr-only">Find a topic in {course.shortTitle}</span>
          <input name="q" defaultValue={q} placeholder={`Find a topic in ${course.shortTitle}`} className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-muted" />
        </label>
      </form>

      {units.length ? (
        <div className="mt-8 space-y-8">
          {units.map(({ unit, topics }) => (
            <div key={unit.id}>
              <p className="font-brand text-[15px] font-extrabold text-muted">
                Unit {unit.order}: {unit.title}
              </p>
              <ul className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 grid-cols-[minmax(0,1fr)]">
                {topics.map((t) => {
                  const isDone = Boolean(mastered[t.id]);
                  return (
                    <li key={t.id}>
                      <Link
                        href={href(t)}
                        className={cn(
                          "press group flex h-full items-center gap-3 rounded-2xl bg-surface p-3.5 ring-2 ring-inset [--ledge:var(--line)] hover:bg-bg-subtle",
                          isDone ? "ring-positive/40" : "ring-line hover:ring-[color-mix(in_oklab,var(--c)_45%,var(--line))]",
                        )}
                      >
                        <span
                          className={cn(
                            "flex size-10 shrink-0 items-center justify-center rounded-xl",
                            isDone ? "bg-positive text-white" : "bg-[color-mix(in_oklab,var(--c)_14%,var(--surface))] text-[color-mix(in_oklab,var(--c2)_80%,var(--ink))]",
                          )}
                        >
                          {isDone ? <Check className="size-5" strokeWidth={3} /> : <Zap className="size-5" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-brand text-[15.5px] font-extrabold leading-snug text-ink">{t.title}</span>
                          <span className="block text-[12.5px] font-semibold text-muted">{isDone ? "Mastered · practice again" : `About ${minutes(t)} min`}</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-3xl bg-surface px-6 py-12 text-center ring-2 ring-line">
          <p className="headline text-[20px] text-ink">No topics match &ldquo;{q}&rdquo;</p>
          <p className="mt-2 text-[15px] text-muted">Try a shorter word, or search all of Merit.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href={`/master?course=${course.slug}`} className={buttonClass("outline", "md")}>
              Show every topic
            </Link>
            <Link href={`/search?q=${encodeURIComponent(q)}`} className={buttonClass("primary", "md")}>
              Search Merit
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
