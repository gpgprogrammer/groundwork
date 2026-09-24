import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { removeContribution } from "@/app/actions/educator";
import { reviewPartner, setTutorVetted } from "@/app/actions/partners";
import { money } from "@/components/booking-ui";
import { aiAvailable, aiStatus } from "@/lib/ai/runtime";
import { allTutorMeta, listBookings } from "@/lib/bookings";
import { PLUS } from "@/lib/billing/plans";
import { getStore } from "@/lib/data/store";
import { isAiConfigured, isStripeEnabled, isSupabaseEnabled } from "@/lib/env";
import { allServices, listPartnerApps } from "@/lib/partners";
import { listLeads } from "@/lib/leads";
import type { Billing, Contribution, Gift, Sprint } from "@/lib/types";
import { getViewer } from "@/lib/viewer";

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
  const leads = await listLeads();
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
    <div className="mx-auto max-w-[1200px] px-4 pb-20 pt-8 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-ink">Admin</h1>
      <p className="mt-1 text-sm text-muted">
        Payments: {isStripeEnabled ? "Stripe live" : "test mode"} · Database: {isSupabaseEnabled ? "Supabase" : "local file"} · AI: {aiOk ? "on" : isAiConfigured ? `unavailable${status?.reason ? ` (${status.reason.slice(0, 90)})` : ""}` : "not configured"}
      </p>

      <div className="tabular mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
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
          <div key={k} className="rounded-2xl bg-bg-subtle p-4">
            <p className="text-xl font-bold text-ink">{v}</p>
            <p className="text-[12.5px] text-muted">{k}</p>
          </div>
        ))}
      </div>

      <Section title={`Partner applications (${apps.filter((a) => a.status === "pending").length} pending)`}>
        {apps.length ? (
          <ul className="divide-y divide-line">
            {apps.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                <span className="min-w-0">
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
                      <button className="h-8 rounded-full bg-accent px-3 text-[13px] font-semibold text-white">Approve</button>
                    </form>
                    {a.status === "pending" ? (
                      <form action={reviewPartner.bind(null, a.id, "rejected")}>
                        <button className="h-8 rounded-full px-3 text-[13px] text-muted ring-1 ring-line">Reject</button>
                      </form>
                    ) : null}
                  </span>
                ) : (
                  <form action={reviewPartner.bind(null, a.id, "rejected")}>
                    <button className="h-8 rounded-full px-3 text-[13px] text-muted ring-1 ring-line">Unlist</button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">No applications yet. Share /tutors/partners with tutoring businesses.</p>
        )}
      </Section>

      <Section title={`Referred students (${leads.length}) · ${followUps.length} need follow-up`}>
        <p className="mb-3 text-sm text-muted">Students who said they had a session with a tutor that the tutor hasn&apos;t logged yet. Follow up with the tutor to collect the 10% fee.</p>
        <ul className="divide-y divide-line text-sm">
          {followUps.map((l) => (
            <li key={l.id} className="flex justify-between gap-3 py-2">
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
              <li key={s.id} className="flex justify-between border-b border-line py-1.5">
                <span className="text-ink">{s.name}</span>
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
                  <span>
                    <Link href={`/tutors/${t.id}`} className="font-semibold text-ink hover:underline">
                      {t.name}
                    </Link>{" "}
                    <span className="text-muted">
                      · {t.hourlyRate == null ? "free" : `$${t.hourlyRate}/hr`} · terms {m?.agreedAt ? "accepted" : "not accepted"} · payouts {m?.payoutsEnabled ? "on" : "off"} · {referrals[t.id] ?? 0} referrals
                    </span>
                  </span>
                  <form action={setTutorVetted.bind(null, t.id, !m?.vetted)}>
                    <button className="h-8 rounded-full px-3 text-[13px] font-medium ring-1 ring-line hover:bg-bg-subtle">{m?.vetted ? "Remove verified" : "Mark verified"}</button>
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
                  {c.kind === "guide" ? `Guide: ${c.title}` : `Video: ${c.video?.title}`} <span className="text-muted">· {c.topicId}</span>
                </span>
                <form action={removeContribution.bind(null, c.id)}>
                  <button className="h-8 shrink-0 rounded-full px-3 text-[13px] text-muted ring-1 ring-line">Remove</button>
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
    <section className="mt-10 rounded-2xl p-5 ring-1 ring-line">
      <h2 className="mb-3 text-[15px] font-semibold text-ink">{title}</h2>
      {children}
    </section>
  );
}
