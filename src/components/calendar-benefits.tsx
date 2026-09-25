import { BellRing, CalendarCheck, MessageCircleQuestion, Sparkles, SquarePlay, Target } from "lucide-react";
import { cn } from "./ui";

/** What connecting a calendar does. Every item is a real feature that reads the student's calendar. */
export const CALENDAR_BENEFITS = [
  { key: "feed", Icon: Sparkles, title: "A feed that follows your classes", body: "The topics on your calendar move to the top of For you, so the videos you see match what you're learning this week." },
  { key: "lessons", Icon: SquarePlay, title: "Lessons for every quiz and test", body: "Each quiz and test gets its own set of the best lessons for its topics, days before it's due." },
  { key: "plan", Icon: CalendarCheck, title: "A plan for tonight", body: "A study plan that fits the time you have and puts whatever's due soonest first." },
  { key: "reminders", Icon: BellRing, title: "Reminders where you'll see them", body: "Study sessions show up in Google, Apple, or Outlook Calendar, timed before each test." },
  { key: "sprint", Icon: Target, title: "An Exam Sprint for any test", body: "Turn a big test into a day-by-day plan in one click, with its units already filled in." },
  { key: "ai", Icon: MessageCircleQuestion, title: "Merit AI knows what's coming", body: "Ask what to study and Merit AI plans around your upcoming tests." },
] as const;

export function CalendarBenefits({ variant = "grid", className }: { variant?: "grid" | "list"; className?: string }) {
  if (variant === "list") {
    return (
      <ul className={cn("grid gap-x-6 gap-y-3 sm:grid-cols-2", className)}>
        {CALENDAR_BENEFITS.map(({ key, Icon, title, body }) => (
          <li key={key} className="flex gap-3">
            <Icon className="mt-0.5 size-5 shrink-0 text-accent" />
            <span>
              <span className="block text-[14px] font-semibold text-ink">{title}</span>
              <span className="block text-[13px] leading-relaxed text-muted">{body}</span>
            </span>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {CALENDAR_BENEFITS.map(({ key, Icon, title, body }) => (
        <div key={key} className="rounded-2xl p-5 ring-1 ring-line">
          <Icon className="size-6 text-accent" />
          <p className="mt-3 font-semibold text-ink">{title}</p>
          <p className="mt-1 text-[14px] leading-relaxed text-muted">{body}</p>
        </div>
      ))}
    </div>
  );
}
