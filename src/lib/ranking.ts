import type { SiteStats, YtVideo } from "@/lib/types";

/**
 * Groundwork's quality score for a lesson (0–100).
 *
 * Views measure reach, not teaching, so they're a small part of the score.
 * Signals are smoothed toward priors so a video with 300 views and 40 likes
 * doesn't beat a proven lesson on luck.
 */
export const RANKING_WEIGHTS = {
  reach: 0.25, // log-scaled views: evidence a lesson has worked for many students
  helpful: 0.2, // Groundwork students' helpful votes
  likeRate: 0.2, // likes per view on YouTube
  relevance: 0.2, // how squarely it covers the topic
  saves: 0.1, // saved per open on Groundwork
  discussion: 0.05, // comments per view
} as const;

const PRIOR_VIEWS = 3000;
const PRIOR_LIKE_RATE = 0.025;
const GOOD_LIKE_RATE = 0.06;

/**
 * Songs, parodies, and ASMR draw huge like rates for reasons other than teaching.
 * They stay findable (and sort normally by views or likes), but rank below real lessons.
 */
const ENTERTAINMENT = /\b(parody|song|music video|rap|asmr|reacts?|reaction|meme|skit|musical)\b/i;
const ENTERTAINMENT_FACTOR = 0.8;
export const isEntertainment = (v: Pick<YtVideo, "title" | "courseId">) => v.courseId !== "ap-music-theory" && ENTERTAINMENT.test(v.title);

export function wilsonLowerBound(positive: number, total: number, z = 1.96) {
  if (total === 0) return 0;
  const p = positive / total;
  const denom = 1 + (z * z) / total;
  const centre = p + (z * z) / (2 * total);
  const margin = z * Math.sqrt((p * (1 - p) + (z * z) / (4 * total)) / total);
  return Math.max(0, (centre - margin) / denom);
}

export type RankBreakdown = {
  score: number;
  helpful: number;
  likeRate: number;
  relevance: number;
  reach: number;
  saves: number;
  discussion: number;
};

export const EMPTY_SITE_STATS: SiteStats = { opens: 0, saves: 0, helpful: 0, notHelpful: 0 };

/** Smoothed YouTube like rate (likes per view). */
export function likeRate(v: Pick<YtVideo, "likes" | "views">) {
  const likes = v.likes ?? v.views * PRIOR_LIKE_RATE;
  return (likes + PRIOR_LIKE_RATE * PRIOR_VIEWS) / (v.views + PRIOR_VIEWS);
}

/** Share of Groundwork students who found it helpful, with the like rate as the prior. */
export function helpfulShare(v: Pick<YtVideo, "likes" | "views">, s: SiteStats) {
  // Weak link to like rate so it isn't double-counted before students vote.
  const prior = 0.7 + 0.2 * Math.min(1, likeRate(v) / GOOD_LIKE_RATE);
  const PRIOR_VOTES = 12;
  return (s.helpful + prior * PRIOR_VOTES) / (s.helpful + s.notHelpful + PRIOR_VOTES);
}

export function rankVideo(v: YtVideo, s: SiteStats = EMPTY_SITE_STATS): RankBreakdown {
  const helpful = helpfulShare(v, s);
  const lr = Math.min(1, likeRate(v) / GOOD_LIKE_RATE);
  const relevance = v.topicId ? Math.min(1, v.relevance) : 0.35;
  const reach = Math.min(1, Math.log10(v.views + 1) / 6.5);
  const saves = Math.min(1, (s.saves + 0.5) / (s.opens + 10) / 0.15);
  const discussion = Math.min(1, ((v.comments ?? 0) + 1) / (v.views + 500) / 0.004);
  const w = RANKING_WEIGHTS;
  const score =
    100 * (w.helpful * helpful + w.likeRate * lr + w.relevance * relevance + w.reach * reach + w.saves * saves + w.discussion * discussion);
  const adjusted = isEntertainment(v) ? score * ENTERTAINMENT_FACTOR : score;
  return { score: Math.round(adjusted * 10) / 10, helpful, likeRate: lr, relevance, reach, saves, discussion };
}

export const SORTS = {
  best: "Best match",
  helpful: "Most helpful",
  views: "Most viewed",
  likes: "Most liked",
  newest: "Newest",
  shortest: "Shortest",
  longest: "Longest",
  comments: "Most discussed",
} as const;
export type SortKey = keyof typeof SORTS;

export function isSortKey(v: unknown): v is SortKey {
  return typeof v === "string" && v in SORTS;
}

export function compareBy<T extends YtVideo & { rank: RankBreakdown }>(sort: SortKey): (a: T, b: T) => number {
  switch (sort) {
    case "helpful":
      return (a, b) => b.rank.helpful - a.rank.helpful || b.views - a.views;
    case "views":
      return (a, b) => b.views - a.views;
    case "likes":
      return (a, b) => (b.likes ?? 0) - (a.likes ?? 0);
    case "newest":
      return (a, b) => b.publishedAt.localeCompare(a.publishedAt);
    case "shortest":
      return (a, b) => a.durationSec - b.durationSec;
    case "longest":
      return (a, b) => b.durationSec - a.durationSec;
    case "comments":
      return (a, b) => (b.comments ?? 0) - (a.comments ?? 0);
    default:
      return (a, b) => b.rank.score - a.rank.score;
  }
}

export const LENGTHS = {
  any: "Any length",
  short: "Under 10 min",
  medium: "10–30 min",
  long: "Over 30 min",
} as const;
export type LengthKey = keyof typeof LENGTHS;

export function inLength(v: Pick<YtVideo, "durationSec">, length: LengthKey) {
  const m = v.durationSec / 60;
  if (length === "short") return m < 10;
  if (length === "medium") return m >= 10 && m <= 30;
  if (length === "long") return m > 30;
  return true;
}
