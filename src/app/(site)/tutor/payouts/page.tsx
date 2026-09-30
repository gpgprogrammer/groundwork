import { CircleCheck, Receipt, Wallet } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { DateTile, money } from "@/components/booking-ui";
import { WorldHero } from "@/components/marketing";
import { StatTile, violetButton } from "@/components/tutoring-ui";
import { Badge, cn, Notice, panel } from "@/components/ui";
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
    <div className="pb-20">
      <WorldHero world="violet" narrow inner="pb-10 pt-6">
        <Link href="/tutor" className="-ml-1 inline-flex min-h-9 items-center gap-1 rounded-full px-1 font-brand text-[13.5px] font-extrabold text-white/80 transition-colors hover:text-white">
          <span aria-hidden>←</span> Tutor dashboard
        </Link>
        <div className="rise mt-4 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="display text-[36px] sm:text-5xl">Payouts and fees</h1>
            <p className="mt-2 max-w-md text-[15.5px] leading-relaxed text-white/90">Merit keeps 10% of sessions booked here. Everything else is yours.</p>
          </div>
          <div className="shrink-0 rounded-3xl bg-white px-5 py-4 text-ink shadow-[0_5px_0_0_rgb(0_0_0/0.2)]">
            <p className="font-brand text-[13px] font-extrabold text-muted">You keep</p>
            <p className="tabular font-brand text-[40px] font-black leading-none text-positive">{money(l.net)}</p>
          </div>
        </div>
      </WorldHero>

      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">

      {sp.test || paymentsPaused ? (
        <div className="mt-6 space-y-3">
          {sp.test ? <Notice tone="warn">Test mode: payments aren&apos;t connected yet, so no money moved.</Notice> : null}
          {paymentsPaused ? (
            <Notice tone="info">Card payments through Merit open soon. For now, students pay you directly, and Merit&apos;s 10% referral fee is tracked here for later.</Notice>
          ) : null}
        </div>
      ) : null}

      <section className={cn(panel, "rise mt-6 p-5 sm:p-6")} style={{ ["--i" as string]: 1 }}>
        <div className="flex items-start gap-4">
          <span className={cn("flex size-12 shrink-0 items-center justify-center rounded-2xl text-white", meta.payoutsEnabled ? "bg-positive" : "bg-[#7c3aed]")}>
            <Wallet className="size-6" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="headline text-[22px] text-ink">Get paid through Merit</h2>
              {meta.payoutsEnabled ? (
                <Badge tone="positive">
                  <CircleCheck className="size-3.5" aria-hidden /> On
                </Badge>
              ) : null}
            </div>
            {meta.payoutsEnabled ? (
              <p className="mt-1.5 text-[15px] leading-relaxed text-ink-2">Payouts are on. Students pay when you confirm, and Merit sends you 90% automatically.</p>
            ) : (
              <>
                <p className="mt-1.5 text-[15px] leading-relaxed text-ink-2">
                  Let students pay by card when they book. Merit keeps its 10% and deposits the rest to your bank, so there&apos;s nothing to invoice. Takes about five minutes with Stripe.
                </p>
                <form action="/api/tutor/connect" method="post" className="mt-4">
                  <button className={violetButton("lg", "w-full sm:w-auto")}>Set up payouts</button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="rise mt-8" style={{ ["--i" as string]: 2 }}>
        <h2 className="headline mb-4 text-[22px] text-ink">Your numbers</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Sessions", String(l.sessions)],
            ["Billed", money(l.gross)],
            ["Merit fees (10%)", money(l.fees)],
            ["You keep", money(l.net)],
          ].map(([k, v], i) => (
            <StatTile key={k} label={k} value={v} tone={i === 0 ? "violet" : i === 3 ? "soft" : "surface"} />
          ))}
        </div>
      </section>

      <section className={cn(panel, "rise mt-8 overflow-hidden")} style={{ ["--i" as string]: 3 }}>
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-bg-subtle text-ink-2">
              <Receipt className="size-6" aria-hidden />
            </span>
            <div className="min-w-0">
              <h2 className="headline text-[22px] text-ink">Fees due</h2>
              <p className="mt-0.5 text-[14px] text-muted">For completed sessions that students paid you for directly.</p>
            </div>
          </div>
          {sp.fees === "paid" ? (
            <Notice tone="success" className="mt-4">
              Thanks, your fees are settled.
            </Notice>
          ) : null}
        </div>
        {l.owed.length ? (
          <>
            <ul className="divide-y-2 divide-line border-t-2 border-line">
              {l.owed.map((b) => (
                <li key={b.id} className="flex items-center gap-3.5 px-5 py-3.5 text-sm sm:px-6">
                  <DateTile iso={b.startsAt} muted />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-brand text-[15px] font-extrabold text-ink">{b.studentName}</span>
                    <span className="tabular block text-[12.5px] text-muted">{new Date(b.startsAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  </span>
                  <span className="tabular shrink-0 text-right">
                    <span className="block font-brand text-[16px] font-black text-ink">{money(b.fee)}</span>
                    <span className="block text-[12.5px] text-muted">of {money(b.amount)}</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-3 border-t-2 border-line bg-[#f3edff] dark:bg-[#2a1f45] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="flex items-baseline justify-between gap-3 text-sm text-muted sm:justify-start">
                <span className="font-brand font-extrabold">Total due</span> <span className="tabular font-brand text-[26px] font-black text-ink">{money(l.owedTotal)}</span>
              </p>
              <form action="/api/tutor/fees" method="post">
                <button className={violetButton("lg", "w-full sm:w-auto")}>Pay {money(l.owedTotal)}</button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2.5 border-t-2 border-line px-5 py-4 font-brand text-[15.5px] font-extrabold text-ink sm:px-6">
            <span className="check-pop flex size-7 items-center justify-center rounded-full bg-positive text-white">
              <CircleCheck className="size-4" aria-hidden />
            </span>{" "}
            Nothing due.
          </div>
        )}
      </section>
      </div>
    </div>
  );
}
