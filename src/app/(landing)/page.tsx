import { ArrowRight, ArrowUpRight, BookOpenCheck, CalendarSync, GraduationCap, HeartHandshake, Presentation, Sparkles, Target, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FunnelLink } from "@/components/landing/funnel-link";
import { LogoMark, Wordmark } from "@/components/logo";
import { formatDuration } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = {
  title: { absolute: "Merit Learning: know what to study tonight" },
  description: "Merit syncs with your class calendar and lines up the exact lessons, practice, and plan for your next AP or SAT test. Free to start.",
};

const EXAMPLE = { course: "ap-calculus-bc", topic: "chain-rule" };

export default async function Landing() {
  if (await getViewer()) redirect("/home");
  const catalog = await getCatalog();
  const course = catalog.course(EXAMPLE.course);
  const topic = course ? catalog.topicIn(course.id, EXAMPLE.topic) : undefined;
  const lessons = topic ? catalog.videosForTopic(topic.id).filter((v) => !v.isShort).slice(0, 3) : [];
  const apCourses = catalog.courses.filter((c) => c.exam === "AP").length;
  const stats = [
    [catalog.videos.length.toLocaleString("en-US"), "lessons, mapped to topics"],
    [String(apCourses), "AP courses, plus the SAT"],
    [new Set(catalog.videos.map((v) => v.topicId).filter(Boolean)).size.toLocaleString("en-US"), "topics covered"],
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05070d] text-white selection:bg-[#3b82f6]/40" style={{ fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif" }}>
      {/* Grid and glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,black,transparent)]" />
      <div aria-hidden className="pointer-events-none absolute -top-48 left-1/2 h-[640px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(59,130,246,0.35),rgba(99,102,241,0.12),transparent)] blur-2xl" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-8">
        <Link href="/" aria-label="Merit Learning" className="flex items-center gap-2 text-[17px]">
          <LogoMark className="size-8" />
          <Wordmark onDark />
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link href="/home" className="hidden rounded-full px-4 py-2 text-white/70 hover:text-white sm:block">
            Explore
          </Link>
          <Link href="/pricing" className="hidden rounded-full px-4 py-2 text-white/70 hover:text-white sm:block">
            Pricing
          </Link>
          <Link href="/login" className="rounded-full px-4 py-2 text-white/80 hover:text-white">
            Sign in
          </Link>
          <FunnelLink href="/signup?as=student" funnel="nav-signup" className="rounded-full bg-white px-4 py-2 font-semibold text-[#05070d] hover:bg-white/90">
            Get started
          </FunnelLink>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-5 pb-24 pt-16 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:pt-24">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[11.5px] uppercase tracking-[0.16em] text-[#9db8ff]">
            <span className="size-1.5 rounded-full bg-[#3b82f6] shadow-[0_0_10px_2px_rgba(59,130,246,0.8)]" /> Every AP course + the SAT
          </p>
          <h1 className="mt-6 text-[42px] font-semibold leading-[1.02] tracking-[-0.035em] sm:text-[64px] lg:text-[72px]">
            Know what to study{" "}
            <span className="bg-gradient-to-r from-[#7fb2ff] via-[#a5b4fc] to-[#67e8f9] bg-clip-text text-transparent">tonight.</span>
          </h1>
          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-white/65 sm:text-lg">
            Merit syncs with your class calendar and lines up the exact lessons, practice, and plan for your next quiz or test. Your feed learns what you&apos;re learning in school.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <FunnelLink href="/signup?as=student" funnel="hero-student" className="group inline-flex h-12 items-center gap-2 rounded-full bg-[#3b82f6] px-6 text-[15px] font-semibold shadow-[0_0_40px_-8px_rgba(59,130,246,0.9)] hover:bg-[#4b8ef8]">
              Start free as a student <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </FunnelLink>
            <FunnelLink href="/home" funnel="hero-explore" className="inline-flex h-12 items-center gap-2 rounded-full border border-white/15 px-6 text-[15px] font-medium text-white/85 hover:border-white/30 hover:text-white">
              Explore lessons
            </FunnelLink>
          </div>
          <p className="mt-4 text-[13px] text-white/45">Free account · Merit Plus free for your first month · No card</p>
        </div>

        {/* Example of what a student sees */}
        {topic && course && lessons.length ? (
          <div className="relative min-w-0">
            <div aria-hidden className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-[#3b82f6]/25 via-transparent to-[#22d3ee]/15 blur-2xl" />
            <div className="relative rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/45">Tonight&apos;s plan · example</p>
                <span className="rounded-full bg-[#f97316]/15 px-2.5 py-0.5 text-[11.5px] font-semibold text-[#fdba74]">Quiz Friday</span>
              </div>
              <p className="mt-3 text-[19px] font-semibold tracking-tight">{topic.title}</p>
              <p className="text-[13px] text-white/50">{course.title}</p>
              <ul className="mt-4 space-y-2.5">
                {lessons.map((v, i) => (
                  <li key={v.id} className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-2.5">
                    <span className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-lg bg-white/5">
                      <img src={v.thumbnail} alt="" loading="lazy" referrerPolicy="no-referrer" className="absolute inset-0 size-full object-cover" />
                      <span className="absolute bottom-1 right-1 rounded bg-black/75 px-1 font-mono text-[10px]">{formatDuration(v.durationSec)}</span>
                    </span>
                    <span className="min-w-0">
                      <span className="font-mono text-[10.5px] text-[#7fb2ff]">0{i + 1}</span>
                      <span className="line-clamp-2 text-[13.5px] font-medium leading-snug text-white/90">{v.title}</span>
                      <span className="block truncate text-[12px] text-white/45">{v.channelTitle} · on YouTube</span>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 rounded-2xl bg-[#3b82f6]/10 px-4 py-3 text-[13px] text-white/75">Picked for the quiz on your calendar, ranked by how well they teach.</p>
            </div>
          </div>
        ) : null}
      </section>

      {/* Real numbers */}
      <section className="relative z-10 border-y border-white/[0.07] bg-white/[0.02]">
        <dl className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-white/[0.07] px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-8">
          {stats.map(([n, l]) => (
            <div key={l} className="py-7 sm:px-8 sm:first:pl-0">
              <dt className="text-[13px] text-white/50">{l}</dt>
              <dd className="mt-1 font-mono text-3xl font-medium tracking-tight">{n}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Funnels */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 py-24 sm:px-8">
        <p className="font-mono text-[11.5px] uppercase tracking-[0.16em] text-[#9db8ff]">Choose your path</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.03em] sm:text-[42px] sm:leading-[1.1]">One place for the whole team behind a score.</h2>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {[
            {
              key: "student",
              Icon: GraduationCap,
              who: "Students",
              title: "A plan for every test",
              points: ["Lessons picked for what's on your calendar", "Exam Sprints: a day-by-day plan to exam day", "Merit AI for any question, any time"],
              cta: "Start free",
              href: "/signup?as=student",
              accent: true,
            },
            {
              key: "teacher",
              Icon: Presentation,
              who: "Teachers & tutors",
              title: "Teach far beyond your classroom",
              points: ["Publish your own videos and study guides", "Get booked for tutoring by students on Merit", "Students find you on the topics you teach"],
              cta: "Create a teacher account",
              href: "/signup?as=teacher",
            },
            {
              key: "parent",
              Icon: HeartHandshake,
              who: "Parents",
              title: "Support without the guesswork",
              points: ["Gift Merit Plus or an Exam Sprint", "Find a tutor for any AP course or the SAT", "Your student gets a clear plan every night"],
              cta: "See options for parents",
              href: "/pricing/parents",
            },
          ].map((f) => (
            <div key={f.key} className={`group relative flex flex-col rounded-3xl border p-7 transition-colors ${f.accent ? "border-[#3b82f6]/40 bg-[#3b82f6]/[0.07]" : "border-white/10 bg-white/[0.03] hover:border-white/20"}`}>
              <f.Icon className="size-6 text-[#7fb2ff]" />
              <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.16em] text-white/45">{f.who}</p>
              <h3 className="mt-1.5 text-[22px] font-semibold tracking-tight">{f.title}</h3>
              <ul className="mt-5 flex-1 space-y-2.5 text-[14.5px] text-white/65">
                {f.points.map((p) => (
                  <li key={p} className="flex gap-2.5">
                    <span className="mt-2 size-1 shrink-0 rounded-full bg-[#7fb2ff]" /> {p}
                  </li>
                ))}
              </ul>
              <FunnelLink href={f.href} funnel={`path-${f.key}`} className={`mt-7 inline-flex h-11 items-center justify-center gap-1.5 rounded-full text-sm font-semibold ${f.accent ? "bg-white text-[#05070d] hover:bg-white/90" : "border border-white/15 text-white hover:border-white/30"}`}>
                {f.cta} <ArrowUpRight className="size-4" />
              </FunnelLink>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 pb-24 sm:px-8">
        <div className="grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 md:grid-cols-3">
          {[
            [CalendarSync, "01", "Connect your calendar", "Blackbaud, Canvas, Schoology, Google, or a PDF. About a minute, and it stays in sync."],
            [BookOpenCheck, "02", "Merit lines it up", "Before every quiz and test: the right lessons, in order, plus practice."],
            [Target, "03", "Walk in ready", "Big exam coming? An Exam Sprint builds a day-by-day plan and tracks your readiness."],
          ].map(([Icon, n, t, d]) => {
            const I = Icon as typeof Target;
            return (
              <div key={n as string} className="bg-[#070a12] p-8">
                <div className="flex items-center justify-between">
                  <I className="size-5 text-[#7fb2ff]" />
                  <span className="font-mono text-[12px] text-white/30">{n as string}</span>
                </div>
                <h3 className="mt-8 text-lg font-semibold tracking-tight">{t as string}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-white/55">{d as string}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature strip */}
      <section className="relative z-10 mx-auto grid max-w-6xl gap-4 px-5 pb-24 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
        {[
          [Sparkles, "Merit AI", "Explanations and practice questions for any topic."],
          [Target, "Exam Sprint", "A plan to exam day, with a live readiness score."],
          [Users, "Tutors", "Book one-on-one help, online or nearby."],
          [GraduationCap, "Every course", `All ${apCourses} AP courses and the SAT, topic by topic.`],
        ].map(([Icon, t, d]) => {
          const I = Icon as typeof Target;
          return (
            <div key={t as string} className="rounded-2xl border border-white/[0.08] p-5">
              <I className="size-5 text-[#7fb2ff]" />
              <p className="mt-4 font-semibold">{t as string}</p>
              <p className="mt-1 text-[13.5px] text-white/50">{d as string}</p>
            </div>
          );
        })}
      </section>

      {/* Final call */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 pb-20 sm:px-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#1d3fa8] via-[#172a7a] to-[#0b1330] px-8 py-14 text-center sm:px-16">
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(127,178,255,0.35),transparent_60%)]" />
          <h2 className="relative text-3xl font-semibold tracking-[-0.03em] sm:text-5xl">Your next test is already on the calendar.</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-white/70">Get the plan for it tonight. Free to start, no card needed.</p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <FunnelLink href="/signup?as=student" funnel="footer-student" className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-[15px] font-semibold text-[#05070d] hover:bg-white/90">
              Start free <ArrowRight className="size-4" />
            </FunnelLink>
            <FunnelLink href="/signup?as=teacher" funnel="footer-teacher" className="inline-flex h-12 items-center rounded-full border border-white/25 px-6 text-[15px] font-medium hover:border-white/50">
              I&apos;m a teacher or tutor
            </FunnelLink>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/[0.07]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] text-[13px] text-white/45 sm:px-8">
          <p>© Merit Learning. AP® and SAT® are trademarks of the College Board, which is not affiliated with Merit.</p>
          <nav className="flex flex-wrap gap-5">
            {[
              ["/home", "Explore"],
              ["/courses", "Courses"],
              ["/tutors", "Tutors"],
              ["/pricing", "Pricing"],
              ["/terms", "Terms"],
              ["/privacy", "Privacy"],
            ].map(([h, l]) => (
              <Link key={h} href={h} className="hover:text-white">
                {l}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
