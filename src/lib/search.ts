import type { IndexedCatalog, RankedVideo } from "@/lib/catalog";
import type { Channel, Course, Topic } from "@/lib/types";

/**
 * In-memory search over the catalog: field-weighted, prefix-aware, and tolerant
 * of small typos ("chian rule", "lhopital", "champa").
 */

export type SearchHit =
  | { kind: "topic"; score: number; topic: Topic; course: Course; lessons: number }
  | { kind: "video"; score: number; video: RankedVideo; topic: Topic | undefined; course: Course | undefined }
  | { kind: "channel"; score: number; channel: Channel; lessons: number }
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
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diagonal + cost);
      // Adjacent transpositions ("chian" → "chain") count as one edit.
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1] && cost) prev[j] = Math.min(prev[j], diagonal);
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
    else if (q.length >= 4 && editDistanceWithin(q, t.slice(0, Math.max(q.length, t.length)), q.length >= 8 ? 2 : 1)) best = Math.max(best, 0.6);
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

const fieldCache = new WeakMap<object, Field[]>();
function fieldsFor(key: object, build: () => [string, number][]) {
  let f = fieldCache.get(key);
  if (!f) {
    f = build().map(([text, weight]) => ({ tokens: tokens(text), text: normalize(text), weight }));
    fieldCache.set(key, f);
  }
  return f;
}

export type SearchFilters = { courseId?: string; kinds?: SearchHit["kind"][] };

export function search(catalog: IndexedCatalog, query: string, filters: SearchFilters = {}, limit = 60): SearchHit[] {
  const qTokens = tokens(query);
  const qPhrase = normalize(query);
  if (!qTokens.length) return [];
  const want = (k: SearchHit["kind"]) => !filters.kinds || filters.kinds.includes(k);
  const courseOk = (courseId: string) => !filters.courseId || filters.courseId === courseId;
  const hits: SearchHit[] = [];

  if (want("course"))
    for (const course of catalog.courses) {
      if (!courseOk(course.id)) continue;
      const score = scoreDoc(qTokens, qPhrase, fieldsFor(course, () => [[course.title, 9], [course.shortTitle, 9], [`${course.exam} ${course.subject}`, 4]]));
      if (score) hits.push({ kind: "course", score: score * 1.1, course });
    }

  if (want("topic"))
    for (const topic of catalog.topics) {
      if (!courseOk(topic.courseId)) continue;
      const course = catalog.course(topic.courseId)!;
      const score = scoreDoc(
        qTokens,
        qPhrase,
        fieldsFor(topic, () => [
          [topic.title, 10],
          [topic.aliases.join(" "), 7],
          [`${catalog.concept(topic.conceptId)?.title ?? ""} ${catalog.unit(topic.unitId)?.title ?? ""}`, 3.5],
          [`${course.shortTitle} ${course.title}`, 3],
          [topic.summary, 2],
        ]),
      );
      if (score) hits.push({ kind: "topic", score: score * 1.3, topic, course, lessons: catalog.videosForTopic(topic.id).length });
    }

  if (want("channel"))
    for (const channel of catalog.channels) {
      const lessons = catalog.videosForChannel(channel.id).length;
      if (lessons < 3) continue;
      // Channels match on whole words or prefixes only; typo tolerance turns "chain" into "Cain".
      const name = normalize(`${channel.title} ${channel.handle ?? ""}`).split(" ");
      if (!qTokens.every((q) => name.some((t) => t === q || (q.length >= 3 && t.startsWith(q))))) continue;
      const score = scoreDoc(qTokens, qPhrase, fieldsFor(channel, () => [[channel.title, 10], [channel.handle ?? "", 6]]));
      if (score) hits.push({ kind: "channel", score: score * (1 + Math.log10(lessons) / 4), channel, lessons });
    }

  if (want("video"))
    for (const video of catalog.videos) {
      if (!courseOk(video.courseId)) continue;
      const topic = video.topicId ? catalog.topic(video.topicId) : undefined;
      const course = catalog.course(video.courseId);
      const score = scoreDoc(
        qTokens,
        qPhrase,
        fieldsFor(video, () => [
          [video.title, 8],
          [topic ? `${topic.title} ${topic.aliases.join(" ")}` : "", 6],
          [video.channelTitle, 5],
          [course ? `${course.shortTitle} ${course.title}` : "", 2.5],
          [video.description, 1.5],
        ]),
      );
      // Quality nudges ordering among similarly relevant lessons.
      if (score) hits.push({ kind: "video", score: score * (0.65 + video.rank.score / 200), video, topic, course });
    }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}
