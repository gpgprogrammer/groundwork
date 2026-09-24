import type { Course, Topic } from "@/lib/types";

/**
 * Matches free text (a video title, a calendar event) to curriculum topics.
 * Shared by YouTube ingestion and schedule sync.
 */

export type TopicMatcher = { courses: Course[]; topics: Topic[] };
export type TopicMatch = { topicId: string; score: number };

const STOP = new Set([
  "the", "a", "an", "of", "and", "in", "on", "to", "for", "how", "what", "is", "with", "its", "vs", "from", "by", "at", "or",
  "part", "rule", "rules", "test", "theorem", "review", "explained", "introduction", "intro", "ap", "sat",
]);

export function norm(s: string) {
  return s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’`]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const has = (hay: string, phrase: string) => phrase.length > 0 && ` ${hay} `.includes(` ${phrase} `);

type Prepared = { topic: Topic; phrases: { p: string; w: number }[]; tokens: string[] };

const cache = new WeakMap<Topic[], Prepared[]>();

function prepare(topics: Topic[]): Prepared[] {
  const hit = cache.get(topics);
  if (hit) return hit;
  const out = topics.map((topic) => {
    const title = norm(topic.title);
    const parts = topic.title
      .split(/\s+and\s+|:|,|\s+vs\.?\s+/i)
      .map(norm)
      .filter((p) => p.split(" ").length >= 2 || p.length >= 6);
    const phrases: { p: string; w: number }[] = [{ p: title, w: 1 }];
    for (const p of parts) if (p !== title) phrases.push({ p, w: 0.9 });
    for (const a of topic.aliases) {
      const n = norm(a);
      // One-word aliases ("chain", "limits") are ambiguous on their own.
      phrases.push({ p: n, w: n.includes(" ") ? 0.85 : n.length >= 8 ? 0.7 : 0.55 });
    }
    const tokens = [...new Set(title.split(" ").filter((t) => t.length >= 3 && !STOP.has(t)))];
    return { topic, phrases, tokens };
  });
  cache.set(topics, out);
  return out;
}

export function matchTopics(m: TopicMatcher, text: string, opts: { courseIds?: string[]; limit?: number } = {}): TopicMatch[] {
  const hay = norm(text);
  if (!hay) return [];
  const allowed = opts.courseIds?.length ? new Set(opts.courseIds) : null;
  const results: TopicMatch[] = [];
  for (const prep of prepare(m.topics)) {
    if (allowed && !allowed.has(prep.topic.courseId)) continue;
    let score = 0;
    for (const { p, w } of prep.phrases) if (w > score && has(hay, p)) score = w;
    if (score < 0.75 && prep.tokens.length >= 2) {
      const present = prep.tokens.filter((t) => has(hay, t) || has(hay, `${t}s`)).length;
      const coverage = present / prep.tokens.length;
      if (coverage >= 0.67) score = Math.max(score, 0.5 + 0.3 * coverage);
    }
    if (score > 0) results.push({ topicId: prep.topic.id, score: Number(score.toFixed(3)) });
  }
  return results.sort((a, b) => b.score - a.score).slice(0, opts.limit ?? 5);
}

/**
 * Guess the course from text like "AP Calc — Unit 3 quiz" using each course's
 * keywords. The longest matching keyword wins; ties go to the student's own
 * courses (so a Calc AB student's "calc quiz" maps to AB, not BC).
 */
export function detectCourse(m: TopicMatcher, text: string, preferred: string[] = []): string | null {
  const hay = norm(text);
  let best: { id: string; len: number; pref: boolean } | null = null;
  for (const c of m.courses) {
    for (const k of c.keywords) {
      const kw = norm(k);
      if (!kw || !has(hay, kw)) continue;
      const cand = { id: c.id, len: kw.length, pref: preferred.includes(c.id) };
      if (!best || cand.len > best.len || (cand.len === best.len && cand.pref && !best.pref)) best = cand;
    }
  }
  return best?.id ?? null;
}

/** Whether text mentions a specific course by any of its keywords. */
export function mentionsCourse(m: TopicMatcher, text: string, courseId: string | null): boolean {
  if (!courseId) return false;
  const hay = norm(text);
  return m.courses.find((c) => c.id === courseId)?.keywords.some((k) => has(hay, norm(k))) ?? false;
}
