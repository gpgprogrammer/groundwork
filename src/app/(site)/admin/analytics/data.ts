import "server-only";
import { eventsSince, signupsSince } from "@/lib/analytics";
import { inWindow, trafficReport } from "@/lib/analytics-report";
import { listBookings } from "@/lib/bookings";
import { PLUS, SPRINT } from "@/lib/billing/plans";
import { SPRINT_TRIAL_DAYS } from "@/lib/billing/access";
import { getCatalog } from "@/lib/catalog";
import { getStore } from "@/lib/data/store";
import { isSupabaseEnabled } from "@/lib/env";
import { listLeads } from "@/lib/leads";
import { createAdminClient } from "@/lib/supabase/server";
import type { Billing, Contribution, Gift, Sprint } from "@/lib/types";

const DAY = 86_400_000;

export async function loadAnalytics(days: number) {
  const now = Date.now();
  const since = new Date(now - days * DAY);
  const store = await getStore();
  const [events, signups, billing, sprints, gifts, bookings, leads, tutors, contributions, catalog, calendars] = await Promise.all([
    eventsSince(new Date(Math.min(since.getTime(), now - 5 * 60_000))),
    signupsSince(since),
    store.listDocs<Billing>("billing"),
    store.listDocs<Sprint>("sprints"),
    store.listDocs<Gift>("gifts"),
    listBookings(),
    listLeads(),
    store.listTutors(),
    store.listDocs<Contribution>("contributions"),
    getCatalog(),
    isSupabaseEnabled ? createAdminClient().from("schedules").select("user_id", { count: "exact", head: true }).then((r) => r.count ?? 0) : Promise.resolve(0),
  ]);
  const traffic = trafficReport(events, days, now);
  const w = (iso: string | null | undefined) => inWindow(iso, days, now);

  // Subscriptions and purchases
  const activePlus = billing.filter((b) => b.plus.status === "active" && b.plus.source === "stripe");
  const mrr = activePlus.reduce((s, b) => s + (b.plus.interval === "year" ? PLUS.annual / 12 : PLUS.monthly), 0);
  const purchases = billing.flatMap((b) => b.purchases.map((p) => ({ ...p, userId: b.userId })));
  const paidInRange = purchases.filter((p) => w(p.at) && p.source === "stripe");
  const sprintSales = purchases.filter((p) => p.product === "sprint" && w(p.at));
  const sprintTrials = billing.filter((b) => b.sprintTrialEndsAt && w(new Date(Date.parse(b.sprintTrialEndsAt) - SPRINT_TRIAL_DAYS * DAY).toISOString()));
  const trialsNow = billing.filter((b) => b.sprintTrialEndsAt && Date.parse(b.sprintTrialEndsAt) > now && !b.sprintPass).length;
  const trialConverted = billing.filter((b) => b.sprintTrialEndsAt && b.purchases.some((p) => p.product === "sprint" && p.source === "stripe")).length;
  const trialTotal = billing.filter((b) => b.sprintTrialEndsAt).length;

  // Tutoring
  const bookingsIn = bookings.filter((b) => w(b.createdAt));
  const leadsIn = leads.filter((l) => w(l.createdAt));
  const gmv = bookingsIn.filter((b) => b.status === "completed" || b.paid).reduce((s, b) => s + b.amount, 0);
  const fees = bookingsIn.filter((b) => b.status === "completed" || b.paid).reduce((s, b) => s + b.fee, 0);
  const feesSettled = bookings.filter((b) => b.feeSettled && b.amount > 0).reduce((s, b) => s + b.fee, 0);
  const feesOwed = bookings.filter((b) => b.status === "completed" && !b.feeSettled).reduce((s, b) => s + b.fee, 0);
  const referralClicks = await store.referralCounts(tutors.map((t) => t.id)).catch(() => ({}) as Record<string, number>);
  const tutorViewsById = new Map(traffic.tutorViews.map((c) => [c.key, c.n]));
  const tutorRows = tutors
    .map((t) => {
      const bs = bookingsIn.filter((b) => b.tutorId === t.id);
      const done = bs.filter((b) => b.status === "completed" || b.paid);
      return {
        id: t.id,
        name: t.name,
        views: tutorViewsById.get(t.id) ?? 0,
        contacts: leadsIn.filter((l) => l.tutorId === t.id).length,
        clicks: referralClicks[t.id] ?? 0,
        bookings: bs.length,
        gmv: done.reduce((s, b) => s + b.amount, 0),
        fees: done.reduce((s, b) => s + b.fee, 0),
        loggedFromReferrals: leads.filter((l) => l.tutorId === t.id && (l.status === "logged" || l.status === "reported")).length,
      };
    })
    .sort((a, b) => b.gmv - a.gmv || b.views - a.views);

  // Content
  const uploads = contributions.filter((c) => c.kind === "upload" && c.status === "published");
  const uploadTitle = new Map(uploads.map((u) => [u.id, u.title ?? u.id]));
  const topVideos = traffic.topVideos.map((c) => ({ ...c, label: catalog.video(c.key)?.title ?? c.key, sub: catalog.video(c.key)?.channelTitle ?? "" }));
  const topUploads = traffic.topUploads.map((c) => ({ ...c, label: uploadTitle.get(c.key) ?? c.key }));
  const topCourses = traffic.courses.map((c) => ({ ...c, label: catalog.course(c.key)?.title ?? c.key }));
  const allTimeUploadViews = uploads.reduce((s, u) => s + (u.views ?? 0), 0);

  return {
    days,
    traffic,
    signups: { count: signups.length, series: traffic.series.map((s, i, arr) => ({ at: s.at, n: signups.filter((u) => u.at >= s.at && (i + 1 >= arr.length || u.at < arr[i + 1].at)).length })) },
    revenue: {
      mrr,
      activePlus: activePlus.length,
      monthly: activePlus.filter((b) => b.plus.interval !== "year").length,
      yearly: activePlus.filter((b) => b.plus.interval === "year").length,
      canceling: activePlus.filter((b) => b.plus.cancelAtPeriodEnd).length,
      stripeRevenue: paidInRange.reduce((s, p) => s + p.amount, 0),
      sprintSold: sprintSales.length,
      sprintRevenue: sprintSales.filter((p) => p.source === "stripe").reduce((s, p) => s + p.amount, 0),
      sprintPrice: SPRINT.price,
      sprintTrials: sprintTrials.length,
      trialsNow,
      trialConversion: trialTotal ? trialConverted / trialTotal : 0,
      gifts: gifts.filter((g) => w(g.createdAt)).length,
      sprintsStarted: sprints.filter((s) => w(s.createdAt)).length,
    },
    tutoring: {
      contacts: leadsIn.length,
      bookings: bookingsIn.length,
      confirmed: bookingsIn.filter((b) => b.status === "confirmed" || b.status === "completed").length,
      gmv,
      fees,
      feesSettled,
      feesOwed,
      referralClicks: Object.values(referralClicks).reduce((s, n) => s + n, 0),
      rows: tutorRows,
    },
    content: { topVideos, topUploads, topCourses, uploadsPublished: uploads.filter((u) => w(u.createdAt)).length, uploadsTotal: uploads.length, allTimeUploadViews },
    calendars,
  };
}
