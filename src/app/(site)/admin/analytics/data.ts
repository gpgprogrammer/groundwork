import "server-only";
import { eventsSince, signupsSince, type Signup } from "@/lib/analytics";
import { buildReport, dayKey, dayKeys, sourceOf, ANALYTICS_TZ } from "@/lib/analytics-report";
import { listBookings } from "@/lib/bookings";
import { PLUS, SPRINT } from "@/lib/billing/plans";
import { getCatalog } from "@/lib/catalog";
import { getStore } from "@/lib/data/store";
import { env, isSupabaseEnabled } from "@/lib/env";
import { listLeads } from "@/lib/leads";
import { PURCHASES, type GuidePurchase } from "@/lib/market";
import { ON_CALL_COLLECTION, type OnCallRequest } from "@/lib/on-call";
import { PRACTICE_COLLECTION, type PracticeStats } from "@/lib/practice-stats";
import { createAdminClient } from "@/lib/supabase/server";
import type { Billing, Contribution, Gift, Sprint } from "@/lib/types";

const DAY = 86_400_000;

/** Accounts that never count: admins, extra team emails, and automated test users. */
function teamOf(users: Signup[]) {
  const emails = new Set([...env.adminEmails, ...(process.env.ANALYTICS_EXCLUDE_EMAILS ?? "").split(",")].map((e) => e.trim().toLowerCase()).filter(Boolean));
  const team = users.filter((u) => u.email && (emails.has(u.email.toLowerCase()) || /@example\.(com|org)$/i.test(u.email)));
  return { ids: new Set(team.map((u) => u.id)), emails: team.map((u) => u.email!).sort() };
}

export async function loadAnalytics(days: number, includeTeam = false) {
  const now = Date.now();
  // Two full periods (this one and the one before, for comparisons) plus a day of slack for time zones.
  const since = new Date(now - (2 * days + 1) * DAY);
  const store = await getStore();
  const [events, users, billing, sprints, gifts, bookings, leads, tutors, contributions, catalog, practice, onCall, guideBuys, crawlerHits] = await Promise.all([
    eventsSince(since),
    signupsSince(new Date(0)),
    store.listDocs<Billing>("billing"),
    store.listDocs<Sprint>("sprints"),
    store.listDocs<Gift>("gifts"),
    listBookings(),
    listLeads(),
    store.listTutors(),
    store.listDocs<Contribution>("contributions"),
    getCatalog(),
    store.listDocs<PracticeStats>(PRACTICE_COLLECTION),
    store.listDocs<OnCallRequest>(ON_CALL_COLLECTION),
    store.listDocs<GuidePurchase>(PURCHASES),
    // Link-following crawlers recorded before cookie checks existed, reported under "Filtered out".
    isSupabaseEnabled
      ? createAdminClient()
          .from("docs")
          .select("id", { count: "exact", head: true })
          .eq("collection", "events")
          .eq("data->>v", "server")
          .gte("id", new Date(now - days * DAY).toISOString())
          .then((r) => r.count ?? 0)
      : Promise.resolve(0),
  ]);
  const team = teamOf(users);
  const r = buildReport(events, { days, now, team: team.ids, members: users, includeTeam });
  const cur = new Set(dayKeys(now, days));
  const inCur = (iso: string | null | undefined) => Boolean(iso && cur.has(dayKey(Date.parse(iso))));
  const counts = (id: string) => includeTeam || !team.ids.has(id);

  // ---- members: totals and who joined
  const members = users.filter((u) => counts(u.id));
  const practiceBy = new Map(practice.map((p) => [p.userId, p]));
  const answered = (p: PracticeStats | undefined, inRange: boolean) =>
    p ? Object.values(p.topics).reduce((n, t) => n + (!inRange || inCur(t.lastAt) ? t.total : 0), 0) : 0;
  const joined = r.joined.map((m) => {
    const act = r.activity(m.id);
    const first = r.firstEver.get(m.id);
    return {
      id: m.id,
      email: m.email,
      type: m.type,
      at: m.at,
      source: first ? sourceOf(first) : "Unknown",
      landing: first?.path ?? null,
      daysActive: act.days,
      lastSeen: act.lastSeen ?? users.find((u) => u.id === m.id)?.lastSignIn ?? null,
      practiced: answered(practiceBy.get(m.id), false),
      ai: act.ai,
      lessons: act.lessons,
    };
  });

  // Came back: members who joined at least 7 days ago (in this period or the one before) and had activity
  // on a later day within their first week.
  const cohort = members.filter((m) => now - Date.parse(m.at) >= 7 * DAY && now - Date.parse(m.at) <= (2 * days + 1) * DAY);
  const cameBack = cohort.filter((m) => {
    const joinedDay = dayKey(Date.parse(m.at));
    const limit = Date.parse(m.at) + 8 * DAY;
    return events.some((e) => e.u === m.id && e.at <= new Date(limit).toISOString() && dayKey(Date.parse(e.at)) !== joinedDay);
  });

  // ---- learning (from saved progress, not just clicks)
  const practicers = practice.filter((p) => counts(p.userId) && Object.values(p.topics).some((t) => inCur(t.lastAt)));
  const practiceAnswers = practicers.reduce((n, p) => n + answered(p, true), 0);
  const sprintsIn = sprints.filter((s) => counts(s.userId) && inCur(s.createdAt));

  // ---- money
  const activePlus = billing.filter((b) => b.plus.status === "active" && b.plus.source === "stripe");
  const mrr = activePlus.reduce((s, b) => s + (b.plus.interval === "year" ? PLUS.annual / 12 : PLUS.monthly), 0);
  const purchases = billing.flatMap((b) => b.purchases.map((p) => ({ ...p, userId: b.userId })));
  const paidInRange = purchases.filter((p) => inCur(p.at) && p.source === "stripe");
  const sprintSales = purchases.filter((p) => p.product === "sprint" && p.source === "stripe" && inCur(p.at));
  const guideSales = guideBuys.filter((g) => g.source === "stripe" && inCur(g.at));

  // ---- tutoring
  const bookingsIn = bookings.filter((b) => inCur(b.createdAt));
  const done = (b: (typeof bookings)[number]) => b.status === "completed" || b.paid;
  const referralClicks = await store.referralCounts(tutors.map((t) => t.id)).catch(() => ({}) as Record<string, number>);
  const tutorRows = tutors
    .map((t) => {
      const bs = bookingsIn.filter((b) => b.tutorId === t.id);
      return {
        id: t.id,
        name: t.name,
        views: r.tutorViews.get(t.id) ?? 0,
        contacts: leads.filter((l) => l.tutorId === t.id && inCur(l.createdAt)).length,
        clicks: referralClicks[t.id] ?? 0,
        bookings: bs.length,
        gmv: bs.filter(done).reduce((s, b) => s + b.amount, 0),
        fees: bs.filter(done).reduce((s, b) => s + b.fee, 0),
      };
    })
    .sort((a, b) => b.gmv - a.gmv || b.bookings - a.bookings || b.views - a.views);

  // ---- content
  const uploads = contributions.filter((c) => c.kind === "upload" && c.status === "published");
  const uploadTitle = new Map(uploads.map((u) => [u.id, u.title ?? u.id]));

  return {
    report: r,
    tz: ANALYTICS_TZ,
    team: team.emails,
    includeTeam,
    members: {
      total: members.length,
      students: members.filter((m) => m.type === "student").length,
      teachers: members.filter((m) => m.type === "teacher").length,
      joined,
      cohort: cohort.length,
      cameBack: cameBack.length,
    },
    learning: {
      practicers: practicers.length,
      practiceAnswers,
      sprints: sprintsIn.length,
      onCall: onCall.filter((x) => counts(x.studentId) && inCur(x.createdAt)).length,
      guides: guideBuys.filter((g) => counts(g.userId) && inCur(g.at)).length,
    },
    revenue: {
      mrr,
      activePlus: activePlus.length,
      monthly: activePlus.filter((b) => b.plus.interval !== "year").length,
      yearly: activePlus.filter((b) => b.plus.interval === "year").length,
      canceling: activePlus.filter((b) => b.plus.cancelAtPeriodEnd).length,
      stripeRevenue: paidInRange.reduce((s, p) => s + p.amount, 0) + guideSales.reduce((s, g) => s + g.fee, 0),
      sprintSold: sprintSales.length,
      sprintRevenue: sprintSales.reduce((s, p) => s + p.amount, 0),
      sprintPrice: SPRINT.price,
      gifts: gifts.filter((g) => inCur(g.createdAt)).length,
      guideSales: guideSales.length,
      guideFees: guideSales.reduce((s, g) => s + g.fee, 0),
    },
    tutoring: {
      contacts: leads.filter((l) => inCur(l.createdAt)).length,
      bookings: bookingsIn.length,
      confirmed: bookingsIn.filter((b) => b.status === "confirmed" || b.status === "completed").length,
      gmv: bookingsIn.filter(done).reduce((s, b) => s + b.amount, 0),
      fees: bookingsIn.filter(done).reduce((s, b) => s + b.fee, 0),
      feesSettled: bookings.filter((b) => b.feeSettled && b.amount > 0).reduce((s, b) => s + b.fee, 0),
      feesOwed: bookings.filter((b) => b.status === "completed" && !b.feeSettled).reduce((s, b) => s + b.fee, 0),
      rows: tutorRows,
    },
    content: {
      topVideos: r.topVideos.map((c) => ({ ...c, label: catalog.video(c.key)?.title ?? c.key, sub: catalog.video(c.key)?.channelTitle ?? "" })),
      topUploads: r.topUploads.map((c) => ({ ...c, label: uploadTitle.get(c.key) ?? c.key })),
      topCourses: r.courses.map((c) => ({ ...c, label: catalog.course(c.key)?.title ?? catalog.courses.find((x) => x.slug === c.key)?.title ?? c.key })),
    },
    filtered: { ...r.filtered, crawlerHits },
  };
}

export type Analytics = Awaited<ReturnType<typeof loadAnalytics>>;
