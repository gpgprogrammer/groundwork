import { ArrowRight, CalendarDays, ChartLine, ExternalLink, Flag, GraduationCap, ListChecks, Target, Trash2, Upload } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { deleteSatPrep } from "@/app/actions/sat";
import { SatScoreForm, SatSetupForm, SatTaskRow } from "@/components/sat/forms";
import { buttonClass, cn, panel } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";
import { getStore } from "@/lib/data/store";
import { PRACTICE_COLLECTION, type PracticeStats } from "@/lib/practice-stats";
import { domainMastery, LINKS, latestScore, SAT_COLLECTION, SAT_DATES, SAT_DOMAINS, satDaysLeft, satPlan, sectionTargets, type SatDay, type SatPrep } from "@/lib/sat-prep";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = {
  title: "SAT Prep",
  description: "Tell Merit your SAT date, your target score, and where you are now. Get a free day-by-day plan with the lessons, practice problems, official practice tests, and question bank sets that get you there.",
};

const fmtDate = (iso: string, opts: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" }) => new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", opts);

function dateOptions(now = Date.now()) {
  const today = new Date(now).toISOString().slice(0, 10);
  return SAT_DATES.filter((d) => d.date >= today).map((d) => ({
    date: d.date,
    label: fmtDate(d.date, { weekday: "short", month: "long", day: "numeric", year: "numeric" }),
    closed: today > d.late,
    note: today <= d.register ? `Register by ${fmtDate(d.register, { month: "short", day: "numeric" })}` : today <= d.late ? `Late registration until ${fmtDate(d.late, { month: "short", day: "numeric" })}` : "Registration closed (already registered? pick it)",
  }));
}

export default async function SatPrepPage({ searchParams }: PageProps<"/sprint/sat">) {
  const [viewer, catalog, sp] = await Promise.all([getViewer(), getCatalog(), searchParams]);
  const store = await getStore();
  const [prep, practice] = viewer ? await Promise.all([store.getDoc<SatPrep>(SAT_COLLECTION, viewer.user.id), store.getDoc<PracticeStats>(PRACTICE_COLLECTION, viewer.user.id)]) : [null, null];
  const dates = dateOptions();

  if (!prep) return <Landing signedIn={Boolean(viewer)} dates={dates} />;

  const plan = satPlan(prep, catalog, practice);
  const left = satDaysLeft(prep.testDate);
  const now = latestScore(prep);
  const targets = sectionTargets(prep);
  const mastery = domainMastery(prep, catalog, practice);
  const today = plan[0];
  const upcoming = plan.slice(1, 7);
  const later = plan.slice(7);
  const weeks: SatDay[][] = [];
  for (let i = 0; i < later.length; i += 7) weeks.push(later.slice(i, i + 7));
  const studyMinutes = plan.reduce((s, d) => s + d.minutes, 0);
  const practiceTests = plan.filter((d) => d.tasks.some((t) => t.kind === "test")).length;
  const doneToday = today ? today.tasks.filter((t) => prep.done[t.id]).length : 0;
  const focus = [...SAT_DOMAINS].sort((a, b) => a.share * (mastery[a.id].mastery - 1) - b.share * (mastery[b.id].mastery - 1)).slice(0, 3).map((d) => d.id);
  const pastDone = Object.keys(prep.done).length;
  const flash = sp.created ? "Your plan is ready. Start with today." : sp.logged ? "Score saved. Your plan has been rebuilt around it." : sp.updated ? "Saved. Your plan has been updated." : null;

  return (
    <div className="pb-24">
      <header className="relative overflow-hidden bg-sprint text-white">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-28 size-[380px] rounded-full border-[52px] border-white/[0.08]" />
        <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-8 sm:px-6 lg:px-8 lg:pb-12">
          <Link href="/sprint" className="inline-flex items-center gap-1.5 font-brand text-[13.5px] font-bold text-white/80 hover:text-white">
            <Target className="size-3.5" /> Exam Sprint
          </Link>
          <p className="mt-4 font-brand text-[14px] font-extrabold uppercase tracking-wide text-white/80">SAT Prep</p>
          <h1 className="display rise mt-1 text-[40px] leading-[1.05] sm:text-[56px]">
            {prep.target} by {fmtDate(prep.testDate, { month: "long", day: "numeric" })}.
          </h1>
          <dl className="rise mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4" style={{ ["--i" as string]: 1 }}>
            {[
              { k: "Days to go", v: left === 0 ? "Today" : String(left) },
              { k: now.total != null ? "Your score now" : "Score now", v: now.total != null ? String(now.total) : "Not yet" },
              { k: "Points to go", v: now.total != null ? String(Math.max(0, prep.target - now.total)) : "·" },
              { k: "Plan ahead", v: `${Math.round(studyMinutes / 60)} hrs · ${practiceTests} test${practiceTests === 1 ? "" : "s"}` },
            ].map((s) => (
              <div key={s.k} className="rounded-2xl bg-white/15 px-4 py-3 ring-2 ring-inset ring-white/20">
                <dt className="text-[12.5px] font-bold text-white/80">{s.k}</dt>
                <dd className="tabular mt-0.5 font-brand text-[24px] font-black leading-tight">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {flash ? (
          <p className="fade mt-6 rounded-2xl bg-positive-soft px-4 py-3 text-[14.5px] font-semibold text-positive" role="status">
            {flash}
          </p>
        ) : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-6">
            {/* Today */}
            {today ? (
              <section className={cn(panel, "p-5 sm:p-6")}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="headline flex items-center gap-2 text-[22px] text-ink">
                    <ListChecks className="size-5 text-sprint-ink" /> Today
                  </h2>
                  <p className="tabular text-[13.5px] font-semibold text-muted">
                    {fmtDate(today.date)} · {today.minutes ? `${today.minutes} min` : "no study"} · {doneToday}/{today.tasks.length} done
                  </p>
                </div>
                <ul className="mt-2 divide-y divide-line">
                  {today.tasks.map((t) => (
                    <SatTaskRow key={t.id} task={t} done={Boolean(prep.done[t.id])} />
                  ))}
                </ul>
              </section>
            ) : null}

            {/* Next six days */}
            {upcoming.length ? (
              <section className={cn(panel, "p-5 sm:p-6")}>
                <h2 className="headline flex items-center gap-2 text-[20px] text-ink">
                  <CalendarDays className="size-5 text-sprint-ink" /> This week
                </h2>
                <div className="mt-3 space-y-4">
                  {upcoming.map((d) => (
                    <DayBlock key={d.date} day={d} done={prep.done} />
                  ))}
                </div>
              </section>
            ) : null}

            {/* Everything after */}
            {weeks.length ? (
              <section className={cn(panel, "p-5 sm:p-6")}>
                <h2 className="headline text-[20px] text-ink">The rest of your plan</h2>
                <p className="mt-1 text-[14px] text-muted">It rebuilds itself each time you log a score, so later weeks shift toward whatever is still weakest.</p>
                <div className="mt-3 divide-y divide-line">
                  {weeks.map((w, i) => (
                    <details key={w[0].date} className="group py-2">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-2">
                        <span className="font-brand text-[15px] font-extrabold text-ink">
                          Week {i + 2}: {fmtDate(w[0].date, { month: "short", day: "numeric" })} to {fmtDate(w.at(-1)!.date, { month: "short", day: "numeric" })}
                        </span>
                        <span className="tabular shrink-0 text-[13px] font-semibold text-muted">
                          {Math.round(w.reduce((s, d) => s + d.minutes, 0) / 6) / 10} hrs
                          {w.some((d) => d.tasks.some((t) => t.kind === "test")) ? " · practice test" : ""}
                        </span>
                      </summary>
                      <div className="space-y-4 pb-2 pt-1">
                        {w.map((d) => (
                          <DayBlock key={d.date} day={d} done={prep.done} />
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="min-w-0 space-y-6">
            {/* Scores */}
            <section id="scores" className={cn(panel, "scroll-mt-28 p-5")}>
              <h2 className="headline flex items-center gap-2 text-[20px] text-ink">
                <ChartLine className="size-5 text-sprint-ink" /> Your scores
              </h2>
              <div className="mt-4 space-y-4">
                {(["math", "rw"] as const).map((s) => {
                  const cur = now[s];
                  const tgt = targets[s];
                  return (
                    <div key={s}>
                      <div className="flex items-baseline justify-between text-[14px]">
                        <span className="font-semibold text-ink">{s === "math" ? "Math" : "Reading and Writing"}</span>
                        <span className="tabular text-muted">
                          <span className="font-brand font-black text-ink">{cur ?? "?"}</span> → {tgt}
                        </span>
                      </div>
                      <div className="relative mt-1.5 h-3 overflow-hidden rounded-full bg-bg-subtle ring-2 ring-inset ring-line">
                        <div className="h-full rounded-full bg-sprint" style={{ width: `${(((cur ?? 200) - 200) / 600) * 100}%` }} />
                        <span aria-hidden className="absolute inset-y-0 w-[3px] bg-ink" style={{ left: `${((tgt - 200) / 600) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <ScoreHistory prep={prep} />
              <details className="mt-4 rounded-2xl bg-bg-subtle">
                <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 font-brand text-[14.5px] font-extrabold text-ink">
                  <Upload className="size-4 text-sprint-ink" /> Log a new score
                </summary>
                <div className="px-4 pb-4">
                  <SatScoreForm />
                </div>
              </details>
            </section>

            {/* Domains */}
            <section className={cn(panel, "p-5")}>
              <h2 className="headline text-[20px] text-ink">By domain</h2>
              <p className="mt-1 text-[13px] text-muted">The plan spends the most time where you have the most points to gain.</p>
              {(["math", "rw"] as const).map((s) => (
                <div key={s} className="mt-4">
                  <p className="text-[12px] font-bold uppercase tracking-wide text-muted">{s === "math" ? "Math" : "Reading and Writing"}</p>
                  <ul className="mt-2 space-y-2.5">
                    {SAT_DOMAINS.filter((d) => d.section === s).map((d) => {
                      const m = mastery[d.id];
                      return (
                        <li key={d.id}>
                          <div className="flex items-baseline justify-between gap-2 text-[13.5px]">
                            <span className="min-w-0 font-semibold text-ink">
                              {d.short}
                              {focus.includes(d.id) ? <span className="ml-1.5 rounded-full bg-sprint-soft px-1.5 py-px text-[11px] font-bold text-sprint-ink">focus</span> : null}
                            </span>
                            <span className="tabular shrink-0 text-[12px] text-muted">{Math.round(d.share * 100)}% of section</span>
                          </div>
                          <div className="mt-1 h-2 overflow-hidden rounded-full bg-bg-subtle">
                            <div className={cn("h-full rounded-full", m.mastery >= 0.75 ? "bg-positive" : m.mastery >= 0.5 ? "bg-accent" : "bg-sprint")} style={{ width: `${Math.round(m.mastery * 100)}%` }} />
                          </div>
                          <p className="mt-0.5 text-[11.5px] text-faint">
                            {m.from === "you" ? "From your results" : m.from === "section" ? "Estimated from your section score" : "No results yet"}
                            {m.practiced >= 5 ? ` · ${m.practiced} recent Merit answers` : ""}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </section>

            <Resources />

            <section className={cn(panel, "p-5")}>
              <details>
                <summary className="cursor-pointer list-none font-brand text-[15px] font-extrabold text-ink">Change date, target, or study time</summary>
                <div className="mt-4">
                  <SatSetupForm dates={dateOptions()} initial={{ testDate: prep.testDate, target: prep.target, minutesPerDay: prep.minutesPerDay, daysPerWeek: prep.daysPerWeek }} editing />
                </div>
              </details>
              <p className="mt-4 text-[12.5px] text-muted">
                {pastDone} task{pastDone === 1 ? "" : "s"} checked off since {fmtDate(prep.createdAt.slice(0, 10), { month: "short", day: "numeric" })}.
              </p>
              <form action={deleteSatPrep} className="mt-3">
                <button className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted hover:text-danger">
                  <Trash2 className="size-3.5" /> Delete my SAT plan
                </button>
              </form>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

function DayBlock({ day, done }: { day: SatDay; done: Record<string, string> }) {
  return (
    <div>
      <p className="flex items-baseline justify-between gap-2">
        <span className="font-brand text-[14px] font-extrabold text-ink">
          {fmtDate(day.date)}
          {day.phase === "rest" ? <span className="ml-2 font-semibold text-muted">Rest</span> : null}
          {day.daysLeft === 0 ? <span className="ml-2 rounded-full bg-sprint px-2 py-px text-[11.5px] font-bold text-white">SAT day</span> : null}
        </span>
        {day.minutes ? <span className="tabular text-[12.5px] font-semibold text-muted">{day.minutes} min</span> : null}
      </p>
      {day.phase !== "rest" ? (
        <ul className="divide-y divide-line">
          {day.tasks.map((t) => (
            <SatTaskRow key={t.id} task={t} done={Boolean(done[t.id])} compact />
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/** Logged scores over time, with the target as a line. */
function ScoreHistory({ prep }: { prep: SatPrep }) {
  const pts = prep.scores.filter((s) => s.math != null && s.rw != null).map((s) => ({ at: s.takenOn ?? s.at.slice(0, 10), total: s.math! + s.rw!, src: s.source }));
  if (!pts.length) return <p className="mt-4 rounded-xl bg-bg-subtle px-3 py-2.5 text-[13px] text-ink-2">No scores yet. Take a practice test in Bluebook, then log it here.</p>;
  const w = 300;
  const h = 90;
  const lo = Math.min(prep.target, ...pts.map((p) => p.total)) - 40;
  const hi = Math.max(prep.target, ...pts.map((p) => p.total)) + 40;
  const y = (v: number) => h - ((v - lo) / (hi - lo)) * h;
  const x = (i: number) => (pts.length === 1 ? w / 2 : (i / (pts.length - 1)) * (w - 20) + 10);
  return (
    <div className="mt-5">
      <svg viewBox={`0 0 ${w} ${h}`} className="h-24 w-full" role="img" aria-label={`Scores over time: ${pts.map((p) => p.total).join(", ")}. Target ${prep.target}.`}>
        <line x1={0} x2={w} y1={y(prep.target)} y2={y(prep.target)} stroke="var(--line-strong)" strokeDasharray="4 4" strokeWidth={1.5} />
        <text x={w - 2} y={y(prep.target) - 4} textAnchor="end" className="fill-[var(--muted)] text-[10px] font-semibold">
          Target {prep.target}
        </text>
        <polyline points={pts.map((p, i) => `${x(i)},${y(p.total)}`).join(" ")} fill="none" stroke="var(--sprint)" strokeWidth={2.5} strokeLinejoin="round" />
        {pts.map((p, i) => (
          <circle key={i} cx={x(i)} cy={y(p.total)} r={4} fill={p.src === "official" ? "var(--ink)" : "var(--sprint)"} />
        ))}
      </svg>
      <ul className="mt-2 space-y-1 text-[12.5px] text-muted">
        {pts
          .slice(-4)
          .reverse()
          .map((p, i) => (
            <li key={i} className="flex justify-between">
              <span>
                {fmtDate(p.at, { month: "short", day: "numeric" })} · {p.src === "official" ? "Real SAT/PSAT" : "Practice test"}
              </span>
              <span className="tabular font-semibold text-ink">{p.total}</span>
            </li>
          ))}
      </ul>
    </div>
  );
}

const RESOURCES = [
  { name: "Bluebook", by: "College Board", what: "The app you take the real SAT in, with free full-length adaptive practice tests. Your plan schedules these.", href: LINKS.bluebook },
  { name: "My Practice", by: "College Board", what: "Review every question from your Bluebook practice tests, with explanations and your results by domain.", href: LINKS.myPractice },
  { name: "SAT Suite Question Bank", by: "College Board", what: "Thousands of official questions you can filter by section, domain, skill, and difficulty.", href: LINKS.qbank },
  { name: "Official Digital SAT Prep", by: "Khan Academy", what: "Free official lessons and practice, built with the College Board.", href: LINKS.khan },
  { name: "Desmos graphing calculator", by: "Desmos", what: "The calculator built into the SAT. Practice with it so you're fast on test day.", href: LINKS.desmos },
  { name: "Test dates and registration", by: "College Board", what: "Register, check deadlines, and confirm your test center.", href: LINKS.dates },
];

function Resources() {
  return (
    <section className={cn(panel, "p-5")}>
      <h2 className="headline flex items-center gap-2 text-[20px] text-ink">
        <GraduationCap className="size-5 text-sprint-ink" /> Free official tools
      </h2>
      <p className="mt-1 text-[13px] text-muted">Your plan sends you to these when they&apos;re the best place for the job. All free.</p>
      <ul className="mt-3 space-y-3">
        {RESOURCES.map((r) => (
          <li key={r.name}>
            <a href={r.href} target="_blank" rel="noreferrer" className="group block">
              <span className="flex items-center gap-1.5 font-brand text-[14.5px] font-extrabold text-ink group-hover:underline">
                {r.name} <ExternalLink className="size-3.5 text-muted" />
              </span>
              <span className="block text-[12.5px] font-semibold text-muted">{r.by}</span>
              <span className="mt-0.5 block text-[13px] leading-relaxed text-ink-2">{r.what}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Landing({ signedIn, dates }: { signedIn: boolean; dates: ReturnType<typeof dateOptions> }) {
  return (
    <div className="pb-24">
      <header className="relative overflow-hidden bg-sprint text-white">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-28 size-[380px] rounded-full border-[52px] border-white/[0.08]" />
        <div aria-hidden className="pointer-events-none absolute -bottom-40 left-[20%] size-80 rounded-full border-[40px] border-white/[0.07]" />
        <div className="relative mx-auto max-w-4xl px-4 pb-24 pt-8 sm:px-6">
          <Link href="/sprint" className="inline-flex items-center gap-1.5 font-brand text-[13.5px] font-bold text-white/80 hover:text-white">
            <Target className="size-3.5" /> Exam Sprint
          </Link>
          <p className="mt-4 flex w-fit items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 font-brand text-[13px] font-extrabold">SAT Prep · free</p>
          <h1 className="display rise mt-4 text-[42px] leading-[1.05] sm:text-[60px]">Your SAT score, planned day by day.</h1>
          <p className="rise mt-4 max-w-2xl text-[17px] leading-relaxed text-white/90" style={{ ["--i" as string]: 1 }}>
            Tell Merit your test date, the score you want, and where you are now. Upload your score report or type your breakdown. You get a plan for every day until the test: which lessons to watch, which problems to do, when to take practice tests, and exactly where to go for each.
          </p>
          <ol className="rise mt-7 flex flex-wrap gap-2.5" style={{ ["--i" as string]: 2 }}>
            {["Your date and target", "Where you are now", "A plan for every day"].map((s, i) => (
              <li key={s} className="flex items-center gap-2 rounded-2xl bg-white/15 py-1.5 pl-1.5 pr-4 font-brand text-[14px] font-extrabold ring-2 ring-inset ring-white/25">
                <span className="tabular flex size-7 items-center justify-center rounded-xl bg-white font-black text-sprint">{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
        </div>
      </header>

      <div className="relative mx-auto -mt-14 max-w-4xl px-4 sm:px-6">
        <div className="rise rounded-3xl bg-surface p-5 ring-2 ring-line shadow-[0_6px_0_0_var(--line)] sm:p-8" style={{ ["--i" as string]: 3 }}>
          {signedIn ? (
            <SatSetupForm dates={dates} />
          ) : (
            <div className="text-center">
              <h2 className="headline text-[24px] text-ink">Build your free SAT plan</h2>
              <p className="mx-auto mt-2 max-w-md text-[15px] text-ink-2">A free account saves your plan, your scores, and what you&apos;ve checked off.</p>
              <Link href="/signup?next=/sprint/sat" className={buttonClass("sprint", "lg", "mt-5 px-8")}>
                Start free <ArrowRight className="size-4" />
              </Link>
              <p className="mt-3 text-[13px] text-muted">
                Already have an account?{" "}
                <Link href="/login?next=/sprint/sat" className="font-semibold text-accent-ink underline underline-offset-2">
                  Sign in
                </Link>
              </p>
            </div>
          )}
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            { icon: Upload, t: "Start from your real scores", b: "Upload your score report PDF, type your section scores, or enter questions right per domain. No score yet? Day 1 is a free practice test." },
            { icon: Flag, t: "Aimed at your target", b: "Merit splits the points you need between Math and Reading and Writing, and spends the most time on the domains worth the most points to you." },
            { icon: CalendarDays, t: "Everything, every day", b: "Merit lessons and practice, official Bluebook practice tests, College Board question bank sets, Khan Academy, and Desmos, each on the right day." },
          ].map((f) => (
            <div key={f.t} className={cn(panel, "p-5")}>
              <f.icon className="size-6 text-sprint-ink" />
              <h3 className="mt-3 font-brand text-[16.5px] font-extrabold text-ink">{f.t}</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-ink-2">{f.b}</p>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <Resources />
        </div>
      </div>
    </div>
  );
}
