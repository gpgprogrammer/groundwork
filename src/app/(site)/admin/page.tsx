import { BarChart3, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { removeContribution } from "@/app/actions/educator";
import { approveUpload, rejectUpload, resolveReport } from "@/app/actions/moderation";
import { listPendingUploads, toUploadCards } from "@/lib/uploads";
import { recentErrors } from "@/lib/error-log";
import type { Report } from "@/lib/types";
import { reviewPartner, setTutorVetted } from "@/app/actions/partners";
import { money } from "@/components/booking-ui";
import { aiAvailable, aiStatus } from "@/lib/ai/runtime";
import { allTutorMeta, listBookings } from "@/lib/bookings";
import { PLUS } from "@/lib/billing/plans";
import { getStore } from "@/lib/data/store";
import { isAiConfigured, isSupabaseEnabled, paymentsMode } from "@/lib/env";
import { allServices, listPartnerApps } from "@/lib/partners";
import { listLeads } from "@/lib/leads";
import type { Billing, Contribution, Gift, Sprint } from "@/lib/types";
import { getViewer } from "@/lib/viewer";
import { Badge, LinkButton, buttonClass, cn } from "@/components/ui";

/** Small solid action button in a status color (approve, take down). */
const solid = (bg: string) => cn("inline-flex h-8 select-none items-center justify-center rounded-full px-3.5 text-[13px] font-semibold text-bg transition-[filter,transform] duration-150 ease-out hover:brightness-110 active:scale-[0.97]", bg);

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

export default async function AdminPage() {
  const viewer = await getViewer();
  if (!viewer?.isAdmin) notFound();
  const store = await getStore();
  const [billing, sprints, gifts, bookings, apps, tutors, meta, contributions, services, aiOk] = await Promise.all([
    store.listDocs<Billing>("billing"),
    store.listDocs<Sprint>("sprints"),
    store.listDocs<Gift>("gifts"),
    listBookings(),
    listPartnerApps(),
    store.listTutors(),
    allTutorMeta(),
    store.listDocs<Contribution>("contributions"),
    allServices(),
    aiAvailable(),
  ]);
  const [leads, pendingUploads, reports, errors] = await Promise.all([listLeads(), listPendingUploads().then(toUploadCards), store.listDocs<Report>("reports"), recentErrors(7)]);
  const openReports = reports.filter((r) => r.status === "open").sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const followUps = leads.filter((l) => l.status === "reported");
  const referrals = await store.referralCounts([...services.map((s) => s.id), ...tutors.map((t) => t.id)]);

  const paid = billing.filter((b) => b.plus.status === "active" && b.plus.source === "stripe");
  const mrr = paid.reduce((s, b) => s + (b.plus.interval === "year" ? PLUS.annual / 12 : PLUS.monthly), 0);
  const purchases = billing.flatMap((b) => b.purchases);
  const revenue = purchases.filter((p) => p.source === "stripe").reduce((s, p) => s + p.amount, 0);
  const sprintSales = purchases.filter((p) => p.product === "sprint");
  const gmv = bookings.filter((b) => b.status === "completed" || b.paid).reduce((s, b) => s + b.amount, 0);
  const feesEarned = bookings.filter((b) => b.feeSettled && b.amount > 0).reduce((s, b) => s + b.fee, 0);
  const feesOwed = bookings.filter((b) => b.status === "completed" && !b.feeSettled).reduce((s, b) => s + b.fee, 0);
  const status = aiStatus();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-8 sm:px-6 sm:pt-10 lg:px-8">
      <header className="rise flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="headline text-[28px] text-ink sm:text-[34px]">Admin</h1>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge tone={paymentsMode === "live" ? "positive" : "warn"}>Payments: {paymentsMode === "live" ? "Stripe live" : paymentsMode === "paused" ? "paused until Stripe is connected" : "test mode"}</Badge>
            <Badge tone={isSupabaseEnabled ? "positive" : "neutral"}>Database: {isSupabaseEnabled ? "Supabase" : "local file"}</Badge>
            <Badge tone={aiOk ? "positive" : isAiConfigured ? "danger" : "neutral"} className="h-auto min-h-6 max-w-full whitespace-normal py-0.5">
              AI: {aiOk ? "on" : isAiConfigured ? `unavailable${status?.reason ? ` (${status.reason.slice(0, 90)})` : ""}` : "not configured"}
            </Badge>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <LinkButton href="/admin/users" variant="outline">
            <Users className="size-4" /> Users
          </LinkButton>
          <LinkButton href="/admin/analytics">
            <BarChart3 className="size-4" /> Open analytics
          </LinkButton>
        </div>
      </header>

      <div className="rise tabular mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4" style={{ ["--i" as string]: 1 }}>
        {[
          ["Plus MRR", money(mrr)],
          ["Paid Plus members", String(paid.length)],
          ["Gifts bought", String(gifts.length)],
          ["Revenue (Stripe)", money(revenue)],
          ["Exam Sprints sold", String(sprintSales.length)],
          ["Sprints started", String(sprints.length)],
          ["Tutoring booked (GMV)", money(gmv)],
          ["Tutor fees earned / owed", `${money(feesEarned)} / ${money(feesOwed)}`],
        ].map(([k, v]) => (
          <div key={k} className="min-w-0 rounded-2xl bg-surface p-4 ring-2 ring-line">
            <p className="text-[12.5px] font-medium text-muted">{k}</p>
            <p className="mt-1 truncate text-[22px] font-bold tracking-tight text-ink">{v}</p>
          </div>
        ))}
      </div>

      <Section title={`Videos waiting for review (${pendingUploads.length})`}>
        {pendingUploads.length ? (
          <ul className="divide-y divide-line">
            {pendingUploads.map((u) => (
              <li key={u.id} className="flex flex-wrap items-center gap-4 py-3">
                <Link href={`/videos/${u.id}`} className="relative block aspect-video w-32 shrink-0 overflow-hidden rounded-xl bg-bg-subtle ring-1 ring-line sm:w-36">
                  {u.posterUrl ? <img src={u.posterUrl} alt="" className="absolute inset-0 size-full object-cover" /> : null}
                </Link>
                <div className="min-w-0 flex-1 text-sm">
                  <Link href={`/videos/${u.id}`} className="font-semibold text-ink hover:underline">
                    {u.title}
                  </Link>
                  <p className="text-muted">
                    {u.by.name} · {u.course?.title ?? ""}
                    {u.topic ? ` · ${u.topic.title}` : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <form action={approveUpload.bind(null, u.id)}>
                    <button className={solid("bg-positive")}>Approve</button>
                  </form>
                  <form action={rejectUpload.bind(null, u.id)}>
                    <button className={buttonClass("outline", "sm")}>Reject and delete</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">Nothing waiting. Watch each video before approving: it becomes public right away.</p>
        )}
      </Section>

      <Section title={`Reports (${openReports.length} open)`}>
        {openReports.length ? (
          <ul className="divide-y divide-line">
            {openReports.map((r) => (
              <li key={r.id} className="flex flex-wrap items-start justify-between gap-3 py-3 text-sm">
                <div className="min-w-0 flex-1">
                  <Link href={r.href} className="font-semibold text-ink hover:underline">
                    {r.title}
                  </Link>
                  <p className="text-ink-2">
                    <span className="font-medium">{r.reason}</span>
                    {r.details ? `: ${r.details}` : ""}
                  </p>
                  <p className="text-[12px] text-muted">
                    {r.reporterEmail ?? "Signed-out visitor"} · {new Date(r.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "America/New_York" })} ET
                  </p>
                </div>
                <div className="flex gap-2">
                  <form action={resolveReport.bind(null, r.id, "remove")}>
                    <button className={solid("bg-danger")}>Take it down</button>
                  </form>
                  <form action={resolveReport.bind(null, r.id, "dismiss")}>
                    <button className={buttonClass("outline", "sm")}>Dismiss</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">No open reports.</p>
        )}
      </Section>

      <Section title={`Site errors, last 7 days (${errors.total})`}>
        {errors.groups.length ? (
          <ul className="divide-y divide-line">
            {errors.groups.map((g) => (
              <li key={`${g.source}${g.message}`} className="py-2.5 text-sm">
                <p className="break-words font-mono text-[12.5px] text-ink">{g.message}</p>
                <p className="mt-0.5 text-[12px] text-muted">
                  {g.count}× · {g.source === "server" ? "server" : "in the browser"} · last {new Date(g.last.at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "America/New_York" })} ET
                  {g.paths.size ? ` · ${[...g.paths].slice(0, 3).join(", ")}` : ""}
                  {g.last.digest ? ` · ref ${g.last.digest}` : ""}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">No errors.</p>
        )}
      </Section>

      <Section title={`Partner applications (${apps.filter((a) => a.status === "pending").length} pending)`}>
        {apps.length ? (
          <ul className="divide-y divide-line">
            {apps.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                <span className="min-w-0 flex-1">
                  <a href={a.website} target="_blank" rel="noopener noreferrer" className="font-semibold text-ink hover:underline">
                    {a.businessName}
                  </a>{" "}
                  <span className="text-muted">
                    · {a.kind} · {a.contactName} ({a.email}) · {a.status}
                  </span>
                  <span className="block text-muted">{a.blurb}</span>
                </span>
                {a.status !== "approved" ? (
                  <span className="flex gap-2">
                    <form action={reviewPartner.bind(null, a.id, "approved")}>
                      <button className={buttonClass("primary", "sm")}>Approve</button>
                    </form>
                    {a.status === "pending" ? (
                      <form action={reviewPartner.bind(null, a.id, "rejected")}>
                        <button className={buttonClass("outline", "sm")}>Reject</button>
                      </form>
                    ) : null}
                  </span>
                ) : (
                  <form action={reviewPartner.bind(null, a.id, "rejected")}>
                    <button className={buttonClass("outline", "sm")}>Unlist</button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">No applications yet. (The public partner page has been removed.)</p>
        )}
      </Section>

      <Section title={`Referred students (${leads.length}) · ${followUps.length} need follow-up`}>
        <p className="mb-3 text-sm text-muted">Students who said they had a session with a tutor that the tutor hasn&apos;t logged yet. Follow up with the tutor to collect the 10% fee.</p>
        <ul className="divide-y divide-line text-sm">
          {followUps.map((l) => (
            <li key={l.id} className="flex flex-wrap justify-between gap-x-3 gap-y-0.5 py-2.5">
              <span className="text-ink">
                {l.studentName} → {tutors.find((t) => t.id === l.tutorId)?.name ?? "tutor"}
              </span>
              <span className="text-muted">reported {l.reportedAt?.slice(0, 10)}</span>
            </li>
          ))}
        </ul>
        {!followUps.length ? <p className="text-sm text-muted">Nothing to follow up on.</p> : null}
      </Section>

      <Section title="Referral clicks by partner">
        <ul className="grid gap-x-8 gap-y-1 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {services
            .map((s) => ({ s, n: referrals[s.id] ?? 0 }))
            .sort((a, b) => b.n - a.n)
            .map(({ s, n }) => (
              <li key={s.id} className="flex justify-between gap-3 border-b border-line py-2">
                <span className="min-w-0 truncate text-ink">{s.name}</span>
                <span className="tabular text-muted">{n}</span>
              </li>
            ))}
        </ul>
      </Section>

      <Section title={`Tutors (${tutors.length})`}>
        {tutors.length ? (
          <ul className="divide-y divide-line">
            {tutors.map((t) => {
              const m = meta.get(t.id);
              return (
                <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="min-w-0 flex-1">
                    <Link href={`/tutors/${t.id}`} className="font-semibold text-ink hover:underline">
                      {t.name}
                    </Link>{" "}
                    <span className="text-muted">
                      · {t.hourlyRate == null ? "free" : `$${t.hourlyRate}/hr`} · terms {m?.agreedAt ? "accepted" : "not accepted"} · payouts {m?.payoutsEnabled ? "on" : "off"} · {referrals[t.id] ?? 0} referrals
                    </span>
                  </span>
                  <form action={setTutorVetted.bind(null, t.id, !m?.vetted)}>
                    <button className={buttonClass(m?.vetted ? "outline" : "secondary", "sm")}>{m?.vetted ? "Remove verified" : "Mark verified"}</button>
                  </form>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-muted">No tutors yet.</p>
        )}
      </Section>

      <Section title="Recent teacher content">
        <ul className="divide-y divide-line">
          {contributions
            .filter((c) => c.status === "published")
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .slice(0, 30)
            .map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span className="truncate text-ink">
                  {c.kind === "guide" ? `Guide: ${c.title}` : c.kind === "upload" ? `Upload: ${c.title}` : `Video: ${c.video?.title}`} <span className="text-muted">· {c.topicId}</span>
                </span>
                <form action={removeContribution.bind(null, c.id)}>
                  <button className={buttonClass("outline", "sm", "shrink-0")}>Remove</button>
                </form>
              </li>
            ))}
        </ul>
        {!contributions.length ? <p className="text-sm text-muted">Nothing yet.</p> : null}
      </Section>

      <Section title={`Gifts (${gifts.length})`}>
        <p className="text-sm text-muted">
          {gifts.filter((g) => g.claimedBy).length} claimed · {gifts.filter((g) => !g.claimedBy).length} waiting for the student to sign in
        </p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 rounded-2xl bg-surface p-5 ring-2 ring-line sm:p-6">
      <h2 className="headline mb-4 text-[17px] text-ink">{title}</h2>
      {children}
    </section>
  );
}
