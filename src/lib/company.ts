/**
 * Who runs Merit and how to reach them, shown on About, Terms, and Privacy. Set these in Vercel
 * (NEXT_PUBLIC_COMPANY_NAME, NEXT_PUBLIC_CONTACT_EMAIL, NEXT_PUBLIC_COMPANY_ADDRESS); until they're set,
 * the pages show clearly marked placeholders so nothing ships with a made-up name or address.
 */
export const COMPANY = {
  name: process.env.NEXT_PUBLIC_COMPANY_NAME || null,
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || null,
  address: process.env.NEXT_PUBLIC_COMPANY_ADDRESS || null,
};

/**
 * The founder's story for the About page, in the founder's own words. Null until it's written;
 * the page then shows a placeholder in the preview.
 */
/** Placeholders are only shown on previews and local builds; production falls back to neutral wording. */
export const SHOW_PLACEHOLDERS = process.env.VERCEL_ENV !== "production";

export const FOUNDER_STORY: { name: string; role: string; story: string } | null = null;

/** Minimum age to have a student account (COPPA): younger students are turned away at signup. */
export const MIN_AGE = 13;

/** Shown to anyone under 13 who tries to make an account (COPPA). Nothing they entered is kept. */
export const TOO_YOUNG = `Merit is for students ${MIN_AGE} and older, so we can't create an account for you yet. Ask a parent or teacher about other ways to study until then.`;

/** Whole years old today for someone born in this month (1–12) and year. Assumes the last day of the month, so it never overstates age. */
export function ageFrom(month: number, year: number, now = new Date()) {
  let age = now.getFullYear() - year;
  if (now.getMonth() + 1 <= month) age -= 1;
  return age;
}
