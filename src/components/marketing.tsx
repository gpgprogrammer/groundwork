import { Check } from "lucide-react";
import { PLAN } from "@/lib/env";
import { LinkButton } from "./ui";

const FREE = ["Every course, unit, and topic", "Thousands of ranked YouTube lessons", "Search, sort, and filter by length", "Watch later, history, and helpful votes", "Topic mastery tracking"];
const PLUS = ["Everything in Free", "Class calendar sync (Google, Canvas, Schoology, Apple, Outlook)", "Videos lined up before each quiz and test", "A feed that leads with what you're covering in class", "Cancel anytime"];

export function Pricing() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="flex flex-col rounded-2xl p-7 ring-1 ring-line">
        <p className="text-lg font-bold text-ink">Free</p>
        <p className="mt-4 flex items-baseline gap-1">
          <span className="text-4xl font-bold tracking-tight text-ink">$0</span>
        </p>
        <ul className="mt-6 flex-1 space-y-3">
          {FREE.map((f) => (
            <li key={f} className="flex gap-3 text-sm text-ink-2">
              <Check className="mt-0.5 size-4 shrink-0 text-muted" />
              {f}
            </li>
          ))}
        </ul>
        <LinkButton href="/signup" variant="secondary" size="lg" className="mt-8 w-full">
          Create free account
        </LinkButton>
      </div>
      <div className="flex flex-col rounded-2xl bg-[#0f0f0f] p-7 text-white">
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold">Groundwork Plus</p>
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium">{PLAN.trialDays} days free</span>
        </div>
        <p className="mt-4 flex items-baseline gap-1">
          <span className="text-4xl font-bold tracking-tight">${PLAN.priceMonthly}</span>
          <span className="text-sm text-white/60">/ month after trial</span>
        </p>
        <ul className="mt-6 flex-1 space-y-3">
          {PLUS.map((f) => (
            <li key={f} className="flex gap-3 text-sm text-white/85">
              <Check className="mt-0.5 size-4 shrink-0 text-[#6ea8fe]" />
              {f}
            </li>
          ))}
        </ul>
        <LinkButton href="/signup" size="lg" className="mt-8 w-full bg-white text-[#0f0f0f] hover:bg-white/90">
          Start free trial
        </LinkButton>
        <p className="mt-3 text-center text-xs text-white/50">No card needed to start.</p>
      </div>
    </div>
  );
}

export function Faq() {
  const faqs = [
    [
      "Where do the videos come from?",
      "Public YouTube lessons from educators and channels students already trust. We sort each one into the course, unit, and topic it teaches, and link straight to YouTube to watch.",
    ],
    [
      "How is this different from searching YouTube?",
      "YouTube ranks for watch time across everything. Groundwork only includes AP and SAT lessons, organizes them the way the exam is organized, and ranks them on how helpful they are for studying.",
    ],
    [
      "How does calendar sync work?",
      "Paste the private iCal link from Google Calendar, Canvas, Schoology, Apple Calendar, or Outlook, or upload an .ics file. We match quizzes, tests, and assignments to topics and put those videos at the top of your home page before they're due.",
    ],
    [
      "What happens after the free trial?",
      `Browsing, search, saves, and topic tracking stay free forever. Calendar sync continues with Plus at $${PLAN.priceMonthly}/month.`,
    ],
    ["Which courses are covered?", "AP Calculus BC, AP World History, AP Biology, AP Chemistry, SAT Math, and SAT Reading and Writing, with more on the way."],
  ];
  return (
    <div className="divide-y divide-line">
      {faqs.map(([q, a]) => (
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
