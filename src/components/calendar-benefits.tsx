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

/** Tile colors, one per benefit, so the grid reads as a set of bold blocks. */
const TONES = [
  "bg-positive-soft text-positive",
  "bg-accent-soft text-accent-ink",
  "bg-positive-soft text-positive",
  "bg-warn-soft text-warn",
  "bg-sprint-soft text-sprint-ink",
  "bg-[#fdeef6] text-[#9d174d] dark:bg-[#3a1428] dark:text-[#f9a8d4]",
];

export function CalendarBenefits({ variant = "grid", className }: { variant?: "grid" | "list"; className?: string }) {
  if (variant === "list") {
    return (
      <ul className={cn("grid gap-3 sm:grid-cols-2", className)}>
        {CALENDAR_BENEFITS.map(({ key, Icon, title, body }, i) => (
          <li key={key} className="flex gap-3 rounded-2xl bg-surface p-3.5 ring-2 ring-line">
            <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", TONES[i % TONES.length])}>
              <Icon className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block font-brand text-[15px] font-extrabold text-ink">{title}</span>
              <span className="block text-[13px] leading-relaxed text-muted">{body}</span>
            </span>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {CALENDAR_BENEFITS.map(({ key, Icon, title, body }, i) => (
        <div key={key} className="rise rounded-3xl bg-surface p-5 ring-2 ring-line" style={{ ["--i" as string]: i }}>
          <span className={cn("flex size-12 items-center justify-center rounded-2xl", TONES[i % TONES.length])}>
            <Icon className="size-6" strokeWidth={2.2} />
          </span>
          <p className="mt-4 font-brand text-[17px] font-extrabold leading-snug text-ink">{title}</p>
          <p className="mt-1 text-[14px] leading-relaxed text-muted">{body}</p>
        </div>
      ))}
    </div>
  );
}
