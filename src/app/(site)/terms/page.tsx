import type { Metadata } from "next";
import { Clause, CompanyName, Contact, LegalPage } from "@/components/legal";
import { AI_LIMITS } from "@/lib/ai/limits";
import { PARTNER_FEE, TUTOR_FEE } from "@/lib/billing/plans";
import { MIN_AGE } from "@/lib/company";

export const metadata: Metadata = { title: "Terms of Service", description: "Terms for using Merit Learning." };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="October 12, 2026">
      <Clause title="Agreement">
        <p>
          Merit Learning (&quot;Merit&quot;) is operated by <CompanyName />. By creating an account or using Merit, you agree to these Terms. If you do not agree, do not use the service. If we change these Terms, we&apos;ll post the new date above, and we&apos;ll tell account holders before a change that affects them takes effect.
        </p>
      </Clause>
      <Clause title="The service">
        <p>
          Merit helps students learn high school classes, AP courses, and the SAT: lessons organized by course and topic, an AI study partner, a learning plan, calendar sync, Exam Sprint test preparation, and ways to find tutors. We do not guarantee grades, exam scores, or other outcomes. Estimated scores are guides, not predictions.
        </p>
      </Clause>
      <Clause title="Who can use Merit">
        <p>
          You must be at least {MIN_AGE} years old to create a student account; signup asks for your birth month and year and turns away anyone younger. Teachers and tutors must be adults. Keep your login secure and give accurate information. You are responsible for activity on your account.
        </p>
      </Clause>
      <Clause title="Merit is free for students">
        <p>
          Everything on Merit is free for students: courses and lessons, the learning plan, calendar sync, progress tracking, Exam Sprint, and Merit AI (up to {AI_LIMITS.plus} messages a day with an account). There are no subscriptions, trials, or in-app purchases. If we ever introduce a paid feature, we&apos;ll update these Terms and tell you first, and you&apos;ll never be charged without choosing to buy something.
        </p>
      </Clause>
      <Clause title="How Merit is funded">
        <p>Merit is funded by tutoring, not by students. {TUTOR_FEE} {PARTNER_FEE}</p>
        <p>Outside tutoring services that pay Merit are labeled &quot;Merit Partner&quot; wherever they appear. Merit never accepts payment for how lessons, teachers, tutors, or services are ranked.</p>
      </Clause>
      <Clause title="Tutors and tutoring services">
        <p>
          Tutors on Merit are independent. They set their own rates, hours, and terms, and are responsible for their sessions. Merit currently lists online tutoring only; in-person tutoring will open only after Merit runs background checks on every in-person tutor. &quot;Merit Verified&quot; means our team reviewed a tutor&apos;s profile; it is not a background check or a guarantee.
        </p>
        <p>When you pay for a session through Merit, the payment is processed by Stripe and paid out to the tutor after Merit&apos;s 10%. Links to outside tutoring services take you to sites whose own terms apply.</p>
      </Clause>
      <Clause title="Merit AI">
        <p>Merit AI generates explanations, practice questions, study materials, and feedback. It can be wrong. Check important answers against your course materials. Use it to learn, and follow your school&apos;s rules on academic honesty.</p>
      </Clause>
      <Clause title="Teacher and tutor content">
        <p>
          Teachers and tutors who add lessons, write guides, or upload videos confirm they own the content or have permission to publish it, and that it is accurate and school-appropriate. Uploaded videos must not include other people&apos;s videos, TV, music, or textbook material you don&apos;t have rights to, or students&apos; faces or names without consent. Uploaded videos are reviewed before they&apos;re published. You keep ownership of what you upload and grant Merit a non-exclusive, worldwide, royalty-free license to host, stream, and display it to Merit users and to show it in previews, until you delete it. We may remove content that breaks these rules.
        </p>
      </Clause>
      <Clause title="Copyright complaints">
        <p>If you believe something on Merit infringes your copyright, <Contact /> with the page link, a description of your work, and your contact details. We remove infringing material promptly and close accounts of repeat infringers.</p>
      </Clause>
      <Clause title="YouTube lessons">
        <p>
          Many lessons on Merit are YouTube videos, found and shown using YouTube API Services, and played in YouTube&apos;s embedded player or on YouTube. They belong to their creators. By using Merit you agree to be bound by the{" "}
          <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" className="text-accent-ink underline">
            YouTube Terms of Service
          </a>
          . Merit is not affiliated with or endorsed by YouTube or Google.
        </p>
      </Clause>
      <Clause title="Conduct">
        <p>Don&apos;t misuse Merit: no scraping, attacks, harassment, spam, cheating on graded work, or fake reviews.</p>
      </Clause>
      <Clause title="Disclaimer">
        <p>Merit is provided &quot;as is.&quot; To the extent the law allows, Merit is not liable for indirect or consequential damages. AP® and SAT® are trademarks of the College Board, which is not affiliated with Merit.</p>
      </Clause>
      <Clause title="Contact">
        <p>
          Questions about these Terms? <Contact />. You don&apos;t need an account to reach us.
        </p>
      </Clause>
    </LegalPage>
  );
}
