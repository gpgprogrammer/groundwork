import { ArrowRight, Shuffle, Target, Timer, TrendingDown, Zap } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CourseIcon } from "@/components/course-icon";
import { heroBtn, heroBtnGhost, HeroKicker, WORLD_ON_WHITE, WorldHero } from "@/components/marketing";
import { cn } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";
import { getStore } from "@/lib/data/store";
import { hasPractice } from "@/lib/mathgen";
import { isSolid, PRACTICE_COLLECTION, recentAccuracy, weakSpots, type PracticeStats } from "@/lib/practice-stats";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = {
  title: "Practice",
  description: "Unlimited math practice problems with step-by-step solutions, from Algebra 1 to AP Calculus. Timed drills for test night, and practice that finds your weak spots.",
};

/** Practice: unlimited generated math problems for every topic that has them, organized like the course. */
export default async function PracticePage({ searchParams }: PageProps<"/practice">) {
  const [sp, catalog, viewer] = await Promise.all([searchParams, getCatalog(), getViewer()]);
  const stats = viewer ? await (await getStore()).getDoc<PracticeStats>(PRACTICE_COLLECTION, viewer.user.id) : null;
  const mine = viewer?.state.profile.courseIds.filter((id) => catalog.course(id)) ?? [];
  const requested = typeof sp.course === "string" ? catalog.course(sp.course) : undefined;
  const course = requested ?? catalog.course(mine[0] ?? "algebra-1") ?? catalog.courses[0];
  const units = catalog.unitsForCourse(course.id).map((u) => ({ unit: u, topics: catalog.topicsForUnit(u.id).filter((t) => hasPractice(t.id)) })).filter((x) => x.topics.length);
  const practiceCount = units.reduce((s, u) => s + u.topics.length, 0);
  const weak = weakSpots(stats).map((w) => ({ ...w, topic: catalog.topic(w.topicId) })).filter((w) => w.topic).slice(0, 6);
  // Mixed review: weak spots in this course first, then a spread of the course's topics.
  const spread = units.flatMap((u) => u.topics[Math.floor(u.topics.length / 2)] ?? []);
  const mixed = [...new Set([...weak.filter((w) => w.topic!.courseId === course.id).map((w) => w.topicId), ...spread.map((t) => t.id)])].slice(0, 6);
  // Only courses with generated problems (SAT Reading and Writing has lessons but no generated practice).
  const practicable = (id: string) => catalog.topicsForCourse(id).some((t) => hasPractice(t.id));
  const ordered = [...mine.map((id) => catalog.course(id)!), ...catalog.courses.filter((c) => !mine.includes(c.id))].filter((c) => practicable(c.id));

  return (
    <div className="pb-20">
      <WorldHero world="sprint" inner="pb-12 pt-8 lg:pb-14 lg:pt-10">
        <HeroKicker>
          <Target className="size-4" /> Practice
        </HeroKicker>
        <h1 className="display rise mt-4 max-w-3xl text-[38px] sm:text-5xl lg:text-[58px]">Unlimited math practice.</h1>
        <p className="rise mt-4 max-w-2xl text-[16.5px] leading-relaxed text-white/90" style={{ ["--i" as string]: 1 }}>
          Fresh problems every time, a hint when you need it, and a step-by-step solution for every one. Wrong answers tell you exactly which mistake you made.
        </p>
        <div className="rise mt-7 flex flex-wrap gap-3" style={{ ["--i" as string]: 2 }}>
          {mixed.length ? (
            <Link href={`/practice/${course.slug}/mixed?topics=${mixed.join(",")}`} className={cn(heroBtn, WORLD_ON_WHITE.sprint)}>
              <Shuffle className="size-4" /> Mixed review: {course.shortTitle}
            </Link>
          ) : null}
          {mixed.length ? (
            <Link href={`/practice/${course.slug}/mixed?topics=${mixed.join(",")}&timed=1`} className={heroBtnGhost}>
              <Timer className="size-4" /> Timed test drill
            </Link>
          ) : null}
        </div>
      </WorldHero>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {weak.length ? (
          <section className="mt-10">
            <h2 className="headline flex items-center gap-2.5 text-[22px] text-ink sm:text-[24px]">
              <TrendingDown className="size-5 text-sprint" /> Your weak spots
            </h2>
            <p className="mt-1 text-sm text-muted">Topics where your recent practice is under 70%. They&apos;re in your learning plan too.</p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {weak.map((w) => {
                const c = catalog.course(w.topic!.courseId)!;
                return (
                  <li key={w.topicId}>
                    <Link href={`/practice/${c.slug}/${w.topic!.slug}`} className="press flex items-center gap-3 rounded-3xl bg-surface p-4 ring-2 ring-line [--ledge:var(--line)] hover:bg-bg-subtle">
                      <CourseIcon id={c.id} size={36} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-brand text-[15px] font-extrabold text-ink">{w.topic!.title}</span>
                        <span className="tabular block text-[12.5px] text-muted">
                          {c.shortTitle} · {Math.round(w.accuracy * 100)}% recently
                        </span>
                      </span>
                      <ArrowRight className="size-4 shrink-0 text-muted" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        <nav aria-label="Courses" className="scrollbar-none -mx-4 mt-10 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-wrap lg:px-0">
          {ordered.map((c) => (
            <Link
              key={c.id}
              href={`/practice?course=${c.slug}`}
              aria-current={c.id === course.id ? "page" : undefined}
              className={cn(
                "press-sm inline-flex h-11 shrink-0 items-center gap-2 rounded-2xl pl-1.5 pr-3.5 font-brand text-[14px] font-extrabold ring-2 ring-inset",
                c.id === course.id ? "bg-sprint text-white ring-sprint [--ledge:var(--sprint-press)]" : "bg-surface text-ink ring-line [--ledge:var(--line)] hover:bg-bg-subtle",
              )}
            >
              <CourseIcon id={c.id} size={30} />
              {c.shortTitle}
            </Link>
          ))}
        </nav>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="headline text-[26px] text-ink sm:text-[30px]">{course.title}</h2>
            <p className="tabular mt-1 text-sm text-muted">
              {practiceCount} {practiceCount === 1 ? "topic" : "topics"} with unlimited practice problems
            </p>
          </div>
          <Link href={`/master`} className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-bg-subtle px-3.5 font-brand text-[13.5px] font-extrabold text-ink-2 hover:bg-line hover:text-ink">
            <Zap className="size-4" /> Quick session: learn + check one topic
          </Link>
        </div>

        {units.length ? (
          <div className="mt-6 space-y-6">
            {units.map(({ unit, topics }) => (
              <section key={unit.id} className="rounded-3xl bg-surface p-4 ring-2 ring-line sm:p-5">
                <h3 className="flex items-center gap-3 font-brand text-[17px] font-extrabold text-ink">
                  <span className="tabular flex size-9 shrink-0 items-center justify-center rounded-xl bg-sprint-soft font-black text-sprint-ink">{unit.order}</span>
                  {unit.title}
                </h3>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {topics.map((t) => {
                    const s = stats?.topics[t.id];
                    return (
                      <li key={t.id}>
                        <Link href={`/practice/${course.slug}/${t.slug}`} className="group flex min-h-12 items-center gap-2.5 rounded-2xl bg-bg-subtle/70 px-3.5 py-2.5 transition-colors hover:bg-sprint-soft">
                          <span className="min-w-0 flex-1 text-[14.5px] font-bold leading-snug text-ink">{t.title}</span>
                          {s ? (
                            <span className={cn("tabular shrink-0 rounded-full px-2 py-0.5 font-brand text-[12px] font-black", isSolid(s) ? "bg-positive-soft text-positive" : "bg-surface text-sprint-ink ring-1 ring-line")}>
                              {Math.round(recentAccuracy(s) * 100)}%
                            </span>
                          ) : (
                            <ArrowRight className="size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        ) : (
          <p className="mt-6 rounded-3xl bg-surface p-6 text-[15px] text-muted ring-2 ring-line">Practice problems for this course are coming. Meanwhile, try a Quick session or an Exam Sprint.</p>
        )}
      </div>
    </div>
  );
}
