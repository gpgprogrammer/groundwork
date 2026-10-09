import { ArrowRight, Receipt, Target } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { setPlusCancel } from "@/app/actions/billing";
import { CheckoutNotice } from "@/components/checkout-notice";
import { BuyButton, PlusBadge, TrialButton } from "@/components/upgrade";
import { PAID_PLANS, PLUS, SPRINT, usd } from "@/lib/billing/plans";
import { isStripeEnabled } from "@/lib/env";
import { requireViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Plan and billing" };

const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "");

export default async function BillingPage({ searchParams }: PageProps<"/settings/billing">) {
  const [viewer, sp] = await Promise.all([requireViewer("/settings/billing"), searchParams]);
  const { plus, billing } = viewer;

  if (!PAID_PLANS) {
    const subscribed = billing.plus.status === "active" && billing.plus.source === "stripe" && isStripeEnabled;
    return (
      <div className="space-y-6">
        <section className="rounded-2xl p-6 bg-surface ring-2 ring-line">
          <h2 className="text-lg font-bold text-ink">Everything on Merit is free</h2>
          <p className="mt-2 text-[15px] text-ink">
            Your learning plan, calendar sync, progress, Merit AI, and Exam Sprint are all included with your account. There&apos;s nothing to buy or unlock.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/plan" className="press font-brand inline-flex h-10 items-center gap-1.5 rounded-2xl bg-accent px-4 text-sm font-extrabold text-white [--ledge:var(--accent-press)]">
              Open my learning plan <ArrowRight className="size-4" />
            </Link>
            <Link href="/sprint" className="press font-brand inline-flex h-10 items-center gap-1.5 rounded-2xl bg-sprint px-4 text-sm font-extrabold text-white [--ledge:var(--sprint-press)]">
              Open Exam Sprint <ArrowRight className="size-4" />
            </Link>
            {subscribed ? (
              // Anyone still subscribed from before can manage or cancel it.
              <form action="/api/billing/portal" method="post">
                <button className="press font-brand h-10 rounded-2xl bg-bg px-4 text-sm font-extrabold text-ink ring-2 ring-inset ring-line hover:bg-bg-subtle [--ledge:var(--line)]">Manage my old subscription</button>
              </form>
            ) : null}
          </div>
        </section>
        {billing.purchases.length ? <History billing={billing} /> : null}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CheckoutNotice sp={sp} />
      <section className="rounded-2xl p-6 bg-surface ring-2 ring-line">
        <div className="flex items-center gap-2">
          <PlusBadge />
          <h2 className="text-lg font-bold text-ink">{PLUS.name}</h2>
        </div>
        {plus.kind === "trial" ? (
          <>
            <p className="mt-3 text-[15px] text-ink">
              Your free trial is active. <span className="font-semibold">{plus.daysLeft} days left</span>, until {fmt(plus.endsAt)}.
            </p>
            <p className="mt-1 text-sm text-muted">Nothing is charged unless you choose a plan. Lock one in now and billing starts when your free trial ends.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <BuyButton product="plus-month" returnTo="/settings/billing">
                {usd(PLUS.monthly)}/month
              </BuyButton>
              <BuyButton product="plus-year" returnTo="/settings/billing" variant="outline">
                {usd(PLUS.annual)}/year
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
                  <button className="press font-brand h-10 rounded-2xl bg-bg px-4 text-sm font-extrabold text-ink ring-2 ring-inset ring-line hover:bg-bg-subtle [--ledge:var(--line)]">Manage billing</button>
                </form>
              ) : (
                <form action={setPlusCancel.bind(null, !plus.cancelAtPeriodEnd)}>
                  <button className="press font-brand h-10 rounded-2xl bg-bg px-4 text-sm font-extrabold text-ink ring-2 ring-inset ring-line hover:bg-bg-subtle [--ledge:var(--line)]">
                    {plus.cancelAtPeriodEnd ? "Resume Plus" : "Cancel Plus"}
                  </button>
                </form>
              )}
            </div>
          </>
        ) : plus.kind === "free" ? (
          <>
            <p className="mt-3 text-[15px] text-ink">You&apos;re on the free plan: every course, lesson, and tutor, plus Merit AI.</p>
            <p className="mt-1 text-sm text-muted">Plus adds your learning plan, calendar sync, and progress. Try it free for {PLUS.trialDays} days, no card needed.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <TrialButton returnTo="/settings/billing" signedIn tone="solid" className="h-11" />
            </div>
          </>
        ) : (
          <>
            <p className="mt-3 text-[15px] text-ink">Your free trial has ended. Your learning plan and calendar sync are paused until you pick a plan.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <BuyButton product="plus-month" returnTo="/plan">
                {usd(PLUS.monthly)}/month
              </BuyButton>
              <BuyButton product="plus-year" returnTo="/plan" variant="outline">
                {usd(PLUS.annual)}/year
              </BuyButton>
            </div>
          </>
        )}
      </section>

      <section className="rounded-2xl p-6 bg-surface ring-2 ring-line">
        <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
          <Target className="size-5 text-sprint" /> Exam Sprints
        </h2>
        <p className="mt-2 text-[15px] text-ink">
          {billing.sprintPass ? "Unlocked for every class and test, for good. Calendar sync is included." : "Not unlocked yet. One purchase unlocks Exam Sprint for every class and test, plus calendar sync."}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/sprint" className="press font-brand inline-flex h-10 items-center gap-1.5 rounded-2xl bg-sprint px-4 text-sm font-extrabold text-white [--ledge:var(--sprint-press)]">
            Open Exam Sprint <ArrowRight className="size-4" />
          </Link>
          {!billing.sprintPass ? (
            <BuyButton product="sprint" returnTo="/settings/billing" variant="outline" className="h-10">
              Unlock · {usd(SPRINT.price)} once
            </BuyButton>
          ) : null}
        </div>
      </section>

      <History billing={billing} />
    </div>
  );
}

function History({ billing }: { billing: Awaited<ReturnType<typeof requireViewer>>["billing"] }) {
  return (
    <section className="rounded-2xl p-6 bg-surface ring-2 ring-line">
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
  );
}
