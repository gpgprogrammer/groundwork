import { Check } from "lucide-react";
import { Container, LinkButton } from "./ui";
import { PLAN } from "@/lib/env";

export function Pricing() {
  const features = [
    "Every course, unit, and lesson",
    "Saved lessons, history, and resume where you left off",
    "Recommendations based on what you've finished",
    "Study plan based on your exam date",
    "Cancel anytime in two clicks",
  ];
  return (
    <section id="pricing" className="border-t border-line bg-surface">
      <Container size="xl" className="grid gap-12 py-24 lg:grid-cols-[1fr_440px] lg:items-center">
        <div className="max-w-lg">
          <p className="eyebrow">Pricing</p>
          <h2 className="headline mt-3 text-3xl text-ink sm:text-[40px]">One plan. Less than one hour of tutoring.</h2>
          <p className="mt-4 text-[16px] leading-relaxed text-muted">
            Try everything free for a month. If it helps, it&apos;s ${PLAN.priceMonthly} a month after that. No card needed to start, and no
            ads.
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-bg p-7 shadow-soft">
          <div className="flex items-baseline justify-between">
            <p className="font-medium text-ink">Groundwork</p>
            <span className="rounded-full bg-positive-soft px-2.5 py-0.5 text-xs font-medium text-positive">First month free</span>
          </div>
          <p className="mt-5 flex items-baseline gap-1.5">
            <span className="display text-5xl text-ink">${PLAN.priceMonthly}</span>
            <span className="text-sm text-muted">/ month after {PLAN.trialDays} days</span>
          </p>
          <ul className="mt-7 space-y-3">
            {features.map((f) => (
              <li key={f} className="flex gap-3 text-sm text-ink-2">
                <Check className="mt-0.5 size-4 shrink-0 text-positive" />
                {f}
              </li>
            ))}
          </ul>
          <LinkButton href="/signup" size="lg" className="mt-8 w-full">
            Start your free month
          </LinkButton>
          <p className="mt-3 text-center text-xs text-faint">Tutoring is booked separately, directly with educators.</p>
        </div>
      </Container>
    </section>
  );
}

export function Faq() {
  const faqs = [
    [
      "Who makes the lessons?",
      "Working teachers, AP Readers, and tutors with years of exam prep experience. We review every educator, and the ranking keeps quality visible.",
    ],
    [
      "How is this different from searching YouTube?",
      "Everything is organized by the exam's own structure, lessons are short and on-topic, and the order reflects how well each one teaches rather than how well it was marketed.",
    ],
    [
      "What happens after the free month?",
      `If you add a payment method, it's $${PLAN.priceMonthly}/month and you keep your history and saved lessons. If you don't, your account stays, and you can still browse and read topic summaries.`,
    ],
    [
      "How does tutoring work?",
      "Educators set their own rates and availability. You send a request from their profile or after a lesson, and they reply to you directly.",
    ],
    ["Which courses are available?", "AP Calculus BC, AP World History, AP Biology, AP Chemistry, SAT Math, and SAT Reading and Writing. More are on the way."],
  ];
  return (
    <section>
      <Container size="md" className="py-24">
        <h2 className="headline text-center text-3xl text-ink">Questions</h2>
        <div className="mt-10 divide-y divide-line border-y border-line">
          {faqs.map(([q, a]) => (
            <details key={q} className="group py-5 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium text-ink">
                {q}
                <span className="text-faint transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">{a}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}

