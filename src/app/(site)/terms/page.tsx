import type { Metadata } from "next";
import { Clause, Contact, LegalPage } from "@/components/legal";
import { PLUS, SPRINT, TUTOR_COMMISSION, usd } from "@/lib/billing/plans";

export const metadata: Metadata = { title: "Terms of Service", description: "Terms for using Merit Learning." };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="September 23, 2026">
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
          <strong className="text-ink">Exam Sprint</strong> ({usd(SPRINT.price)} one-time) unlocks a sprint for one exam until that exam date. It is not a subscription.
        </p>
        <p>Purchases can be made by a parent or other adult for a student; they unlock when the student signs in with the email given at checkout. Payments are processed by Stripe. Prices may change for future purchases; we will tell you before any change affects a renewal.</p>
      </Clause>
      <Clause title="Merit AI">
        <p>Merit AI generates explanations, practice questions, study materials, and feedback. It can be wrong. Check important answers against your course materials. Use it to learn, and follow your school&apos;s rules on academic honesty.</p>
      </Clause>
      <Clause title="Tutors and tutoring services">
        <p>
          Tutors on Merit are independent. They set their own rates, hours, and terms, and are responsible for their sessions. &quot;Merit Verified&quot; means our team reviewed the profile; it is not a background check or a guarantee. Merit earns a {Math.round(TUTOR_COMMISSION * 100)}% referral fee on sessions booked with tutors through Merit, and may earn referral fees from partner tutoring services. Fees never affect how tutors or services are ranked.
        </p>
        <p>When you pay a tutor through Merit, the payment is processed by Stripe and paid out to the tutor after Merit&apos;s fee. Links to outside services take you to sites whose own terms apply.</p>
      </Clause>
      <Clause title="Teacher content">
        <p>Teachers who add lessons or write guides confirm they have the right to share them and that they are accurate and school-appropriate. They grant Merit permission to display that content to students. We may remove content that breaks these rules.</p>
      </Clause>
      <Clause title="Lessons from other creators">
        <p>Many lessons are made by independent teachers and channels and play on YouTube. They belong to their creators; YouTube&apos;s Terms of Service apply when you watch them there.</p>
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
