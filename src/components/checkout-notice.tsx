import { Notice } from "./ui";
import { PLUS } from "@/lib/billing/plans";

const NAMES: Record<string, string> = { "plus-month": "Merit Plus", "plus-year": "Merit Plus", sprint: "Exam Sprint" };

/** Banner shown after returning from checkout. */
export function CheckoutNotice({ sp }: { sp: Record<string, string | string[] | undefined> }) {
  const status = sp.checkout;
  if (status === "success") {
    const name = NAMES[String(sp.product)] ?? "Your purchase";
    return (
      <Notice tone="success" role="status" className="mb-6">
        <p className="font-semibold">{name} is ready. Thank you!</p>
        {sp.test ? <p className="mt-0.5 text-ink-2">Test mode: payments aren&apos;t connected yet, so no card was charged.</p> : null}
      </Notice>
    );
  }
  if (status === "paused") {
    return (
      <Notice tone="info" role="status" className="mb-6">
        <p>Purchases open soon. Until then, you can try Merit Plus free for {PLUS.trialDays} days and Exam Sprint free for 7 days.</p>
      </Notice>
    );
  }
  if (status === "canceled" || status === "error") {
    return (
      <Notice tone="warn" role="status" className="mb-6">
        <p>{status === "error" ? "Checkout couldn't start. Please try again in a minute." : "Checkout canceled. Nothing was charged."}</p>
      </Notice>
    );
  }
  return null;
}
