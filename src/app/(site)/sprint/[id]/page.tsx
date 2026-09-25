import { ArrowRight, BookOpen, CalendarDays, ClipboardCheck, Coffee, Lock, NotebookText, PenLine, Play, Target } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { beginSprintTrial, deleteSprint, updateSprintSettings } from "@/app/actions/sprint";
import { sprintTrialDaysLeft } from "@/lib/billing/access";
import { CheckoutNotice } from "@/components/checkout-notice";
import { CourseIcon } from "@/components/course-icon";
import { Gauge, ReadinessBars } from "@/components/sprint/readiness";
import { SprintTaskToggle } from "@/components/sprint/task-toggle";
import { BuyButton } from "@/components/upgrade";
import { cn, formatDuration } from "@/components/ui";
import { SPRINT, usd } from "@/lib/billing/plans";
import { getCatalog } from "@/lib/catalog";
import { daysLeft, estimatedScore, overall, readiness, sprintPlan, type SprintDay, type SprintTask } from "@/lib/sprint";
import { consumeCredit, getSprint } from "@/lib/sprint-store";
import { requireViewer } from "@/lib/viewer";
import { StudyTimeInput } from "@/components/study-time-input";

export const metadata: Metadata = { title: "Exam Sprint" };

function dayName(d: SprintDay) {
  if (d.index === 0) return "Today";
  if (d.index === 1) return "Tomorrow";
  return new Date(`${d.date}T12:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
}

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

  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-20 pt-6 sm:px-6">
      <CheckoutNotice sp={sp} />
      <header className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#ff8a3d] via-[#ef5b25] to-[#9a2d0e] p-6 text-white sm:p-10">
        <div className="pointer-events-none absolute -right-16 -top-24 size-80 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <CourseIcon id={course.id} size={44} />
              <p className="text-[13px] font-bold uppercase tracking-wide text-white/85">{SPRINT.name}</p>
            </div>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">{sprint.kind === "test" && sprint.title ? sprint.title : course.title}</h1>
            {sprint.kind === "test" ? <p className="mt-1 text-[15px] font-medium text-white/85">{course.title} · {r.length} {r.length === 1 ? "unit" : "units"}</p> : null}
            <p className="mt-2 text-[16px] text-white/85">
              <span className="tabular text-2xl font-extrabold text-white">{left}</span> {left === 1 ? "day" : "days"} to {sprint.kind === "test" ? "test" : "exam"} day ·{" "}
              {new Date(`${sprint.examDate}T12:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {!took ? (
                <Link href={`/sprint/${sprint.id}/diagnostic`} className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-[#9a2d0e]">
                  <ClipboardCheck className="size-4" /> Take the diagnostic (10 min)
                </Link>
              ) : sprint.unlocked ? (
                <Link href={`/sprint/${sprint.id}/practice?mode=checkpoint`} className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-[#9a2d0e]">
                  <Play className="size-4 fill-current" /> Quick practice
                </Link>
              ) : null}
              <Link href="/ask" className="inline-flex h-11 items-center gap-2 rounded-full bg-white/15 px-5 text-sm font-semibold text-white hover:bg-white/25">
                Ask Merit AI
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Gauge value={overall(r)} label={`${Math.round(overall(r) * 100)}%`} sub="ready" />
            {sprint.kind === "test" ? null : (
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wide text-white/75">Estimated</p>
              <p className="tabular text-5xl font-extrabold">{est.label}</p>
              <p className="text-[12px] text-white/75">
                {est.scale} · {est.confidence === "good" ? "solid estimate" : est.confidence === "rough" ? "rough estimate" : "early estimate"}
              </p>
              <p className="tabular mt-2 text-[12px] text-white/75">
                {correct}/{sprint.answers.length} correct so far
              </p>
            </div>
            )}
          </div>
        </div>
      </header>

      {trialLeft !== null ? (
        <section className="mt-6 flex flex-col gap-3 rounded-2xl bg-[#fff1e8] p-4 text-ink sm:flex-row sm:items-center sm:justify-between dark:bg-[#3a1d0c]">
          <p className="text-[14px]">
            <span className="font-semibold">Free week of Exam Sprint:</span> {trialLeft} {trialLeft === 1 ? "day" : "days"} left. Unlock it for good to keep every class&apos;s Sprint.
          </p>
          <BuyButton product="sprint" returnTo={`/sprint/${sprint.id}`} variant="sprint" className="h-10 shrink-0">
            Unlock forever · {usd(SPRINT.price)}
          </BuyButton>
        </section>
      ) : null}
      {!sprint.unlocked ? (
        <section className="mt-6 flex flex-col gap-4 rounded-3xl bg-[#0b1530] p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="flex items-center gap-2 text-[13px] font-semibold text-[#ffb489]">
              <Lock className="size-4" /> Your plan is ready
            </p>
            <p className="mt-1 text-xl font-bold">Unlock Exam Sprint for every class, for good.</p>
            <p className="mt-1 max-w-xl text-[14px] text-white/75">One payment unlocks Sprints for every test and AP exam you&apos;ll ever have on Merit: daily lessons and practice, checkpoints, cram sheets, and the free-response coach. Calendar sync is included.</p>
          </div>
          <div className="flex shrink-0 flex-col items-center gap-2">
            {!viewer.billing.sprintTrialEndsAt ? (
              <form action={beginSprintTrial.bind(null, `/sprint/${sprint.id}`)}>
                <button className="h-12 rounded-full bg-white px-7 text-[15px] font-semibold text-[#0b1530] hover:bg-white/90">Start 7-day free trial</button>
              </form>
            ) : null}
            <BuyButton product="sprint" returnTo={`/sprint/${sprint.id}`} variant="sprint" className="h-12 px-7 text-[15px]">
              Unlock for {usd(SPRINT.price)}
            </BuyButton>
            <Link href="/pricing/parents" className="text-[12px] text-white/70 hover:text-white">
              Have a parent pay
            </Link>
          </div>
        </section>
      ) : null}

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold tracking-tight text-ink">Today</h2>
          <p className="text-[14px] text-muted">
            {today.tasks.length ? `About ${today.minutes} minutes.` : ""} {today.phase === "review" ? "Review phase: mixed practice and cram sheets." : today.phase === "final" ? "Final stretch." : ""}
          </p>
          <ul className="mt-4 space-y-3">
            {today.tasks.map((t) => (
              <Task key={t.id} t={t} sprintId={sprint.id} done={Boolean(sprint.done[t.id])} locked={!sprint.unlocked && t.kind !== "learn"} />
            ))}
          </ul>

          <h2 className="mt-12 text-xl font-bold tracking-tight text-ink">Coming up</h2>
          <div className="relative mt-4 space-y-6">
            {visibleDays.map((d) => (
              <section key={d.date}>
                <p className="flex items-baseline justify-between text-[15px] font-semibold text-ink">
                  {dayName(d)} <span className="tabular text-[12.5px] font-normal text-muted">{d.minutes} min</span>
                </p>
                <ul className="mt-2 space-y-2">
                  {d.tasks.map((t) => (
                    <li key={t.id} className="flex items-center gap-3 rounded-xl bg-bg-subtle px-4 py-2.5 text-[14px] text-ink-2">
                      <TaskIcon kind={t.kind} />
                      <span className="min-w-0 flex-1 truncate">{taskTitle(t)}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
            {!sprint.unlocked && plan.length > 3 ? (
              <div className="relative">
                <div className="pointer-events-none select-none space-y-2 opacity-60 blur-[3px]" aria-hidden>
                  {plan.slice(3, 6).map((d) => (
                    <div key={d.date} className="rounded-xl bg-bg-subtle px-4 py-5" />
                  ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="flex items-center gap-2 rounded-full bg-bg px-4 py-2 text-sm font-semibold text-ink shadow-soft ring-1 ring-line">
                    <Lock className="size-4" /> {plan.length - 3} more days in your plan
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <aside className="space-y-5">
          <section className="rounded-2xl p-5 ring-1 ring-line">
            <h2 className="text-[15px] font-semibold text-ink">Readiness by unit</h2>
            <p className="mt-0.5 text-[12.5px] text-muted">Weighted by how much of the exam each unit covers.</p>
            <div className="mt-4">
              <ReadinessBars units={r} compact />
            </div>
            {weakest.length && sprint.unlocked ? (
              <div className="mt-4 border-t border-line pt-4">
                <p className="text-[12.5px] font-medium text-muted">Drill a weak unit</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {weakest.map((u) => (
                    <Link
                      key={u.unit.id}
                      href={`/sprint/${sprint.id}/practice?mode=topic&topics=${catalog
                        .topicsForUnit(u.unit.id)
                        .slice(0, 4)
                        .map((t) => t.id)
                        .join(",")}`}
                      className="rounded-full bg-bg-subtle px-3 py-1 text-[12.5px] font-medium text-ink hover:bg-line"
                    >
                      Unit {u.unit.order}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </section>

          <section className="rounded-2xl p-5 ring-1 ring-line">
            <h2 className="flex items-center gap-2 text-[15px] font-semibold text-ink">
              <NotebookText className="size-4 text-[#e0531c]" /> Cram sheets
            </h2>
            <ul className="mt-3 space-y-1">
              {r.map((u) => (
                <li key={u.unit.id}>
                  {sprint.unlocked ? (
                    <Link href={`/sprint/${sprint.id}/cram/${encodeURIComponent(u.unit.id)}`} className="block truncate rounded-lg px-2 py-1.5 text-[13.5px] text-ink hover:bg-bg-subtle">
                      Unit {u.unit.order}: {u.unit.title}
                    </Link>
                  ) : (
                    <span className="flex items-center gap-2 truncate px-2 py-1.5 text-[13.5px] text-muted">
                      <Lock className="size-3.5 shrink-0" /> Unit {u.unit.order}: {u.unit.title}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <Link href={sprint.unlocked ? `/sprint/${sprint.id}/frq` : "#"} className={cn("flex items-center gap-4 rounded-2xl p-5 ring-1 ring-line", sprint.unlocked ? "hover:bg-bg-subtle" : "cursor-default opacity-70")}>
            <PenLine className="size-6 shrink-0 text-[#e0531c]" />
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-semibold text-ink">Free-response coach</span>
              <span className="block text-[13px] text-muted">{sprint.frq.length ? `${sprint.frq.length} answers graded` : "Write an answer, get rubric feedback"}</span>
            </span>
            {sprint.unlocked ? <ArrowRight className="size-4 text-muted" /> : <Lock className="size-4 text-muted" />}
          </Link>

          <details className="rounded-2xl p-5 ring-1 ring-line">
            <summary className="cursor-pointer text-[15px] font-semibold text-ink">Sprint settings</summary>
            <form action={updateSprintSettings.bind(null, sprint.id)} className="mt-4 space-y-3">
              <label className="block text-[13px] font-medium text-ink-2">
                Exam date
                <input type="date" name="examDate" defaultValue={sprint.examDate} className="mt-1 h-10 w-full rounded-lg bg-bg px-3 text-sm ring-1 ring-line-strong" />
              </label>
              <StudyTimeInput defaultMinutes={sprint.minutesPerDay} />
              <button className="h-10 w-full rounded-full bg-ink text-sm font-semibold text-bg">Save</button>
            </form>
            {!sprint.unlocked ? (
              <form action={deleteSprint.bind(null, sprint.id)} className="mt-3">
                <button className="text-[13px] text-muted hover:text-ink">Delete this Sprint</button>
              </form>
            ) : null}
          </details>
        </aside>
      </div>
    </div>
  );
}

function TaskIcon({ kind }: { kind: SprintTask["kind"] }) {
  const Icon = { learn: BookOpen, practice: Target, checkpoint: ClipboardCheck, cram: NotebookText, frq: PenLine, rest: Coffee }[kind];
  return <Icon className="size-4 shrink-0 text-[#e0531c]" />;
}

function taskTitle(t: SprintTask) {
  switch (t.kind) {
    case "learn":
      return `Learn: ${t.topic.title}`;
    case "practice":
      return `Practice: ${t.count} questions`;
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

function Task({ t, sprintId, done, locked }: { t: SprintTask; sprintId: string; done: boolean; locked: boolean }) {
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
  return (
    <li className={cn("rounded-2xl p-4 ring-1 ring-line", done && "opacity-60")}>
      <div className="flex items-start gap-4">
        {t.kind !== "rest" ? <SprintTaskToggle sprintId={sprintId} taskId={t.id} done={done} /> : <Coffee className="mt-1 size-6 text-muted" />}
        <div className="min-w-0 flex-1">
          <p className={cn("text-[16px] font-semibold text-ink", done && "line-through")}>{taskTitle(t)}</p>
          <p className="text-[13px] text-muted">
            {t.why}
            {t.minutes ? ` · ${t.minutes} min` : ""}
          </p>
          {t.kind === "learn" && t.videos.length ? (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {t.videos.map((v) => (
                <a key={v.id} href={`/go/${v.id}`} target="_blank" rel="noopener" className="group flex gap-3 rounded-xl p-1.5 hover:bg-bg-subtle">
                  <span className="relative w-28 shrink-0 overflow-hidden rounded-lg bg-bg-subtle">
                    <img src={v.thumbnail} alt="" className="aspect-video w-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
                    <span className="tabular absolute bottom-1 right-1 rounded bg-black/80 px-1 text-[10.5px] font-medium text-white">{formatDuration(v.durationSec)}</span>
                  </span>
                  <span className="min-w-0">
                    <span className="line-clamp-2 text-[13px] font-medium leading-snug text-ink group-hover:underline">{v.title}</span>
                    <span className="mt-0.5 block truncate text-[12px] text-muted">{v.channelTitle}</span>
                  </span>
                </a>
              ))}
            </div>
          ) : null}
          {href ? (
            locked ? (
              <p className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-muted">
                <Lock className="size-3.5" /> Unlock your Sprint to start
              </p>
            ) : (
              <Link href={href} className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-full bg-ink px-4 text-[13px] font-semibold text-bg hover:bg-ink/85">
                {t.kind === "cram" ? "Open cram sheet" : t.kind === "frq" ? "Open the coach" : "Start"} <ArrowRight className="size-3.5" />
              </Link>
            )
          ) : null}
        </div>
      </div>
      {t.kind === "learn" && !t.videos.length ? (
        <Link href={`/courses/${t.topic.courseId}/${t.topic.slug}`} className="ml-11 mt-2 inline-flex items-center gap-1 text-[13px] text-accent hover:underline">
          <CalendarDays className="size-3.5" /> Open the topic
        </Link>
      ) : null}
    </li>
  );
}
