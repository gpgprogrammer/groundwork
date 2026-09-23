import type { Video, VideoStats } from "@/lib/types";

/**
 * Groundwork's lesson ranking.
 *
 * Views measure reach, not whether a lesson taught anything, so they carry only
 * 5% of the weight. Every other signal is smoothed toward a prior so a
 * new lesson with 40 perfect views doesn't outrank a proven one with 40,000.
 */
export const RANKING_WEIGHTS = {
  completion: 0.35,
  helpful: 0.25,
  saves: 0.2,
  engagement: 0.15,
  reach: 0.05,
} as const;

const PRIOR_VIEWS = 150;
const PRIOR_COMPLETION = 0.45;
const PRIOR_SAVE_RATE = 0.04;
const SAVE_RATE_CEILING = 0.12;

/** Lower bound of the Wilson score interval (95%). Rewards both ratio and confidence. */
export function wilsonLowerBound(positive: number, total: number, z = 1.96) {
  if (total === 0) return 0;
  const p = positive / total;
  const denom = 1 + (z * z) / total;
  const centre = p + (z * z) / (2 * total);
  const margin = z * Math.sqrt((p * (1 - p) + (z * z) / (4 * total)) / total);
  return Math.max(0, (centre - margin) / denom);
}

export type RankBreakdown = {
  score: number; // 0–100
  completion: number; // 0–1 components
  helpful: number;
  saves: number;
  engagement: number;
  reach: number;
};

export function rankVideo(stats: VideoStats): RankBreakdown {
  const v = Math.max(0, stats.views);
  const completion = (stats.completions + PRIOR_COMPLETION * PRIOR_VIEWS) / (v + PRIOR_VIEWS);
  const helpful = wilsonLowerBound(stats.helpful, stats.helpful + stats.notHelpful);
  const saveRate = (stats.saves + PRIOR_SAVE_RATE * PRIOR_VIEWS) / (v + PRIOR_VIEWS);
  const saves = Math.min(1, saveRate / SAVE_RATE_CEILING);
  const engagement = Math.max(
    0,
    Math.min(
      1,
      0.55 * stats.avgWatchFraction + 0.25 * Math.min(1, stats.rewatchRate / 0.3) + 0.2 * (1 - stats.earlyDropRate),
    ),
  );
  const reach = Math.min(1, Math.log10(v + 1) / 5);

  const w = RANKING_WEIGHTS;
  const score =
    100 *
    (w.completion * completion + w.helpful * helpful + w.saves * saves + w.engagement * engagement + w.reach * reach);

  return { score: Math.round(score * 10) / 10, completion, helpful, saves, engagement, reach };
}

export function rankVideos<T extends Pick<Video, "stats">>(videos: T[]): (T & { rank: RankBreakdown })[] {
  return videos
    .map((v) => ({ ...v, rank: rankVideo(v.stats) }))
    .sort((a, b) => b.rank.score - a.rank.score);
}

export function completionRate(stats: VideoStats) {
  return stats.views ? stats.completions / stats.views : 0;
}

export function helpfulRate(stats: VideoStats) {
  const total = stats.helpful + stats.notHelpful;
  return total ? stats.helpful / total : 0;
}
