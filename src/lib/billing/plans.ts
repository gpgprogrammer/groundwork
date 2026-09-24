/** Prices and plan copy. Safe to import from client components. */

export const PLUS = {
  name: "Merit Plus",
  monthly: 4.99,
  annual: 39.99,
  /** Every new account gets Plus free for this long, no card required. */
  trialDays: Number(process.env.NEXT_PUBLIC_PLUS_TRIAL_DAYS || 30),
  features: [
    { key: "plan", title: "Adaptive study plan", body: "Tonight's lessons, picked from your calendar, exam date, and what you haven't mastered yet." },
    { key: "calendar", title: "Calendar sync", body: "Blackbaud, Canvas, Schoology, Google, Outlook, or a PDF. Quizzes and tests line up the right lessons days ahead." },
    { key: "reminders", title: "Study reminders", body: "Reminders land in the calendar app you already check, timed before each test." },
    { key: "progress", title: "Progress tracking", body: "Mastery by unit, streaks, and study time, so you always know where you stand." },
  ],
} as const;

export const SPRINT = {
  name: "Exam Sprint",
  price: 14.99,
  days: 30,
  features: [
    { title: "Free diagnostic", body: "A quick exam-style check across every unit. See your readiness before you pay a cent." },
    { title: "Every test, not just May", body: "Start a Sprint for any quiz or test on your calendar, or the AP or SAT exam. One purchase covers every class, forever." },
    { title: "A day-by-day plan to test day", body: "Exactly what to watch and practice each day, sized to the time you have." },
    { title: "Unlimited exam-style practice", body: "Fresh questions for every topic, with a full explanation for every answer choice." },
    { title: "Readiness dashboard", body: "Live readiness for every unit and an estimated score that moves as you practice." },
    { title: "Weekly mock checkpoints", body: "Mixed-unit mini exams that show whether the plan is working." },
    { title: "Cram sheets", body: "One-page summaries of every unit for the final review." },
    { title: "Free-response coach", body: "Write answers to exam-style prompts and get rubric-based feedback in seconds." },
    { title: "Calendar sync included", body: "Connect Blackbaud, Canvas, Schoology, Google, or any school calendar so every upcoming test gets a Sprint." },
  ],
} as const;

export const TUTOR_COMMISSION = 0.1;

export type Product = "plus-month" | "plus-year" | "sprint";

export const PRODUCTS: Record<Product, { label: string; amount: number; recurring: "month" | "year" | null }> = {
  "plus-month": { label: `${PLUS.name} (monthly)`, amount: PLUS.monthly, recurring: "month" },
  "plus-year": { label: `${PLUS.name} (annual)`, amount: PLUS.annual, recurring: "year" },
  sprint: { label: SPRINT.name, amount: SPRINT.price, recurring: null },
};

export const usd = (n: number) => `$${n.toFixed(2).replace(/\.00$/, "")}`;
export const annualSavings = Math.round((1 - PLUS.annual / (PLUS.monthly * 12)) * 100);
