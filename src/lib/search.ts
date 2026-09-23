import type { IndexedCatalog, RankedVideo } from "@/lib/catalog";
import type { Course, Educator, Topic } from "@/lib/types";

/**
 * In-memory search over the catalog: field-weighted, prefix-aware, and tolerant
 * of small typos ("chian rule", "lhopital", "champa"). Postgres has matching
 * tsvector + trigram indexes for when the catalog outgrows memory.
 */

export type SearchHit =
  | { kind: "topic"; score: number; topic: Topic; course: Course; lessons: number }
  | { kind: "video"; score: number; video: RankedVideo; topic: Topic; educator: Educator }
  | { kind: "educator"; score: number; educator: Educator }
  | { kind: "course"; score: number; course: Course };

export function normalize(s: string) {
  return s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’`]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const STOP = new Set(["the", "a", "an", "of", "and", "in", "on", "to", "for", "how", "what", "is", "with"]);

function tokens(s: string) {
  return normalize(s)
    .split(" ")
    .filter((t) => t && !STOP.has(t));
}

function editDistanceWithin(a: string, b: string, max: number) {
  if (Math.abs(a.length - b.length) > max) return false;
  const prev = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    let diagonal = prev[0];
    prev[0] = i;
    let rowMin = prev[0];
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      // Treat adjacent transpositions ("chian" → "chain") as one edit.
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diagonal + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1] && cost) {
        prev[j] = Math.min(prev[j], diagonal);
      }
      diagonal = tmp;
      rowMin = Math.min(rowMin, prev[j]);
    }
    if (rowMin > max) return false;
  }
  return prev[b.length] <= max;
}

type Field = { tokens: string[]; text: string; weight: number };

function matchToken(q: string, field: Field): number {
  let best = 0;
  for (const t of field.tokens) {
    if (t === q) return 1;
    if (q.length >= 2 && t.startsWith(q)) best = Math.max(best, 0.85);
    else if (q.length >= 4 && editDistanceWithin(q, t.slice(0, Math.max(q.length, t.length)), q.length >= 8 ? 2 : 1)) {
      best = Math.max(best, 0.6);
    }
  }
  if (!best && q.length >= 3 && field.text.includes(q)) best = 0.5;
  return best;
}

function scoreDoc(qTokens: string[], qPhrase: string, fields: Field[]) {
  let total = 0;
  let matched = 0;
  for (const q of qTokens) {
    let best = 0;
    for (const f of fields) best = Math.max(best, matchToken(q, f) * f.weight);
    if (best > 0) matched++;
    total += best;
  }
  if (!matched) return 0;
  const coverage = matched / qTokens.length;
  if (coverage < 0.5) return 0;
  const primary = fields[0];
  const phraseBonus = qPhrase.length > 2 && primary.text.includes(qPhrase) ? 4 : 0;
  const exactBonus = primary.text === qPhrase ? 6 : 0;
  return (total + phraseBonus + exactBonus) * coverage * coverage;
}

const field = (text: string, weight: number): Field => ({ tokens: tokens(text), text: normalize(text), weight });

export type SearchFilters = { courseId?: string; exam?: "AP" | "SAT" };

export function search(catalog: IndexedCatalog, query: string, filters: SearchFilters = {}, limit = 40): SearchHit[] {
  const qTokens = tokens(query);
  const qPhrase = normalize(query);
  if (!qTokens.length) return [];

  const courseOk = (courseId: string) => {
    if (filters.courseId && filters.courseId !== courseId) return false;
    if (filters.exam && catalog.course(courseId)?.exam !== filters.exam) return false;
    return true;
  };

  const hits: SearchHit[] = [];

  for (const course of catalog.courses) {
    if (!courseOk(course.id)) continue;
    const score = scoreDoc(qTokens, qPhrase, [
      field(course.title, 9),
      field(course.shortTitle, 9),
      field(`${course.exam} ${course.subject}`, 4),
    ]);
    if (score) hits.push({ kind: "course", score: score * 1.1, course });
  }

  for (const topic of catalog.topics) {
    if (!courseOk(topic.courseId)) continue;
    const course = catalog.course(topic.courseId)!;
    const unit = catalog.unit(topic.unitId);
    const concept = catalog.concept(topic.conceptId);
    const score = scoreDoc(qTokens, qPhrase, [
      field(topic.title, 10),
      field(topic.aliases.join(" "), 7),
      field(`${concept?.title ?? ""} ${unit?.title ?? ""}`, 3.5),
      field(`${course.shortTitle} ${course.title}`, 3),
      field(topic.summary, 2),
    ]);
    if (score) hits.push({ kind: "topic", score: score * 1.25, topic, course, lessons: catalog.videosForTopic(topic.id).length });
  }

  for (const educator of catalog.educators) {
    const score = scoreDoc(qTokens, qPhrase, [
      field(educator.name, 10),
      field(educator.subjects.join(" "), 4),
      field(educator.headline, 2),
    ]);
    if (score) hits.push({ kind: "educator", score, educator });
  }

  for (const video of catalog.videos) {
    const topic = catalog.topic(video.topicId);
    if (!topic || !courseOk(topic.courseId)) continue;
    const educator = catalog.educator(video.educatorId)!;
    const score = scoreDoc(qTokens, qPhrase, [
      field(video.title, 8),
      field(`${topic.title} ${topic.aliases.join(" ")}`, 6),
      field(educator.name, 5),
      field(video.style, 3),
      field(video.description, 1.5),
    ]);
    // Quality nudges ordering among similarly relevant lessons.
    if (score) hits.push({ kind: "video", score: score * (0.7 + video.rank.score / 250), video, topic, educator });
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function suggestFor(query: string) {
  const q = normalize(query);
  const fixes: Record<string, string> = { calc: "calculus", bio: "biology", chem: "chemistry", apush: "US history" };
  return fixes[q];
}
