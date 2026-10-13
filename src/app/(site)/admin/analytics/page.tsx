import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { money } from "@/components/booking-ui";
import { PageHeader, SegmentedLinks, cn } from "@/components/ui";
import { getViewer } from "@/lib/viewer";
import { loadAnalytics } from "./data";
import { costHistory } from "@/lib/ai/costs";
import { routingEnabled, TIER_CONFIG } from "@/lib/ai/router";
import { TIERS } from "@/lib/ai/router-rules";
import { LiveRefresh } from "./live-refresh";

export const metadata: Metadata = { title: "Analytics", robots: { index: false } };

const RANGES = [
  { d: 1, label: "24 hours" },
  { d: 7, label: "7 days" },
  { d: 30, label: "30 days" },
  { d: 90, label: "90 days" },
];

/** Names for the landing page's buttons. */
const FUNNELS: Record<string, string> = {
  "hero-student": "Top: Create a free account",
  "hero-explore": "Top: Browse lessons",
  "path-student": "Students card",
  "path-teacher": "Teachers and tutors card",
  "path-parent": "Parents card",
  "footer-student": "Bottom: Create a free account",
  "calendar-signup": "Calendar section: Connect my calendar",
};

const pct = (n: number) => `${Math.round(n * 100)}%`;
const num = (n: number) => n.toLocaleString("en-US");

export default async function AnalyticsPage({ searchParams }: PageProps<"/admin/analytics">) {
  const viewer = await getViewer();
  if (!viewer?.isAdmin) notFound();
  const sp = await searchParams;
  const days = RANGES.find((r) => String(r.d) === sp.range)?.d ?? 7;
  const [a, aiDays] = await Promise.all([loadAnalytics(days), costHistory(days)]);
  const t = a.traffic;
  // Merit AI spend by tier for the range (recorded per answer by /api/ask when OpenRouter routing is on).
  const ai = TIERS.map((tier) => {
    const rows = aiDays.map((d) => d.tiers[tier]).filter((x) => x !== undefined);
    return {
      tier,
      answers: rows.reduce((n, r) => n + r.answers, 0),
      cost: rows.reduce((n, r) => n + r.cost, 0),
      baseline: rows.reduce((n, r) => n + r.baseline, 0),
      byRule: rows.reduce((n, r) => n + r.byRule, 0),
    };
  });
  const aiAnswers = ai.reduce((n, r) => n + r.answers, 0);
  const aiCost = ai.reduce((n, r) => n + r.cost, 0);
  const aiBaseline = ai.reduce((n, r) => n + r.baseline, 0);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-24 pt-8 sm:px-6 sm:pt-10 lg:px-8">
      <LiveRefresh />
      <PageHeader
        back={{ href: "/admin", label: "Admin" }}
        title="Analytics"
        actions={<SegmentedLinks label="Date range" active={String(days)} items={RANGES.map((r) => ({ key: String(r.d), label: r.label, href: `/admin/analytics?range=${r.d}` }))} />}
      />

      <div className="rise mt-6 flex items-center gap-3 rounded-2xl bg-positive-soft px-5 py-4" style={{ ["--i" as string]: 1 }}>
        <span className="relative flex size-3 shrink-0">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-positive opacity-60" />
          <span className="relative inline-flex size-3 rounded-full bg-positive" />
        </span>
        <p className="text-[15px] text-ink">
          <span className="tabular text-2xl font-bold">{t.live}</span> {t.live === 1 ? "person" : "people"} on Merit right now <span className="text-muted">(last 5 minutes, refreshes every 30s)</span>
        </p>
      </div>

      <Group title="Traffic">
        <Stat label="Visitors" value={num(t.visitors)} />
        <Stat label="Page views" value={num(t.views)} />
        <Stat label="Sessions" value={num(t.sessions)} />
        <Stat label="Pages per session" value={t.pagesPerSession.toFixed(1)} />
        <Stat label="Bounce rate" value={pct(t.bounceRate)} hint="Sessions with one page view" />
        <Stat label="Signed-in visitors" value={num(t.signedInVisitors)} />
        <Stat label="New accounts" value={num(a.signups.count)} />
        <Stat label="Signup rate" value={t.visitors ? pct(a.signups.count / t.visitors) : "–"} hint="New accounts ÷ visitors" />
      </Group>
      <Card title={t.hourly ? "Views by hour" : "Views and visitors by day"} className="mt-4">
        <Bars series={t.series.map((s) => ({ at: s.at, a: s.views, b: s.visitors }))} hourly={t.hourly} />
        <p className="mt-2 flex gap-4 text-[12px] text-muted">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-accent" /> Page views
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-accent/35" /> Visitors
          </span>
        </p>
      </Card>

      <Group title="Landing page funnel">
        <Stat label="Landing page visitors" value={num(t.landingVisitors)} />
        <Stat label="Clicked a button" value={num(t.landingClickers)} hint={t.landingVisitors ? `${pct(t.landingClickers / t.landingVisitors)} of landing visitors` : undefined} />
        <Stat label="New accounts" value={num(a.signups.count)} hint={t.landingVisitors ? `${pct(a.signups.count / t.landingVisitors)} of landing visitors` : undefined} />
        <Stat label="Top path" value={t.ctaClicks[0] ? FUNNELS[t.ctaClicks[0].key] ?? t.ctaClicks[0].key : "–"} />
      </Group>

      <Group title="Learning">
        <Stat label="YouTube lessons opened" value={num(t.videoOpens)} />
        <Stat label="Merit video plays" value={num(t.uploadPlays)} />
        <Stat label="Merit videos published" value={num(a.content.uploadsPublished)} hint={`${num(a.content.uploadsTotal)} total · ${num(a.content.allTimeUploadViews)} all-time views`} />
        <Stat label="Merit AI questions" value={num(t.aiQuestions)} hint={`${num(t.aiAskers)} people asked`} />
        <Stat label="Calendars connected" value={num(t.calendarConnects)} hint={`${num(a.calendars)} students have a calendar`} />
        <Stat label="Exam Sprints started" value={num(a.revenue.sprintsStarted)} />
      </Group>

      <Group title="Merit AI cost">
        <Stat label="Answers routed" value={num(aiAnswers)} hint={routingEnabled() ? `${num(ai.reduce((n, r) => n + r.byRule, 0))} placed by rules, the rest by the classifier` : "Routing is off: set OPENROUTER_API_KEY"} />
        <Stat label="Spent" value={usd(aiCost)} hint={aiAnswers ? `${usd(aiCost / aiAnswers)} per answer` : undefined} />
        <Stat label="If every answer used the expert" value={usd(aiBaseline)} hint={`${TIER_CONFIG.expert.models[0]} at list price`} />
        <Stat label="Saved by routing" value={aiBaseline ? pct(1 - aiCost / aiBaseline) : "–"} hint={aiBaseline ? usd(aiBaseline - aiCost) : undefined} />
        {ai.map((r) => (
          <Stat
            key={r.tier}
            label={`${TIER_CONFIG[r.tier].label}: ${TIER_CONFIG[r.tier].models[0]}`}
            value={aiAnswers ? pct(r.answers / aiAnswers) : "–"}
            hint={`${num(r.answers)} answers · ${usd(r.cost)}`}
          />
        ))}
      </Group>

      <Group title="Money">
        <Stat label="Plus MRR" value={money(a.revenue.mrr)} />
        <Stat label="Paid Plus members" value={num(a.revenue.activePlus)} hint={`${a.revenue.monthly} monthly · ${a.revenue.yearly} yearly · ${a.revenue.canceling} canceling`} />
        <Stat label="Stripe revenue" value={money(a.revenue.stripeRevenue)} hint="Plus and Sprint, this period" />
        <Stat label="Sprint passes sold" value={num(a.revenue.sprintSold)} hint={money(a.revenue.sprintRevenue)} />
        <Stat label="Sprint trials started" value={num(a.revenue.sprintTrials)} hint={`${a.revenue.trialsNow} active now`} />
        <Stat label="Sprint trial → paid" value={pct(a.revenue.trialConversion)} hint="All time" />
        <Stat label="Gifts bought" value={num(a.revenue.gifts)} />
        <Stat label="Checkouts started" value={num(t.checkouts.reduce((s, c) => s + c.n, 0))} hint={t.checkouts.map((c) => `${c.key} ${c.n}`).join(" · ") || undefined} />
      </Group>

      <Group title="Tutoring">
        <Stat label="Tutor profile views" value={num(t.tutorViews.reduce((s, c) => s + c.n, 0))} />
        <Stat label="Referral contacts" value={num(a.tutoring.contacts)} hint="Students who messaged a tutor" />
        <Stat label="Referral link clicks" value={num(a.tutoring.referralClicks)} hint="All time" />
        <Stat label="Bookings" value={num(a.tutoring.bookings)} hint={`${a.tutoring.confirmed} confirmed or done`} />
        <Stat label="Tutoring booked (GMV)" value={money(a.tutoring.gmv)} />
        <Stat label="Merit commission" value={money(a.tutoring.fees)} hint="This period" />
        <Stat label="Commission collected" value={money(a.tutoring.feesSettled)} hint="All time" />
        <Stat label="Commission owed" value={money(a.tutoring.feesOwed)} hint="Completed, not yet collected" />
      </Group>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Table title="Landing page buttons clicked" rows={t.ctaClicks.map((c) => [FUNNELS[c.key] ?? c.key, num(c.n)])} empty="No clicks yet." />
        <Table title="Top pages" rows={t.topPages.map((c) => [<Link key="l" href={c.key} className="hover:underline">{c.key}</Link>, num(c.n)])} />
        <Table title="Where visitors come from" rows={t.referrers.map((c) => [c.key, num(c.n)])} empty="No outside referrers yet (direct visits don't count here)." />
        <Table title="Top courses" rows={a.content.topCourses.map((c) => [c.label, num(c.n)])} />
        <Table title="Most-opened YouTube lessons" rows={a.content.topVideos.map((c) => [<span key="l" className="line-clamp-1">{c.label} <span className="text-muted">· {c.sub}</span></span>, num(c.n)])} />
        <Table title="Most-played Merit videos" rows={a.content.topUploads.map((c) => [<Link key="l" href={`/videos/${c.key}`} className="line-clamp-1 hover:underline">{c.label}</Link>, num(c.n)])} />
        <Table title="How calendars get connected" rows={t.calendarMethods.map((c) => [c.key, num(c.n)])} />
        <Table title="Devices" rows={t.devices.map((c) => [c.key, t.visitors ? pct(c.n / t.visitors) : "0%"])} />
        <Table title="Countries" rows={t.countries.map((c) => [c.key, num(c.n)])} />
      </div>

      <Card title="Tutors" className="mt-8">
        <div className="overflow-x-auto">
          <table className="tabular w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-line text-[12px] text-muted">
              <tr>
                {["Tutor", "Profile views", "Contacts", "Link clicks", "Bookings", "GMV", "Commission", "Referred sessions"].map((h) => (
                  <th key={h} scope="col" className="whitespace-nowrap px-2 pb-2.5 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {a.tutoring.rows.map((r) => (
                <tr key={r.id} className="transition-colors duration-150 hover:bg-bg-subtle/50">
                  <td className="px-2 py-2">
                    <Link href={`/tutors/${r.id}`} className="font-medium text-ink hover:underline">
                      {r.name}
                    </Link>
                  </td>
                  <td className="px-2 py-2">{num(r.views)}</td>
                  <td className="px-2 py-2">{num(r.contacts)}</td>
                  <td className="px-2 py-2">{num(r.clicks)}</td>
                  <td className="px-2 py-2">{num(r.bookings)}</td>
                  <td className="px-2 py-2">{money(r.gmv)}</td>
                  <td className="px-2 py-2">{money(r.fees)}</td>
                  <td className="px-2 py-2">{num(r.loggedFromReferrals)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!a.tutoring.rows.length ? <p className="py-4 text-sm text-muted">No tutors yet.</p> : null}
        </div>
      </Card>
      <p className="mt-8 max-w-3xl text-[12px] leading-relaxed text-muted">
        First-party analytics: stored in Merit&apos;s own database with a random visitor id. No IP addresses, no third-party trackers. Page views started counting when this dashboard shipped; money and tutoring numbers include earlier history.
      </p>
    </div>
  );
}

/** Dollars with enough precision for fractions of a cent. */
const usd = (n: number) => (n === 0 ? "$0" : n < 0.01 ? `$${n.toFixed(4)}` : n < 10 ? `$${n.toFixed(3)}` : `$${n.toFixed(2)}`);

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

function Card({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("min-w-0 rounded-2xl bg-surface p-5 ring-2 ring-line", className)}>
      <h2 className="mb-3 text-[14.5px] font-semibold text-ink">{title}</h2>
      {children}
    </section>
  );
}

function Table({ title, rows, empty = "No data yet." }: { title: string; rows: [ReactNode, string][]; empty?: string }) {
  return (
    <Card title={title}>
      {rows.length ? (
        <ul className="tabular divide-y divide-line text-sm">
          {rows.map(([k, v], i) => (
            <li key={i} className="flex items-center justify-between gap-4 py-2">
              <span className="min-w-0 truncate text-ink-2">{k}</span>
              <span className="shrink-0 font-medium text-ink">{v}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">{empty}</p>
      )}
    </Card>
  );
}

function Bars({ series, hourly }: { series: { at: string; a: number; b: number }[]; hourly: boolean }) {
  const max = Math.max(1, ...series.map((s) => s.a));
  const w = 100 / series.length;
  const label = (iso: string) => (hourly ? `${new Date(iso).getUTCHours()}:00` : new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }));
  const every = Math.ceil(series.length / 8);
  return (
    <div>
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="h-48 w-full" role="img" aria-label="Chart">
        {series.map((s, i) => (
          <g key={s.at}>
            <title>{`${label(s.at)}: ${s.a} views, ${s.b} visitors`}</title>
            <rect x={i * w + w * 0.1} width={w * 0.8} y={40 - (s.a / max) * 38} height={(s.a / max) * 38} fill="var(--accent)" rx="0.3" />
            <rect x={i * w + w * 0.3} width={w * 0.4} y={40 - (s.b / max) * 38} height={(s.b / max) * 38} fill="color-mix(in oklab, var(--accent) 35%, var(--surface))" rx="0.3" />
          </g>
        ))}
      </svg>
      <div className="mt-1 flex text-[10.5px] text-muted">
        {series.map((s, i) => (
          <span key={s.at} className="flex-1 text-center">
            {i % every === 0 ? label(s.at) : ""}
          </span>
        ))}
      </div>
    </div>
  );
}
