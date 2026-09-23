import type { Metadata } from "next";
import { Faq, Pricing } from "@/components/marketing";
import { Container } from "@/components/ui";
import { PLAN } from "@/lib/env";

export const metadata: Metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <>
      <Container size="md" className="pt-16 text-center">
        <h1 className="display text-4xl text-ink sm:text-5xl">Simple pricing</h1>
        <p className="mx-auto mt-4 max-w-md text-[16px] leading-relaxed text-muted">
          Your first {PLAN.trialDays} days are free. After that it&apos;s ${PLAN.priceMonthly} a month, and you can cancel anytime.
        </p>
      </Container>
      <div className="mt-12">
        <Pricing />
      </div>
      <Faq />
    </>
  );
}
