import { ArrowRight, BookOpenCheck, CalendarCheck, CalendarClock, GraduationCap, HeartHandshake, MonitorPlay, Presentation, Sparkles, Target, Users } from "lucide-react";
import Link from "next/link";
import { CourseIcon, courseColors } from "@/components/course-icon";
import { FunnelLink } from "@/components/landing/funnel-link";
import { Faq } from "@/components/marketing";
import { formatDuration } from "@/components/ui";
import type { IndexedCatalog } from "@/lib/catalog";
import { buildPlan, DEFAULT_PREFS } from "@/lib/plan";
import { sampleState } from "@/lib/sample";
import { readiness } from "@/lib/sprint";
import { CATEGORIES } from "@/lib/types";
import { CourseFinder } from "./course-finder";

const EXAMPLE = { course: "ap-calculus-bc", topic: "chain-rule" };
const QUIZ = { course: "ap-biology", topic: "cellular-respiration" };
const POPULAR = ["ap-calculus-ab", "ap-biology", "ap-us-history", "sat-math", "ap-psychology", "ap-chemistry"];
const AI_PROMPTS = ["Explain the chain rule like I'm new to it", "Quiz me on the causes of World War I", "What's on the AP Biology exam?"];

/** The signed-out front page: what Merit is, whether it has your course, and how to start. */
export function Landing({ catalog }: { catalog: IndexedCatalog }) {
  const course = catalog.course(EXAMPLE.course);
  const topic = course ? catalog.topicIn(course.id, EXAMPLE.topic) : undefined;
  const lessons = topic ? catalog.videosForTopic(topic.id).filter((v) => !v.isShort).slice(0, 3) : [];
  const lessonCount = `${(Math.floor(catalog.videos.length / 1000) * 1000).toLocaleString("en-US")}+`;
  const apCount = catalog.courses.filter((c) => c.exam === "AP").length;

  // Real output of Merit's planner and readiness engine, run on the built-in sample student.
  const sample = buildPlan(catalog, sampleState(catalog), DEFAULT_PREFS, 1)[0];
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
  const floating = ["ap-biology", "ap-us-history", "sat-math", "ap-psychology", "ap-chemistry", "ap-spanish-language"].filter((id) => catalog.course(id));
  const spots: React.CSSProperties[] = [
    { left: "-6%", top: "8%", rotate: "-8deg" },
    { right: "-5%", top: "-6%", rotate: "6deg" },
    { right: "-8%", top: "44%", rotate: "10deg" },
    { left: "-9%", bottom: "30%", rotate: "-6deg" },
    { right: "8%", bottom: "-7%", rotate: "4deg" },
    { left: "22%", top: "-9%", rotate: "-4deg" },
  ];

  return (
    <div className="overflow-x-clip">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#3b82f6,#1d4ed8)] text-white">
        <div aria-hidden className="pointer-events-none absolute -left-32 -top-32 size-[440px] rounded-full border-[60px] border-white/[0.07]" />
        <div aria-hidden className="pointer-events-none absolute -bottom-48 right-1/4 size-[420px] rounded-full border-[56px] border-white/[0.06]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 sm:pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:px-8 lg:pb-24 lg:pt-20 grid-cols-[minmax(0,1fr)]">
          <div className="min-w-0">
            <p className="rise inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 font-brand text-[14px] font-extrabold ring-1 ring-inset ring-white/25">
              <GraduationCap className="size-4" /> Every AP course and the SAT
            </p>
            <h1 className="rise display mt-5 text-[46px] sm:text-6xl lg:text-[68px]" style={{ ["--i" as string]: 1 }}>
              Understand what you&apos;re studying tonight.
            </h1>
            <p className="rise mt-5 max-w-lg text-[18px] leading-relaxed text-white/90" style={{ ["--i" as string]: 2 }}>
              The best lesson for every topic, Merit AI when you&apos;re stuck, and a plan for every test. Free to start.
            </p>
            <div className="rise mt-8 text-ink" style={{ ["--i" as string]: 3 }}>
              <CourseFinder courses={finder} popular={POPULAR} />
            </div>
            <div className="rise mt-5 flex flex-wrap items-center gap-3" style={{ ["--i" as string]: 4 }}>
              <FunnelLink
                href="/signup?as=student"
                funnel="hero-student"
                className="press inline-flex h-12 items-center gap-2 rounded-2xl bg-white px-6 font-brand text-[16px] font-extrabold text-[#1d4ed8] [--ledge:rgb(0_0_0/0.22)] hover:brightness-95"
              >
                Create a free account
              </FunnelLink>
              <FunnelLink
                href="/lessons"
                funnel="hero-explore"
                className="press inline-flex h-12 items-center gap-2 rounded-2xl bg-white/15 px-6 font-brand text-[16px] font-extrabold text-white ring-2 ring-inset ring-white/30 [--ledge:rgb(0_0_0/0.18)] hover:bg-white/25"
              >
                Browse lessons <ArrowRight className="size-4" />
              </FunnelLink>
            </div>
          </div>

          {course && topic && lessons.length ? (
            <div className="rise relative lg:pl-4" style={{ ["--i" as string]: 2 }}>
              {floating.map((id, i) => (
                <span key={id} aria-hidden className="absolute hidden rounded-2xl bg-white/20 p-1 ring-2 ring-white/30 lg:block" style={spots[i]}>
                  <CourseIcon id={id} size={44} />
                </span>
              ))}
              <div className="relative rounded-[28px] bg-surface p-5 text-ink shadow-[0_8px_0_0_rgb(0_0_0/0.18)] ring-2 ring-white/40 sm:p-6">
                <Link href={`/courses/${course.slug}/${topic.slug}`} className="group flex items-center gap-3">
                  <CourseIcon id={course.id} size={44} />
                  <span className="min-w-0">
                    <span className="block font-brand text-[13px] font-extrabold text-muted">{course.title}</span>
                    <span className="block font-brand text-[22px] font-black leading-tight text-ink group-hover:underline">{topic.title}</span>
                  </span>
                </Link>
                <p className="mt-4 font-brand text-[13.5px] font-extrabold text-muted">The top lessons, ranked by how well they teach</p>
                <ol className="mt-3 space-y-2">
                  {lessons.map((v, i) => (
                    <li key={v.id}>
                      <a href={`/go/${v.id}`} target="_blank" rel="noopener" className="group flex items-center gap-3 rounded-2xl p-1.5 ring-2 ring-transparent transition-colors hover:bg-bg-subtle hover:ring-line">
                        <span className="tabular flex size-7 shrink-0 items-center justify-center rounded-full bg-[#2563eb] font-brand text-[13px] font-black text-white">{i + 1}</span>
                        <span className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-xl bg-bg-subtle sm:w-28">
                          <img src={v.thumbnail} alt="" referrerPolicy="no-referrer" fetchPriority={i === 0 ? "high" : "auto"} className="absolute inset-0 size-full object-cover" />
                          <span className="tabular absolute bottom-1 right-1 rounded-md bg-black/75 px-1 text-[10.5px] font-bold text-white">{formatDuration(v.durationSec)}</span>
                        </span>
                        <span className="min-w-0">
                          <span className="line-clamp-2 text-[14px] font-bold leading-snug text-ink">{v.title}</span>
                          <span className="mt-0.5 block truncate text-[12.5px] text-muted">{v.channelTitle}</span>
                        </span>
                      </a>
                    </li>
                  ))}
                </ol>
                {sample.tasks[0] ? (
                  <div className="mt-4 flex items-center gap-3 rounded-2xl bg-positive-soft p-3">
                    <CalendarCheck className="size-5 shrink-0 text-positive" />
                    <span className="min-w-0 flex-1 text-[13px] text-ink-2">
                      <span className="font-brand font-extrabold text-ink">Tonight&apos;s plan:</span> {sample.tasks[0].topic.title}, {sample.tasks[0].minutes} min
                    </span>
                    <span className="shrink-0 font-brand text-[11.5px] font-extrabold text-muted">Example</span>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* Does it support my course? */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="max-w-2xl">
          <h2 className="display text-[36px] text-ink sm:text-5xl">Every AP course and the SAT.</h2>
          <p className="mt-4 text-[17px] leading-relaxed text-muted">
            <span className="tabular font-bold text-ink">{apCount}</span> AP courses plus SAT Math and Reading and Writing, organized the way the exam is:{" "}
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
              <h3 className="display mt-4 text-[30px]">The best lesson for every topic.</h3>
              <p className="mt-2 max-w-md text-[16px] leading-relaxed text-white/90">
                Lessons from the teachers students already trust, sorted into the exact topic they teach and ranked by what Merit students find helpful.
              </p>
            </div>
            {thumbs.length ? (
              <div className="relative grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {thumbs.map((v) => (
                  <a key={v.id} href={`/go/${v.id}`} target="_blank" rel="noopener" className="group block rounded-2xl bg-white/15 p-1.5 ring-1 ring-inset ring-white/25">
                    <span className="relative block aspect-video overflow-hidden rounded-xl bg-white/10">
                      <img src={v.thumbnail} alt="" loading="lazy" referrerPolicy="no-referrer" className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]" />
                    </span>
                    <span className="mt-1.5 line-clamp-2 px-0.5 text-[12px] font-bold leading-snug">{v.title}</span>
                  </a>
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
              <p className="mt-2 text-[16px] leading-relaxed text-white/90">Explanations, practice questions, and the right lesson for any AP or SAT topic.</p>
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

          <article id="calendar" className="relative flex scroll-mt-24 flex-col justify-between gap-8 overflow-hidden rounded-[28px] bg-positive p-6 text-white shadow-[0_6px_0_0_var(--positive-press)] sm:p-8 lg:col-span-5">
            <div aria-hidden className="pointer-events-none absolute -left-16 -top-16 size-56 rounded-full border-[30px] border-white/10" />
            <div className="relative">
              <CalendarClock className="size-8" />
              <h3 className="display mt-4 text-[30px]">Merit works around your classes.</h3>
              <p className="mt-2 text-[16px] leading-relaxed text-white/90">Connect your school calendar once and every quiz gets its lessons, days before it&apos;s due.</p>
            </div>
            {quizCourse && quizTopic && quizLessons.length ? (
              <div className="relative rounded-2xl bg-white p-4 text-[#0f1729]">
                <p className="flex items-center justify-between font-brand text-[12.5px] font-extrabold text-[#5b6475]">
                  On your calendar · Friday <span>Example</span>
                </p>
                <p className="mt-1.5 flex items-center gap-2 font-brand text-[15.5px] font-extrabold">
                  <CourseIcon id={quizCourse.id} size={26} /> {quizCourse.shortTitle} quiz: {quizTopic.title}
                </p>
                <ul className="mt-3 space-y-2">
                  {quizLessons.map((v) => (
                    <li key={v.id} className="flex items-center gap-2.5">
                      <span className="relative aspect-video w-20 shrink-0 overflow-hidden rounded-lg bg-[#f2f4f7]">
                        <img src={v.thumbnail} alt="" loading="lazy" referrerPolicy="no-referrer" className="absolute inset-0 size-full object-cover" />
                      </span>
                      <span className="line-clamp-2 text-[12.5px] font-bold leading-snug text-[#334155]">{v.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <Link href="/schedule" className="press relative inline-flex h-11 w-fit items-center gap-2 rounded-2xl bg-white px-5 font-brand text-[15px] font-extrabold text-[#15803d] [--ledge:rgb(0_0_0/0.2)]">
              How calendar sync works <ArrowRight className="size-4" />
            </Link>
          </article>

          <article className="relative flex flex-col justify-between gap-8 overflow-hidden rounded-[28px] bg-sprint p-6 text-white shadow-[0_6px_0_0_var(--sprint-press)] sm:p-8 lg:col-span-7">
            <div aria-hidden className="pointer-events-none absolute -bottom-20 -right-16 size-64 rounded-full border-[36px] border-white/10" />
            <div className="relative">
              <Target className="size-8" />
              <h3 className="display mt-4 text-[30px]">Your exam, planned day by day.</h3>
              <p className="mt-2 max-w-md text-[16px] leading-relaxed text-white/90">
                Exam Sprint starts with a free 10-minute diagnostic, then tells you exactly what to watch and practice each day until test day.
              </p>
            </div>
            {example.length ? (
              <div className="relative rounded-2xl bg-white p-4 text-[#0f1729] sm:p-5">
                <p className="mb-3 flex items-center justify-between font-brand text-[13px] font-extrabold">
                  AP Biology readiness <span className="text-[#5b6475]">Example</span>
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
              <span className="block text-[14px] text-white/85">Book one-on-one help for your exact course, online or nearby.</span>
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
              { color: "#c94b16", ledge: "#93350c", title: "Study tonight's plan", body: "Open Merit after school and see exactly what to watch, sized to the time you have." },
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
            { key: "student", Icon: GraduationCap, tint: "bg-accent-soft text-accent-ink", title: "Students", body: "The best lessons for every topic, tutors when you need one, Merit AI, and Exam Sprints before big tests.", cta: "Create a free account", href: "/signup?as=student" },
            { key: "teacher", Icon: Presentation, tint: "bg-[#f3edff] text-[#6d28d9] dark:bg-[#2a1f45] dark:text-[#c9b5ff]", title: "Teachers and tutors", body: "Publish your own videos and study guides, and get booked for tutoring by students on Merit.", cta: "Create a teacher account", href: "/signup?as=teacher" },
            { key: "parent", Icon: HeartHandshake, tint: "bg-sprint-soft text-sprint-ink", title: "Parents", body: "Gift Merit Plus or an Exam Sprint, or find a tutor for any AP course or the SAT.", cta: "Options for parents", href: "/pricing/parents" },
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
