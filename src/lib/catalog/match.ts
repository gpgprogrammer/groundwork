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

const COURSE_PATTERNS: [string, RegExp][] = [
  ["ap-calculus-bc", /\b(calc(ulus)?( bc| ab)?|ap calc)\b/],
  ["ap-world-history", /\b(ap world|world history|apwh|whap)\b/],
  ["sat-math", /\bsat math\b|\bsat\b.*\bmath\b/],
  ["sat-reading-writing", /\bsat (reading|writing|verbal|english|r ?w)\b/],
  ["ap-biology", /\b(ap bio(logy)?|biology|bio)\b/],
  ["ap-chemistry", /\b(ap chem(istry)?|chemistry|chem)\b/],
];

/** Guess the course from text like "AP Calc — Unit 3 quiz". */
export function detectCourse(text: string): string | null {
  const hay = norm(text);
  for (const [id, re] of COURSE_PATTERNS) if (re.test(hay)) return id;
  return null;
}
