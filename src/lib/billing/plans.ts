/** Prices and plan copy. Safe to import from client components. */

/**
 * Whether Merit Plus and Exam Sprint are sold. While this is false, every signed-in student gets
 * every Plus and Sprint feature free, and nothing on the site asks them to pay: tutor booking fees
 * are the only paid feature. All of the paid-plan code (trials, checkout, gifts, pricing) stays in
 * place; set NEXT_PUBLIC_PAID_PLANS=on (or flip the default here) to bring it back.
 */
export const PAID_PLANS = process.env.NEXT_PUBLIC_PAID_PLANS === "on";

export const PLUS = {
  name: "Merit Plus",
  monthly: 4.99,
  annual: 39.99,
  /** Length of the free trial a student can start once, from any Plus feature. No card required. */
  trialDays: Number(process.env.NEXT_PUBLIC_PLUS_TRIAL_DAYS || 14),
  features: [
    { key: "feed", title: "A feed that learns your classes", body: "Merit reads what you're learning in school from your calendar and suggests the videos for it, so For you keeps pace with class." },
    { key: "plan", title: "Learning plan", body: "The best videos for what you're covering in class, picked from your class calendar and the topics you choose." },
    { key: "calendar", title: "Calendar sync", body: "Blackbaud, Canvas, Schoology, Google, Outlook, or a PDF. Quizzes and tests line up the right lessons days ahead." },
    { key: "progress", title: "Progress tracking", body: "Mastery by unit, streaks, and study time, so you always know where you stand." },
  ],
} as const;

export const SPRINT = {
  name: "Exam Sprint",
  price: 14.99,
  days: 30,
  features: [
    { title: "7 days free", body: "Take the diagnostic and use every Sprint feature free for a week. No card needed." },
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

/** Exam Sprint's features as the site should describe them right now (no trial or price talk while it's free). */
export const sprintFeatures = () =>
  PAID_PLANS
    ? SPRINT.features
    : SPRINT.features
        .filter((f) => f.title !== "7 days free")
        .map((f) =>
          f.title === "Free diagnostic"
            ? { ...f, body: "A quick exam-style check across every unit shows where you stand on day one." }
            : f.title === "Every test, not just May"
              ? { ...f, body: "Start a Sprint for any quiz or test on your calendar, or the AP or SAT exam." }
              : f,
        );

export const TUTOR_COMMISSION = 0.1;

/** How Merit earns from tutoring, word for word everywhere it's described (tutors, partners, Terms). */
export const TUTOR_FEE = "Listing is free. Merit keeps 10% of sessions booked on Merit, and nothing else.";
export const PARTNER_FEE = "Listing is free. Partners pay Merit 10% of sessions students book through Merit, and nothing else.";

export type Product = "plus-month" | "plus-year" | "sprint";

export const PRODUCTS: Record<Product, { label: string; amount: number; recurring: "month" | "year" | null }> = {
  "plus-month": { label: `${PLUS.name} (monthly)`, amount: PLUS.monthly, recurring: "month" },
  "plus-year": { label: `${PLUS.name} (annual)`, amount: PLUS.annual, recurring: "year" },
  sprint: { label: SPRINT.name, amount: SPRINT.price, recurring: null },
};

export const usd = (n: number) => `$${n.toFixed(2).replace(/\.00$/, "")}`;
export const annualSavings = Math.round((1 - PLUS.annual / (PLUS.monthly * 12)) * 100);
