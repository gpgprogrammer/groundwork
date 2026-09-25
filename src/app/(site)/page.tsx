import { ArrowRight, CalendarCheck, GraduationCap, HeartHandshake, MonitorPlay, Presentation, Sparkles, SquarePlay, Target, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CourseIcon } from "@/components/course-icon";
import { FunnelLink } from "@/components/landing/funnel-link";
import { formatDuration } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = {
  title: { absolute: "Merit Learning: understand what you're studying tonight" },
  description: "The best videos and tutors in the world for every AP course and the SAT, in one place, with Merit AI and a plan for every test. Free to start.",
};

const EXAMPLE = { course: "ap-calculus-bc", topic: "chain-rule" };

/** Home: what Merit is, for everyone. */
export default async function HomePage() {
  const viewer = await getViewer();
  if (viewer && !viewer.state.profile.onboarded && viewer.user.accountType !== "teacher") redirect("/onboarding");
  const catalog = await getCatalog();
  const course = catalog.course(EXAMPLE.course);
  const topic = course ? catalog.topicIn(course.id, EXAMPLE.topic) : undefined;
  const lessons = topic ? catalog.videosForTopic(topic.id).filter((v) => !v.isShort).slice(0, 3) : [];
  const apCount = catalog.courses.filter((c) => c.exam === "AP").length;
  const mine = viewer ? viewer.state.profile.courseIds.map((id) => catalog.course(id)).filter((c) => c !== undefined) : [];
  const shown = mine.length ? mine : [...catalog.courses].sort((a, b) => catalog.videosForCourse(b.id).length - catalog.videosForCourse(a.id).length).slice(0, 12);
  const lessonCount = `${(Math.floor(catalog.videos.length / 1000) * 1000).toLocaleString("en-US")}+`;

  const features = [
    { Icon: SquarePlay, title: "The best lessons", body: `${lessonCount} videos from the world's best teachers, sorted by topic and ranked by how well they teach.`, href: "/lessons" },
    { Icon: Users, title: "Real tutors", body: "Book one-on-one help from tutors for your exact course, online or nearby.", href: "/tutors" },
    { Icon: Sparkles, title: "Merit AI", body: "Stuck at 11pm? Ask anything and get an explanation, practice questions, and the right lesson.", href: "/ask" },
    { Icon: Target, title: "Exam Sprint", body: "A day-by-day plan to exam day with a live readiness score.", href: "/sprint" },
    { Icon: MonitorPlay, title: "Merit tutors' videos", body: "Lessons recorded by the tutors and teachers on Merit, only on Merit.", href: "/videos" },
    { Icon: CalendarCheck, title: "Your class calendar", body: "Connect it once and Merit lines up lessons for every quiz and test.", href: "/schedule" },
  ];

  return (
    <div className="mx-auto max-w-[1100px] px-4 pb-20 pt-10 sm:px-6">
      {/* Hero */}
      <section className="grid items-center gap-10 lg:grid-cols-[1fr_420px]">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-accent">{viewer ? `Welcome back, ${viewer.user.name.split(" ")[0]}` : "Every AP course and the SAT"}</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">Understand what you&apos;re studying tonight.</h1>
          <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-ink-2">
            The best videos and tutors in the world, for every AP course and the SAT, in one place. Plus Merit AI for any question and a plan for every test.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            {viewer ? (
              <>
                <Link href="/lessons" className="inline-flex h-12 items-center gap-2 rounded-full bg-accent px-6 text-[15px] font-semibold text-white hover:brightness-110">
                  Go to my lessons <ArrowRight className="size-4" />
                </Link>
                <Link href="/tutors" className="inline-flex h-12 items-center rounded-full px-6 text-[15px] font-semibold text-ink ring-1 ring-line-strong hover:bg-bg-subtle">
                  Find a tutor
                </Link>
              </>
            ) : (
              <>
                <FunnelLink href="/signup?as=student" funnel="hero-student" className="inline-flex h-12 items-center gap-2 rounded-full bg-accent px-6 text-[15px] font-semibold text-white hover:brightness-110">
                  Create a free account <ArrowRight className="size-4" />
                </FunnelLink>
                <FunnelLink href="/lessons" funnel="hero-explore" className="inline-flex h-12 items-center rounded-full px-6 text-[15px] font-semibold text-ink ring-1 ring-line-strong hover:bg-bg-subtle">
                  Browse lessons
                </FunnelLink>
              </>
            )}
          </div>
          <div className="mt-6 flex flex-wrap gap-2 text-[13px]">
            {[`${lessonCount} lessons`, `${apCount} AP courses + the SAT`, "Tutors for every course", viewer ? null : "Free to start"].filter(Boolean).map((p) => (
              <span key={p} className="tabular rounded-full bg-bg-subtle px-3 py-1 font-medium text-ink-2">
                {p}
              </span>
            ))}
          </div>
        </div>

        {topic && course && lessons.length ? (
          <div className="rounded-2xl p-5 ring-1 ring-line">
            <Link href={`/courses/${course.slug}/${topic.slug}`} className="flex items-center gap-2 text-[15px] font-semibold text-ink hover:underline">
              <CourseIcon id={course.id} size={24} /> {course.shortTitle}: {topic.title}
            </Link>
            <p className="mt-1 text-[13px] text-muted">The top lessons, ranked by how well they teach</p>
            <ul className="mt-4 space-y-3">
              {lessons.map((v) => (
                <li key={v.id} className="flex gap-3">
                  <span className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-lg bg-bg-subtle">
                    <img src={v.thumbnail} alt="" loading="lazy" referrerPolicy="no-referrer" className="absolute inset-0 size-full object-cover" />
                    <span className="tabular absolute bottom-1 right-1 rounded bg-black/80 px-1 text-[11px] font-medium text-white">{formatDuration(v.durationSec)}</span>
                  </span>
                  <span className="min-w-0">
                    <span className="line-clamp-2 text-[14px] font-medium leading-snug text-ink">{v.title}</span>
                    <span className="mt-0.5 block truncate text-[12.5px] text-muted">{v.channelTitle}</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4 text-[13px]">
              <Link href="/ask" className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1.5 font-medium text-accent hover:brightness-95">
                <Sparkles className="size-3.5" /> Ask Merit AI
              </Link>
              <Link href={`/tutors?course=${course.id}`} className="inline-flex items-center gap-1.5 rounded-full bg-bg-subtle px-3 py-1.5 font-medium text-ink hover:bg-line">
                <Users className="size-3.5" /> Find a tutor
              </Link>
            </div>
          </div>
        ) : null}
      </section>

      {/* Everything on Merit */}
      <section className="mt-16">
        <h2 className="text-xl font-bold tracking-tight text-ink">Everything you need, in one place</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Link key={f.title} href={f.href} className="group rounded-2xl p-5 ring-1 ring-line hover:bg-bg-subtle">
              <f.Icon className="size-6 text-accent" />
              <p className="mt-3 font-semibold text-ink group-hover:underline">{f.title}</p>
              <p className="mt-1 text-[14px] leading-relaxed text-muted">{f.body}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Courses */}
      <section className="mt-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-ink">{mine.length ? "Your courses" : "Pick your course"}</h2>
            <p className="mt-1 text-[15px] text-muted">Every AP course and the SAT, unit by unit.</p>
          </div>
          <Link href="/courses" className="shrink-0 rounded-full px-3 py-1.5 text-sm font-medium text-accent hover:bg-accent-soft">
            All courses
          </Link>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((c) => (
            <Link key={c.id} href={`/courses/${c.slug}`} className="flex items-center gap-3 rounded-xl bg-bg-subtle px-3 py-2.5 hover:bg-line">
              <CourseIcon id={c.id} size={36} />
              <span className="min-w-0 truncate text-[15px] font-medium text-ink">{c.title}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Paths */}
      {!viewer ? (
        <section className="mt-16">
          <h2 className="text-xl font-bold tracking-tight text-ink">Made for everyone behind a score</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {[
              { key: "student", Icon: GraduationCap, title: "Students", body: "The best lessons for every topic, tutors when you need one, Merit AI, and Exam Sprints before big tests.", cta: "Start free", href: "/signup?as=student" },
              { key: "teacher", Icon: Presentation, title: "Teachers and tutors", body: "Publish your own videos and study guides, and get booked for tutoring by students on Merit.", cta: "Create a teacher account", href: "/signup?as=teacher" },
              { key: "parent", Icon: HeartHandshake, title: "Parents", body: "Gift Merit Plus or an Exam Sprint, or find a tutor for any AP course or the SAT.", cta: "Options for parents", href: "/pricing/parents" },
            ].map((f) => (
              <div key={f.key} className="flex flex-col rounded-2xl p-6 ring-1 ring-line">
                <f.Icon className="size-6 text-accent" />
                <p className="mt-4 font-semibold text-ink">{f.title}</p>
                <p className="mt-1 flex-1 text-[14px] leading-relaxed text-muted">{f.body}</p>
                <FunnelLink href={f.href} funnel={`path-${f.key}`} className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline">
                  {f.cta} <ArrowRight className="size-4" />
                </FunnelLink>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Final call */}
      {!viewer ? (
        <section className="mt-16 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Tonight&apos;s homework, understood.</h2>
          <p className="mt-2 text-[15px] text-muted">Free to start, no card needed.</p>
          <FunnelLink href="/signup?as=student" funnel="footer-student" className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-accent px-6 text-[15px] font-semibold text-white hover:brightness-110">
            Create a free account <ArrowRight className="size-4" />
          </FunnelLink>
        </section>
      ) : null}
    </div>
  );
}
