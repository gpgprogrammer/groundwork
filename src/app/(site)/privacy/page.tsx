import type { Metadata } from "next";
import { Clause, Contact, LegalPage } from "@/components/legal";

export const metadata: Metadata = { title: "Privacy Policy", description: "How Merit Learning collects, uses, and protects your information." };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="September 23, 2026">
      <Clause title="Overview">
        <p>Merit Learning (&quot;Merit&quot;) helps high school students study for AP exams and the SAT. This policy explains what we collect, why, and the choices you have. We don&apos;t sell personal information and we don&apos;t show ads.</p>
      </Clause>
      <Clause title="What we collect">
        <p>
          <strong className="text-ink">Account</strong>: your name, email, and password (stored hashed), or your Google or Apple sign-in. <strong className="text-ink">Learning activity</strong>: courses, lessons you open, saves, helpful votes, topics you mark understood, study plan progress, Exam Sprint answers, and messages you send to Merit AI.{" "}
          <strong className="text-ink">Calendar</strong>: if you connect one, the school events on it and the private link you gave us (kept private to your account). <strong className="text-ink">Location</strong>: the city, state, or ZIP you enter to find tutors.{" "}
          <strong className="text-ink">Payments</strong>: handled by Stripe; we keep a record of what you bought, not your card number. <strong className="text-ink">Tutoring</strong>: bookings and messages between students and tutors.
        </p>
      </Clause>
      <Clause title="How we use it">
        <p>To run Merit: build your plan, rank lessons, personalize practice, answer your questions, process purchases and bookings, prevent abuse, and improve the service. Aggregated, anonymous engagement helps rank lessons for everyone.</p>
      </Clause>
      <Clause title="Sharing">
        <p>
          With service providers that run Merit for us (for example hosting, database, payments, and AI model providers that process Merit AI requests under their own privacy terms and do not use them to train models on your data where that option is available). With a tutor you book: your name, email, and message. With a parent or guardian who bought Merit for you: that the purchase was used. We share information if the law requires it.
        </p>
      </Clause>
      <Clause title="Retention and deletion">
        <p>We keep your data while your account is active. You can clear your history in your library, disconnect your calendar at any time, and ask us to delete your account.</p>
      </Clause>
      <Clause title="Children">
        <p>Merit is designed for high school students. Children under 13 should use Merit only with a parent or guardian. If you believe a child under 13 gave us information without consent, contact us and we will delete it.</p>
      </Clause>
      <Clause title="Contact">
        <p>
          To exercise your privacy rights or ask a question, <Contact />.
        </p>
      </Clause>
    </LegalPage>
  );
}
