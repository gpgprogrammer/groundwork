import type { SiteStats, YtVideo } from "@/lib/types";

/**
 * Merit's quality score for a lesson (0–100), built only from Merit's own
 * signals: how squarely it covers the topic (our curriculum mapping), and what
 * Merit students do with it (helpful votes, saves). YouTube's numbers (views,
 * likes, comments) are never folded into a score or turned into new metrics, per
 * the YouTube API Services policies; views are only used as a plain tie-breaker
 * and shown as YouTube reports them.
 */
export const RANKING_WEIGHTS = {
  relevance: 0.5, // how squarely it covers the topic
  helpful: 0.35, // Merit students' helpful votes
  saves: 0.15, // saved per open on Merit
} as const;

/** Votes needed before Merit shows a "% helpful" figure. */
export const MIN_VOTES_TO_SHOW = 5;

/**
 * Songs, parodies, and ASMR aren't lessons, even when popular.
 * They stay findable, but rank below real lessons.
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
  /** Merit votes behind `helpful`. */
  votes: number;
  /** Shown to students only once enough have voted. */
  helpfulPct: number | null;
  relevance: number;
  saves: number;
};

export const EMPTY_SITE_STATS: SiteStats = { opens: 0, saves: 0, helpful: 0, notHelpful: 0 };

/** Share of Merit students who found it helpful, smoothed toward a neutral prior. */
export function helpfulShare(s: SiteStats) {
  const PRIOR = 0.8;
  const PRIOR_VOTES = 12;
  return (s.helpful + PRIOR * PRIOR_VOTES) / (s.helpful + s.notHelpful + PRIOR_VOTES);
}

/** "% helpful" from Merit votes alone, or null until enough students have voted. */
export function helpfulPercent(s: SiteStats) {
  const votes = s.helpful + s.notHelpful;
  return votes >= MIN_VOTES_TO_SHOW ? Math.round((s.helpful / votes) * 100) : null;
}

export function rankVideo(v: YtVideo, s: SiteStats = EMPTY_SITE_STATS): RankBreakdown {
  const helpful = helpfulShare(s);
  const relevance = v.topicId ? Math.min(1, v.relevance) : 0.35;
  const saves = Math.min(1, (s.saves + 0.5) / (s.opens + 10) / 0.15);
  const w = RANKING_WEIGHTS;
  const score = 100 * (w.helpful * helpful + w.relevance * relevance + w.saves * saves);
  const adjusted = isEntertainment(v) ? score * ENTERTAINMENT_FACTOR : score;
  return { score: Math.round(adjusted * 10) / 10, helpful, votes: s.helpful + s.notHelpful, helpfulPct: helpfulPercent(s), relevance, saves };
}

export const SORTS = {
  best: "Best match",
  helpful: "Most helpful",
  views: "Most viewed",
  newest: "Newest",
  shortest: "Shortest",
  longest: "Longest",
} as const;
export type SortKey = keyof typeof SORTS;

export function isSortKey(v: unknown): v is SortKey {
  return typeof v === "string" && v in SORTS;
}

export function compareBy<T extends YtVideo & { rank: RankBreakdown }>(sort: SortKey): (a: T, b: T) => number {
  switch (sort) {
    case "helpful":
      return (a, b) => b.rank.helpful - a.rank.helpful || b.rank.score - a.rank.score;
    case "views":
      return (a, b) => b.views - a.views;
    case "newest":
      return (a, b) => b.publishedAt.localeCompare(a.publishedAt);
    case "shortest":
      return (a, b) => a.durationSec - b.durationSec;
    case "longest":
      return (a, b) => b.durationSec - a.durationSec;
    default:
      // Ties (common before students vote) keep YouTube's own order of popularity.
      return (a, b) => b.rank.score - a.rank.score || b.views - a.views;
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
