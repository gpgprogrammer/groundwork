import { CircleCheck, CircleAlert } from "lucide-react";

const NAMES: Record<string, string> = { "plus-month": "Merit Plus", "plus-year": "Merit Plus", sprint: "Exam Sprint" };

/** Banner shown after returning from checkout. */
export function CheckoutNotice({ sp }: { sp: Record<string, string | string[] | undefined> }) {
  const status = sp.checkout;
  if (status === "success") {
    const name = NAMES[String(sp.product)] ?? "Your purchase";
    return (
      <div role="status" className="mb-6 flex items-start gap-3 rounded-2xl bg-positive-soft p-4 text-sm text-ink">
        <CircleCheck className="mt-0.5 size-5 shrink-0 text-positive" />
        <div>
          <p className="font-semibold">{name} is ready. Thank you!</p>
          {sp.test ? <p className="mt-0.5 text-ink-2">Test mode: payments aren&apos;t connected yet, so no card was charged.</p> : null}
        </div>
      </div>
    );
  }
  if (status === "paused") {
    return (
      <div role="status" className="mb-6 flex items-start gap-3 rounded-2xl bg-accent-soft p-4 text-sm text-ink">
        <CircleAlert className="mt-0.5 size-5 shrink-0 text-accent" />
        <p>Purchases open soon. Until then, Merit Plus is free for your first month and Exam Sprint has a free 7-day trial.</p>
      </div>
    );
  }
  if (status === "canceled" || status === "error") {
    return (
      <div role="status" className="mb-6 flex items-start gap-3 rounded-2xl bg-warn-soft p-4 text-sm text-ink">
        <CircleAlert className="mt-0.5 size-5 shrink-0 text-warn" />
        <p>{status === "error" ? "Checkout couldn't start. Please try again in a minute." : "Checkout canceled. Nothing was charged."}</p>
      </div>
    );
  }
  return null;
}
