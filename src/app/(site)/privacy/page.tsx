import type { Metadata } from "next";
import { Clause, CompanyName, Contact, LegalPage } from "@/components/legal";
import { MIN_AGE } from "@/lib/company";

export const metadata: Metadata = { title: "Privacy Policy", description: "How Merit Learning collects, uses, and protects your information." };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="November 28, 2026">
      <Clause title="Overview">
        <p>
          Merit Learning (&quot;Merit&quot;), operated by <CompanyName />, helps high school students learn math, from Algebra 1 to AP Calculus and SAT Math. Merit is free for students. This policy explains what we collect, why, and the choices you have. We don&apos;t sell personal information and we don&apos;t show ads.
        </p>
      </Clause>
      <Clause title="What we collect">
        <p>
          <strong className="text-ink">Account</strong>: your name, email, password (stored hashed) or Google or Apple sign-in, and your birth month and year (to confirm you&apos;re {MIN_AGE} or older). <strong className="text-ink">Learning activity</strong>: courses, lessons you watch, saves, helpful votes, topics you mark understood, learning plan progress, Exam Sprint answers, and messages you send to Merit AI.{" "}
          <strong className="text-ink">Calendar</strong>: if you connect one, the school events on it and the private link you gave us (kept private to your account). <strong className="text-ink">Location</strong>: the city, state, or ZIP you enter to find tutors.{" "}
          <strong className="text-ink">Tutoring</strong>: bookings and messages between students and tutors; session payments are handled by Stripe, and we keep a record of the payment, not your card number. <strong className="text-ink">Uploads</strong>: videos and descriptions teachers and tutors publish, which are public on Merit.{" "}
          <strong className="text-ink">Usage</strong>: pages you visit on Merit, how long you spend on each, the buttons and links you click (their labels, never what you type), what you do in features like practice and SAT Prep, the device type, the country (from your connection, not stored as an IP address), and the site that referred you, tied to a random ID in a first-party cookie.
        </p>
      </Clause>
      <Clause title="How we use it">
        <p>To run Merit: build your learning plan, rank lessons, personalize practice, answer your questions, handle tutoring bookings, prevent abuse, and improve the service. Aggregated, anonymous engagement helps rank lessons for everyone.</p>
      </Clause>
      <Clause title="School calendars and FERPA">
        <p>
          When you connect a school calendar (Canvas, Schoology, Blackbaud, Google Classroom, or any calendar link or file), you choose to share it with Merit. Merit reads event titles and dates to find your quizzes, tests, and assignments and match them to lessons. It never sees your grades, never changes your calendar, and never shares calendar data with anyone. Disconnect at any time from My schedule and Merit deletes the link and the events it saved.
        </p>
        <p>
          Merit doesn&apos;t receive education records from schools; students share their own calendars. If a school or district wants to provide Merit to its students, we&apos;ll sign a student data privacy agreement and act as a &quot;school official&quot; under FERPA, using student data only for the school&apos;s purposes. <Contact /> to set one up.
        </p>
      </Clause>
      <Clause title="Google Calendar">
        <p>
          If you choose &quot;Connect Google Calendar,&quot; Merit gets read-only access to your Google calendars. Merit reads event titles, dates, and descriptions to find your tests, quizzes, and assignments and match them to lessons, and keeps only those items. Merit never changes your calendars, never shares this data, and never uses it for ads. Merit&apos;s use of information received from Google APIs adheres to the{" "}
          <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-accent-ink underline">
            Google API Services User Data Policy
          </a>
          , including the Limited Use requirements. You can disconnect at any time from My schedule, which deletes Merit&apos;s access, or from your Google account settings.
        </p>
      </Clause>
      <Clause title="Cookies and analytics">
        <p>Merit uses its own cookies to keep you signed in and to count visits (a random visitor ID). Our analytics are first-party: they&apos;re stored in Merit&apos;s own database, not sent to advertising or analytics companies. We don&apos;t store IP addresses for analytics. When you&apos;re signed in, your activity is linked to your account (including earlier visits from the same browser) so Merit&apos;s team can see how people use Merit and make it better. Only Merit admins can see it.</p>
      </Clause>
      <Clause title="YouTube API Services">
        <p>
          Merit uses YouTube API Services to find, describe, and show YouTube lessons. Lessons play in YouTube&apos;s embedded player (in privacy-enhanced mode) or on YouTube, where Google&apos;s{" "}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-accent-ink underline">
            Privacy Policy
          </a>{" "}
          applies. Merit doesn&apos;t access your YouTube or Google account. We store public video details (title, channel, thumbnail, length, view count) to build lesson pages, refresh them regularly, and remove videos that are no longer public. If you signed in with Google, you can revoke Merit&apos;s access at any time from{" "}
          <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-accent-ink underline">
            Google security settings
          </a>
          .
        </p>
      </Clause>
      <Clause title="Sharing">
        <p>
          With service providers that run Merit for us (for example hosting, database, payments for tutoring, and AI model providers that process Merit AI requests under their own privacy terms and do not use them to train models on your data where that option is available). With a tutor you book or message: your name, email, and message. We share information if the law requires it. We never sell it.
        </p>
      </Clause>
      <Clause title="Retention and deletion">
        <p>We keep your data while your account is active. You can clear your history in your library, disconnect your calendar at any time, and ask us to delete your account and its data, with or without an account, by contacting us below.</p>
      </Clause>
      <Clause title="Children">
        <p>
          Merit is for students {MIN_AGE} and older. Signup asks for a birth month and year and doesn&apos;t create an account for anyone younger, and we don&apos;t knowingly collect personal information from children under {MIN_AGE}. If you believe a child under {MIN_AGE} has given us information, <Contact /> and we will delete it.
        </p>
      </Clause>
      <Clause title="Contact">
        <p>
          To exercise your privacy rights (access, correction, or deletion) or ask a question, <Contact />. You don&apos;t need an account to reach us.
        </p>
      </Clause>
    </LegalPage>
  );
}
