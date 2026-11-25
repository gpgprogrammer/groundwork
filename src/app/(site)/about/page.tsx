import { ArrowRight, CalendarCheck, GraduationCap, NotebookPen, Sparkles, Target, Users } from "lucide-react";
import { bandCta, bandCtaGhost } from "@/components/learn-band";
import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark, Wordmark } from "@/components/logo";
import { Faq } from "@/components/marketing";
import { IconTile, plural } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";
import { PAID_PLANS, TUTOR_FEE } from "@/lib/billing/plans";
import { CompanyName, Contact, Placeholder } from "@/components/legal";
import { COMPANY, FOUNDER_STORY, SHOW_PLACEHOLDERS } from "@/lib/company";

export const metadata: Metadata = {
  title: "About Merit",
  description: "Merit Learning helps high school students learn math, from Algebra 1 to AP Calculus and SAT Math: ranked lessons, an AI study partner, a learning plan that follows your class calendar, and Exam Sprints. Free for students, funded by tutoring.",
};

export default async function AboutPage() {
  const catalog = await getCatalog();
  const stats = [
    { n: catalog.courses.length, label: "courses" },
    { n: catalog.units.length, label: "units" },
    { n: catalog.topics.length, label: "topics" },
  ];
  return (
    <div className="overflow-x-clip">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#3b82f6,#1d4ed8)] text-white">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-[420px] rounded-full border-[56px] border-white/[0.08]" />
        <div aria-hidden className="pointer-events-none absolute -bottom-40 left-1/3 size-80 rounded-full border-[40px] border-white/[0.06]" />
        <div className="relative mx-auto max-w-6xl px-4 pb-14 pt-10 sm:px-6 sm:pt-16 lg:px-8 lg:pb-20">
          <div className="rise flex items-center gap-3 text-[30px] sm:text-[34px]">
            <LogoMark className="size-12 sm:size-14" />
            <Wordmark tagline onDark />
          </div>
          <h1 className="rise display mt-8 max-w-3xl text-[40px] sm:text-[60px]" style={{ ["--i" as string]: 1 }}>
            Every student deserves a great teacher and a clear plan.
          </h1>
          <p className="rise mt-5 max-w-2xl text-[17px] leading-relaxed text-white/90 sm:text-[18px]" style={{ ["--i" as string]: 2 }}>
            Merit brings together lessons for every topic in high school math, AP math, and SAT Math, ranked by how well they teach, with an AI study partner and a learning plan that follows your class calendar. It&apos;s free for students, and funded by tutoring, never by students.
          </p>
          <div className="rise mt-8 flex flex-wrap items-center gap-3" style={{ ["--i" as string]: 3 }}>
            <Link href="/signup" className={bandCta}>
              Get started free
            </Link>
            <Link href="/courses" className={bandCtaGhost}>
              Browse courses
            </Link>
          </div>
        </div>
      </section>

      {/* What Merit is */}
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-12">
          {/* Courses: the foundation, with real catalog counts */}
          <article className="rise flex flex-col justify-between gap-8 rounded-3xl bg-surface p-6 ring-2 ring-line sm:p-8 lg:col-span-7" style={{ ["--i" as string]: 4 }}>
            <div>
              <IconTile>
                <GraduationCap className="size-5" />
              </IconTile>
              <h2 className="headline mt-5 text-2xl text-ink">{plural(catalog.courses.length, "course")}, every topic</h2>
              <p className="mt-2 max-w-md text-[15px] leading-relaxed text-muted">
                High school and honors math classes, AP math courses, and SAT Math, organized the way they&apos;re taught: {plural(catalog.units.length, "unit")} and {plural(catalog.topics.length, "topic")}, each with the lessons that teach it best.
              </p>
            </div>
            <dl className="grid grid-cols-3 divide-x divide-line rounded-2xl bg-bg-subtle py-4">
              {stats.map((s) => (
                <div key={s.label} className="px-4 text-center">
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="tabular text-[26px] font-bold tracking-tight text-ink sm:text-[30px]">{s.n.toLocaleString("en-US")}</dd>
                  <dd className="text-[12.5px] font-medium text-muted">{s.label}</dd>
                </div>
              ))}
            </dl>
          </article>

          {/* Merit AI */}
          <article className="rise flex flex-col rounded-3xl bg-accent-soft p-6 sm:p-8 lg:col-span-5" style={{ ["--i" as string]: 5 }}>
            <IconTile className="bg-surface">
              <Sparkles className="size-5" />
            </IconTile>
            <h2 className="headline mt-5 text-2xl text-ink">Merit AI</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-2">A study partner that explains, quizzes, and finds the right lesson, grounded in the curriculum and the page you&apos;re on.</p>
            <Link href="/ask" className="group mt-auto inline-flex items-center gap-1 pt-6 text-[14px] font-semibold text-accent-ink">
              Ask Merit AI <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </article>

          {/* Plan */}
          <article className="rise rounded-3xl bg-surface p-6 ring-2 ring-line sm:p-8 lg:col-span-4" style={{ ["--i" as string]: 6 }}>
            <IconTile>
              <CalendarCheck className="size-5" />
            </IconTile>
            <h2 className="headline mt-5 text-xl text-ink">A learning plan for your classes</h2>
            <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{PAID_PLANS ? "Merit Plus follows" : "Your learning plan follows"} what you&apos;re covering in class and picks the best videos for it, with every quiz and test on your calendar lined up ahead of time.</p>
          </article>

          {/* Exam Sprints */}
          <article className="rise rounded-3xl bg-surface p-6 ring-2 ring-line sm:p-8 lg:col-span-4" style={{ ["--i" as string]: 7 }}>
            <IconTile tone="sprint">
              <Target className="size-5" />
            </IconTile>
            <h2 className="headline mt-5 text-xl text-ink">Exam Sprints</h2>
            <p className="mt-2 text-[14.5px] leading-relaxed text-muted">A diagnostic, a day-by-day plan to exam day, unlimited exam-style practice, and a readiness score you can watch climb.</p>
          </article>

          {/* People */}
          <article className="rise rounded-3xl bg-surface p-6 ring-2 ring-line sm:p-8 lg:col-span-4" style={{ ["--i" as string]: 8 }}>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <IconTile tone="neutral">
                  <Users className="size-5" />
                </IconTile>
                <div>
                  <h2 className="font-semibold text-ink">Tutoring help</h2>
                  <p className="mt-1 text-[14px] leading-relaxed text-muted">Book a math tutor, or get an on-call tutor in minutes when something is due tonight.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <IconTile tone="neutral">
                  <NotebookPen className="size-5" />
                </IconTile>
                <div>
                  <h2 className="font-semibold text-ink">Built with teachers</h2>
                  <p className="mt-1 text-[14px] leading-relaxed text-muted">Teachers add the lessons they trust and write study guides for the topics students struggle with.</p>
                </div>
              </li>
            </ul>
          </article>
        </div>
      </section>

      {/* How it's funded, and who's behind it */}
      <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-20 sm:px-6 lg:grid-cols-2 lg:px-8">
        <article className="rounded-3xl bg-surface p-6 ring-2 ring-line sm:p-8">
          <h2 className="headline text-2xl text-ink">Free for students, funded by tutoring</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-2">
            Everything students use on Merit is free: lessons, Merit AI, the learning plan, calendar sync, and Exam Sprint. Merit earns money only from tutoring. {TUTOR_FEE} Nobody can pay to rank higher.
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-2">
            Merit is a company, not a nonprofit. The .org is about the mission: free learning for every student.
          </p>
        </article>
{FOUNDER_STORY || COMPANY.name || COMPANY.email || SHOW_PLACEHOLDERS ? (
        <article className="rounded-3xl bg-surface p-6 ring-2 ring-line sm:p-8">
          <h2 className="headline text-2xl text-ink">Who&apos;s behind Merit</h2>
          {FOUNDER_STORY ? (
            <>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-2">{FOUNDER_STORY.story}</p>
              <p className="mt-3 font-semibold text-ink">
                {FOUNDER_STORY.name}, {FOUNDER_STORY.role}
              </p>
            </>
          ) : (
            <p className="mt-3 text-[15px] leading-relaxed text-ink-2">
              <Placeholder>founder story: who built Merit and why, in a few sentences</Placeholder>
            </p>
          )}
          <p className="mt-4 text-[15px] leading-relaxed text-ink-2">
            Merit Learning is operated by <CompanyName />
            {COMPANY.address ? `, ${COMPANY.address}` : null}. Parents, teachers, and schools can reach us without an account: <Contact />.
          </p>
        </article>
        ) : null}
      </section>

      {/* FAQ */}
      <section className="border-t border-line bg-surface">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_2fr] lg:gap-16 lg:px-8 lg:py-20 grid-cols-[minmax(0,1fr)]">
          <div>
            <h2 className="headline text-3xl text-ink">Questions</h2>
            <p className="mt-3 max-w-xs text-[15px] leading-relaxed text-muted">
              Anything else? See{" "}
              <Link href="/how-ranking-works" className="font-medium text-accent-ink hover:underline">
                how ranking works
              </Link>{" "}
              or{" "}
              <Link href="/pricing" className="font-medium text-accent-ink hover:underline">
                pricing
              </Link>
              .
            </p>
          </div>
          <Faq />
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
          <p className="text-[12.5px] leading-relaxed text-faint">
            Lessons are created by their teachers and channels and play on YouTube. AP® and SAT® are trademarks of the College Board, which is not affiliated with Merit Learning.
          </p>
        </div>
      </section>
    </div>
  );
}
