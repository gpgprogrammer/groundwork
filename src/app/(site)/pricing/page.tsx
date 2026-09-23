import type { Metadata } from "next";
import { Faq, Pricing } from "@/components/marketing";
import { PLAN } from "@/lib/env";

export const metadata: Metadata = { title: "Groundwork Plus" };

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-20 pt-10 sm:px-6">
      <h1 className="text-center text-4xl font-bold tracking-tight text-ink">Free to learn. Plus to plan.</h1>
      <p className="mx-auto mt-3 max-w-lg text-center text-[16px] text-muted">
        Every video, topic, and course is free. Plus connects your class calendar so the right lessons show up before each test, free for{" "}
        {PLAN.trialDays} days.
      </p>
      <div className="mt-12">
        <Pricing />
      </div>
      <h2 className="mt-20 text-2xl font-bold tracking-tight text-ink">Questions</h2>
      <div className="mt-4">
        <Faq />
      </div>
    </div>
  );
}
