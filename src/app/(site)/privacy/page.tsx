import type { Metadata } from "next";
import { Clause, Contact, LegalPage } from "@/components/legal";

export const metadata: Metadata = { title: "Privacy Policy", description: "How Merit Learning collects, uses, and protects your information." };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="September 24, 2026">
      <Clause title="Overview">
        <p>Merit Learning (&quot;Merit&quot;) helps high school students study for AP exams and the SAT. This policy explains what we collect, why, and the choices you have. We don&apos;t sell personal information and we don&apos;t show third-party ads.</p>
      </Clause>
      <Clause title="What we collect">
        <p>
          <strong className="text-ink">Account</strong>: your name, email, and password (stored hashed), or your Google or Apple sign-in. <strong className="text-ink">Learning activity</strong>: courses, lessons you open, saves, helpful votes, topics you mark understood, study plan progress, Exam Sprint answers, and messages you send to Merit AI.{" "}
          <strong className="text-ink">Calendar</strong>: if you connect one, the school events on it and the private link you gave us (kept private to your account). <strong className="text-ink">Location</strong>: the city, state, or ZIP you enter to find tutors.{" "}
          <strong className="text-ink">Payments</strong>: handled by Stripe; we keep a record of what you bought, not your card number. <strong className="text-ink">Tutoring</strong>: bookings and messages between students and tutors. <strong className="text-ink">Uploads</strong>: videos and descriptions teachers and tutors publish, which are public on Merit. <strong className="text-ink">Usage</strong>: pages you visit on Merit, the device type, the country (from your connection, not stored as an IP address), and the site that referred you, tied to a random ID in a first-party cookie.
        </p>
      </Clause>
      <Clause title="How we use it">
        <p>To run Merit: build your plan, rank lessons, personalize practice, answer your questions, process purchases and bookings, prevent abuse, and improve the service. Aggregated, anonymous engagement helps rank lessons for everyone.</p>
      </Clause>
      <Clause title="Google Calendar">
        <p>
          If you choose &quot;Connect Google Calendar,&quot; Merit gets read-only access to your Google calendars. Merit reads event titles, dates, and descriptions to find your tests, quizzes, and assignments and match them to lessons, and keeps only those items. Merit never changes your calendars, never shares this data, and never uses it for ads. Merit&apos;s use of information received from Google APIs adheres to the{" "}
          <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-accent underline">
            Google API Services User Data Policy
          </a>
          , including the Limited Use requirements. You can disconnect at any time from My schedule, which deletes Merit&apos;s access, or from your Google account settings.
        </p>
      </Clause>
      <Clause title="Cookies and analytics">
        <p>Merit uses its own cookies to keep you signed in and to count visits (a random visitor ID). Our analytics are first-party: they&apos;re stored in Merit&apos;s own database, not sent to advertising or analytics companies. We don&apos;t store IP addresses for analytics.</p>
      </Clause>
      <Clause title="YouTube API Services">
        <p>
          Merit uses YouTube API Services to find, describe, and show YouTube lessons. When you watch a lesson on YouTube, Google&apos;s <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-accent underline">Privacy Policy</a> applies. Merit doesn&apos;t access your YouTube or Google account. We store public video details (title, channel, thumbnail, length, view count) to build lesson pages, refresh them regularly, and remove videos that are no longer public. If you signed in with Google, you can revoke Merit&apos;s access at any time from <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-accent underline">Google security settings</a>.
        </p>
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
