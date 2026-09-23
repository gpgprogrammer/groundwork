import { ArrowRight, ChevronRight } from "lucide-react";
import { Faq, Pricing } from "@/components/marketing";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Thumbnail } from "@/components/thumbnail";
import { Avatar, Container, LinkButton, Stars, cn, formatCount } from "@/components/ui";
import { getCatalog, type IndexedCatalog } from "@/lib/catalog";
import { PLAN } from "@/lib/env";
import { completionRate, helpfulRate, RANKING_WEIGHTS } from "@/lib/ranking";
import { getViewer } from "@/lib/viewer";

export default async function LandingPage({ searchParams }: PageProps<"/">) {
  const [viewer, catalog, sp] = await Promise.all([getViewer(), getCatalog(), searchParams]);
  if (viewer && sp.home === undefined) redirect("/dashboard");

  const topicCount = catalog.topics.length;
  const lessonCount = catalog.videos.length;

  return (
    <>
      <Hero catalog={catalog} topicCount={topicCount} lessonCount={lessonCount} />
      <CourseStrip catalog={catalog} />
      <HowItWorks />
      <RankingSection catalog={catalog} />
      <EducatorSection catalog={catalog} />
      <Pricing />
      <Faq />
      <FinalCta />
    </>
  );
}

function Hero({ catalog, topicCount, lessonCount }: { catalog: IndexedCatalog; topicCount: number; lessonCount: number }) {
  return (
    <section className="relative overflow-hidden">
      <div className="paper pointer-events-none absolute inset-0 [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]" />
      <Container size="xl" className="relative pb-20 pt-16 sm:pt-24">
        <div className="rise mx-auto max-w-3xl text-center">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 py-1 pl-1 pr-3 text-[13px] text-ink-2 shadow-soft backdrop-blur transition-colors hover:border-line-strong"
          >
            <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">New</span>
            AP World, Calc BC, SAT Math and more
            <ChevronRight className="size-3.5 text-faint" />
          </Link>
          <h1 className="display mt-7 text-[44px] text-ink sm:text-[68px]">
            The best lesson for
            <br className="hidden sm:block" /> every idea on the{" "}
            <span className="font-serif font-normal italic tracking-[-0.02em]">exam.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-muted">
            Choose your course, go down to the exact concept you&apos;re stuck on, and watch the short lessons students actually
            finish. Lessons are ranked by how well they teach, not by views.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <LinkButton href="/signup" size="lg" className="w-full sm:w-auto">
              Start your free month <ArrowRight className="size-4" />
            </LinkButton>
            <LinkButton href="/courses" size="lg" variant="secondary" className="w-full sm:w-auto">
              Browse courses
            </LinkButton>
          </div>
          <p className="mt-4 text-[13px] text-faint">
            {PLAN.trialDays} days free, then ${PLAN.priceMonthly}/month. No card needed to start.
          </p>
        </div>

        <div className="rise mx-auto mt-16 max-w-5xl [animation-delay:120ms]">
          <DrillDown catalog={catalog} />
          <p className="tabular mt-4 text-center text-xs text-faint">
            {catalog.courses.length} courses · {topicCount} topics · {lessonCount} lessons, each under 20 minutes
          </p>
        </div>
      </Container>
    </section>
  );
}

function Col({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("min-w-0 border-line p-3 max-md:border-b md:border-r md:last:border-r-0", className)}>
      <p className="px-2 pb-2 text-[11px] font-medium text-faint">{title}</p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function Item({ active, children }: { active?: boolean; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 truncate rounded-md px-2 py-1.5 text-[13px]",
        active ? "bg-ink font-medium text-bg" : "text-ink-2",
      )}
    >
      <span className="truncate">{children}</span>
      {active ? <ChevronRight className="size-3.5 shrink-0 opacity-60" /> : null}
    </div>
  );
}

/** A Miller-column view of the catalog, rendered from real data. */
function DrillDown({ catalog }: { catalog: IndexedCatalog }) {
  const course = catalog.course("ap-calculus-bc")!;
  const topic = catalog.topic("chain-rule")!;
  const units = catalog.unitsForCourse(course.id);
  const concept = catalog.concept(topic.conceptId)!;
  const topics = catalog.topicsForConcept(concept.id);
  const lessons = catalog.videosForTopic(topic.id).slice(0, 3);

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-lift">
      <div className="flex items-center gap-2 border-b border-line bg-bg px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-line-strong" />
        <span className="size-2.5 rounded-full bg-line-strong" />
        <span className="size-2.5 rounded-full bg-line-strong" />
        <div className="ml-3 flex min-w-0 items-center gap-1.5 truncate text-xs text-muted">
          <span>{course.title}</span>
          <ChevronRight className="size-3 shrink-0" />
          <span>Differentiation</span>
          <ChevronRight className="size-3 shrink-0" />
          <span className="font-medium text-ink">{topic.title}</span>
        </div>
      </div>
      <div className="grid md:grid-cols-[0.9fr_1fr_1fr_1.6fr]">
        <Col title="Courses" className="hidden md:block">
          {catalog.courses.map((c) => (
            <Item key={c.id} active={c.id === course.id}>
              {c.title}
            </Item>
          ))}
        </Col>
        <Col title="Units" className="hidden md:block">
          {units.map((u) => (
            <Item key={u.id} active={u.id === topic.unitId}>
              {u.title}
            </Item>
          ))}
        </Col>
        <Col title={concept.title} className="hidden md:block">
          {topics.map((t) => (
            <Item key={t.id} active={t.id === topic.id}>
              {t.title}
            </Item>
          ))}
        </Col>
        <div className="min-w-0 p-5">
          <p className="text-[11px] font-medium text-faint">Topic</p>
          <h3 className="headline mt-1 text-xl text-ink">{topic.title}</h3>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">{topic.summary}</p>
          <div className="mt-4 space-y-2.5">
            {lessons.map((v, i) => {
              const ed = catalog.educator(v.educatorId)!;
              return (
                <div key={v.id} className="flex items-center gap-3">
                  <div className="w-24 shrink-0">
                    <Thumbnail topic={topic} course={course} size="sm" durationSec={v.durationSec} className="rounded-md" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-ink">{v.title}</p>
                    <p className="tabular truncate text-xs text-muted">
                      {ed.name} · {Math.round(completionRate(v.stats) * 100)}% finish
                    </p>
                  </div>
                  {i === 0 ? <span className="hidden rounded bg-accent-soft px-1.5 py-0.5 text-[10.5px] font-medium text-accent sm:block">#1</span> : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function CourseStrip({ catalog }: { catalog: IndexedCatalog }) {
  return (
    <section className="border-y border-line bg-surface">
      <Container size="xl" className="py-10">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-line sm:grid-cols-3 lg:grid-cols-6">
          {catalog.courses.map((c) => (
            <Link key={c.id} href={`/courses/${c.slug}`} className="group bg-surface p-4 transition-colors hover:bg-bg">
              <span className="block size-1.5 rounded-full" style={{ background: `oklch(0.62 0.12 ${c.hue})` }} />
              <p className="mt-3 text-[14px] font-medium text-ink">{c.title}</p>
              <p className="tabular mt-0.5 text-xs text-muted">{catalog.topicsForCourse(c.id).length} topics</p>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Pick what you're studying",
      body: "Choose from AP and SAT courses. Each one is organized the way the exam is: units, then concepts, then specific topics.",
    },
    {
      n: "02",
      title: "Go down to the exact idea",
      body: "Go from “Calc BC” to “Differentiation” to “Chain Rule” in three clicks, or just search for it. Every topic opens with a two-sentence explanation.",
    },
    {
      n: "03",
      title: "Watch what works",
      body: "Lessons are short and ranked by how many students finish them and find them helpful. Save the good ones and pick up where you left off.",
    },
  ];
  return (
    <section>
      <Container size="xl" className="py-24">
        <div className="max-w-2xl">
          <p className="eyebrow">How it works</p>
          <h2 className="headline mt-3 text-3xl text-ink sm:text-[40px]">Less searching. More learning.</h2>
          <p className="mt-4 text-[16px] leading-relaxed text-muted">
            A search on a general video site returns thousands of results for “chain rule.” Here you get a handful, taught by people who
            know the exam, in the order most likely to help.
          </p>
        </div>
        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="bg-surface p-7">
              <span className="tabular font-mono text-xs text-faint">{s.n}</span>
              <h3 className="mt-6 text-[17px] font-semibold tracking-[-0.01em] text-ink">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function RankingSection({ catalog }: { catalog: IndexedCatalog }) {
  // Find a showcase topic where the most-viewed lesson is *not* the top-ranked one.
  const candidates = ["chain-rule", "related-rates", "champa-rice", "quadratic-forms", "separation-of-variables"];
  let pair: { top: (typeof catalog.videos)[number]; popular: (typeof catalog.videos)[number]; topicId: string } | null = null;
  for (const slug of [...candidates, ...catalog.topics.map((t) => t.slug)]) {
    const vids = catalog.videosForTopic(slug);
    if (vids.length < 2) continue;
    const popular = [...vids].sort((a, b) => b.stats.views - a.stats.views)[0];
    if (popular.id !== vids[0].id && popular.stats.views > vids[0].stats.views * 1.5) {
      pair = { top: vids[0], popular, topicId: slug };
      break;
    }
  }
  const weights = [
    { label: "Completion rate", w: RANKING_WEIGHTS.completion, note: "Did students finish it?" },
    { label: "Helpful votes", w: RANKING_WEIGHTS.helpful, note: "Confidence-adjusted, so 9 of 10 doesn't beat 900 of 1,000" },
    { label: "Saves", w: RANKING_WEIGHTS.saves, note: "Worth coming back to" },
    { label: "Engagement quality", w: RANKING_WEIGHTS.engagement, note: "Rewatches, early drop-off, watch depth" },
    { label: "Views", w: RANKING_WEIGHTS.reach, note: "Reach, weighted lightly" },
  ];
  const topic = pair ? catalog.topic(pair.topicId)! : null;

  return (
    <section className="border-y border-line bg-surface">
      <Container size="xl" className="grid gap-14 py-24 lg:grid-cols-2 lg:gap-20">
        <div>
          <p className="eyebrow">Ranking</p>
          <h2 className="headline mt-3 text-3xl text-ink sm:text-[40px]">
            Ranked by learning,
            <br /> not by views.
          </h2>
          <p className="mt-4 max-w-md text-[16px] leading-relaxed text-muted">
            A video can get a lot of views and still lose students halfway through. Our ranking looks at what happened after people
            pressed play.
          </p>
          <ul className="mt-10 space-y-5">
            {weights.map((x) => (
              <li key={x.label}>
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-sm font-medium text-ink">{x.label}</span>
                  <span className="tabular text-xs text-muted">{Math.round(x.w * 100)}%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-bg-subtle">
                  <div className="h-full rounded-full bg-ink" style={{ width: `${(x.w / 0.35) * 100}%` }} />
                </div>
                <p className="mt-1.5 text-xs text-muted">{x.note}</p>
              </li>
            ))}
          </ul>
          <Link href="/how-ranking-works" className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-ink hover:underline">
            Read the full method <ArrowRight className="size-3.5" />
          </Link>
        </div>
        {pair && topic ? (
          <div className="self-center">
            <p className="mb-4 text-sm text-muted">
              Real example: <span className="font-medium text-ink">{topic.title}</span>
            </p>
            <div className="space-y-3">
              {[
                { v: pair.top, tag: "Ranked #1", tone: "top" as const },
                { v: pair.popular, tag: "Most viewed", tone: "plain" as const },
              ].map(({ v, tag, tone }) => {
                const ed = catalog.educator(v.educatorId)!;
                const course = catalog.course(topic.courseId)!;
                return (
                  <div key={v.id} className={cn("rounded-xl border p-4", tone === "top" ? "border-ink/80 bg-bg shadow-soft" : "border-line bg-bg")}>
                    <div className="flex gap-4">
                      <div className="w-32 shrink-0">
                        <Thumbnail topic={topic} course={course} size="sm" durationSec={v.durationSec} className="rounded-lg" />
                      </div>
                      <div className="min-w-0">
                        <span
                          className={cn(
                            "inline-block rounded px-1.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide",
                            tone === "top" ? "bg-ink text-bg" : "bg-bg-subtle text-muted",
                          )}
                        >
                          {tag}
                        </span>
                        <p className="mt-1.5 line-clamp-2 text-sm font-medium text-ink">{v.title}</p>
                        <p className="text-xs text-muted">{ed.name}</p>
                      </div>
                    </div>
                    <dl className="tabular mt-4 grid grid-cols-4 gap-2 border-t border-line pt-3 text-center">
                      {[
                        ["Views", formatCount(v.stats.views)],
                        ["Finish", `${Math.round(completionRate(v.stats) * 100)}%`],
                        ["Helpful", `${Math.round(helpfulRate(v.stats) * 100)}%`],
                        ["Score", v.rank.score.toFixed(0)],
                      ].map(([k, val]) => (
                        <div key={k}>
                          <dt className="text-[11px] text-muted">{k}</dt>
                          <dd className="mt-0.5 text-sm font-semibold text-ink">{val}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </Container>
    </section>
  );
}

function EducatorSection({ catalog }: { catalog: IndexedCatalog }) {
  const featured = ["sarah-chen", "daniel-reyes", "jordan-kim"].map((h) => catalog.educatorByHandle(h)!).filter(Boolean);
  return (
    <section>
      <Container size="xl" className="py-24">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-xl">
            <p className="eyebrow">Educators</p>
            <h2 className="headline mt-3 text-3xl text-ink sm:text-[40px]">Taught by people who grade the exam.</h2>
            <p className="mt-4 text-[16px] leading-relaxed text-muted">
              Every lesson comes from an experienced teacher. If one of them clicks for you, you can book them for one-on-one tutoring.
            </p>
          </div>
          <Link href="/educators" className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-ink hover:underline">
            Meet all educators <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {featured.map((e) => (
            <Link
              key={e.id}
              href={`/educators/${e.handle}`}
              className="group flex flex-col rounded-2xl border border-line bg-surface p-6 transition-shadow hover:shadow-soft"
            >
              <div className="flex items-center gap-3">
                <Avatar name={e.name} hue={e.hue} size={44} />
                <div className="min-w-0">
                  <p className="font-medium text-ink">{e.name}</p>
                  <p className="truncate text-[13px] text-muted">{e.subjects.slice(0, 2).join(" · ")}</p>
                </div>
              </div>
              <p className="mt-5 flex-1 text-[15px] leading-relaxed text-ink-2">“{e.headline}.”</p>
              <div className="tabular mt-6 flex items-center justify-between border-t border-line pt-4 text-[13px] text-muted">
                <Stars rating={e.rating} className="text-ink-2" />
                <span>{e.credentials[1] ?? e.credentials[0]}</span>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-2xl border border-line bg-bg-subtle p-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <Avatar name="Sarah Chen" hue={232} size={36} />
            <p className="text-[15px] text-ink">
              <span className="font-medium">Liked this lesson? Learn with Sarah.</span>{" "}
              <span className="text-muted">This is how tutoring shows up: once, after the lesson, and never before it.</span>
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

function FinalCta() {
  return (
    <section>
      <Container size="xl">
        <div className="relative overflow-hidden rounded-3xl bg-ink px-8 py-16 text-center sm:py-20">
          <h2 className="display text-4xl text-bg sm:text-5xl">
            Study the <span className="font-serif font-normal italic">right</span> thing tonight.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[15px] text-bg/60">
            Set up takes a minute. Tell us your courses and exam date, and your first lesson is ready.
          </p>
          <LinkButton href="/signup" size="lg" variant="secondary" className="mt-8 border-transparent">
            Start your free month <ArrowRight className="size-4" />
          </LinkButton>
        </div>
      </Container>
    </section>
  );
}
