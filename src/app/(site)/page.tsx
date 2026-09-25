import { ArrowRight, CalendarCheck, GraduationCap, HeartHandshake, Presentation, Sparkles, Target } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CourseIcon } from "@/components/course-icon";
import { FunnelLink } from "@/components/landing/funnel-link";
import { formatDuration } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = {
  title: { absolute: "Merit Learning: know what to study tonight" },
  description: "Merit syncs with your class calendar and lines up the lessons, practice, and plan for your next AP or SAT test. Free to start.",
};

const EXAMPLE = { course: "ap-calculus-bc", topic: "chain-rule" };

/** The front door for signed-out visitors. Signed-in students go straight to their feed. */
export default async function Landing() {
  if (await getViewer()) redirect("/home");
  const catalog = await getCatalog();
  const course = catalog.course(EXAMPLE.course);
  const topic = course ? catalog.topicIn(course.id, EXAMPLE.topic) : undefined;
  const lessons = topic ? catalog.videosForTopic(topic.id).filter((v) => !v.isShort).slice(0, 3) : [];
  const apCount = catalog.courses.filter((c) => c.exam === "AP").length;
  const popular = [...catalog.courses].sort((a, b) => catalog.videosForCourse(b.id).length - catalog.videosForCourse(a.id).length).slice(0, 12);

  return (
    <div className="mx-auto max-w-[1100px] px-4 pb-20 pt-10 sm:px-6">
      {/* Hero */}
      <section className="grid items-center gap-10 lg:grid-cols-[1fr_420px]">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-accent">For AP and SAT students</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">Know what to study tonight.</h1>
          <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-ink-2">
            Merit connects to your class calendar and lines up the right lessons and practice before every quiz and test.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <FunnelLink href="/signup?as=student" funnel="hero-student" className="inline-flex h-12 items-center gap-2 rounded-full bg-accent px-6 text-[15px] font-semibold text-white hover:brightness-110">
              Create a free account <ArrowRight className="size-4" />
            </FunnelLink>
            <FunnelLink href="/home" funnel="hero-explore" className="inline-flex h-12 items-center rounded-full px-6 text-[15px] font-semibold text-ink ring-1 ring-line-strong hover:bg-bg-subtle">
              Browse lessons
            </FunnelLink>
          </div>
          <div className="mt-6 flex flex-wrap gap-2 text-[13px]">
            {[`${catalog.videos.length.toLocaleString("en-US")} lessons`, `${apCount} AP courses + the SAT`, "Merit Plus free for a month"].map((p) => (
              <span key={p} className="tabular rounded-full bg-bg-subtle px-3 py-1 font-medium text-ink-2">
                {p}
              </span>
            ))}
          </div>
        </div>

        {topic && course && lessons.length ? (
          <div className="rounded-2xl p-5 ring-1 ring-line">
            <div className="flex items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-[15px] font-semibold text-ink">
                <CalendarCheck className="size-4 text-accent" /> Tonight&apos;s plan
              </p>
              <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-[12px] font-medium text-accent">Example</span>
            </div>
            <p className="mt-3 text-[13px] text-muted">Quiz Friday</p>
            <Link href={`/courses/${course.slug}/${topic.slug}`} className="mt-0.5 flex items-center gap-2 font-semibold text-ink hover:underline">
              <CourseIcon id={course.id} size={22} /> {course.shortTitle}: {topic.title}
            </Link>
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
          </div>
        ) : null}
      </section>

      {/* Courses */}
      <section className="mt-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-ink">Pick your course</h2>
            <p className="mt-1 text-[15px] text-muted">Every AP course and the SAT, unit by unit.</p>
          </div>
          <Link href="/courses" className="shrink-0 rounded-full px-3 py-1.5 text-sm font-medium text-accent hover:bg-accent-soft">
            All courses
          </Link>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {popular.map((c) => (
            <Link key={c.id} href={`/courses/${c.slug}`} className="flex items-center gap-3 rounded-xl bg-bg-subtle px-3 py-2.5 hover:bg-line">
              <CourseIcon id={c.id} size={36} />
              <span className="min-w-0 truncate text-[15px] font-medium text-ink">{c.title}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Paths */}
      <section className="mt-16">
        <h2 className="text-xl font-bold tracking-tight text-ink">Made for everyone behind a score</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            { key: "student", Icon: GraduationCap, title: "Students", body: "Lessons for what's on your calendar, Exam Sprints before big tests, and Merit AI for any question.", cta: "Start free", href: "/signup?as=student" },
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

      {/* How it works */}
      <section className="mt-16 grid gap-6 rounded-3xl bg-bg-subtle p-6 sm:p-8 md:grid-cols-3">
        {[
          [CalendarCheck, "Connect your calendar", "Blackbaud, Canvas, Schoology, Google, or a PDF. It takes about a minute."],
          [Sparkles, "Merit lines it up", "Before each quiz and test, you get the right lessons in order, plus practice."],
          [Target, "Walk in ready", "For big exams, an Exam Sprint plans every day until test day."],
        ].map(([Icon, t, d], i) => {
          const I = Icon as typeof Target;
          return (
            <div key={t as string}>
              <span className="flex size-9 items-center justify-center rounded-full bg-bg text-accent ring-1 ring-line">
                <I className="size-4.5" />
              </span>
              <p className="mt-3 font-semibold text-ink">
                {i + 1}. {t as string}
              </p>
              <p className="mt-1 text-[14px] leading-relaxed text-muted">{d as string}</p>
            </div>
          );
        })}
      </section>

      {/* Final call */}
      <section className="mt-16 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Your next test is already on the calendar.</h2>
        <p className="mt-2 text-[15px] text-muted">Get the plan for it tonight. Free to start, no card needed.</p>
        <FunnelLink href="/signup?as=student" funnel="footer-student" className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-accent px-6 text-[15px] font-semibold text-white hover:brightness-110">
          Create a free account <ArrowRight className="size-4" />
        </FunnelLink>
      </section>
    </div>
  );
}
