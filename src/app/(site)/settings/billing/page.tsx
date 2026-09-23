import { Check, CircleAlert, Info } from "lucide-react";
import type { Metadata } from "next";
import { Badge, Button } from "@/components/ui";
import { isStripeEnabled, PLAN } from "@/lib/env";
import { requireViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Plan and billing" };

const fmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "";

export default async function BillingPage({ searchParams }: PageProps<"/settings/billing">) {
  const [viewer, sp] = await Promise.all([requireViewer("/settings/billing"), searchParams]);
  const { access } = viewer;
  const sub = viewer.state.subscription;
  const isCreator = viewer.state.profile.role === "creator";
  const subscribed = sub.status === "active" || sub.status === "trialing" || sub.status === "past_due";

  return (
    <div className="space-y-6">
      {sp.checkout === "success" ? (
        <Notice tone="positive">
          You&apos;re subscribed. {sub.status === "trialing" ? `You won't be charged until ${fmt(sub.currentPeriodEnd)}.` : "Thanks for supporting Groundwork."}
        </Notice>
      ) : null}
      {sp.checkout === "canceled" ? <Notice tone="neutral">Checkout was canceled. Nothing was charged.</Notice> : null}
      {sp.checkout === "error" || sp.portal === "error" ? (
        <Notice tone="warn">We couldn&apos;t reach the payment provider. Please try again in a moment.</Notice>
      ) : null}
      {!isStripeEnabled ? (
        <Notice tone="neutral" icon={<Info className="size-4" />}>
          Demo mode: Stripe keys aren&apos;t configured, so checkout is simulated and no card is charged. Add STRIPE_SECRET_KEY and
          STRIPE_PRICE_ID to use real Stripe Checkout.
        </Notice>
      ) : null}

      <section className="rounded-2xl border border-line bg-surface p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h2 className="text-[15px] font-semibold text-ink">Groundwork</h2>
            {isCreator ? (
              <Badge tone="accent">Educator: included</Badge>
            ) : access.kind === "trial" ? (
              <Badge tone="accent">Free trial</Badge>
            ) : access.kind === "active" ? (
              <Badge tone="positive">{sub.status === "trialing" ? "Subscribed · trial" : sub.status === "past_due" ? "Payment due" : "Active"}</Badge>
            ) : (
              <Badge tone="warn">Trial ended</Badge>
            )}
          </div>
          <p className="tabular text-sm text-muted">
            ${PLAN.priceMonthly} / month
          </p>
        </div>

        <div className="mt-5 text-sm leading-relaxed text-ink-2">
          {isCreator ? (
            <p>Educator accounts have full access to every lesson at no cost.</p>
          ) : access.kind === "trial" ? (
            <>
              <p>
                You have <strong className="font-semibold text-ink">{access.daysLeft} days</strong> left in your free month (it ends{" "}
                {fmt(access.endsAt)}).
              </p>
              <p className="mt-1 text-muted">Subscribe any time. The days you have left carry over, so you won&apos;t be charged until the trial ends.</p>
            </>
          ) : access.kind === "active" ? (
            <p>
              {sub.cancelAtPeriodEnd ? (
                <>Your plan is set to end on {fmt(sub.currentPeriodEnd)}. You&apos;ll keep full access until then.</>
              ) : sub.status === "trialing" ? (
                <>Your first charge of ${PLAN.priceMonthly} is on {fmt(sub.currentPeriodEnd)}.</>
              ) : (
                <>Renews on {fmt(sub.currentPeriodEnd)}.</>
              )}
            </p>
          ) : (
            <p>Your free month has ended. Subscribe to keep watching. Your history and saved lessons are waiting.</p>
          )}
        </div>

        {!isCreator ? (
          <div className="mt-6 flex flex-wrap gap-3 border-t border-line pt-6">
            {subscribed ? (
              <form action="/api/billing/portal" method="post">
                {!isStripeEnabled ? <input type="hidden" name="intent" value={sub.cancelAtPeriodEnd ? "resume" : "cancel"} /> : null}
                <Button variant="secondary" type="submit">
                  {isStripeEnabled ? "Manage billing" : sub.cancelAtPeriodEnd ? "Resume plan" : "Cancel plan"}
                </Button>
              </form>
            ) : (
              <form action="/api/billing/checkout" method="post">
                <Button type="submit">{access.kind === "expired" ? `Subscribe for $${PLAN.priceMonthly}/month` : "Subscribe now"}</Button>
              </form>
            )}
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="text-[15px] font-semibold text-ink">What&apos;s included</h2>
        <ul className="mt-4 grid gap-2.5 text-sm text-ink-2 sm:grid-cols-2">
          {["Every course and lesson", "Saved lessons and history", "Personal recommendations", "Resume on any device", "No ads", "Cancel anytime"].map((f) => (
            <li key={f} className="flex items-center gap-2.5">
              <Check className="size-4 text-positive" /> {f}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Notice({ children, tone, icon }: { children: React.ReactNode; tone: "positive" | "warn" | "neutral"; icon?: React.ReactNode }) {
  const tones = {
    positive: "border-positive/20 bg-positive-soft text-positive",
    warn: "border-warn/20 bg-warn-soft text-warn",
    neutral: "border-line bg-bg-subtle text-ink-2",
  };
  return (
    <div className={`flex gap-3 rounded-xl border px-4 py-3 text-sm leading-relaxed ${tones[tone]}`} role="status">
      <span className="mt-0.5 shrink-0">{icon ?? (tone === "positive" ? <Check className="size-4" /> : <CircleAlert className="size-4" />)}</span>
      <span>{children}</span>
    </div>
  );
}
