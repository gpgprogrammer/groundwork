import type { Metadata } from "next";
import { Container } from "@/components/ui";
import { PLAN } from "@/lib/env";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms for using Groundwork.",
};

export default function TermsPage() {
  return (
    <Container size="md" className="py-16 sm:py-20">
      <h1 className="headline text-3xl text-ink sm:text-4xl">Terms of Service</h1>
      <p className="mt-3 text-sm text-muted">Last updated: September 23, 2026</p>

      <div className="prose-groundwork mt-10 space-y-8 text-[15px] leading-relaxed text-ink-2">
        <section>
          <h2 className="text-lg font-semibold text-ink">Agreement</h2>
          <p className="mt-2">
            By creating an account or using Groundwork, you agree to these Terms. If you do not agree, do not use the service. Groundwork
            Learning, Inc. may update these Terms; we will post the revised date above.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink">The service</h2>
          <p className="mt-2">
            Groundwork organizes publicly available educational videos from YouTube by course and topic, ranks them, and offers study tools
            such as saved videos, topic tracking, and calendar sync. Rankings combine YouTube statistics with aggregated feedback from
            Groundwork students. We do not guarantee exam scores or specific outcomes.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink">Accounts</h2>
          <p className="mt-2">
            You are responsible for your account credentials and for activity under your account. Provide accurate information and notify us
            of unauthorized use at{" "}
            <a href="mailto:support@groundwork.study" className="font-medium text-ink underline underline-offset-2">
              support@groundwork.study
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink">Subscription and billing</h2>
          <p className="mt-2">
            Browsing and search are free. New accounts include a {PLAN.trialDays}-day free trial of Groundwork Plus (calendar sync and the
            personalized feed). After the trial, Plus requires a paid subscription currently priced at ${PLAN.priceMonthly}/month unless otherwise stated at checkout. Payments are
            processed by Stripe. You may cancel through the billing portal; access continues through the end of the paid period unless
            otherwise required by law.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink">Videos and YouTube</h2>
          <p className="mt-2">
            Videos are created and owned by their channels and play on YouTube. When you open one, you leave Groundwork and YouTube&apos;s Terms
            of Service and Privacy Policy apply. Groundwork shows titles, thumbnails, and statistics provided through the YouTube API
            Services and is not endorsed by YouTube or by the channels listed.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink">Content and conduct</h2>
          <p className="mt-2">
            You may not scrape, reverse engineer, or misuse the service; or interfere with other users. We may remove content or suspend accounts that violate these Terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink">Disclaimer</h2>
          <p className="mt-2">
            The service is provided &quot;as is&quot; to the extent permitted by law. AP® and SAT® are trademarks of the College Board, which is
            not affiliated with Groundwork.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink">Contact</h2>
          <p className="mt-2">
            <a href="mailto:support@groundwork.study" className="font-medium text-ink underline underline-offset-2">
              support@groundwork.study
            </a>
          </p>
        </section>
      </div>
    </Container>
  );
}
