import type { Metadata } from "next";
import { Container } from "@/components/ui";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Groundwork collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <Container size="md" className="py-16 sm:py-20">
      <h1 className="headline text-3xl text-ink sm:text-4xl">Privacy Policy</h1>
      <p className="mt-3 text-sm text-muted">Last updated: September 23, 2026</p>

      <div className="prose-groundwork mt-10 space-y-8 text-[15px] leading-relaxed text-ink-2">
        <section>
          <h2 className="text-lg font-semibold text-ink">Overview</h2>
          <p className="mt-2">
            Groundwork Learning, Inc. (&quot;Groundwork,&quot; &quot;we,&quot; &quot;us&quot;) provides a learning platform for AP and SAT
            students. This policy describes what we collect when you use groundwork.study (or our other domains), why we collect it, and
            the choices you have.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink">Information we collect</h2>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>
              <strong className="font-medium text-ink">Account data</strong>: name, email, password hash (via our auth provider), and
              profile preferences such as courses and exam date.
            </li>
            <li>
              <strong className="font-medium text-ink">Learning activity</strong>: videos you open from Groundwork, saves, helpful votes,
              and topics you mark as understood, used to rank videos and personalize recommendations.
            </li>
            <li>
              <strong className="font-medium text-ink">Payment data</strong>: subscription status and Stripe customer identifiers. Card
              numbers are handled by Stripe, not stored on our servers.
            </li>
            <li>
              <strong className="font-medium text-ink">Calendar data</strong>: if you connect a calendar, we store the calendar link you
              provide and the titles and dates of school-related events (tests, assignments, classes) matched to your courses. Other events are
              discarded. You can disconnect at any time, which deletes this data.
            </li>
            <li>
              <strong className="font-medium text-ink">Technical data</strong>: device/browser type, IP address, and cookies required for
              sign-in and security.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink">How we use information</h2>
          <p className="mt-2">We use your information to operate the service, including authentication, lesson ranking, recommendations, billing, fraud prevention, and support. We do not sell your personal information.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink">Sharing</h2>
          <p className="mt-2">
            We share data with service providers that help us run Groundwork (for example Supabase for auth/database and Stripe for
            payments). When you open a video you go to YouTube, which handles your viewing under Google&apos;s Privacy Policy. We may disclose information if required by law or to protect
            users and the service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink">Retention and deletion</h2>
          <p className="mt-2">
            We retain account and learning data while your account is active. You may request deletion by emailing{" "}
            <a href="mailto:privacy@groundwork.study" className="font-medium text-ink underline underline-offset-2">
              privacy@groundwork.study
            </a>
            . Some records may be kept where we have a legal obligation (for example payment records).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink">Children</h2>
          <p className="mt-2">
            Groundwork is designed for high school students. Users under 13 should use the service with a parent or guardian. If you believe
            we have collected information from a child without appropriate consent, contact us and we will delete it.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink">Contact</h2>
          <p className="mt-2">
            Questions about this policy:{" "}
            <a href="mailto:privacy@groundwork.study" className="font-medium text-ink underline underline-offset-2">
              privacy@groundwork.study
            </a>
          </p>
        </section>
      </div>
    </Container>
  );
}
