/**
 * What a student has practiced: per topic, lifetime totals and the last 10 answers. It powers
 * the weak spots on the Practice page and the "fix a weak spot" items in the learning plan.
 */

export type TopicPractice = { correct: number; total: number; recent: boolean[]; lastAt: string };
export type PracticeStats = { userId: string; topics: Record<string, TopicPractice>; updatedAt: string };

export const PRACTICE_COLLECTION = "practiceStats";

/** Accuracy over the recent answers (they say more about now than old ones). */
export const recentAccuracy = (t: TopicPractice) => (t.recent.length ? t.recent.filter(Boolean).length / t.recent.length : 0);

export function addResults(stats: PracticeStats | null, userId: string, topicId: string, results: boolean[], now = new Date()): PracticeStats {
  const base: PracticeStats = stats ?? { userId, topics: {}, updatedAt: now.toISOString() };
  const prev = base.topics[topicId] ?? { correct: 0, total: 0, recent: [], lastAt: now.toISOString() };
  const next: TopicPractice = {
    correct: prev.correct + results.filter(Boolean).length,
    total: prev.total + results.length,
    recent: [...prev.recent, ...results].slice(-10),
    lastAt: now.toISOString(),
  };
  return { ...base, topics: { ...base.topics, [topicId]: next }, updatedAt: now.toISOString() };
}

export type WeakSpot = { topicId: string; accuracy: number; answered: number; lastAt: string };

/** Topics practiced at least `min` times where recent accuracy is under 70%, weakest first. */
export function weakSpots(stats: PracticeStats | null, min = 3): WeakSpot[] {
  if (!stats) return [];
  return Object.entries(stats.topics)
    .filter(([, t]) => t.recent.length >= min && recentAccuracy(t) < 0.7)
    .map(([topicId, t]) => ({ topicId, accuracy: recentAccuracy(t), answered: t.total, lastAt: t.lastAt }))
    .sort((a, b) => a.accuracy - b.accuracy || b.lastAt.localeCompare(a.lastAt));
}

/** A topic is "solid" after 5+ recent answers at 80% or better. */
export const isSolid = (t: TopicPractice | undefined) => Boolean(t && t.recent.length >= 5 && recentAccuracy(t) >= 0.8);
