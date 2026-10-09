import { ArrowRight, BookOpenCheck, CalendarPlus, CalendarRange, ClipboardCheck, Gauge as GaugeIcon, Gift, NotebookText, PenLine, Plus, RefreshCw, Target, Zap } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutNotice } from "@/components/checkout-notice";
import { CourseIcon } from "@/components/course-icon";
import { Faq } from "@/components/marketing";
import { ReadinessBars, Ring } from "@/components/sprint/readiness";
import { SprintStartForm } from "@/components/sprint/start-form";
import { cn, panel } from "@/components/ui";
import { PAID_PLANS, SPRINT, sprintFeatures, usd } from "@/lib/billing/plans";
import { getCatalog } from "@/lib/catalog";
import { getStore } from "@/lib/data/store";
import { examDateFor } from "@/lib/exams";
import { daysLeft, estimatedScore, overall, readiness } from "@/lib/sprint";
import type { Sprint } from "@/lib/types";
import { getViewer } from "@/lib/viewer";
import { upcomingTests } from "@/lib/schedule-model";

export const metadata: Metadata = {
  title: "Exam Sprint",
  description: `A day-by-day plan to your AP or SAT exam, unlimited exam-style practice, and a live readiness score. ${PAID_PLANS ? `Free diagnostic, then ${usd(SPRINT.price)} once.` : "Free."}`,
};

const ICONS = [Gift, ClipboardCheck, CalendarPlus, CalendarRange, Zap, GaugeIcon, RefreshCw, NotebookText, PenLine, BookOpenCheck];

/** A varied bento: each feature tile gets its own color and size so the grid reads as a poster, not a list. */
const TILE = [
  { cls: "bg-sprint text-white lg:col-span-2 sm:col-span-2", icon: "bg-white/20 text-white", body: "text-white/85", big: true },
  { cls: "bg-sprint-soft text-ink", icon: "bg-surface text-sprint-ink", body: "text-ink-2" },
  { cls: "bg-surface text-ink ring-2 ring-line", icon: "bg-sprint-soft text-sprint-ink", body: "text-muted" },
  { cls: "bg-surface text-ink ring-2 ring-line", icon: "bg-sprint-soft text-sprint-ink", body: "text-muted" },
  { cls: "bg-accent text-white", icon: "bg-white/20 text-white", body: "text-white/85" },
  { cls: "bg-surface text-ink ring-2 ring-line lg:col-span-2 sm:col-span-2", icon: "bg-sprint-soft text-sprint-ink", body: "text-muted", big: true },
  { cls: "bg-surface text-ink ring-2 ring-line", icon: "bg-sprint-soft text-sprint-ink", body: "text-muted" },
  { cls: "bg-sprint-soft text-ink", icon: "bg-surface text-sprint-ink", body: "text-ink-2" },
  { cls: "bg-ink text-bg", icon: "bg-bg/15 text-bg", body: "text-bg/75" },
  { cls: "bg-surface text-ink ring-2 ring-line", icon: "bg-sprint-soft text-sprint-ink", body: "text-muted" },
];

export default async function SprintHome({ searchParams }: PageProps<"/sprint">) {
  const [viewer, catalog, sp] = await Promise.all([getViewer(), getCatalog(), searchParams]);
  const sprints = viewer ? (await (await getStore()).listDocs<Sprint>("sprints", { owner: viewer.user.id })).sort((a, b) => b.createdAt.localeCompare(a.createdAt)) : [];
  const tests = viewer ? upcomingTests(viewer.state.schedule) : [];
  const initial = typeof sp.course === "string" && catalog.course(sp.course) ? sp.course : (viewer?.state.profile.courseIds[0] ?? null);
  const options = catalog.courses.map((c) => ({ id: c.id, title: c.title, category: c.category, defaultDate: examDateFor(c, null) }));
  const example = catalog.course("ap-biology")
    ? readiness(catalog, { id: "x", userId: "x", courseId: "ap-biology", examDate: "2099-01-01", minutesPerDay: 45, createdAt: "", unlocked: true, answers: [], done: {}, frq: [], confidence: Object.fromEntries(catalog.unitsForCourse("ap-biology").map((u, i) => [u.id, [4, 3, 2, 4, 1, 3, 2, 5][i % 8]])) })
    : [];

  return (
    <div className="pb-20">
      <div className="mx-auto max-w-6xl px-4 pt-4 empty:hidden sm:px-6 lg:px-8">
        <CheckoutNotice sp={sp} />
      </div>

      {/* Practice world: full-bleed ember */}
      <header className="relative overflow-hidden bg-sprint text-white">
        <div aria-hidden className="pointer-events-none absolute -left-24 -top-32 size-[380px] rounded-full border-[52px] border-white/[0.08]" />
        <div aria-hidden className="pointer-events-none absolute -bottom-40 right-[30%] size-80 rounded-full border-[40px] border-white/[0.07]" />
        <div className="relative mx-auto grid max-w-6xl gap-8 px-4 pb-12 pt-10 sm:px-6 lg:grid-cols-[1fr_430px] lg:items-center lg:px-8 lg:pb-16 lg:pt-14 grid-cols-[minmax(0,1fr)]">
          <div className="rise">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 font-brand text-[13px] font-extrabold">
              <Target className="size-3.5" /> {SPRINT.name}
            </span>
            <h1 className="display mt-5 text-[44px] sm:text-6xl lg:text-[68px]">Your exam, planned day by day.</h1>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-white/90">
              Find out where you stand in 10 minutes. Then get exactly what to watch and practice every day until test day, for your AP exam or any quiz or test on your calendar.
            </p>
            <ol className="mt-7 flex flex-wrap gap-2.5">
              {["Free diagnostic", "Daily plan", "Walk in ready"].map((s, i) => (
                <li key={s} className="flex items-center gap-2 rounded-2xl bg-white/15 py-1.5 pl-1.5 pr-4 font-brand text-[14px] font-extrabold ring-2 ring-inset ring-white/25">
                  <span className="tabular flex size-7 items-center justify-center rounded-xl bg-white font-black text-sprint">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
            <p className="mt-6 font-brand text-[15px] font-extrabold">
              {PAID_PLANS ? (
                <>
                  7 days free, then {usd(SPRINT.price)} once for every class, forever <span className="font-semibold text-white/75">· not a subscription</span>
                </>
              ) : (
                <>
                  Free for every class and every test <span className="font-semibold text-white/75">· no card, no trial</span>
                </>
              )}
            </p>
          </div>
          <div id="start" className="rise scroll-mt-[calc(var(--nav-h)+16px)] rounded-3xl bg-surface p-6 text-ink shadow-[0_6px_0_0_var(--sprint-press)] sm:p-7" style={{ ["--i" as string]: 1 }}>
            <p className="headline mb-5 text-[22px] text-ink">Start your Sprint</p>
            <SprintStartForm courses={options} initialCourse={initial} signedIn={Boolean(viewer)} />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {sprints.length ? (
          <section className="mt-10">
            <h2 className="headline text-[26px] text-ink">Your Sprints</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sprints.map((s, i) => {
                const c = catalog.course(s.courseId);
                if (!c) return null;
                const r = readiness(catalog, s);
                const est = estimatedScore(c, r);
                const left = daysLeft(s);
                return (
                  <Link
                    key={s.id}
                    href={`/sprint/${s.id}`}
                    className="press rise group flex flex-col gap-4 rounded-3xl bg-surface p-5 ring-2 ring-line [--ledge:var(--line)] hover:ring-sprint/40"
                    style={{ ["--i" as string]: i }}
                  >
                    <div className="flex items-start gap-3">
                      <CourseIcon id={c.id} size={48} />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 font-brand text-[17px] font-extrabold leading-snug text-ink">{s.kind === "test" && s.title ? s.title : c.title}</p>
                        <p className="mt-0.5 truncate text-[13px] text-muted">{s.kind === "test" ? c.shortTitle : `Estimated ${est.label} · ${est.scale}`}</p>
                      </div>
                    </div>
                    <div className="flex items-end justify-between gap-3">
                      <p className="leading-none">
                        <span className="tabular display text-[40px] text-sprint-ink">{left}</span>
                        <span className="ml-1.5 font-brand text-[13px] font-extrabold text-muted">{left === 1 ? "day left" : "days left"}</span>
                      </p>
                      <Ring value={overall(r)} size={60} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}

        {viewer ? (
          <section className="mt-10">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="headline text-[26px] text-ink">Upcoming tests</h2>
              <Link href="/sprint/new" className="press-sm font-brand inline-flex h-10 items-center gap-1.5 rounded-2xl bg-surface px-4 text-[14px] font-extrabold text-sprint-ink ring-2 ring-inset ring-line [--ledge:var(--line)] hover:bg-bg-subtle">
                <Plus className="size-4" strokeWidth={3} /> Sprint for a test that&apos;s not on your calendar
              </Link>
            </div>
            {tests.length ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tests.map((e, i) => {
                  const existing = sprints.find((x) => x.eventUid === e.uid);
                  const d = new Date(e.start);
                  return (
                    <Link
                      key={e.uid}
                      href={existing ? `/sprint/${existing.id}` : `/sprint/new?event=${encodeURIComponent(e.uid)}`}
                      className="press rise flex items-center gap-4 rounded-3xl bg-surface p-4 ring-2 ring-line [--ledge:var(--line)] hover:ring-sprint/40"
                      style={{ ["--i" as string]: i }}
                    >
                      <span className="flex w-16 shrink-0 flex-col items-center overflow-hidden rounded-2xl ring-2 ring-sprint">
                        <span className="w-full bg-sprint py-0.5 text-center font-brand text-[11px] font-extrabold uppercase tracking-wide text-white">{d.toLocaleDateString("en-US", { month: "short" })}</span>
                        <span className="tabular py-1 font-brand text-[26px] font-black leading-none text-ink">{d.getDate()}</span>
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 font-brand text-[16px] font-extrabold leading-snug text-ink">{e.title}</p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-muted">
                          {e.courseId ? <CourseIcon id={e.courseId} size={18} /> : null}
                          {d.toLocaleDateString("en-US", { weekday: "long" })}
                        </p>
                      </div>
                      <span className={cn("shrink-0 rounded-full px-3 py-1 font-brand text-[12.5px] font-extrabold", existing ? "bg-positive-soft text-positive" : "bg-sprint-soft text-sprint-ink")}>
                        {existing ? "Open" : "Start Sprint"}
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="mt-4 flex flex-col gap-4 rounded-3xl bg-sprint-soft p-6 sm:flex-row sm:items-center">
                <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-surface text-sprint-ink">
                  <CalendarRange className="size-7" />
                </span>
                <p className="flex-1 text-[15px] leading-relaxed text-ink-2">
                  {viewer.state.schedule ? "No tests coming up on your calendar." : "Connect your school calendar and every upcoming quiz and test gets its own Sprint."}
                </p>
                <Link href="/schedule" className="press font-brand inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-2xl bg-sprint px-5 text-[15px] font-extrabold text-white [--ledge:var(--sprint-press)] hover:brightness-110">
                  {viewer.state.schedule ? "Manage calendars" : "Connect a calendar"} <ArrowRight className="size-4" />
                </Link>
              </div>
            )}
          </section>
        ) : null}

        {/* Readiness showcase */}
        <section className="mt-16 grid gap-8 lg:grid-cols-[1fr_460px] lg:items-center grid-cols-[minmax(0,1fr)]">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sprint-soft px-3 py-1 font-brand text-[13px] font-extrabold text-sprint-ink">
              <GaugeIcon className="size-3.5" /> Readiness
            </span>
            <h2 className="headline mt-4 text-[32px] text-ink sm:text-[40px]">See exactly where the points are.</h2>
            <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-ink-2">
              Every unit gets a live readiness score from your diagnostic and every practice question after it. Units that count more on the exam and units you&apos;re weakest in move to the front of your plan.
            </p>
          </div>
          <div className={cn(panel, "p-6")}>
            <div className="flex items-center justify-between">
              <p className="font-brand text-[16px] font-extrabold text-ink">AP Biology readiness</p>
              <span className="rounded-full bg-bg-subtle px-2.5 py-0.5 font-brand text-[11.5px] font-extrabold text-muted">Example</span>
            </div>
            <div className="mt-5">
              <ReadinessBars units={example} compact />
            </div>
          </div>
        </section>

        {/* Features: a bento of bold tiles */}
        <section className="mt-16">
          <h2 className="headline text-[32px] text-ink sm:text-[40px]">Everything in a Sprint</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {sprintFeatures().map((f, i) => {
              const Icon = ICONS[i % ICONS.length];
              const t = TILE[i % TILE.length];
              return (
                <div key={f.title} className={cn("rise relative flex flex-col overflow-hidden rounded-3xl p-6", t.cls)} style={{ ["--i" as string]: i }}>
                  {t.big && t.cls.includes("bg-sprint") ? <div aria-hidden className="pointer-events-none absolute -bottom-20 -right-16 size-60 rounded-full border-[36px] border-white/10" /> : null}
                  <span className={cn("relative flex items-center justify-center rounded-2xl", t.big ? "size-14" : "size-12", t.icon)}>
                    <Icon className={t.big ? "size-7" : "size-6"} />
                  </span>
                  <p className={cn("relative mt-5 font-brand font-extrabold leading-tight", t.big ? "text-[26px] sm:text-[30px]" : "text-[18px]")}>{f.title}</p>
                  <p className={cn("relative mt-1.5 leading-relaxed", t.big ? "max-w-md text-[15.5px]" : "text-[14px]", t.body)}>{f.body}</p>
                </div>
              );
            })}
          </div>

          {/* Price tile */}
          <div className="relative mt-4 flex flex-col gap-6 overflow-hidden rounded-3xl bg-surface p-7 ring-4 ring-sprint sm:flex-row sm:items-center sm:justify-between sm:p-9">
            <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full border-[40px] border-sprint/10" />
            <div className="relative">
              <p className="tabular display text-[64px] text-sprint-ink sm:text-[80px]">{PAID_PLANS ? usd(SPRINT.price) : "Free"}</p>
              <p className="mt-1 font-brand text-[17px] font-extrabold text-ink">{PAID_PLANS ? "Once. Every class, every test, forever." : "Every class, every test. Nothing to pay."}</p>
              <p className="mt-1 max-w-lg text-[14.5px] text-muted">{PAID_PLANS ? "Includes calendar sync. Less than a single hour of tutoring." : "Includes calendar sync."}</p>
            </div>
            <div className="relative flex shrink-0 flex-col gap-2 sm:items-end">
              <a href="#start" className="press font-brand inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-sprint px-6 text-[16px] font-extrabold text-white [--ledge:var(--sprint-press)] hover:brightness-110">
                {PAID_PLANS ? "Try it free for 7 days" : "Start my Sprint"} <ArrowRight className="size-4" />
              </a>
              {PAID_PLANS ? (
                <Link href="/pricing/parents" className="px-1 text-center font-brand text-[14px] font-extrabold text-sprint-ink hover:underline">
                  A parent can pay for it →
                </Link>
              ) : null}
            </div>
          </div>
        </section>

        <section className="mx-auto mt-20 max-w-3xl">
          <h2 className="headline mb-4 text-[28px] text-ink">Questions</h2>
          <Faq
            items={[
              PAID_PLANS
                ? ["What do I get for free?", "The full diagnostic, your readiness by unit, an estimated score, and a preview of your first days. You only pay to unlock the full plan, unlimited practice, checkpoints, cram sheets, and the free-response coach."]
                : ["What does it cost?", "Nothing. Every part of Exam Sprint is free: the diagnostic, the full day-by-day plan, unlimited practice, checkpoints, cram sheets, and the free-response coach."],
              ["How is the estimated score calculated?", "From your accuracy on exam-style questions in each unit, weighted by how much of the course each unit covers, with your own confidence as a starting point. It's a guide to where you stand, not a guarantee, and it gets sharper the more you practice."],
              ["What if my exam is less than 30 days away?", "The plan compresses to the days you have: the heaviest, weakest units first, then checkpoints and review."],
              ["Which exams are covered?", "Every AP exam and both SAT sections."],
              ["Where do the questions come from?", "Merit writes exam-style questions for every topic, each with an explanation for every answer choice, and pairs them with the best-ranked lessons in our library."],
            ]}
          />
        </section>
      </div>
    </div>
  );
}
