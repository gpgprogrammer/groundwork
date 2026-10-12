import { ArrowRight, BookOpen, CalendarDays, ClipboardCheck, Coffee, Lock, NotebookText, PenLine, Play, Settings2, Sparkles, Target } from "lucide-react";
import type { Metadata } from "next";
import { LessonMini } from "@/components/video-card";
import Link from "next/link";
import { notFound } from "next/navigation";
import { beginSprintTrial, deleteSprint, updateSprintSettings } from "@/app/actions/sprint";
import { sprintTrialDaysLeft } from "@/lib/billing/access";
import { CheckoutNotice } from "@/components/checkout-notice";
import { CourseIcon } from "@/components/course-icon";
import { inputClass } from "@/components/form";
import { Gauge, ReadinessBars, tone } from "@/components/sprint/readiness";
import { SprintTaskToggle } from "@/components/sprint/task-toggle";
import { BuyButton } from "@/components/upgrade";
import { buttonClass, cn, panel, plural } from "@/components/ui";
import { SPRINT, usd } from "@/lib/billing/plans";
import { getCatalog } from "@/lib/catalog";
import { daysLeft, estimatedScore, overall, readiness, sprintPlan, type SprintDay, type SprintTask } from "@/lib/sprint";
import { consumeCredit, getSprint } from "@/lib/sprint-store";
import { requireViewer } from "@/lib/viewer";
import { StudyTimeInput } from "@/components/study-time-input";

export const metadata: Metadata = { title: "Exam Sprint" };

const heroCta = "press font-brand inline-flex h-12 items-center gap-2 rounded-2xl px-5 text-[15.5px] font-extrabold";

export default async function SprintDashboard({ params, searchParams }: PageProps<"/sprint/[id]">) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const viewer = await requireViewer(`/sprint/${id}`);
  let sprint = await getSprint(id);
  if (!sprint || sprint.userId !== viewer.user.id) notFound();
  if (!sprint.unlocked) sprint = await consumeCredit(sprint);

  const catalog = await getCatalog();
  const course = catalog.course(sprint.courseId);
  if (!course) notFound();
  const r = readiness(catalog, sprint);
  const est = estimatedScore(course, r);
  const left = daysLeft(sprint);
  const plan = sprintPlan(catalog, sprint);
  const took = sprint.answers.some((a) => a.kind === "diagnostic") || Object.keys(sprint.confidence).length > 0;
  const today = plan[0];
  const visibleDays = sprint.unlocked ? plan.slice(1, 8) : plan.slice(1, 3);
  const weakest = [...r].sort((a, b) => a.score - b.score).slice(0, 3);
  const correct = sprint.answers.filter((a) => a.correct).length;
  const trialLeft = sprintTrialDaysLeft(viewer.billing);
  const isTest = sprint.kind === "test";
  const todayDone = today.tasks.filter((t) => t.kind !== "rest" && sprint.done[t.id]).length;
  const todayTotal = today.tasks.filter((t) => t.kind !== "rest").length;

  return (
    <div className="pb-20">
      <div className="mx-auto max-w-6xl px-4 pt-4 empty:hidden sm:px-6 lg:px-8">
        <CheckoutNotice sp={sp} />
      </div>

      {/* Hero band */}
      <header className="relative overflow-hidden bg-sprint text-white">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-28 size-[420px] rounded-full border-[56px] border-white/[0.08]" />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 left-[40%] size-72 rounded-full border-[40px] border-white/[0.06]" />
        <div className="relative mx-auto grid max-w-6xl gap-8 px-4 pb-10 pt-8 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8 lg:pb-12 lg:pt-10 grid-cols-[minmax(0,1fr)]">
          <div className="min-w-0">
            <nav className="flex items-center gap-1.5 font-brand text-[13.5px] font-bold text-white/80" aria-label="Breadcrumb">
              <Link href="/sprint" className="inline-flex items-center gap-1 hover:text-white">
                <Target className="size-3.5" /> {SPRINT.name}
              </Link>
              <span aria-hidden>›</span>
              <span className="truncate">{course.shortTitle}</span>
            </nav>
            <div className="rise mt-4 flex items-center gap-4">
              <span className="flex size-16 shrink-0 items-center justify-center rounded-3xl bg-white/15 ring-2 ring-white/25 sm:size-[72px]">
                <CourseIcon id={course.id} size={48} />
              </span>
              <div className="min-w-0">
                <h1 className="display text-[30px] sm:text-[44px]">{isTest && sprint.title ? sprint.title : course.title}</h1>
                {isTest ? (
                  <p className="mt-1 font-brand text-[14.5px] font-bold text-white/85">
                    {course.title} · {r.length} {r.length === 1 ? "unit" : "units"}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="rise mt-6 flex items-end gap-4" style={{ ["--i" as string]: 1 }}>
              <span className="tabular display text-[88px] leading-[0.8] sm:text-[112px]">{left}</span>
              <div className="pb-1">
                <p className="font-brand text-[20px] font-black leading-tight sm:text-[24px]">
                  {left === 1 ? "day" : "days"} to {isTest ? "test" : "exam"} day
                </p>
                <p className="mt-0.5 text-[14px] font-semibold text-white/80">{new Date(`${sprint.examDate}T12:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
              </div>
            </div>

            <div className="rise mt-7 flex flex-wrap gap-2.5" style={{ ["--i" as string]: 2 }}>
              {!took ? (
                <Link href={`/sprint/${sprint.id}/diagnostic`} className={cn(heroCta, "bg-white text-[#b3400f] [--ledge:rgb(0_0_0/0.22)] hover:brightness-95")}>
                  <ClipboardCheck className="size-4" /> Take the diagnostic (10 min)
                </Link>
              ) : sprint.unlocked ? (
                <Link href={`/sprint/${sprint.id}/practice?mode=checkpoint`} className={cn(heroCta, "bg-white text-[#b3400f] [--ledge:rgb(0_0_0/0.22)] hover:brightness-95")}>
                  <Play className="size-4 fill-current" /> Quick practice
                </Link>
              ) : null}
              <Link href="/ask" className={cn(heroCta, "bg-white/15 text-white ring-2 ring-inset ring-white/30 [--ledge:rgb(0_0_0/0.18)] hover:bg-white/25")}>
                <Sparkles className="size-4" /> Ask Merit AI
              </Link>
            </div>
          </div>

          <div className="rise flex flex-wrap items-center gap-5 rounded-3xl bg-white/[0.12] p-5 ring-2 ring-inset ring-white/20 sm:flex-nowrap sm:p-6" style={{ ["--i" as string]: 2 }}>
            <Gauge value={overall(r)} label={`${Math.round(overall(r) * 100)}%`} sub="ready" onDark />
            {isTest ? null : (
              <div className="min-w-[140px]">
                <p className="font-brand text-[13px] font-extrabold uppercase tracking-wide text-white/80">Estimated</p>
                <p className="tabular display text-[64px] leading-none">{est.label}</p>
                <p className="mt-1 font-brand text-[13.5px] font-bold text-white/85">{est.scale}</p>
                <p className="text-[12.5px] text-white/75">{est.confidence === "good" ? "solid estimate" : est.confidence === "rough" ? "rough estimate" : "early estimate"}</p>
                <p className="tabular mt-3 inline-flex rounded-full bg-white/15 px-2.5 py-1 font-brand text-[12.5px] font-extrabold">
                  {correct}/{sprint.answers.length} correct so far
                </p>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {trialLeft !== null ? (
          <section className="mt-6 flex flex-col gap-4 rounded-3xl bg-sprint-soft p-5 sm:flex-row sm:items-center sm:justify-between sm:pl-6">
            <div className="flex items-center gap-4">
              <span className="flex size-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-sprint text-white">
                <span className="tabular font-brand text-[22px] font-black leading-none">{trialLeft}</span>
                <span className="font-brand text-[9.5px] font-extrabold uppercase tracking-wide">{trialLeft === 1 ? "day" : "days"}</span>
              </span>
              <p className="text-[14.5px] text-ink-2">
                <span className="font-brand font-extrabold text-ink">Free week of Exam Sprint.</span> Unlock it for good to keep every class&apos;s Sprint.
              </p>
            </div>
            <BuyButton product="sprint" returnTo={`/sprint/${sprint.id}`} variant="sprint" className="shrink-0">
              Unlock forever · {usd(SPRINT.price)}
            </BuyButton>
          </section>
        ) : null}

        {!sprint.unlocked ? (
          <section className="relative mt-6 overflow-hidden rounded-3xl bg-surface p-6 ring-4 ring-sprint sm:p-8">
            <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full border-[36px] border-sprint/10" />
            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <span className="press-sm flex size-14 shrink-0 items-center justify-center rounded-2xl bg-sprint text-white [--ledge:var(--sprint-press)]">
                  <Lock className="size-7" strokeWidth={2.5} />
                </span>
                <div>
                  <p className="font-brand text-[14px] font-extrabold text-sprint-ink">Your plan is ready</p>
                  <p className="headline mt-1 text-[24px] text-ink sm:text-[28px]">Unlock Exam Sprint for every class, for good.</p>
                  <p className="mt-2 max-w-xl text-[14.5px] leading-relaxed text-muted">
                    One payment unlocks Sprints for every test and AP exam you&apos;ll ever have on Merit: daily lessons and practice, checkpoints, cram sheets, and the free-response coach. Calendar sync is included.
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-stretch gap-2.5 md:w-64">
                {!viewer.billing.sprintTrialEndsAt ? (
                  <form action={beginSprintTrial.bind(null, `/sprint/${sprint.id}`)}>
                    <button className={buttonClass("sprint", "lg", "w-full px-7")}>Start 7-day free trial</button>
                  </form>
                ) : null}
                <BuyButton product="sprint" returnTo={`/sprint/${sprint.id}`} variant={viewer.billing.sprintTrialEndsAt ? "sprint" : "outline"} className="h-12 w-full px-7 text-[15.5px]">
                  Unlock for {usd(SPRINT.price)}
                </BuyButton>
                <Link href="/pricing/parents" className="text-center font-brand text-[13.5px] font-extrabold text-muted hover:text-ink">
                  Have a parent pay
                </Link>
              </div>
            </div>
          </section>
        ) : null}

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px] grid-cols-[minmax(0,1fr)]">
          <div className="min-w-0">
            {/* Today: a vertical path of task tiles */}
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="headline text-[30px] text-ink">Today</h2>
                <p className="text-[14.5px] text-muted">
                  {today.tasks.length ? `About ${today.minutes} minutes.` : ""} {today.phase === "review" ? "Review phase: mixed practice and cram sheets." : today.phase === "final" ? "Final stretch." : ""}
                </p>
              </div>
              {todayTotal ? (
                <span className={cn("tabular rounded-full px-3.5 py-1.5 font-brand text-[14px] font-extrabold", todayDone === todayTotal ? "bg-positive-soft text-positive" : "bg-sprint-soft text-sprint-ink")}>
                  {todayDone}/{todayTotal} done
                </span>
              ) : null}
            </div>
            <ol className="relative mt-5 space-y-4">
              <span aria-hidden className="absolute bottom-8 left-[22px] top-8 w-1 rounded-full bg-line" />
              {today.tasks.map((t, i) => (
                <Task key={t.id} t={t} step={i + 1} sprintId={sprint.id} done={Boolean(sprint.done[t.id])} locked={!sprint.unlocked && t.kind !== "learn"} />
              ))}
            </ol>

            {/* Coming up: a horizontal strip of days */}
            <h2 className="headline mt-14 text-[24px] text-ink">Coming up</h2>
            <div className="scrollbar-none -mx-4 mt-4 overflow-x-auto px-4 pb-3 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
              <ol className="flex gap-3">
                {visibleDays.map((d, i) => (
                  <DayCard key={d.date} d={d} i={i} />
                ))}
                {!sprint.unlocked && plan.length > 3 ? (
                  <li className="flex w-[220px] shrink-0 flex-col items-center justify-center gap-3 rounded-3xl bg-bg-subtle p-5 text-center border-2 border-dashed border-line-strong">
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-surface text-sprint-ink ring-2 ring-line">
                      <Lock className="size-6" />
                    </span>
                    <p className="font-brand text-[15px] font-extrabold text-ink">{plan.length - 3} more days in your plan</p>
                  </li>
                ) : null}
              </ol>
            </div>
          </div>

          <aside className="space-y-5">
            <section className={cn(panel, "p-5")}>
              <h2 className="font-brand text-[18px] font-extrabold text-ink">Readiness by unit</h2>
              <p className="mt-0.5 text-[13px] text-muted">Weighted by how much of the exam each unit covers.</p>
              <div className="mt-5">
                <ReadinessBars units={r} compact />
              </div>
              {weakest.length && sprint.unlocked ? (
                <div className="mt-5 border-t-2 border-line pt-4">
                  <p className="font-brand text-[13.5px] font-extrabold text-ink">Drill a weak unit</p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {weakest.map((u) => (
                      <Link
                        key={u.unit.id}
                        href={`/sprint/${sprint.id}/practice?mode=topic&topics=${catalog
                          .topicsForUnit(u.unit.id)
                          .slice(0, 4)
                          .map((t) => t.id)
                          .join(",")}`}
                        className="press-sm font-brand inline-flex h-10 items-center gap-1.5 rounded-2xl bg-surface px-3.5 text-[13.5px] font-extrabold text-ink ring-2 ring-inset ring-line [--ledge:var(--line)] hover:bg-bg-subtle"
                      >
                        <span className={cn("size-2.5 rounded-full", tone(u.score))} /> Unit {u.unit.order}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>

            {/* FRQ coach tile */}
            {sprint.unlocked ? (
              <Link href={`/sprint/${sprint.id}/frq`} className="press group relative flex items-center gap-4 overflow-hidden rounded-3xl bg-sprint p-5 text-white [--ledge:var(--sprint-press)] hover:brightness-105">
                <div aria-hidden className="pointer-events-none absolute -right-10 -top-12 size-32 rounded-full border-[18px] border-white/10" />
                <span className="relative flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/20">
                  <PenLine className="size-6" />
                </span>
                <span className="relative min-w-0 flex-1">
                  <span className="block font-brand text-[17px] font-extrabold">Free-response coach</span>
                  <span className="block text-[13px] text-white/85">{sprint.frq.length ? `${plural(sprint.frq.length, "answer")} graded` : "Write an answer, get rubric feedback"}</span>
                </span>
                <ArrowRight className="relative size-5 shrink-0 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ) : (
              <div className="relative flex items-center gap-4 rounded-3xl bg-bg-subtle p-5 ring-2 ring-line">
                <span className="relative flex size-12 shrink-0 items-center justify-center rounded-2xl bg-surface text-muted ring-2 ring-line">
                  <PenLine className="size-6" />
                  <LockBadge />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-brand text-[17px] font-extrabold text-ink">Free-response coach</span>
                  <span className="block text-[13px] text-muted">Write an answer, get rubric feedback</span>
                </span>
              </div>
            )}

            {/* Cram sheets as a grid of unit tiles */}
            <section className={cn(panel, "p-5")}>
              <h2 className="flex items-center gap-2 font-brand text-[18px] font-extrabold text-ink">
                <NotebookText className="size-5 text-sprint-ink" /> Cram sheets
              </h2>
              <ul className="mt-4 grid grid-cols-2 gap-2.5">
                {r.map((u) => (
                  <li key={u.unit.id}>
                    {sprint.unlocked ? (
                      <Link
                        href={`/sprint/${sprint.id}/cram/${encodeURIComponent(u.unit.id)}`}
                        className="press-sm flex h-full flex-col gap-2 rounded-2xl bg-sprint-soft p-3 [--ledge:color-mix(in_oklab,var(--sprint)_30%,transparent)] hover:brightness-[0.98]"
                        title={u.unit.title}
                      >
                        <span className="tabular flex size-8 items-center justify-center rounded-xl bg-sprint font-brand text-[14px] font-black text-white">{u.unit.order}</span>
                        <span className="line-clamp-2 text-[12.5px] font-semibold leading-snug text-ink">{u.unit.title}</span>
                      </Link>
                    ) : (
                      <span className="relative flex h-full flex-col gap-2 rounded-2xl bg-bg-subtle p-3" title={u.unit.title}>
                        <span className="tabular flex size-8 items-center justify-center rounded-xl bg-line font-brand text-[14px] font-black text-muted">{u.unit.order}</span>
                        <Lock aria-hidden className="absolute right-3 top-3 size-4 text-faint" />
                        <span className="line-clamp-2 text-[12.5px] font-semibold leading-snug text-muted">{u.unit.title}</span>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>

            <details className={cn(panel, "group p-5 [&_summary::-webkit-details-marker]:hidden")}>
              <summary className="flex cursor-pointer list-none items-center gap-2 font-brand text-[16px] font-extrabold text-ink">
                <Settings2 className="size-5 text-muted" /> Sprint settings
              </summary>
              <form action={updateSprintSettings.bind(null, sprint.id)} className="mt-4 space-y-4">
                <label className="block">
                  <span className="mb-1.5 block font-brand text-[13.5px] font-extrabold text-ink-2">Exam date</span>
                  <input type="date" name="examDate" defaultValue={sprint.examDate} className={inputClass} />
                </label>
                <StudyTimeInput defaultMinutes={sprint.minutesPerDay} />
                <button className={buttonClass("sprint", "md", "w-full")}>Save</button>
              </form>
              {!sprint.unlocked ? (
                <form action={deleteSprint.bind(null, sprint.id)} className="mt-3">
                  <button className="font-brand text-[13px] font-bold text-muted hover:text-danger">Delete this Sprint</button>
                </form>
              ) : null}
            </details>
          </aside>
        </div>
      </div>
    </div>
  );
}

function LockBadge() {
  return (
    <span aria-hidden className="absolute -bottom-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-ink text-bg ring-2 ring-surface">
      <Lock className="size-2.5" strokeWidth={3} />
    </span>
  );
}

const KIND = {
  learn: { Icon: BookOpen, label: "Learn" },
  practice: { Icon: Target, label: "Practice" },
  checkpoint: { Icon: ClipboardCheck, label: "Checkpoint" },
  cram: { Icon: NotebookText, label: "Cram sheet" },
  frq: { Icon: PenLine, label: "Free response" },
  rest: { Icon: Coffee, label: "Rest" },
} as const;

function taskTitle(t: SprintTask) {
  switch (t.kind) {
    case "learn":
      return `Learn: ${t.topic.title}`;
    case "practice":
      return `Practice: ${plural(t.count, "question")}`;
    case "checkpoint":
      return `Checkpoint: ${t.count} mixed questions`;
    case "cram":
      return `Cram sheet: Unit ${t.unit.order}`;
    case "frq":
      return `Free response: Unit ${t.unit.order}`;
    default:
      return t.why;
  }
}

function DayCard({ d, i }: { d: SprintDay; i: number }) {
  const date = new Date(`${d.date}T12:00:00`);
  return (
    <li className="rise flex w-[240px] shrink-0 flex-col rounded-3xl bg-surface p-4 ring-2 ring-line" style={{ ["--i" as string]: i }}>
      <div className="flex items-center gap-3">
        <span className={cn("flex w-12 shrink-0 flex-col items-center rounded-2xl py-1.5", d.index === 1 ? "bg-sprint text-white" : "bg-sprint-soft text-sprint-ink")}>
          <span className="font-brand text-[10.5px] font-extrabold uppercase tracking-wide">{date.toLocaleDateString("en-US", { weekday: "short" })}</span>
          <span className="tabular font-brand text-[20px] font-black leading-none">{date.getDate()}</span>
        </span>
        <div className="min-w-0">
          <p className="font-brand text-[15.5px] font-extrabold text-ink">{d.index === 1 ? "Tomorrow" : date.toLocaleDateString("en-US", { weekday: "long" })}</p>
          <p className="tabular text-[12.5px] text-muted">
            {d.minutes} min · {d.daysLeft} to go
          </p>
        </div>
      </div>
      <ul className="mt-3 space-y-1.5">
        {d.tasks.map((t) => {
          const { Icon } = KIND[t.kind];
          return (
            <li key={t.id} className="flex items-center gap-2 rounded-xl bg-bg-subtle px-2.5 py-2 text-[13px] text-ink-2">
              <Icon className="size-4 shrink-0 text-sprint-ink" />
              <span className="min-w-0 flex-1 truncate">{taskTitle(t)}</span>
            </li>
          );
        })}
      </ul>
    </li>
  );
}

function Task({ t, step, sprintId, done, locked }: { t: SprintTask; step: number; sprintId: string; done: boolean; locked: boolean }) {
  const href =
    t.kind === "practice"
      ? `/sprint/${sprintId}/practice?mode=daily&topics=${t.topicIds.join(",")}&task=${encodeURIComponent(t.id)}`
      : t.kind === "checkpoint"
        ? `/sprint/${sprintId}/practice?mode=checkpoint&task=${encodeURIComponent(t.id)}`
        : t.kind === "cram"
          ? `/sprint/${sprintId}/cram/${encodeURIComponent(t.unit.id)}`
          : t.kind === "frq"
            ? `/sprint/${sprintId}/frq?unit=${encodeURIComponent(t.unit.id)}`
            : null;
  const { Icon, label } = KIND[t.kind];
  return (
    <li className="rise relative flex items-start gap-4" style={{ ["--i" as string]: step }}>
      <div className="relative z-10 pt-3">
        {t.kind !== "rest" ? (
          <SprintTaskToggle sprintId={sprintId} taskId={t.id} done={done} step={step} />
        ) : (
          <span className="flex size-12 items-center justify-center rounded-full bg-bg-subtle text-muted ring-2 ring-inset ring-line">
            <Coffee className="size-5" />
          </span>
        )}
      </div>
      <div className={cn("min-w-0 flex-1 rounded-3xl bg-surface p-4 ring-2 transition-[box-shadow,opacity] sm:p-5", done ? "ring-positive/40" : "ring-line")}>
        <div className="flex items-center gap-2">
          <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-brand text-[12px] font-extrabold", done ? "bg-positive-soft text-positive" : "bg-sprint-soft text-sprint-ink")}>
            <Icon className="size-3.5" /> {label}
          </span>
          {t.minutes ? <span className="tabular font-brand text-[12.5px] font-bold text-muted">{t.minutes} min</span> : null}
        </div>
        <p className={cn("mt-2 font-brand text-[18px] font-extrabold leading-snug text-ink", done && "text-muted line-through decoration-2")}>{taskTitle(t)}</p>
        <p className="mt-0.5 text-[13.5px] text-muted">{t.why}</p>
        {t.kind === "learn" && t.videos.length ? (
          <div className="mt-3 grid gap-1 sm:grid-cols-2">
            {t.videos.map((v) => (
              <LessonMini key={v.id} v={v} />
            ))}
          </div>
        ) : null}
        {t.kind === "learn" && !t.videos.length ? (
          <Link href={`/courses/${t.topic.courseId}/${t.topic.slug}`} className="mt-3 inline-flex items-center gap-1.5 font-brand text-[13.5px] font-extrabold text-accent-ink hover:underline">
            <CalendarDays className="size-4" /> Open the topic
          </Link>
        ) : null}
        {href ? (
          locked ? (
            <p className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-bg-subtle px-3.5 py-2 font-brand text-[13.5px] font-extrabold text-muted">
              <Lock className="size-4" /> Unlock your Sprint to start
            </p>
          ) : (
            <Link href={href} className={buttonClass(done ? "outline" : "sprint", "md", "mt-4")}>
              {t.kind === "cram" ? "Open cram sheet" : t.kind === "frq" ? "Open the coach" : done ? "Practice again" : "Start"} <ArrowRight className="size-4" />
            </Link>
          )
        ) : null}
      </div>
    </li>
  );
}
