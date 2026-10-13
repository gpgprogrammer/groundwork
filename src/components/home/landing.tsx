import { ArrowRight, BookOpenCheck, CalendarCheck, CalendarClock, GraduationCap, HeartHandshake, MonitorPlay, Presentation, Sparkles, Target, Users } from "lucide-react";
import Link from "next/link";
import { CalendarBenefits } from "@/components/calendar-benefits";
import { CALENDAR_SYSTEMS } from "@/components/calendar-nudge";
import { CourseIcon, courseColors } from "@/components/course-icon";
import { FunnelLink } from "@/components/landing/funnel-link";
import { Faq } from "@/components/marketing";
import { formatDuration } from "@/components/ui";
import type { IndexedCatalog } from "@/lib/catalog";
import { readiness } from "@/lib/sprint";
import { CATEGORIES } from "@/lib/types";
import { CalendarHeroVisual } from "./calendar-hero";
import { CourseFinder } from "./course-finder";
import { PAID_PLANS } from "@/lib/billing/plans";
import { LessonLink } from "@/components/lesson-player";
import { CalendarTry } from "@/components/calendar-try";

const QUIZ = { course: "ap-biology", topic: "cellular-respiration" };
const POPULAR = ["ap-calculus-ab", "ap-biology", "ap-us-history", "sat-math", "ap-psychology", "ap-chemistry"];
const AI_PROMPTS = ["Explain the chain rule like I'm new to it", "Quiz me on the causes of World War I", "What's on the AP Biology exam?"];

/** The signed-out front page: what Merit is, whether it has your course, and how to start. */
export function Landing({ catalog }: { catalog: IndexedCatalog }) {
  const lessonCount = `${(Math.floor(catalog.videos.length / 1000) * 1000).toLocaleString("en-US")}+`;
  const apCount = catalog.courses.filter((c) => c.exam === "AP").length;
  const classCount = catalog.courses.filter((c) => c.exam === "Class").length;

  // Real output of Merit's readiness engine, run on the built-in sample student.
  const quizCourse = catalog.course(QUIZ.course);
  const quizTopic = quizCourse ? (catalog.topicIn(quizCourse.id, QUIZ.topic) ?? catalog.topicsForCourse(quizCourse.id)[0]) : undefined;
  const quizLessons = quizTopic ? catalog.videosForTopic(quizTopic.id).filter((v) => !v.isShort).slice(0, 2) : [];
  const bio = catalog.course("ap-biology");
  const example = bio
    ? readiness(catalog, {
        id: "x",
        userId: "x",
        courseId: bio.id,
        examDate: "2099-01-01",
        minutesPerDay: 45,
        createdAt: "",
        unlocked: true,
        answers: [],
        done: {},
        frq: [],
        confidence: Object.fromEntries(catalog.unitsForCourse(bio.id).map((u, i) => [u.id, [4, 3, 2, 4, 1, 3, 2, 5][i % 8]])),
      }).slice(0, 4)
    : [];
  const thumbs = catalog.videos.filter((v) => !v.isShort && v.courseId === "ap-us-history").slice(0, 4);

  const finder = catalog.courses.map((c) => ({ id: c.id, slug: c.slug, title: c.title, shortTitle: c.shortTitle, category: c.category }));
  const groups = CATEGORIES.map((g) => ({ g, items: catalog.courses.filter((c) => c.category === g) })).filter((x) => x.items.length);

  return (
    <div className="overflow-x-clip">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#3b82f6,#1d4ed8)] text-white">
        <div aria-hidden className="pointer-events-none absolute -left-32 -top-32 size-[440px] rounded-full border-[60px] border-white/[0.07]" />
        <div aria-hidden className="pointer-events-none absolute -bottom-48 right-1/4 size-[420px] rounded-full border-[56px] border-white/[0.06]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 sm:pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:px-8 lg:pb-24 lg:pt-20 grid-cols-[minmax(0,1fr)]">
          <div className="min-w-0">
            <p className="rise inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 font-brand text-[14px] font-extrabold ring-1 ring-inset ring-white/25">
              <CalendarClock className="size-4" /> Works with {CALENDAR_SYSTEMS.slice(0, 3).join(", ")}, and more
            </p>
            <h1 className="rise display mt-5 text-[46px] sm:text-6xl lg:text-[68px]" style={{ ["--i" as string]: 1 }}>
              Understand what you&apos;re studying tonight.
            </h1>
            <p className="rise mt-5 max-w-lg text-[18px] leading-relaxed text-white/90" style={{ ["--i" as string]: 2 }}>
              <span className="font-brand font-extrabold text-white">Connect your class calendar and Merit preps you for every quiz before it happens.</span> Lessons for high school classes, every AP course, and the SAT. Free for students.
            </p>
            <div className="rise mt-8 flex flex-wrap items-center gap-3" style={{ ["--i" as string]: 3 }}>
              <FunnelLink
                href="/signup?as=student&next=%2Fschedule"
                funnel="hero-calendar"
                className="press inline-flex h-14 items-center gap-2 rounded-2xl bg-white px-7 font-brand text-[17px] font-extrabold text-[#15803d] [--ledge:rgb(0_0_0/0.22)] hover:brightness-95"
              >
                <CalendarClock className="size-5" /> Connect my calendar
              </FunnelLink>
              <a href="#calendar" className="px-2 font-brand text-[15.5px] font-extrabold text-white/90 hover:text-white">
                How it works
              </a>
            </div>
            <div className="rise mt-8 text-ink" style={{ ["--i" as string]: 4 }}>
              <p className="mb-2 font-brand text-[14px] font-extrabold text-white/85">Or find your course</p>
              <CourseFinder courses={finder} popular={POPULAR} />
            </div>
          </div>

          <div className="rise relative min-w-0 lg:pl-4" style={{ ["--i" as string]: 2 }}>
            <CalendarHeroVisual catalog={catalog} />
          </div>
        </div>
      </section>

      {/* Calendar sync, step by step: the hero's promise, explained */}
      <section id="calendar" className="scroll-mt-24 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--positive)_10%,var(--bg)),var(--bg))]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] grid-cols-[minmax(0,1fr)]">
            <div className="min-w-0">
              <p className="inline-flex items-center gap-2 rounded-full bg-positive px-3.5 py-1.5 font-brand text-[14px] font-extrabold text-white">
                <CalendarClock className="size-4" /> Calendar sync
              </p>
              <h2 className="display mt-4 text-[36px] text-ink sm:text-5xl">Connect your school calendar. Merit does the rest.</h2>
              <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-muted">
                Merit reads every quiz and test on your class calendar and lines up lessons for each one, days before it&apos;s due. No more guessing what to study.
              </p>
              <ol className="mt-7 space-y-3">
                {[
                  { title: "Copy your calendar link", body: `From ${CALENDAR_SYSTEMS.slice(0, 4).join(", ")}, or any school calendar.` },
                  { title: "Paste it into Merit", body: "Or upload the file. It takes about a minute, and it keeps itself up to date." },
                  { title: "Every quiz gets its lessons", body: "They show up on your home page, in your feed, and in your learning plan." },
                ].map((s, i) => (
                  <li key={s.title} className="flex gap-4 rounded-2xl bg-surface p-4 ring-2 ring-line">
                    <span className="tabular flex size-10 shrink-0 items-center justify-center rounded-xl bg-positive font-brand text-[18px] font-black text-white">{i + 1}</span>
                    <span className="min-w-0">
                      <span className="block font-brand text-[16.5px] font-extrabold text-ink">{s.title}</span>
                      <span className="block text-[14px] leading-relaxed text-muted">{s.body}</span>
                    </span>
                  </li>
                ))}
              </ol>
              <div className="mt-7 flex flex-wrap items-center gap-4">
                <FunnelLink
                  href="/signup?as=student&next=%2Fschedule"
                  funnel="calendar-signup"
                  className="press inline-flex h-14 items-center gap-2 rounded-2xl bg-positive px-7 font-brand text-[17px] font-extrabold text-white [--ledge:var(--positive-press)] hover:brightness-110"
                >
                  Connect my calendar <ArrowRight className="size-5" />
                </FunnelLink>
                <p className="max-w-xs text-[13px] leading-relaxed text-muted">{PAID_PLANS ? "Part of Merit Plus (try it free) or Exam Sprint." : "Free with your account."}</p>
              </div>
            </div>
            {quizCourse && quizTopic && quizLessons.length ? (
              <div className="relative min-w-0 lg:pl-6">
                <div aria-hidden className="absolute -left-2 top-8 hidden h-[85%] w-[92%] rotate-[-4deg] rounded-[28px] bg-positive/15 lg:block" />
                <div className="relative rounded-[28px] bg-surface p-5 shadow-[0_8px_0_0_var(--line)] ring-2 ring-line sm:p-6">
                  <p className="flex items-center justify-between font-brand text-[13px] font-extrabold text-muted">
                    On your calendar · Friday <span className="rounded-full bg-bg-subtle px-2.5 py-0.5 text-[11.5px]">Sample</span>
                  </p>
                  <p className="mt-2 flex items-center gap-2.5 font-brand text-[19px] font-black leading-snug text-ink">
                    <CourseIcon id={quizCourse.id} size={32} /> {quizCourse.shortTitle} quiz: {quizTopic.title}
                    <span className="rounded-md bg-danger-soft px-1.5 py-0.5 text-[11px] font-black uppercase text-danger">Test</span>
                  </p>
                  <p className="mt-5 font-brand text-[13px] font-extrabold text-muted">Merit lined up these lessons</p>
                  <ul className="mt-2 space-y-2">
                    {quizLessons.map((v) => (
                      <li key={v.id}>
                        <LessonLink v={{ id: v.id, title: v.title, channelTitle: v.channelTitle }} className="group flex items-center gap-3 rounded-2xl p-1.5 transition-colors hover:bg-bg-subtle">
                          <span className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-xl bg-bg-subtle">
                            <img src={v.thumbnail} alt="" loading="lazy" referrerPolicy="no-referrer" className="absolute inset-0 size-full object-cover" />
                            <span className="tabular absolute bottom-1 right-1 rounded-md bg-black/75 px-1 text-[10.5px] font-bold text-white">{formatDuration(v.durationSec)}</span>
                          </span>
                          <span className="min-w-0">
                            <span className="line-clamp-2 text-[14px] font-bold leading-snug text-ink group-hover:underline">{v.title}</span>
                            <span className="mt-0.5 block truncate text-[12.5px] text-muted">{v.channelTitle}</span>
                          </span>
                        </LessonLink>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex flex-wrap gap-2 border-t-2 border-line pt-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-positive-soft px-3 py-1.5 font-brand text-[12.5px] font-extrabold text-positive">
                      <CalendarCheck className="size-3.5" /> In your learning plan
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-sprint-soft px-3 py-1.5 font-brand text-[12.5px] font-extrabold text-sprint-ink">
                      <Target className="size-3.5" /> One click to an Exam Sprint
                    </span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
          <CalendarTry className="mt-12 max-w-3xl" />
          <h3 className="headline mt-16 text-[26px] text-ink">What connecting your calendar does</h3>
          <CalendarBenefits className="mt-5" />
        </div>
      </section>

      {/* Does it support my course? */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="max-w-2xl">
          <h2 className="display text-[36px] text-ink sm:text-5xl">Your classes, every AP course, and the SAT.</h2>
          <p className="mt-4 text-[17px] leading-relaxed text-muted">
            <span className="tabular font-bold text-ink">{classCount}</span> high school and honors classes, <span className="tabular font-bold text-ink">{apCount}</span> AP courses, and SAT Math and Reading and Writing, organized the way they&apos;re taught:{" "}
            <span className="tabular font-bold text-ink">{catalog.units.length.toLocaleString()}</span> units, <span className="tabular font-bold text-ink">{catalog.topics.length.toLocaleString()}</span> topics, and{" "}
            <span className="tabular font-bold text-ink">{lessonCount}</span> lessons.
          </p>
        </div>
        <div className="mt-10 space-y-8">
          {groups.map(({ g, items }) => (
            <div key={g}>
              <p className="font-brand text-[15px] font-extrabold text-muted">{g}</p>
              <ul className="mt-3 flex flex-wrap gap-2.5">
                {items.map((c) => {
                  const { from, to } = courseColors(c.id);
                  return (
                    <li key={c.id}>
                      <Link
                        href={`/courses/${c.slug}`}
                        style={{ ["--c" as string]: from, ["--c2" as string]: to }}
                        className="press flex h-12 items-center gap-2.5 rounded-2xl bg-surface pl-1.5 pr-4 font-brand text-[14.5px] font-extrabold text-ink ring-2 ring-inset ring-line [--ledge:var(--line)] hover:bg-[color-mix(in_oklab,var(--c)_10%,var(--surface))] hover:ring-[color-mix(in_oklab,var(--c)_45%,var(--line))]"
                      >
                        <CourseIcon id={c.id} size={36} />
                        {c.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* How Merit helps: one color block per part of Merit */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28">
        <h2 className="display max-w-2xl text-[36px] text-ink sm:text-5xl">Learn it, get unstuck, and walk in ready.</h2>
        <div className="mt-10 grid gap-5 lg:grid-cols-12">
          <article className="relative flex flex-col justify-between gap-8 overflow-hidden rounded-[28px] bg-[#2563eb] p-6 text-white shadow-[0_6px_0_0_#1a45b5] sm:p-8 lg:col-span-7">
            <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 size-60 rounded-full border-[32px] border-white/10" />
            <div className="relative">
              <BookOpenCheck className="size-8" />
              <h3 className="display mt-4 text-[30px]">A ranked lesson for every topic.</h3>
              <p className="mt-2 max-w-md text-[16px] leading-relaxed text-white/90">
                Lessons from the teachers students already trust, sorted into the exact topic they teach and ranked by how well they teach it.
              </p>
            </div>
            {thumbs.length ? (
              <div className="relative grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {thumbs.map((v) => (
                  <LessonLink v={{ id: v.id, title: v.title, channelTitle: v.channelTitle }} key={v.id} className="group block rounded-2xl bg-white/15 p-1.5 ring-1 ring-inset ring-white/25">
                    <span className="relative block aspect-video overflow-hidden rounded-xl bg-white/10">
                      <img src={v.thumbnail} alt="" loading="lazy" referrerPolicy="no-referrer" className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]" />
                    </span>
                    <span className="mt-1.5 line-clamp-2 px-0.5 text-[12px] font-bold leading-snug">{v.title}</span>
                  </LessonLink>
                ))}
              </div>
            ) : null}
            <FunnelLink href="/lessons" funnel="bento-lessons" className="press relative inline-flex h-11 w-fit items-center gap-2 rounded-2xl bg-white px-5 font-brand text-[15px] font-extrabold text-[#1d4ed8] [--ledge:rgb(0_0_0/0.22)]">
              See the lessons <ArrowRight className="size-4" />
            </FunnelLink>
          </article>

          <article className="relative flex flex-col justify-between gap-8 overflow-hidden rounded-[28px] bg-[#db2777] p-6 text-white shadow-[0_6px_0_0_#9d174d] sm:p-8 lg:col-span-5">
            <div aria-hidden className="pointer-events-none absolute -bottom-20 -right-20 size-64 rounded-full border-[36px] border-white/10" />
            <div className="relative">
              <Sparkles className="size-8" />
              <h3 className="display mt-4 text-[30px]">Stuck at 11pm? Ask Merit AI.</h3>
              <p className="mt-2 text-[16px] leading-relaxed text-white/90">Explanations, practice questions, and the right lesson for any topic in your classes, AP courses, or the SAT.</p>
            </div>
            <ul className="relative space-y-2">
              {AI_PROMPTS.map((p) => (
                <li key={p} className="rounded-2xl bg-white/15 px-4 py-3 text-[14.5px] font-bold ring-1 ring-inset ring-white/25">
                  {p}
                </li>
              ))}
            </ul>
            <Link href="/ask" className="press relative inline-flex h-11 w-fit items-center gap-2 rounded-2xl bg-white px-5 font-brand text-[15px] font-extrabold text-[#be185d] [--ledge:rgb(0_0_0/0.22)]">
              Try Merit AI free <ArrowRight className="size-4" />
            </Link>
          </article>

          <article className="relative flex flex-col justify-between gap-8 overflow-hidden rounded-[28px] bg-sprint p-6 text-white shadow-[0_6px_0_0_var(--sprint-press)] sm:p-8 lg:col-span-12">
            <div aria-hidden className="pointer-events-none absolute -bottom-20 -right-16 size-64 rounded-full border-[36px] border-white/10" />
            <div className="relative">
              <Target className="size-8" />
              <h3 className="display mt-4 text-[30px]">Your exam, planned day by day.</h3>
              <p className="mt-2 max-w-md text-[16px] leading-relaxed text-white/90">
                Exam Sprint starts with a free 10-minute diagnostic, then tells you exactly what to watch and practice each day until test day.
              </p>
            </div>
            {example.length ? (
              <div className="relative rounded-2xl bg-white p-4 text-[#0f1729] sm:p-5 lg:max-w-2xl">
                <p className="mb-3 flex items-center justify-between font-brand text-[13px] font-extrabold">
                  AP Biology readiness <span className="text-[#5b6475]">Sample</span>
                </p>
                <ul className="space-y-2.5">
                  {example.map((u) => (
                    <li key={u.unit.id} className="flex items-center gap-3 text-[13px]">
                      <span className="w-36 truncate font-semibold text-[#334155] sm:w-44">
                        <span className="tabular mr-1.5 text-[#8a93a3]">{u.unit.order}</span>
                        {u.unit.title}
                      </span>
                      <span className="h-3 flex-1 overflow-hidden rounded-full bg-[#f2f4f7]">
                        <span className="block h-full rounded-full bg-[#c94b16]" style={{ width: `${Math.round(u.score * 100)}%` }} />
                      </span>
                      <span className="tabular w-10 text-right font-brand font-black">{Math.round(u.score * 100)}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <Link href="/sprint" className="press relative inline-flex h-11 w-fit items-center gap-2 rounded-2xl bg-white px-5 font-brand text-[15px] font-extrabold text-[#93350c] [--ledge:rgb(0_0_0/0.22)]">
              Take the free diagnostic <ArrowRight className="size-4" />
            </Link>
          </article>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Link href="/tutors" className="press group flex items-center gap-4 rounded-[28px] bg-[#7c3aed] p-5 text-white [--ledge:#5b21b6] sm:p-6">
            <Users className="size-8 shrink-0" />
            <span className="min-w-0 flex-1">
              <span className="block font-brand text-[18px] font-black">Real tutors, when you want a person</span>
              <span className="block text-[14px] text-white/85">Trusted tutoring services and free teachers for your exact course.</span>
            </span>
            <ArrowRight className="size-5 shrink-0 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link href="/videos" className="press group flex items-center gap-4 rounded-[28px] bg-surface p-5 ring-2 ring-line [--ledge:var(--line)] sm:p-6">
            <MonitorPlay className="size-8 shrink-0 text-accent-ink" />
            <span className="min-w-0 flex-1">
              <span className="block font-brand text-[18px] font-black text-ink">Merit Tutors&apos; Videos</span>
              <span className="block text-[14px] text-muted">Lessons recorded by the tutors and teachers on Merit, only on Merit.</span>
            </span>
            <ArrowRight className="size-5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

      </section>

      {/* How to start */}
      <section className="border-y-2 border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <h2 className="display text-[36px] text-ink sm:text-5xl">Start in about a minute.</h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-3 md:gap-6">
            {[
              { color: "#2563eb", ledge: "#1a45b5", title: "Pick your courses", body: "Choose what you're taking this year. Merit organizes everything around them." },
              { color: "#15803d", ledge: "#0f5c2b", title: "Connect your calendar", body: "Optional. Paste your school calendar and every quiz and test gets the right lessons." },
              { color: "#c94b16", ledge: "#93350c", title: "Watch your learning plan", body: "Open Merit after school and see lessons for exactly what you're covering in class." },
            ].map((s, i) => (
              <li key={s.title} className="relative">
                <span className="tabular flex size-14 items-center justify-center rounded-2xl font-brand text-[26px] font-black text-white" style={{ background: s.color, boxShadow: `0 4px 0 0 ${s.ledge}` }}>
                  {i + 1}
                </span>
                <p className="mt-5 font-brand text-[20px] font-black text-ink">{s.title}</p>
                <p className="mt-1 max-w-xs text-[15px] leading-relaxed text-muted">{s.body}</p>
                {i < 2 ? <span aria-hidden className="absolute left-20 right-4 top-7 hidden h-1 rounded-full bg-line md:block" /> : null}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Who it's for */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <h2 className="display text-[36px] text-ink sm:text-5xl">Made for everyone behind a score.</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            { key: "student", Icon: GraduationCap, tint: "bg-accent-soft text-accent-ink", title: "Students", body: "Ranked lessons for every topic, a plan that follows your class calendar, Merit AI, and Exam Sprints before big tests.", cta: "Create a free account", href: "/signup?as=student" },
            { key: "teacher", Icon: Presentation, tint: "bg-[#f3edff] text-[#6d28d9] dark:bg-[#2a1f45] dark:text-[#c9b5ff]", title: "Teachers and tutors", body: "Publish your own videos and study guides, and get booked for tutoring by students on Merit.", cta: "Create a teacher account", href: "/signup?as=teacher" },
            { key: "parent", Icon: HeartHandshake, tint: "bg-sprint-soft text-sprint-ink", title: "Parents", body: PAID_PLANS ? "Gift Merit Plus or an Exam Sprint, or find a tutor for any class, AP course, or the SAT." : "Everything on Merit is free for your student. When they want a person, find a tutor for any class, AP course, or the SAT.", cta: "Options for parents", href: "/pricing/parents" },
          ].map((f) => (
            <div key={f.key} className="flex flex-col rounded-[28px] bg-surface p-6 ring-2 ring-line sm:p-7">
              <span className={`flex size-14 items-center justify-center rounded-2xl ${f.tint}`}>
                <f.Icon className="size-7" />
              </span>
              <p className="mt-5 font-brand text-[20px] font-black text-ink">{f.title}</p>
              <p className="mt-1.5 flex-1 text-[15px] leading-relaxed text-muted">{f.body}</p>
              <FunnelLink
                href={f.href}
                funnel={`path-${f.key}`}
                className="press mt-6 inline-flex h-11 w-fit items-center gap-2 rounded-2xl bg-surface px-5 font-brand text-[15px] font-extrabold text-ink ring-2 ring-inset ring-line [--ledge:var(--line)] hover:bg-bg-subtle"
              >
                {f.cta} <ArrowRight className="size-4" />
              </FunnelLink>
            </div>
          ))}
        </div>
      </section>

      {/* Questions */}
      <section className="mx-auto max-w-3xl px-4 pb-8 sm:px-6">
        <h2 className="display text-[36px] text-ink">Questions</h2>
        <div className="mt-4">
          <Faq />
        </div>
      </section>

      {/* Final call */}
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,#3b82f6,#1d4ed8)] px-6 py-14 text-center text-white shadow-[0_8px_0_0_#1a45b5] sm:px-12 sm:py-20">
          <div aria-hidden className="pointer-events-none absolute -left-20 -top-20 size-72 rounded-full border-[40px] border-white/[0.08]" />
          <div aria-hidden className="pointer-events-none absolute -bottom-24 -right-16 size-80 rounded-full border-[44px] border-white/[0.08]" />
          <h2 className="display relative text-[38px] sm:text-6xl">Tonight&apos;s homework, understood.</h2>
          <p className="relative mt-3 text-[17px] text-white/85">Free to start, no card needed.</p>
          <FunnelLink
            href="/signup?as=student"
            funnel="footer-student"
            className="press relative mt-8 inline-flex h-14 items-center gap-2 rounded-2xl bg-white px-8 font-brand text-[17px] font-extrabold text-[#1d4ed8] [--ledge:rgb(0_0_0/0.22)] hover:brightness-95"
          >
            Create a free account <ArrowRight className="size-5" />
          </FunnelLink>
        </div>
      </section>
    </div>
  );
}
