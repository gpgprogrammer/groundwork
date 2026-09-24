import { ArrowRight, Receipt, Target } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { setPlusCancel } from "@/app/actions/billing";
import { CheckoutNotice } from "@/components/checkout-notice";
import { BuyButton, PlusBadge } from "@/components/upgrade";
import { PLUS, SPRINT, usd } from "@/lib/billing/plans";
import { isStripeEnabled } from "@/lib/env";
import { requireViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Plan and billing" };

const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "");

export default async function BillingPage({ searchParams }: PageProps<"/settings/billing">) {
  const [viewer, sp] = await Promise.all([requireViewer("/settings/billing"), searchParams]);
  const { plus, billing } = viewer;

  return (
    <div className="space-y-6">
      <CheckoutNotice sp={sp} />
      <section className="rounded-2xl p-6 ring-1 ring-line">
        <div className="flex items-center gap-2">
          <PlusBadge />
          <h2 className="text-lg font-bold text-ink">{PLUS.name}</h2>
        </div>
        {plus.kind === "trial" ? (
          <>
            <p className="mt-3 text-[15px] text-ink">
              Your free year is active. <span className="font-semibold">{plus.daysLeft} days left</span>, until {fmt(plus.endsAt)}.
            </p>
            <p className="mt-1 text-sm text-muted">Nothing is charged unless you choose a plan. Lock one in now and billing starts when your free year ends.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <BuyButton product="plus-year" returnTo="/settings/billing">
                {usd(PLUS.annual)}/year
              </BuyButton>
              <BuyButton product="plus-month" returnTo="/settings/billing" variant="outline">
                {usd(PLUS.monthly)}/month
              </BuyButton>
            </div>
          </>
        ) : plus.kind === "active" ? (
          <>
            <p className="mt-3 text-[15px] text-ink">
              Active, billed {plus.interval === "year" ? "yearly" : "monthly"}.{" "}
              {plus.renewsAt ? (plus.cancelAtPeriodEnd ? `Ends ${fmt(plus.renewsAt)}.` : `Renews ${fmt(plus.renewsAt)}.`) : null}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {billing.plus.source === "stripe" && isStripeEnabled ? (
                <form action="/api/billing/portal" method="post">
                  <button className="h-10 rounded-full bg-bg px-4 text-sm font-medium text-ink ring-1 ring-line-strong hover:bg-bg-subtle">Manage billing</button>
                </form>
              ) : (
                <form action={setPlusCancel.bind(null, !plus.cancelAtPeriodEnd)}>
                  <button className="h-10 rounded-full bg-bg px-4 text-sm font-medium text-ink ring-1 ring-line-strong hover:bg-bg-subtle">
                    {plus.cancelAtPeriodEnd ? "Resume Plus" : "Cancel Plus"}
                  </button>
                </form>
              )}
            </div>
          </>
        ) : (
          <>
            <p className="mt-3 text-[15px] text-ink">Your free year has ended. Your plan, calendar sync, and reminders are paused until you pick a plan.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <BuyButton product="plus-year" returnTo="/plan">
                {usd(PLUS.annual)}/year
              </BuyButton>
              <BuyButton product="plus-month" returnTo="/plan" variant="outline">
                {usd(PLUS.monthly)}/month
              </BuyButton>
            </div>
          </>
        )}
      </section>

      <section className="rounded-2xl p-6 ring-1 ring-line">
        <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
          <Target className="size-5 text-[#e0531c]" /> Exam Sprints
        </h2>
        <p className="mt-2 text-[15px] text-ink">
          {billing.sprintCredits ? `${billing.sprintCredits} unused Sprint${billing.sprintCredits > 1 ? "s" : ""}, ready to start.` : "No unused Sprints."}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/sprint" className="inline-flex h-10 items-center gap-1.5 rounded-full bg-gradient-to-r from-[#ff8a3d] to-[#e0531c] px-4 text-sm font-semibold text-white">
            Open Exam Sprint <ArrowRight className="size-4" />
          </Link>
          <BuyButton product="sprint" returnTo="/settings/billing" variant="outline" className="h-10">
            Buy another · {usd(SPRINT.price)}
          </BuyButton>
        </div>
      </section>

      <section className="rounded-2xl p-6 ring-1 ring-line">
        <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
          <Receipt className="size-5 text-muted" /> History
        </h2>
        {billing.purchases.length ? (
          <ul className="mt-3 divide-y divide-line text-sm">
            {billing.purchases.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                <span className="text-ink">
                  {p.product === "sprint" ? SPRINT.name : `${PLUS.name} (${p.product === "plus-year" ? "year" : "month"})`}
                  {p.note ? <span className="text-muted"> · {p.note}</span> : null}
                </span>
                <span className="tabular shrink-0 text-muted">
                  {fmt(p.at)} · {p.amount ? usd(p.amount) : "$0"}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted">No purchases yet.</p>
        )}
      </section>
    </div>
  );
}
