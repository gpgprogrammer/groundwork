import { PLUS, SPRINT, usd } from "@/lib/billing/plans";

const DEFAULT_FAQS: [string, string][] = [
  [
    "What is Merit?",
    "Merit is where high schoolers learn every AP course and the SAT: the best lesson for every topic, an AI study partner, a plan for tonight, exam sprints, and real tutors when you want one.",
  ],
  [
    "Where do the lessons come from?",
    "From teachers and educators students already trust. Merit sorts every lesson into the course, unit, and topic it teaches and ranks it on how well it teaches. Teachers can also add lessons and study guides directly.",
  ],
  [
    "How does calendar sync work?",
    "Paste the private iCal link from Google Calendar, Canvas, Schoology, Apple Calendar, or Outlook, or upload an .ics file. Merit matches quizzes and tests to topics and builds your nightly plan around them.",
  ],
  [
    "What's free and what's paid?",
    `Courses, lessons, tutor search, and the AI study partner are free. Merit Plus (study plan, calendar sync, reminders, progress) is free for your first year, then ${usd(PLUS.monthly)}/month. An Exam Sprint is ${usd(SPRINT.price)} once.`,
  ],
  ["Which courses are covered?", "Every AP course offered to high school students, from Calculus and Biology to Art History and Japanese, plus SAT Math and SAT Reading and Writing."],
];

export function Faq({ items = DEFAULT_FAQS }: { items?: [string, string][] }) {
  return (
    <div className="divide-y divide-line">
      {items.map(([q, a]) => (
        <details key={q} className="group py-5 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-medium text-ink">
            {q}
            <span className="text-xl text-muted transition-transform group-open:rotate-45">+</span>
          </summary>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">{a}</p>
        </details>
      ))}
    </div>
  );
}
