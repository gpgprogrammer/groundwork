import { ArrowRight, CalendarCheck, Check, Flame, Lock, PlayCircle, Target, Trophy } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CourseIcon, courseColors } from "@/components/course-icon";
import { HeroPill, heroWhite, PlanHero } from "@/components/plan-ui";
import { PlusBadge, PlusLocked } from "@/components/upgrade";
import { cn, Notice } from "@/components/ui";
import { hasPlus } from "@/lib/billing/access";
import { getCatalog } from "@/lib/catalog";
import { getStore } from "@/lib/data/store";
import { getDoneTasks } from "@/lib/plan-store";
import { courseProgress, nextTopicInCourse } from "@/lib/recommend";
import type { Sprint } from "@/lib/types";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Progress" };

const DAY = 86400000;
const key = (iso: string) => new Date(iso).toDateString();

function activityStats(stamps: string[], now = Date.now()) {
  const active = new Set(stamps.map(key));
  // A streak survives until the end of today even if you haven't studied yet.
  let streak = 0;
  let t = now;
  if (!active.has(new Date(t).toDateString())) t -= DAY;
  while (active.has(new Date(t).toDateString())) {
    streak++;
    t -= DAY;
  }
  const thisWeek = stamps.filter((s) => new Date(s).getTime() > now - 7 * DAY).length;
  return { streak, thisWeek };
}

function heatmapStart() {
  const end = new Date(new Date().toDateString());
  return { end, start: new Date(end.getTime() - (7 * 12 - 1 + end.getDay()) * DAY) };
}

export default async function ProgressPage() {
  const [viewer, catalog] = await Promise.all([getViewer(), getCatalog()]);
  if (!viewer || !hasPlus(viewer.plus)) {
    return (
      <div className="pb-16">
        <PlanHero
          kicker={
            <HeroPill>
              <Lock className="size-3.5" /> Merit Plus
            </HeroPill>
          }
        >
          <h1 className="display rise text-[44px] sm:text-[64px]" style={{ ["--i" as string]: 1 }}>
            Progress
          </h1>
          <p className="rise mt-3 max-w-xl text-[17px] leading-relaxed text-white/90" style={{ ["--i" as string]: 2 }}>
            A streak, a 12-week activity map, and a bar for every unit in every course you take.
          </p>
        </PlanHero>
        <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:px-8">
          <PlusLocked access={viewer?.plus ?? { kind: "anonymous" }} feature="Progress tracking" returnTo="/progress" />
        </div>
      </div>
    );
  }
  const { state } = viewer;
  const [done, sprints] = await Promise.all([getDoneTasks(viewer.user.id), (await getStore()).listDocs<Sprint>("sprints", { owner: viewer.user.id })]);

  // Every dated thing the student did.
  const stamps = [
    ...Object.values(state.history).map((h) => h.openedAt),
    ...Object.values(state.mastered),
    ...Object.values(done),
    ...sprints.flatMap((s) => s.answers.map((a) => a.at)),
  ];
  const { streak, thisWeek } = activityStats(stamps);
  const mastered = Object.keys(state.mastered).length;
  const watched = Object.keys(state.history).length;

  // 12-week heatmap, Sunday-aligned columns.
  const counts = new Map<string, number>();
  for (const s of stamps) counts.set(key(s), (counts.get(key(s)) ?? 0) + 1);
  const { start, end } = heatmapStart();
  const cells = Array.from({ length: Math.round((end.getTime() - start.getTime()) / DAY) + 1 }, (_, i) => {
    const d = new Date(start.getTime() + i * DAY);
    return { d, n: counts.get(d.toDateString()) ?? 0 };
  });

  const courses = state.profile.courseIds.map((id) => catalog.course(id)).filter((c) => c !== undefined);

  return (
    <div className="pb-16">
      <PlanHero
        kicker={<PlusBadge onDark />}
        aside={
          <div className="flex items-center gap-4 rounded-3xl bg-white/15 p-5 ring-2 ring-inset ring-white/25">
            <span className={cn("flex size-20 shrink-0 items-center justify-center rounded-3xl", streak ? "bg-[#ff9d3d] text-white shadow-[0_5px_0_0_#c2560b]" : "bg-white/15 text-white/70")}>
              <Flame className="size-11" fill="currentColor" strokeWidth={1.5} />
            </span>
            <div>
              <p className="tabular display text-[64px] leading-none">{streak}</p>
              <p className="mt-1 font-brand text-[15px] font-extrabold text-white/85">day streak</p>
            </div>
          </div>
        }
      >
        <h1 className="display rise text-[44px] sm:text-[64px]" style={{ ["--i" as string]: 1 }}>
          Your progress
        </h1>
        <p className="rise mt-3 max-w-xl text-[17px] leading-relaxed text-white/90" style={{ ["--i" as string]: 2 }}>
          {streak ? `${streak} ${streak === 1 ? "day" : "days"} in a row. Keep it going tonight.` : "Study a little tonight to start a streak."}
        </p>
        <div className="rise mt-6 flex flex-wrap gap-2.5" style={{ ["--i" as string]: 3 }}>
          <Link href="/plan" className={heroWhite}>
            <CalendarCheck className="size-4" /> Open my learning plan
          </Link>
        </div>
      </PlanHero>

      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:px-8">
        {!stamps.length ? (
          <div className="mb-6">
            <Notice>
              Your progress fills in as you study: open lessons, mark topics <span className="font-semibold">I understand this</span>, and watch the videos in your learning plan.{" "}
              <Link href="/plan" className="font-semibold text-accent-ink hover:underline">
                Open my learning plan
              </Link>
            </Notice>
          </div>
        ) : null}
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] grid-cols-[minmax(0,1fr)]">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {[
            { icon: Flame, label: "Day streak", value: streak, tone: "bg-sprint-soft text-sprint-ink" },
            { icon: Trophy, label: "Topics understood", value: mastered, tone: "bg-warn-soft text-warn" },
            { icon: PlayCircle, label: "Lessons watched", value: watched, tone: "bg-accent-soft text-accent-ink" },
            { icon: Target, label: "Study actions this week", value: thisWeek, tone: "bg-positive-soft text-positive" },
          ].map((s, i) => (
            <div key={s.label} className="rise rounded-3xl bg-surface p-4 ring-2 ring-line sm:p-5" style={{ ["--i" as string]: i }}>
              <span className={cn("flex size-11 items-center justify-center rounded-2xl", s.tone)}>
                <s.icon className="size-6" strokeWidth={2.2} />
              </span>
              <p className="tabular display mt-4 text-[40px] leading-none text-ink">{s.value}</p>
              <p className="mt-1.5 font-brand text-[13.5px] font-extrabold text-muted">{s.label}</p>
            </div>
          ))}
        </div>

        <section className="min-w-0 rounded-3xl bg-surface p-5 ring-2 ring-line sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="headline text-[22px] text-ink">Last 12 weeks</h2>
            <div className="flex items-center gap-1.5 font-brand text-[12.5px] font-bold text-muted" aria-hidden>
              Less
              <span className="size-4 rounded-[5px] bg-bg-subtle ring-1 ring-inset ring-line" />
              <span className="size-4 rounded-[5px] bg-positive/30" />
              <span className="size-4 rounded-[5px] bg-positive/60" />
              <span className="size-4 rounded-[5px] bg-positive" />
              More
            </div>
          </div>
          <div className="scrollbar-none mt-5 overflow-x-auto pb-1">
            <div className="grid w-max grid-flow-col grid-rows-7 gap-1.5">
              {cells.map((c) => (
                <span
                  key={c.d.toISOString()}
                  title={`${c.d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}: ${c.n} ${c.n === 1 ? "action" : "actions"}`}
                  className={cn(
                    "size-[18px] rounded-[6px] sm:size-6",
                    c.n === 0 ? "bg-bg-subtle ring-1 ring-inset ring-line" : c.n < 3 ? "bg-positive/30" : c.n < 6 ? "bg-positive/60" : "bg-positive",
                  )}
                />
              ))}
            </div>
          </div>
        </section>
        </div>

        <h2 className="headline mt-12 text-[24px] text-ink">By course</h2>
        {!courses.length ? <p className="mt-3 text-muted">Add courses in onboarding to track them here.</p> : null}
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {courses.map((c) => {
            const p = courseProgress(catalog, state, c.id);
            const next = nextTopicInCourse(catalog, state, c.id);
            const units = catalog.unitsForCourse(c.id);
            const { from, to } = courseColors(c.id);
            const pct = Math.round((p.done / Math.max(1, p.total)) * 100);
            return (
              <section key={c.id} className="flex flex-col overflow-hidden rounded-3xl bg-surface ring-2 ring-line" style={{ ["--c" as string]: from, ["--c2" as string]: to }}>
                <div className="relative overflow-hidden bg-[linear-gradient(135deg,var(--c),var(--c2))] p-5 text-white">
                  <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 size-36 rounded-full border-[22px] border-white/10" />
                  <div className="relative flex items-center gap-3">
                    <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-2 ring-white/25">
                      <CourseIcon id={c.id} size={40} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <Link href={`/courses/${c.slug}`} className="block truncate font-brand text-[18px] font-extrabold hover:underline">
                        {c.title}
                      </Link>
                      <p className="tabular font-brand text-[13.5px] font-bold text-white/85">
                        {p.done} of {p.total} topics · {pct}%
                      </p>
                    </div>
                    <span className="tabular display text-[34px] leading-none">{pct}%</span>
                  </div>
                  <div className="relative mt-4 h-3 overflow-hidden rounded-full bg-black/20">
                    <div className="h-full rounded-full bg-white" style={{ width: `${Math.max(pct, p.done ? 3 : 0)}%` }} />
                  </div>
                </div>
                <div className="flex-1 space-y-2.5 p-5">
                  {units.map((u) => {
                    const ts = catalog.topicsForUnit(u.id);
                    const d = ts.filter((t) => state.mastered[t.id]).length;
                    const full = ts.length > 0 && d === ts.length;
                    return (
                      <div key={u.id} className="flex items-center gap-3 text-[13px]">
                        <span
                          className={cn("tabular flex size-7 shrink-0 items-center justify-center rounded-lg font-brand text-[12.5px] font-black", full ? "text-white" : "bg-bg-subtle text-ink-2")}
                          style={full ? { background: from } : undefined}
                        >
                          {full ? <Check className="size-4" strokeWidth={3.5} /> : u.order}
                        </span>
                        <span className="w-32 truncate font-semibold text-ink-2 sm:w-40" title={u.title}>
                          {u.title}
                        </span>
                        <span className="h-3 flex-1 overflow-hidden rounded-full bg-bg-subtle">
                          <span className="block h-full rounded-full" style={{ width: `${(d / Math.max(1, ts.length)) * 100}%`, background: from }} />
                        </span>
                        <span className="tabular w-10 text-right font-brand font-bold text-muted">
                          {d}/{ts.length}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {next ? (
                  <Link
                    href={`/courses/${c.slug}/${next.slug}`}
                    className="group flex items-center gap-2 border-t-2 border-line px-5 py-4 font-brand text-[14.5px] font-extrabold text-ink transition-colors hover:bg-bg-subtle"
                  >
                    <span className="text-muted">Next up:</span> <span className="min-w-0 flex-1 truncate">{next.title}</span>
                    <ArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ) : null}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
