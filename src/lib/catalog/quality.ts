import type { Course, YtVideo } from "@/lib/types";

/**
 * Lesson quality signals that come from the lesson itself (never from YouTube's views, likes, or
 * comments): does it squarely teach this topic at this level, is it a sensible length for one
 * topic, and does it predate the current course framework. Also the hard filters for things that
 * aren't lessons at all (ads, spam) or aren't in English outside the language courses.
 *
 * When the AI audit (src/data/video-audit.json) has scored a video, its topic fit and flags win
 * over the rule-based estimates here.
 */

export type AuditEntry = {
  /** 0–1: how squarely it teaches the topic it's filed under, at a high school level. */
  fit: number;
  /** Reasons to hide or demote: "ad", "spam", "non_english", "off_topic", "wrong_level", "not_a_lesson". */
  flags?: string[];
};

/** Ads: never lessons, wherever they're found. */
const AD = /\b(loans? up to|get approved|only takes \d+ minutes|make money online|business secrets?|crypto(currency)? (trading|signals))\b/i;
/** Money pitches that are only lessons in courses that teach personal finance. */
const MONEY_PITCH = /\b(personal loans?|mutual funds?|passive income|investment tips)\b/i;
const TEACHES_FINANCE = /^(ap-business-personal-finance|sat-math|ap-macroeconomics|ap-microeconomics)$/;
/** Engagement bait in a title: hashtag farming and promo pushes. */
const BAIT_TITLE = /#(fyp|foryou|foryoupage|reels|viral|funny|trending|shortsfeed)\b|\b(giveaway|promo code|apply now)\b/i;

/** College, graduate, or foreign-curriculum material filed under a high school topic. */
const WRONG_LEVEL =
  /\b(multivariable|multi-variable|calc(ulus)? (3|iii)|vector calculus|linear algebra|real analysis|abstract algebra|graduate|grad school|ph\.?d|mit 18\.\d+|o[- ]level|a[- ]level|igcse|gcse|cbse|ncert|icse|jee|neet|class (9|10|11|12)|grade (9|10|11|12) (cbse|icse)|matric|form [1-6] )\b/i;

/** Scripts that mean the lesson isn't in English (allowed in the world-language courses). */
const NON_LATIN = /[ऀ-෿฀-๿؀-ۿЀ-ӿ֐-׿가-힯]/;
const WORLD_LANGUAGE = /^ap-(spanish|french|german|italian|chinese|japanese|latin)/;

/** The school year each course's current framework took effect; older lessons may teach the old one. */
const FRAMEWORK_YEAR: Record<string, number> = {
  "ap-statistics": 2026,
  "ap-computer-science-a": 2025,
  "ap-business-personal-finance": 2025,
  "ap-cybersecurity": 2025,
  "ap-physics-1": 2024,
  "ap-physics-2": 2024,
  "ap-physics-c-mechanics": 2024,
  "ap-physics-c-electricity-and-magnetism": 2024,
  "ap-psychology": 2024,
  "ap-african-american-studies": 2024,
  "ap-chemistry": 2024,
  "ap-precalculus": 2023,
  "sat-math": 2023,
  "sat-reading-writing": 2023,
  "ap-latin": 2025,
};
const DEFAULT_AP_FRAMEWORK = 2019;

export function frameworkYear(course: Pick<Course, "id" | "exam">) {
  if (FRAMEWORK_YEAR[course.id]) return FRAMEWORK_YEAR[course.id];
  return course.exam === "AP" ? DEFAULT_AP_FRAMEWORK : null;
}

/** Whether a video should be left out of Merit entirely. */
export function isHidden(v: Pick<YtVideo, "title" | "description" | "courseId" | "durationSec">, audit?: AuditEntry) {
  if (audit?.flags?.some((f) => f === "ad" || f === "spam" || f === "not_a_lesson")) return true;
  if (audit?.flags?.includes("non_english") && !WORLD_LANGUAGE.test(v.courseId)) return true;
  if (audit && audit.fit < 0.25) return true;
  const text = `${v.title} ${v.description.slice(0, 200)}`;
  if (AD.test(text)) return true;
  // Hashtag-farmed clips aren't lessons; longer videos with bait titles are only demoted (topicFit).
  if (BAIT_TITLE.test(v.title) && v.durationSec <= 90) return true;
  if (!TEACHES_FINANCE.test(v.courseId) && MONEY_PITCH.test(text)) return true;
  if (!WORLD_LANGUAGE.test(v.courseId) && NON_LATIN.test(v.title)) return true;
  return false;
}

const norm = (s: string) => s.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
/** Reviews and roundups cover a whole unit or many rules at once, not one topic. */
const BROAD = /\b(unit \d+ (review|recap|summary)|full (course|review)|crash course|cram|everything you need|all (the )?(rules|formulas|topics)|in \d+ minutes|review in|final review|exam review|rules in minutes)\b/i;

/**
 * Topic fit, 0–1: the audit's score when there is one. Otherwise the matcher's confidence, sharpened:
 * a lesson whose title names the topic beats one that only mentions it, broad reviews and roundups
 * rank below focused lessons, and the wrong level or engagement bait is demoted.
 */
export function topicFit(v: Pick<YtVideo, "title" | "description" | "topicId" | "relevance">, audit?: AuditEntry, topic?: { title: string; aliases: string[] }) {
  if (audit) return Math.max(0, Math.min(1, audit.fit * (audit.flags?.includes("wrong_level") ? 0.4 : 1)));
  if (!v.topicId) return 0.35;
  let fit = Math.min(1, v.relevance);
  if (topic) {
    const title = ` ${norm(v.title)} `;
    const names = [topic.title, ...topic.aliases].map(norm).filter((n) => n.length >= 4);
    if (!names.some((n) => title.includes(` ${n} `))) fit *= 0.8;
  }
  if (BROAD.test(v.title)) fit *= 0.85;
  if (WRONG_LEVEL.test(`${v.title} ${v.description.slice(0, 120)}`)) fit *= 0.35;
  if (BAIT_TITLE.test(v.title)) fit *= 0.6;
  return fit;
}

/**
 * Length fit, 0–1, for a single topic: a focused 4–20 minute lesson is ideal; full-unit reviews and
 * multi-hour lectures cover far more than the topic, so they rank lower (but stay findable).
 */
export function lengthFit(durationSec: number) {
  const m = durationSec / 60;
  if (m < 1.5) return 0.4;
  if (m < 4) return 0.85;
  if (m <= 20) return 1;
  if (m <= 35) return 0.75;
  if (m <= 60) return 0.45;
  if (m <= 120) return 0.2;
  return 0.1;
}

/** Freshness, 0–1: lessons from before the course's current framework may teach the old one. */
export function freshness(publishedAt: string, course: Pick<Course, "id" | "exam"> | undefined, now = Date.now()) {
  const year = new Date(publishedAt).getFullYear();
  const fw = course ? frameworkYear(course) : null;
  if (fw) {
    // Lessons published in the spring before a framework change were usually made for it already.
    if (year >= fw) return 1;
    const behind = fw - year;
    return behind <= 1 ? 0.7 : behind <= 3 ? 0.45 : 0.25;
  }
  // No framework (high school classes): content ages slowly, so only very old lessons lose a little.
  const age = (now - new Date(publishedAt).getTime()) / (365 * 86400000);
  return age <= 10 ? 1 : age <= 15 ? 0.8 : 0.6;
}
