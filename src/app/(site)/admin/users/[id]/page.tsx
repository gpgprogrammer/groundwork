import { Clock, Laptop, MousePointerClick, Smartphone, Tablet } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, cn, panel } from "@/components/ui";
import { getAdminUser } from "@/lib/admin-users";
import { eventsForUser } from "@/lib/analytics";
import { ANALYTICS_TZ } from "@/lib/analytics-report";
import { getCatalog, type IndexedCatalog } from "@/lib/catalog";
import { getStore } from "@/lib/data/store";
import { env } from "@/lib/env";
import { PRACTICE_COLLECTION, recentAccuracy, type PracticeStats } from "@/lib/practice-stats";
import { latestScore, SAT_COLLECTION, type SatPrep } from "@/lib/sat-prep";
import type { Sprint } from "@/lib/types";
import { buildUserActivity, duration } from "@/lib/user-activity";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "User activity", robots: { index: false } };

const when = (iso: string | null, withTime = true) =>
  iso
    ? new Date(iso).toLocaleString("en-US", { timeZone: ANALYTICS_TZ, month: "short", day: "numeric", year: "numeric", ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}) }) + (withTime ? " ET" : "")
    : "Never";
const short = (iso: string) => new Date(iso).toLocaleDateString("en-US", { timeZone: ANALYTICS_TZ, month: "short", day: "numeric" });
const clock = (iso: string) => new Date(iso).toLocaleTimeString("en-US", { timeZone: ANALYTICS_TZ, hour: "numeric", minute: "2-digit" });

/** Plain-English names for paths: "/practice/sat-math/discriminant" → "Practice · SAT Math · Discriminant". */
function pageName(path: string, catalog: IndexedCatalog) {
  const parts = path.split("/").filter(Boolean);
  const fixed: Record<string, string> = {
    "": "Home",
    lessons: "Lessons",
    courses: "Courses",
    practice: "Practice",
    sprint: "Exam Sprint",
    "sprint/sat": "SAT Prep",
    "sprint/new": "New test Sprint",
    plan: "Learning plan",
    schedule: "My schedule",
    progress: "Progress",
    library: "Library",
    ask: "Merit AI",
    tutors: "Tutors",
    "tutors/on-call": "On-call tutors",
    "tutors/book": "Book a tutor",
    "tutors/join": "Become a tutor",
    master: "Quick session",
    search: "Search",
    settings: "Settings",
    "settings/billing": "Plan and billing",
    onboarding: "Onboarding",
    signup: "Sign up",
    login: "Sign in",
    pricing: "Pricing",
    about: "About",
    "study-guides": "Study guides",
    shorts: "Quick lessons",
    admin: "Admin",
  };
  const key = parts.join("/");
  if (key in fixed) return fixed[key];
  const [head, c, t] = parts;
  const course = c ? catalog.course(c) : undefined;
  const topic = course && t && t !== "mixed" ? catalog.topicIn(course.id, t) : undefined;
  if ((head === "courses" || head === "practice" || head === "master") && course) {
    const base = head === "courses" ? "Course" : head === "practice" ? "Practice" : "Quick session";
    return [base, course.shortTitle, topic?.title ?? (t === "mixed" ? "Mixed" : t)].filter(Boolean).join(" · ");
  }
  if (head === "sprint" && c) return `Exam Sprint · ${t ?? "plan"}`;
  if (head === "go" && c) return `Lesson on YouTube · ${catalog.video(c)?.title ?? c}`;
  return path;
}

export default async function AdminUserPage({ params }: PageProps<"/admin/users/[id]">) {
  const viewer = await getViewer();
  if (!viewer?.isAdmin) notFound();
  const { id } = await params;
  const store = await getStore();
  const [user, events, catalog, state, practice, sprints, sat] = await Promise.all([
    getAdminUser(id, env.adminEmails),
    eventsForUser(id).catch(() => []),
    getCatalog(),
    store.getUserState(id),
    store.getDoc<PracticeStats>(PRACTICE_COLLECTION, id),
    store.listDocs<Sprint>("sprints", { owner: id }),
    store.getDoc<SatPrep>(SAT_COLLECTION, id),
  ]);
  if (!user) notFound();
  const a = buildUserActivity(events, { video: (v) => catalog.video(v)?.title ?? null });
  const name = (p: string) => pageName(p, catalog);
  const maxDay = Math.max(60, ...a.daily.map((d) => d.seconds));
  const practiced = practice ? Object.entries(practice.topics) : [];
  const answered = practiced.reduce((s, [, t]) => s + t.total, 0);
  const right = practiced.reduce((s, [, t]) => s + t.correct, 0);
  const SHOWN = 60;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-24 pt-8 sm:px-6 sm:pt-10 lg:px-8">
      <PageHeader
        back={{ href: "/admin/users", label: "Users" }}
        title={user.name || user.email}
        lede={
          <span className="text-[14px]">
            {user.email} · {user.roles.join(", ")} · signed up {when(user.signedUpAt)}
            {user.courses.length ? ` · ${user.courses.join(", ")}` : ""}
          </span>
        }
      />

      {!events.length ? (
        <p className={cn(panel, "mt-6 p-5 text-[14.5px] text-ink-2")}>
          No activity recorded for this account yet. Page views and time on each page are recorded for everyone; clicks and actions like practice rounds are recorded from Nov 28, 2026 on.
        </p>
      ) : null}

      {/* Totals */}
      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {[
          { k: "Time on Merit", v: duration(a.seconds) },
          { k: "Days active", v: String(a.activeDays) },
          { k: "Visits", v: String(a.sessionCount) },
          { k: "Avg visit", v: duration(a.avgSessionSeconds) },
          { k: "Pages viewed", v: String(a.pageViews) },
          { k: "Last active", v: a.lastSeen ? short(a.lastSeen) : "Never" },
          { k: "First seen", v: a.firstSeen ? short(a.firstSeen) : "·" },
          { k: "Found Merit via", v: a.firstSource ?? "·" },
        ].map((s) => (
          <div key={s.k} className={cn(panel, "px-4 py-3")}>
            <dt className="text-[12px] font-semibold text-muted">{s.k}</dt>
            <dd className="tabular mt-0.5 truncate font-brand text-[19px] font-black text-ink">{s.v}</dd>
          </div>
        ))}
      </dl>

      {/* Last 30 days */}
      <section className={cn(panel, "mt-6 p-5")}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="headline text-[19px] text-ink">Last 30 days</h2>
          <p className="text-[12.5px] text-muted">Active minutes per day (Eastern time). Hover a bar for details.</p>
        </div>
        <div className="mt-4 flex h-32 items-end gap-[3px]" role="img" aria-label={`Active minutes per day: ${a.daily.map((d) => Math.round(d.seconds / 60)).join(", ")}`}>
          {a.daily.map((d) => (
            <div key={d.day} title={`${d.day}: ${duration(d.seconds)} active, ${d.views} page${d.views === 1 ? "" : "s"}`} className="flex h-full min-w-0 flex-1 flex-col justify-end">
              <div className={cn("rounded-t-[3px]", d.seconds ? "bg-accent" : d.views ? "bg-line-strong" : "bg-bg-subtle")} style={{ height: d.seconds ? `${Math.max(6, (d.seconds / maxDay) * 100)}%` : d.views ? "4px" : "2px" }} />
            </div>
          ))}
        </div>
        <div className="mt-1.5 flex justify-between text-[11.5px] text-faint">
          <span>{a.daily[0]?.day}</span>
          <span>Today</span>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        {/* Pages */}
        <section className={cn(panel, "p-5")}>
          <h2 className="headline text-[19px] text-ink">Where their time went</h2>
          {a.pages.length ? (
            <table className="mt-3 w-full text-left text-[13.5px]">
              <thead className="text-[12px] text-muted">
                <tr>
                  <th className="py-1.5 font-semibold">Page</th>
                  <th className="py-1.5 text-right font-semibold">Visits</th>
                  <th className="py-1.5 text-right font-semibold">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {a.pages.slice(0, 25).map((p) => (
                  <tr key={p.path}>
                    <td className="max-w-0 truncate py-2 pr-3">
                      <Link href={p.path} className="text-ink hover:underline" title={p.path}>
                        {name(p.path)}
                      </Link>
                    </td>
                    <td className="tabular py-2 text-right text-ink-2">{p.views}</td>
                    <td className="tabular whitespace-nowrap py-2 text-right text-ink-2">{p.seconds ? duration(p.seconds) : "·"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="mt-3 text-[14px] text-muted">No page views yet.</p>
          )}
        </section>

        <div className="space-y-6">
          {/* Features */}
          <section className={cn(panel, "p-5")}>
            <h2 className="headline text-[19px] text-ink">What they used</h2>
            {a.features.length ? (
              <ul className="mt-3 grid grid-cols-2 gap-2">
                {a.features.map((f) => (
                  <li key={f.key} className="rounded-xl bg-bg-subtle px-3 py-2">
                    <span className="tabular block font-brand text-[18px] font-black text-ink">{f.n}</span>
                    <span className="text-[12.5px] text-muted">{f.key}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-[14px] text-muted">No actions recorded yet.</p>
            )}
            {a.devices.length ? (
              <p className="mt-3 flex flex-wrap items-center gap-3 text-[13px] text-ink-2">
                {a.devices.map((d) => {
                  const Icon = d.key === "mobile" ? Smartphone : d.key === "tablet" ? Tablet : Laptop;
                  return (
                    <span key={d.key} className="inline-flex items-center gap-1.5 capitalize">
                      <Icon className="size-4 text-muted" /> {d.key} · {d.n} visit{d.n === 1 ? "" : "s"}
                    </span>
                  );
                })}
              </p>
            ) : null}
          </section>

          {/* Their data */}
          <section className={cn(panel, "p-5")}>
            <h2 className="headline text-[19px] text-ink">Their progress</h2>
            <dl className="mt-3 space-y-2.5 text-[13.5px]">
              <Row k="Practice">{answered ? `${answered} problems across ${practiced.length} topic${practiced.length === 1 ? "" : "s"}, ${Math.round((right / answered) * 100)}% right` : "None yet"}</Row>
              {practiced.length ? (
                <Row k="Weakest topics">
                  {practiced
                    .filter(([, t]) => t.recent.length >= 3)
                    .sort((x, y) => recentAccuracy(x[1]) - recentAccuracy(y[1]))
                    .slice(0, 3)
                    .map(([tid, t]) => `${catalog.topic(tid)?.title ?? tid} (${Math.round(recentAccuracy(t) * 100)}%)`)
                    .join(", ") || "Not enough answers yet"}
                </Row>
              ) : null}
              <Row k="Lessons opened">{state ? Object.keys(state.history).length : 0}</Row>
              <Row k="Saved lessons">{state ? Object.keys(state.saves).length : 0}</Row>
              <Row k="Topics mastered">{state ? Object.keys(state.mastered).length : 0}</Row>
              <Row k="Exam Sprints">
                {sprints.length
                  ? sprints.map((s) => `${s.kind === "test" && s.title ? s.title : (catalog.course(s.courseId)?.shortTitle ?? s.courseId)} (${s.examDate}, ${s.answers.length} answers, ${Object.keys(s.done).length} tasks done)`).join("; ")
                  : "None"}
              </Row>
              <Row k="SAT Prep">
                {sat
                  ? `Target ${sat.target} on ${sat.testDate}; latest ${latestScore(sat).total ?? "no score"}; ${sat.scores.length} score${sat.scores.length === 1 ? "" : "s"} logged; ${Object.keys(sat.done).length} tasks done`
                  : "No plan"}
              </Row>
            </dl>
          </section>
        </div>
      </div>

      {/* Every visit */}
      <section className="mt-8">
        <h2 className="headline text-[22px] text-ink">Every visit</h2>
        <p className="mt-1 text-[13.5px] text-muted">
          Newest first. A visit ends after 30 minutes without activity. Time counts only while the page was open, visible, and in use.
        </p>
        <div className="mt-4 space-y-3">
          {a.sessions.slice(0, SHOWN).map((s, i) => (
            <details key={s.start} open={i < 3} className={cn(panel, "group")}>
              <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3.5">
                <span className="font-brand text-[15px] font-extrabold text-ink">{when(s.start)}</span>
                <span className="inline-flex items-center gap-1 text-[13px] text-ink-2">
                  <Clock className="size-3.5 text-muted" /> {s.seconds ? duration(s.seconds) : "under a minute"}
                </span>
                <span className="text-[13px] text-ink-2">
                  {s.steps.length} page{s.steps.length === 1 ? "" : "s"}
                </span>
                <span className="inline-flex items-center gap-1 text-[13px] text-ink-2">
                  <MousePointerClick className="size-3.5 text-muted" /> {s.steps.reduce((n, st) => n + st.actions.length, 0)} actions
                </span>
                <span className="text-[13px] capitalize text-muted">
                  {s.device ?? "device unknown"} · {s.source}
                  {s.country ? ` · ${s.country}` : ""}
                </span>
                {!s.signedIn ? <span className="rounded-full bg-warn-soft px-2 py-px text-[11.5px] font-semibold text-warn">before signing in</span> : null}
              </summary>
              <ol className="border-t border-line px-5 py-3">
                {s.steps.map((st, k) => (
                  <li key={`${st.at}-${k}`} className="grid grid-cols-[64px_minmax(0,1fr)] gap-3 py-1.5">
                    <span className="tabular pt-0.5 text-[12px] text-muted">{clock(st.at)}</span>
                    <div className="min-w-0">
                      <p className="text-[14px]">
                        <Link href={st.path === "(server)" ? "#" : st.path} className="font-semibold text-ink hover:underline" title={st.path}>
                          {st.path === "(server)" ? "Action" : name(st.path)}
                        </Link>
                        {st.seconds ? <span className="tabular ml-2 text-[12.5px] text-muted">{duration(st.seconds)}</span> : null}
                      </p>
                      {st.actions.length ? (
                        <ul className="mt-0.5 space-y-0.5">
                          {st.actions.map((ac, j) => (
                            <li key={j} className="flex gap-2 text-[13px] text-ink-2">
                              <span className="tabular shrink-0 text-faint">{clock(ac.at)}</span>
                              <span className="min-w-0 break-words">{ac.text}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            </details>
          ))}
        </div>
        {a.sessions.length > SHOWN ? <p className="mt-3 text-[13px] text-muted">Showing the latest {SHOWN} of {a.sessions.length} visits.</p> : null}
      </section>
    </div>
  );
}

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-3">
      <dt className="text-muted">{k}</dt>
      <dd className="text-ink">{children}</dd>
    </div>
  );
}
