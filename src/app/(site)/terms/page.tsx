import type { Metadata } from "next";
import { Clause, Contact, LegalPage } from "@/components/legal";
import { PLUS, SPRINT, TUTOR_COMMISSION, usd } from "@/lib/billing/plans";

export const metadata: Metadata = { title: "Terms of Service", description: "Terms for using Merit Learning." };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="September 24, 2026">
      <Clause title="Agreement">
        <p>By creating an account or using Merit Learning (&quot;Merit&quot;), you agree to these Terms. If you do not agree, do not use the service. We may update these Terms and will post the revised date above.</p>
      </Clause>
      <Clause title="The service">
        <p>
          Merit helps students study for AP exams and the SAT: lessons organized by course and topic, an AI study partner, study planning, exam preparation tools, and ways to find and book tutors. We do not guarantee exam scores or specific outcomes. Estimated scores are guides, not predictions.
        </p>
      </Clause>
      <Clause title="Accounts">
        <p>Keep your login secure and give accurate information. Students under 13 must use Merit with a parent or guardian. You are responsible for activity on your account.</p>
      </Clause>
      <Clause title="Free and paid features">
        <p>Courses, lessons, tutor search, and the AI study partner (up to a daily limit) are free.</p>
        <p>
          <strong className="text-ink">Merit Plus</strong> ({usd(PLUS.monthly)}/month or {usd(PLUS.annual)}/year) includes the study plan, calendar sync, reminders, and progress tracking. New accounts get Plus free for their first {PLUS.trialDays === 365 ? "year" : `${PLUS.trialDays} days`}, without a card. Paid plans renew automatically until canceled; you can cancel anytime in Settings and keep Plus until the end of the period you paid for.
        </p>
        <p>
          <strong className="text-ink">Exam Sprint</strong> ({usd(SPRINT.price)} one-time) permanently unlocks Exam Sprint for every class, test, and AP or SAT exam on your account, and includes calendar sync. It is not a subscription.
        </p>
        <p>Purchases can be made by a parent or other adult for a student; they unlock when the student signs in with the email given at checkout. Payments are processed by Stripe. Prices may change for future purchases; we will tell you before any change affects a renewal.</p>
      </Clause>
      <Clause title="Merit AI">
        <p>Merit AI generates explanations, practice questions, study materials, and feedback. It can be wrong. Check important answers against your course materials. Use it to learn, and follow your school&apos;s rules on academic honesty.</p>
      </Clause>
      <Clause title="Tutors and tutoring services">
        <p>
          Tutors on Merit are independent. They set their own rates, hours, and terms, and are responsible for their sessions. &quot;Merit Verified&quot; means our team reviewed the profile; it is not a background check or a guarantee. Merit earns a {Math.round(TUTOR_COMMISSION * 100)}% referral fee on sessions with students Merit referred to a tutor, for 12 months after the referral, whether the session is booked on Merit or directly with the tutor. Merit may also earn referral fees from partner tutoring services. Students may be asked to confirm whether they worked with a tutor. Fees never affect how tutors or services are ranked.
        </p>
        <p>When you pay a tutor through Merit, the payment is processed by Stripe and paid out to the tutor after Merit&apos;s fee. Links to outside services take you to sites whose own terms apply.</p>
      </Clause>
      <Clause title="Teacher and tutor content">
        <p>Teachers and tutors who add lessons, write guides, or upload videos confirm they own the content or have permission to publish it, and that it is accurate and school-appropriate. Uploaded videos must not include other people&apos;s videos, TV, music, or textbook material you don&apos;t have rights to, or students&apos; faces or names without consent. You keep ownership of what you upload and grant Merit a non-exclusive, worldwide, royalty-free license to host, stream, and display it to Merit users and to show it in previews, until you delete it. We may remove content that breaks these rules.</p>
      </Clause>
      <Clause title="Copyright complaints">
        <p>If you believe something on Merit infringes your copyright, <Contact /> with the page link, a description of your work, and your contact details. We remove infringing material promptly and close accounts of repeat infringers.</p>
      </Clause>
      <Clause title="YouTube lessons">
        <p>Many lessons on Merit are YouTube videos, found and shown using YouTube API Services. They belong to their creators and play on YouTube. By using Merit you agree to be bound by the <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" className="text-accent underline">YouTube Terms of Service</a>. Merit is not affiliated with or endorsed by YouTube or Google.</p>
      </Clause>
      <Clause title="Conduct">
        <p>Don&apos;t misuse Merit: no scraping, attacks, harassment, spam, cheating on graded work, or fake reviews.</p>
      </Clause>
      <Clause title="Disclaimer">
        <p>Merit is provided &quot;as is.&quot; To the extent the law allows, Merit is not liable for indirect or consequential damages. AP® and SAT® are trademarks of the College Board, which is not affiliated with Merit.</p>
      </Clause>
      <Clause title="Contact">
        <p>
          Questions? <Contact />.
        </p>
      </Clause>
    </LegalPage>
  );
}
