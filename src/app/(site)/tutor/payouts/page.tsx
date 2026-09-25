import { CircleCheck, Wallet } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { money } from "@/components/booking-ui";
import { getTutorMeta, ledger, listBookings } from "@/lib/bookings";
import { refreshConnectStatus } from "@/lib/billing/stripe";
import { getStore } from "@/lib/data/store";
import { isStripeEnabled, paymentsPaused } from "@/lib/env";
import { requireViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Payouts and fees" };

export default async function PayoutsPage({ searchParams }: PageProps<"/tutor/payouts">) {
  const [viewer, sp] = await Promise.all([requireViewer("/tutor/payouts"), searchParams]);
  const tutor = (await (await getStore()).listTutors()).find((t) => t.userId === viewer.user.id);
  if (!tutor) redirect("/tutors/join");
  let meta = await getTutorMeta(tutor.id);
  if (sp.connected && isStripeEnabled && meta.stripeAccountId) meta = await refreshConnectStatus(meta);
  const bookings = await listBookings({ tutorId: tutor.id });
  const l = ledger(bookings);

  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-8 sm:px-6">
      <Link href="/tutor" className="text-sm text-muted hover:text-ink">
        ← Tutor dashboard
      </Link>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink">Payouts and fees</h1>
      {sp.test ? <p className="mt-4 rounded-xl bg-warn-soft p-3 text-sm text-ink">Test mode: payments aren&apos;t connected yet, so no money moved.</p> : null}
      {paymentsPaused ? (
        <p className="mt-4 rounded-xl bg-accent-soft p-3 text-sm text-ink">
          Card payments through Merit open soon. For now, students pay you directly, and Merit&apos;s 10% referral fee is tracked here for later.
        </p>
      ) : null}

      <section className="mt-6 rounded-2xl p-6 ring-1 ring-line">
        <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
          <Wallet className="size-5 text-accent" /> Get paid through Merit
        </h2>
        {meta.payoutsEnabled ? (
          <p className="mt-2 flex items-center gap-2 text-[15px] text-ink">
            <CircleCheck className="size-5 text-positive" /> Payouts are on. Students pay when you confirm, and Merit sends you 90% automatically.
          </p>
        ) : (
          <>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-2">
              Let students pay by card when they book. Merit keeps its 10% and deposits the rest to your bank, so there&apos;s nothing to invoice. Takes about five minutes with Stripe.
            </p>
            <form action="/api/tutor/connect" method="post" className="mt-4">
              <button className="h-11 rounded-full bg-accent px-5 text-sm font-semibold text-white">Set up payouts</button>
            </form>
          </>
        )}
      </section>

      <section className="mt-5 rounded-2xl p-6 ring-1 ring-line">
        <h2 className="text-lg font-bold text-ink">Your numbers</h2>
        <dl className="tabular mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            ["Sessions", String(l.sessions)],
            ["Billed", money(l.gross)],
            ["Merit fees (10%)", money(l.fees)],
            ["You keep", money(l.net)],
          ].map(([k, v]) => (
            <div key={k}>
              <dd className="text-2xl font-bold text-ink">{v}</dd>
              <dt className="text-[13px] text-muted">{k}</dt>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-5 rounded-2xl p-6 ring-1 ring-line">
        <h2 className="text-lg font-bold text-ink">Fees due</h2>
        <p className="mt-1 text-[14px] text-muted">For completed sessions that students paid you for directly.</p>
        {sp.fees === "paid" ? <p className="mt-3 text-sm font-medium text-positive">Thanks, your fees are settled.</p> : null}
        {l.owed.length ? (
          <>
            <ul className="mt-4 divide-y divide-line text-sm">
              {l.owed.map((b) => (
                <li key={b.id} className="flex justify-between py-2">
                  <span className="text-ink">
                    {b.studentName} · {new Date(b.startsAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                  <span className="tabular text-muted">
                    {money(b.fee)} of {money(b.amount)}
                  </span>
                </li>
              ))}
            </ul>
            <form action="/api/tutor/fees" method="post" className="mt-4">
              <button className="h-11 rounded-full bg-ink px-5 text-sm font-semibold text-bg">Pay {money(l.owedTotal)}</button>
            </form>
          </>
        ) : (
          <p className="mt-3 text-[15px] text-ink">Nothing due.</p>
        )}
      </section>
    </div>
  );
}
