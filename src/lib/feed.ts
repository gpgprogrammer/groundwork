import type { IndexedCatalog, RankedVideo } from "@/lib/catalog";
import { compareBy, inLength, isSortKey, LENGTHS, type LengthKey, type SortKey } from "@/lib/ranking";
import { recommend } from "@/lib/recommend";
import type { UserState } from "@/lib/types";

/** What a video card needs, serializable for client-side infinite scroll. */
export type FeedVideo = {
  id: string;
  title: string;
  thumbnail: string;
  channelId: string;
  channelTitle: string;
  channelThumb: string | null;
  views: number;
  likes: number | null;
  publishedAt: string;
  durationSec: number;
  isShort: boolean;
  courseShort: string | null;
  topicTitle: string | null;
  topicHref: string | null;
  helpfulPct: number;
  reason?: string;
  /** A teacher on Merit recommended this lesson. */
  addedBy?: { name: string; href: string; note: string };
};

export function toFeedVideo(catalog: IndexedCatalog, v: RankedVideo, reason?: string): FeedVideo {
  const course = catalog.course(v.courseId);
  const topic = v.topicId ? catalog.topic(v.topicId) : undefined;
  return {
    id: v.id,
    title: v.title,
    thumbnail: v.thumbnail,
    channelId: v.channelId,
    channelTitle: v.channelTitle,
    channelThumb: catalog.channel(v.channelId)?.thumbnail ?? null,
    views: v.views,
    likes: v.likes,
    publishedAt: v.publishedAt,
    durationSec: v.durationSec,
    isShort: v.isShort,
    courseShort: course?.shortTitle ?? null,
    topicTitle: topic?.title ?? null,
    topicHref: topic && course ? `/courses/${course.slug}/${topic.slug}` : null,
    helpfulPct: Math.round(v.rank.helpful * 100),
    ...(v.addedBy ? { addedBy: { name: v.addedBy.name, href: `/educators/${v.addedBy.educatorId}`, note: v.addedBy.note.slice(0, 200) } } : {}),
    ...(reason ? { reason } : {}),
  };
}

export const CHIP_EXTRAS = [
  { key: "quick", label: "Under 10 minutes" },
  { key: "reviews", label: "Full reviews" },
  { key: "new", label: "Recently uploaded" },
] as const;

export type FeedParams = {
  chip?: string;
  sort?: string;
  length?: string;
  courseId?: string;
  topicId?: string;
  channelId?: string;
};

export function parseSort(v: unknown, fallback: SortKey = "best"): SortKey {
  return isSortKey(v) ? v : fallback;
}
export function parseLength(v: unknown): LengthKey {
  return typeof v === "string" && v in LENGTHS ? (v as LengthKey) : "any";
}

/** Round-robin across courses so one subject doesn't flood the home page. */
function interleave(videos: RankedVideo[]) {
  const buckets = new Map<string, RankedVideo[]>();
  for (const v of videos) {
    const b = buckets.get(v.courseId);
    if (b) b.push(v);
    else buckets.set(v.courseId, [v]);
  }
  const lists = [...buckets.values()];
  const out: RankedVideo[] = [];
  for (let i = 0; out.length < videos.length; i++) for (const l of lists) if (l[i]) out.push(l[i]);
  return out;
}

export function queryFeed(catalog: IndexedCatalog, state: UserState | null, params: FeedParams) {
  const chip = params.chip ?? "all";
  const sort = parseSort(params.sort);
  const length = parseLength(params.length);
  const reasons = new Map<string, string>();

  const courseFilter = params.courseId ?? (catalog.course(chip) ? chip : undefined);
  let pool: RankedVideo[] = params.topicId
    ? catalog.videosForTopic(params.topicId)
    : params.channelId
      ? catalog.videosForChannel(params.channelId)
      : courseFilter
        ? catalog.videosForCourse(courseFilter)
        : catalog.videos;
  if (params.channelId) pool = pool.filter((v) => v.channelId === params.channelId);
  if (courseFilter && (params.topicId || params.channelId)) pool = pool.filter((v) => v.courseId === courseFilter);

  const wantShorts = chip === "shorts";
  pool = pool.filter((v) => v.isShort === wantShorts && inLength(v, length));
  if (chip === "quick") pool = pool.filter((v) => v.durationSec < 600);
  if (chip === "reviews") pool = pool.filter((v) => v.durationSec >= 1800 || /\b(full|complete|unit|final|cram)\b.*\breview\b|\breview\b/i.test(v.title) && v.durationSec >= 900);
  if (chip === "new") pool = pool.filter((v) => Date.now() - new Date(v.publishedAt).getTime() < 540 * 86400000);

  let ordered: RankedVideo[];
  if (chip === "foryou" && state && sort === "best") {
    const recs = recommend(catalog, state, 60);
    for (const r of recs) reasons.set(r.video.id, r.reason);
    const mine = new Set(state.profile.courseIds.length ? state.profile.courseIds : catalog.courses.map((c) => c.id));
    const rest = interleave(pool.filter((v) => mine.has(v.courseId) && !reasons.has(v.id)));
    ordered = [...recs.map((r) => r.video).filter((v) => inLength(v, length)), ...rest];
  } else if (chip === "new" && sort === "best") {
    ordered = [...pool].sort(compareBy("newest"));
  } else if (sort === "best" && !params.topicId && !params.channelId && !courseFilter) {
    ordered = interleave(pool);
  } else {
    ordered = [...pool].sort(compareBy(sort));
  }
  return { ordered, reasons, sort, length };
}

export function pageOf(catalog: IndexedCatalog, result: ReturnType<typeof queryFeed>, offset: number, limit: number) {
  const slice = result.ordered.slice(offset, offset + limit);
  return {
    items: slice.map((v) => toFeedVideo(catalog, v, result.reasons.get(v.id))),
    nextOffset: offset + limit < result.ordered.length ? offset + limit : null,
    total: result.ordered.length,
  };
}
