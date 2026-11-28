import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { money } from "@/components/booking-ui";
import { PageHeader, SegmentedLinks, cn } from "@/components/ui";
import { change } from "@/lib/analytics-report";
import { getViewer } from "@/lib/viewer";
import { loadAnalytics } from "./data";
import { costHistory } from "@/lib/ai/costs";
import { routingEnabled, TIER_CONFIG } from "@/lib/ai/router";
import { TIERS } from "@/lib/ai/router-rules";
import { LiveRefresh } from "./live-refresh";

export const metadata: Metadata = { title: "Analytics", robots: { index: false } };

const RANGES = [
  { d: 1, label: "Today" },
  { d: 7, label: "7 days" },
  { d: 30, label: "30 days" },
  { d: 90, label: "90 days" },
];

/** Names for the landing page's buttons. */
const FUNNELS: Record<string, string> = {
  "hero-student": "Top: Create a free account",
  "hero-explore": "Top: Browse lessons",
  "bento-lessons": "Lessons card: See the lessons",
  "path-student": "Students card",
  "path-teacher": "Teachers and tutors card",
  "path-parent": "Parents card",
  "footer-student": "Bottom: Create a free account",
  "calendar-signup": "Calendar section: Connect my calendar",
};

const pct = (n: number) => `${Math.round(n * 100)}%`;
const num = (n: number) => n.toLocaleString("en-US");
const dur = (s: number | null) => (s === null ? "–" : s < 60 ? `${Math.round(s)}s` : `${Math.floor(s / 60)}m ${String(Math.round(s % 60)).padStart(2, "0")}s`);
const shortDay = (key: string) => new Date(`${key}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const hourLabel = (h: string) => (Number(h) === 0 ? "12a" : Number(h) < 12 ? `${h}a` : Number(h) === 12 ? "12p" : `${Number(h) - 12}p`);
const when = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/New_York" }) : "–";

export default async function AnalyticsPage({ searchParams }: PageProps<"/admin/analytics">) {
  const viewer = await getViewer();
  if (!viewer?.isAdmin) notFound();
  const sp = await searchParams;
  const days = RANGES.find((r) => String(r.d) === sp.range)?.d ?? 7;
  const includeTeam = sp.team === "1";
  const [a, aiDays] = await Promise.all([loadAnalytics(days, includeTeam), costHistory(days)]);
  const r = a.report;
  const n = r.now;
  const p = r.before;
  const rangeLabel = RANGES.find((x) => x.d === days)!.label;
  const vs = days === 1 ? "vs yesterday" : `vs the ${days} days before`;
  const href = (o: { range?: number; team?: boolean }) => {
    const q = new URLSearchParams();
    q.set("range", String(o.range ?? days));
    if (o.team ?? includeTeam) q.set("team", "1");
    return `/admin/analytics?${q}`;
  };

  // Merit AI spend by tier for the range (recorded per answer by /api/ask when OpenRouter routing is on).
  const ai = TIERS.map((tier) => {
    const rows = aiDays.map((d) => d.tiers[tier]).filter((x) => x !== undefined);
    return { tier, answers: rows.reduce((s, x) => s + x.answers, 0), cost: rows.reduce((s, x) => s + x.cost, 0), baseline: rows.reduce((s, x) => s + x.baseline, 0), byRule: rows.reduce((s, x) => s + x.byRule, 0) };
  });
  const aiAnswers = ai.reduce((s, x) => s + x.answers, 0);
  const aiCost = ai.reduce((s, x) => s + x.cost, 0);
  const aiBaseline = ai.reduce((s, x) => s + x.baseline, 0);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-24 pt-8 sm:px-6 sm:pt-10 lg:px-8">
      <LiveRefresh seconds={60} />
      <PageHeader
        back={{ href: "/admin", label: "Admin" }}
        title="Analytics"
        actions={<SegmentedLinks label="Date range" active={String(days)} items={RANGES.map((x) => ({ key: String(x.d), label: x.label, href: href({ range: x.d }) }))} />}
      />

      <div className="rise mt-6 flex flex-col gap-3 rounded-2xl bg-positive-soft px-5 py-4 sm:flex-row sm:items-center sm:justify-between" style={{ ["--i" as string]: 1 }}>
        <p className="flex items-center gap-3 text-[15px] text-ink">
          <span className="relative flex size-3 shrink-0">
            {r.live ? <span className="absolute inline-flex size-full animate-ping rounded-full bg-positive opacity-60" /> : null}
            <span className={cn("relative inline-flex size-3 rounded-full", r.live ? "bg-positive" : "bg-faint")} />
          </span>
          <span>
            <span className="tabular text-2xl font-bold">{r.live}</span> {r.live === 1 ? "person" : "people"} on Merit right now <span className="text-muted">(last 5 minutes)</span>
          </span>
        </p>
        <Link href={href({ team: !includeTeam })} className="text-[13px] font-semibold text-ink-2 underline-offset-2 hover:underline">
          {includeTeam ? "Showing team visits · hide them" : "Team visits hidden · show them"}
        </Link>
      </div>

      {/* Headline numbers */}
      <section className="mt-8">
        <h2 className="headline mb-3 text-[17px] text-ink">
          {rangeLabel} <span className="font-sans text-[13px] font-medium text-muted">· {days === 1 ? shortDay(r.range.to) : `${shortDay(r.range.from)} to ${shortDay(r.range.to)}`}, Eastern time</span>
        </h2>
        <div className="tabular grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
          <Kpi label="Visitors" value={num(n.visitors)} delta={change(n.visitors, p.visitors)} vs={vs} prev={num(p.visitors)} hint="Real people, not bots or the team" />
          <Kpi label="New members" value={num(n.signups)} delta={change(n.signups, p.signups)} vs={vs} prev={num(p.signups)} hint={`${num(a.members.total)} members in total`} />
          <Kpi label="Sign-up rate" value={n.visitors ? pct(n.signupRate) : "–"} delta={p.signupRate ? change(n.signupRate, p.signupRate) : null} vs={vs} prev={p.visitors ? pct(p.signupRate) : "–"} hint="New members ÷ visitors" />
          <Kpi label="Active members" value={num(n.activeMembers)} delta={change(n.activeMembers, p.activeMembers)} vs={vs} prev={num(p.activeMembers)} hint="Signed-in people who used Merit" />
          <Kpi label="Came back another day" value={num(n.returning)} delta={change(n.returning, p.returning)} vs={vs} prev={num(p.returning)} hint={n.visitors ? `${pct(n.returning / n.visitors)} of visitors` : undefined} />
          <Kpi label="Time on Merit" value={dur(n.avgTime)} delta={n.avgTime !== null && p.avgTime ? change(n.avgTime, p.avgTime) : null} vs={vs} prev={dur(p.avgTime)} hint={n.timedVisitors ? `Average per visitor (${num(n.timedVisitors)} measured)` : "Average per visitor; measured from Nov 28"} />
        </div>
      </section>

      <Card title={r.hourly ? "Today by hour" : "Visitors and new members by day"} className="mt-4">
        <Chart series={r.series} hourly={r.hourly} />
      </Card>

      {/* New members */}
      <Card title={`New members (${a.members.joined.length})`} className="mt-8" aside={<Link href="/admin/users" className="text-[13px] font-semibold text-ink-2 hover:underline">All users</Link>}>
        {a.members.joined.length ? (
          <div className="-mx-2 overflow-x-auto">
            <table className="tabular w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-line text-[12px] text-muted">
                <tr>
                  {["Member", "Type", "Joined", "Found Merit through", "First page", "Days active", "Practice answers", "Lessons", "AI questions", "Last seen"].map((h) => (
                    <th key={h} scope="col" className="whitespace-nowrap px-2 pb-2.5 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {a.members.joined.map((m) => (
                  <tr key={m.id} className="transition-colors duration-150 hover:bg-bg-subtle/50">
                    <td className="max-w-[220px] truncate px-2 py-2 font-medium text-ink">{m.email ?? "–"}</td>
                    <td className="px-2 py-2 capitalize text-ink-2">{m.type ?? "–"}</td>
                    <td className="whitespace-nowrap px-2 py-2 text-ink-2">{when(m.at)}</td>
                    <td className="px-2 py-2 text-ink-2">{m.source}</td>
                    <td className="max-w-[180px] truncate px-2 py-2 text-ink-2">{m.landing ?? "–"}</td>
                    <td className="px-2 py-2">{num(m.daysActive)}</td>
                    <td className="px-2 py-2">{num(m.practiced)}</td>
                    <td className="px-2 py-2">{num(m.lessons)}</td>
                    <td className="px-2 py-2">{num(m.ai)}</td>
                    <td className="whitespace-nowrap px-2 py-2 text-ink-2">{when(m.lastSeen)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted">No one joined in this period.</p>
        )}
        <p className="mt-3 text-[12px] text-muted">
          {a.members.cohort
            ? `${num(a.members.cameBack)} of ${num(a.members.cohort)} members who joined at least a week ago (${pct(a.members.cameBack / a.members.cohort)}) came back on a later day in their first week.`
            : "First-week return rate appears once members have been around for a week."}{" "}
          {num(a.members.students)} students and {num(a.members.teachers)} teachers in total.
        </p>
      </Card>

      {/* Acquisition */}
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Table
          title="Where people come from"
          head={["Source", "Visitors", "New members"]}
          rows={r.sources.map((s) => [s.key, num(s.visitors), num(s.signups)])}
          empty="No visitors yet."
          note="From each visitor's first visit. Direct means typed in, bookmarked, or an app that hides where it came from. Tag links with ?ref=instagram (or tiktok) to track posts."
        />
        <Table
          title="Landing pages"
          head={["First page of the visit", "Visits", "Left right away"]}
          rows={r.landingPages.map((l) => [<PageLink key="l" path={l.key} />, num(l.sessions), pct(l.bounces / l.sessions)])}
          empty="No visits yet."
        />
      </div>

      {/* Engagement */}
      <Group title="How people use Merit">
        <Stat label="Visits" value={num(n.sessions)} hint="A visit ends after 30 idle minutes" />
        <Stat label="Pages per visit" value={n.sessions ? n.pagesPerSession.toFixed(1) : "–"} />
        <Stat label="Left after one page" value={n.sessions ? pct(n.bounceRate) : "–"} hint="Visits with a single page view" />
        <Stat label="Page views" value={num(n.views)} hint={`${num(p.views)} ${vs}`} />
        <Stat label="Practiced" value={num(a.learning.practicers)} hint={`${num(a.learning.practiceAnswers)} answers on topics practiced in this period`} />
        <Stat label="Opened a lesson" value={num(r.use.lessons.people)} hint={`${num(r.use.lessons.times)} lessons opened`} />
        <Stat label="Asked Merit AI" value={num(r.use.ai.people)} hint={`${num(r.use.ai.times)} questions`} />
        <Stat label="Connected a calendar" value={num(r.use.calendar.people)} />
        <Stat label="Exam Sprints started" value={num(a.learning.sprints)} />
        <Stat label="On-call tutor requests" value={num(a.learning.onCall)} />
        <Stat label="Study guides gotten" value={num(a.learning.guides)} />
        <Stat label="Merit video plays" value={num(r.use.uploads.times)} hint={`${num(r.use.uploads.people)} people`} />
      </Group>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Table
          title="Top pages"
          head={["Page", "People", "Views", "Avg. time"]}
          rows={r.pages.map((x) => [<PageLink key="l" path={x.key} />, num(x.visitors), num(x.views), dur(x.avgTime)])}
          empty="No page views yet."
        />
        <div className="grid gap-4">
          <Table title="Top courses" head={["Course", "People"]} rows={a.content.topCourses.map((c) => [c.label, num(c.n)])} empty="No course pages viewed yet." />
          <Table title="Most-opened YouTube lessons" head={["Lesson", "Opens"]} rows={a.content.topVideos.map((c) => [<span key="l" className="line-clamp-1">{c.label} <span className="text-muted">· {c.sub}</span></span>, num(c.n)])} empty="No lessons opened yet." />
        </div>
      </div>

      {/* Landing funnel */}
      <Group title="Home page funnel">
        <Stat label="Saw the home page" value={num(r.landingVisitors)} />
        <Stat label="Clicked a button" value={num(r.landingClickers)} hint={r.landingVisitors ? `${pct(r.landingClickers / r.landingVisitors)} of home page visitors` : undefined} />
        <Stat label="Joined" value={num(n.signups)} hint={r.landingVisitors ? `${pct(Math.min(1, n.signups / r.landingVisitors))} of home page visitors` : undefined} />
        <Stat label="Most-clicked button" value={r.ctaClicks[0] ? FUNNELS[r.ctaClicks[0].key] ?? r.ctaClicks[0].key : "–"} />
      </Group>

      <Group title="Money">
        <Stat label="Plus MRR" value={money(a.revenue.mrr)} />
        <Stat label="Paid Plus members" value={num(a.revenue.activePlus)} hint={`${a.revenue.monthly} monthly · ${a.revenue.yearly} yearly · ${a.revenue.canceling} canceling`} />
        <Stat label="Revenue this period" value={money(a.revenue.stripeRevenue)} hint="Stripe payments: Plus, Sprint, guide commission" />
        <Stat label="Sprint passes sold" value={num(a.revenue.sprintSold)} hint={money(a.revenue.sprintRevenue)} />
        <Stat label="Study guides sold" value={num(a.revenue.guideSales)} hint={`${money(a.revenue.guideFees)} Merit commission`} />
        <Stat label="Gifts bought" value={num(a.revenue.gifts)} />
        <Stat label="Checkouts started" value={num(r.use.checkout.times)} hint={`${num(r.use.checkout.people)} people`} />
      </Group>

      <Group title="Tutoring">
        <Stat label="Messages to tutors" value={num(a.tutoring.contacts)} />
        <Stat label="Bookings" value={num(a.tutoring.bookings)} hint={`${a.tutoring.confirmed} confirmed or done`} />
        <Stat label="Tutoring booked (GMV)" value={money(a.tutoring.gmv)} />
        <Stat label="Merit commission" value={money(a.tutoring.fees)} hint={`${money(a.tutoring.feesSettled)} collected all time · ${money(a.tutoring.feesOwed)} owed`} />
      </Group>

      <Group title="Merit AI cost">
        <Stat label="Answers routed" value={num(aiAnswers)} hint={routingEnabled() ? `${num(ai.reduce((s, x) => s + x.byRule, 0))} placed by rules, the rest by the classifier` : "Routing is off: set OPENROUTER_API_KEY"} />
        <Stat label="Spent" value={usd(aiCost)} hint={aiAnswers ? `${usd(aiCost / aiAnswers)} per answer` : undefined} />
        <Stat label="If every answer used the expert" value={usd(aiBaseline)} hint={`${TIER_CONFIG.expert.models[0]} at list price`} />
        <Stat label="Saved by routing" value={aiBaseline ? pct(1 - aiCost / aiBaseline) : "–"} hint={aiBaseline ? usd(aiBaseline - aiCost) : undefined} />
      </Group>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <Table title="Countries" head={["Country", "People"]} rows={r.countries.map((c) => [countryName(c.key), num(c.n)])} />
        <Table title="Devices" head={["Device", "People"]} rows={r.devices.map((c) => [<span key="d" className="capitalize">{c.key}</span>, `${num(c.n)} · ${n.visitors ? pct(c.n / n.visitors) : "0%"}`])} />
        <Table title="Home page buttons" head={["Button", "Clicks"]} rows={r.ctaClicks.map((c) => [FUNNELS[c.key] ?? c.key, num(c.n)])} empty="No clicks yet." />
        {a.content.topUploads.length ? <Table title="Most-played Merit videos" head={["Video", "Plays"]} rows={a.content.topUploads.map((c) => [<Link key="l" href={`/videos/${c.key}`} className="line-clamp-1 hover:underline">{c.label}</Link>, num(c.n)])} /> : null}
        {r.calendarMethods.length ? <Table title="How calendars get connected" head={["Method", "Times"]} rows={r.calendarMethods.map((c) => [c.key, num(c.n)])} /> : null}
      </div>

      <Card title="Tutors" className="mt-8">
        <div className="-mx-2 overflow-x-auto">
          <table className="tabular w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-line text-[12px] text-muted">
              <tr>
                {["Tutor", "Profile visitors", "Messages", "Link clicks (all time)", "Bookings", "GMV", "Commission"].map((h) => (
                  <th key={h} scope="col" className="whitespace-nowrap px-2 pb-2.5 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {a.tutoring.rows.map((t) => (
                <tr key={t.id} className="transition-colors duration-150 hover:bg-bg-subtle/50">
                  <td className="px-2 py-2">
                    <Link href={`/tutors/${t.id}`} className="font-medium text-ink hover:underline">
                      {t.name}
                    </Link>
                  </td>
                  <td className="px-2 py-2">{num(t.views)}</td>
                  <td className="px-2 py-2">{num(t.contacts)}</td>
                  <td className="px-2 py-2">{num(t.clicks)}</td>
                  <td className="px-2 py-2">{num(t.bookings)}</td>
                  <td className="px-2 py-2">{money(t.gmv)}</td>
                  <td className="px-2 py-2">{money(t.fees)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!a.tutoring.rows.length ? <p className="px-2 py-4 text-sm text-muted">No tutors yet.</p> : null}
        </div>
      </Card>

      {/* What isn't counted */}
      <Card title="Not counted in these numbers" className="mt-8">
        <ul className="tabular space-y-1.5 text-[13.5px] text-ink-2">
          <li>
            <span className="font-semibold text-ink">{num(a.filtered.botViews)}</span> page views from <span className="font-semibold text-ink">{num(a.filtered.botVisitors)}</span> bot visitors (they loaded a page but never moved, tapped, typed, or came back)
          </li>
          <li>
            <span className="font-semibold text-ink">{num(a.filtered.crawlerHits)}</span> lesson links followed by crawlers with no browser cookie
          </li>
          <li>
            <span className="font-semibold text-ink">{num(a.filtered.teamViews)}</span> page views by the team{includeTeam ? " (included right now)" : ""}: {a.team.length ? a.team.join(", ") : "none"}
          </li>
        </ul>
        <p className="mt-3 max-w-3xl text-[12px] leading-relaxed text-muted">
          First-party analytics, stored in Merit&apos;s own database with a random visitor id. No IP addresses, no third-party trackers. A visitor counts as a person once they interact with a page, sign in, or come back for a
          second page. Time on Merit counts only while the tab is visible and in use. Days are Eastern time. Add team emails with the ANALYTICS_EXCLUDE_EMAILS setting.
        </p>
      </Card>
    </div>
  );
}

/** Dollars with enough precision for fractions of a cent. */
const usd = (x: number) => (x === 0 ? "$0" : x < 0.01 ? `$${x.toFixed(4)}` : x < 10 ? `$${x.toFixed(3)}` : `$${x.toFixed(2)}`);

const regions = new Intl.DisplayNames(["en"], { type: "region" });
function countryName(code: string) {
  try {
    return regions.of(code) ?? code;
  } catch {
    return code;
  }
}

function PageLink({ path }: { path: string }) {
  return (
    <Link href={path} className="block truncate hover:underline">
      {path}
    </Link>
  );
}

function Kpi({ label, value, delta, vs, prev, hint }: { label: string; value: string; delta: number | null; vs: string; prev: string; hint?: string }) {
  const up = delta !== null && delta > 0.005;
  const down = delta !== null && delta < -0.005;
  return (
    <div className="min-w-0 rounded-2xl bg-surface p-4 ring-2 ring-line">
      <p className="text-[12.5px] font-medium text-muted">{label}</p>
      <p className="mt-1 break-words text-[28px] font-bold leading-tight tracking-tight text-ink">{value}</p>
      <p className={cn("mt-1 text-[12px] font-semibold", up ? "text-positive" : down ? "text-danger" : "text-muted")} title={`${prev} ${vs}`}>
        {delta === null ? `${prev} ${vs}` : `${up ? "▲" : down ? "▼" : "■"} ${Math.abs(Math.round(delta * 100))}% ${vs}`}
      </p>
      {hint ? <p className="mt-1 text-[11.5px] leading-snug text-faint">{hint}</p> : null}
    </div>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="headline mb-3 text-[17px] text-ink">{title}</h2>
      <div className="tabular grid grid-cols-2 gap-3 lg:grid-cols-4">{children}</div>
    </section>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="min-w-0 rounded-2xl bg-surface p-4 ring-2 ring-line">
      <p className="text-[12.5px] font-medium text-muted">{label}</p>
      <p className="mt-1 break-words text-[22px] font-bold leading-tight tracking-tight text-ink">{value}</p>
      {hint ? <p className="mt-1 text-[11.5px] leading-snug text-faint">{hint}</p> : null}
    </div>
  );
}

function Card({ title, children, className, aside }: { title: string; children: ReactNode; className?: string; aside?: ReactNode }) {
  return (
    <section className={cn("min-w-0 rounded-2xl bg-surface p-5 ring-2 ring-line", className)}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-[14.5px] font-semibold text-ink">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

function Table({ title, head, rows, empty = "No data yet.", note }: { title: string; head: string[]; rows: ReactNode[][]; empty?: string; note?: string }) {
  return (
    <Card title={title}>
      {rows.length ? (
        <table className="tabular w-full table-fixed text-sm">
          <thead className="text-[12px] text-muted">
            <tr className="border-b border-line">
              {head.map((h, i) => (
                <th key={h} scope="col" className={cn("pb-2 font-semibold", i === 0 ? "text-left" : "w-24 text-right")}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((row, i) => (
              <tr key={i}>
                {row.map((c, j) => (
                  <td key={j} className={cn("py-2", j === 0 ? "truncate pr-3 text-ink-2" : "text-right font-medium text-ink")}>
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-sm text-muted">{empty}</p>
      )}
      {note ? <p className="mt-3 text-[11.5px] leading-snug text-faint">{note}</p> : null}
    </Card>
  );
}

/** Visitors as bars, new members as a marked count above each bar. */
function Chart({ series, hourly }: { series: { key: string; visitors: number; views: number; signups: number }[]; hourly: boolean }) {
  const max = Math.max(1, ...series.map((s) => s.visitors));
  const label = (k: string) => (hourly ? hourLabel(k) : shortDay(k));
  const every = Math.ceil(series.length / (hourly ? 8 : 10));
  const totalSignups = series.reduce((s, x) => s + x.signups, 0);
  return (
    <div>
      <div className="flex h-52 items-end gap-[3px]" role="img" aria-label={`Chart of visitors${totalSignups ? " and new members" : ""} ${hourly ? "by hour" : "by day"}`}>
        {series.map((s) => (
          <div key={s.key} className="group relative flex h-full min-w-0 flex-1 flex-col justify-end">
            <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink px-2 py-1 text-[11.5px] font-semibold text-bg group-hover:block">
              {label(s.key)}: {s.visitors} {s.visitors === 1 ? "visitor" : "visitors"} · {s.views} views{s.signups ? ` · ${s.signups} joined` : ""}
            </div>
            {s.signups ? (
              <span className="tabular mx-auto mb-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-positive px-1 text-[10.5px] font-bold text-white">+{s.signups}</span>
            ) : null}
            <div className="w-full rounded-t-[4px] bg-accent transition-[filter] group-hover:brightness-110" style={{ height: `${Math.max(s.visitors ? 2 : 0, (s.visitors / max) * 100) * 0.82}%` }} />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex gap-[3px] text-[10.5px] text-muted">
        {series.map((s, i) => (
          <span key={s.key} className="min-w-0 flex-1 overflow-visible whitespace-nowrap text-center">
            {i % every === 0 ? label(s.key) : ""}
          </span>
        ))}
      </div>
      <p className="mt-3 flex flex-wrap gap-4 text-[12px] text-muted">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-accent" /> Visitors
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-positive" /> New members (+n)
        </span>
      </p>
    </div>
  );
}
