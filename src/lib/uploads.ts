import "server-only";
import { getStore } from "@/lib/data/store";
import { isSupabaseEnabled } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/server";
import type { Contribution, Educator } from "@/lib/types";

/** Videos tutors and teachers upload straight to Merit (Supabase Storage). */

export const VIDEO_BUCKET = "merit-videos";
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
export const uploadsEnabled = isSupabaseEnabled;

/** Who a video is by: their teacher profile, or their tutor listing. */
export async function uploaderIdentity(userId: string) {
  const store = await getStore();
  const [educator, tutor] = await Promise.all([store.getDoc<Educator>("educators", userId), store.listTutors().then((ts) => ts.find((t) => t.userId === userId))]);
  if (!educator && !tutor) return null;
  return { name: educator?.name ?? tutor!.name, headline: educator?.headline ?? tutor?.headline ?? "", tutorId: tutor?.id ?? null, educator: Boolean(educator) };
}

/** A one-time URL the browser uploads the file to directly (large files never pass through our server). */
export async function signedUpload(path: string) {
  const { data, error } = await createAdminClient().storage.from(VIDEO_BUCKET).createSignedUploadUrl(path);
  if (error || !data) throw new Error(error?.message ?? "Could not start the upload.");
  const { data: pub } = createAdminClient().storage.from(VIDEO_BUCKET).getPublicUrl(path);
  return { uploadUrl: data.signedUrl, publicUrl: pub.publicUrl };
}

export async function objectSize(path: string) {
  const dir = path.split("/").slice(0, -1).join("/");
  const name = path.split("/").pop()!;
  const { data } = await createAdminClient().storage.from(VIDEO_BUCKET).list(dir, { search: name });
  const f = data?.find((x) => x.name === name);
  return f ? Number((f.metadata as { size?: number } | null)?.size ?? 0) : null;
}

export async function removeObjects(paths: string[]) {
  if (paths.length) await createAdminClient().storage.from(VIDEO_BUCKET).remove(paths);
}

export async function listUploads(filter: { educatorId?: string; courseId?: string; topicId?: string } = {}) {
  const all = await (await getStore()).listDocs<Contribution>("contributions");
  return all
    .filter((c) => c.kind === "upload" && c.status === "published" && c.media)
    .filter((c) => (!filter.educatorId || c.educatorId === filter.educatorId) && (!filter.courseId || c.courseId === filter.courseId) && (!filter.topicId || c.topicId === filter.topicId))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getUpload(id: string) {
  const c = await (await getStore()).getDoc<Contribution>("contributions", id);
  return c && c.kind === "upload" && c.status === "published" && c.media ? c : null;
}

/** A published upload, or a pending one for its uploader and admins. */
export async function getUploadFor(id: string, viewer: { user: { id: string }; isAdmin: boolean } | null) {
  const c = await (await getStore()).getDoc<Contribution>("contributions", id);
  if (!c || c.kind !== "upload" || !c.media) return null;
  if (c.status === "published") return c;
  if (c.status === "pending" && viewer && (viewer.isAdmin || viewer.user.id === c.educatorId)) return c;
  return null;
}

/** Uploads waiting for an admin, oldest first (optionally one uploader's). */
export async function listPendingUploads(educatorId?: string) {
  const all = await (await getStore()).listDocs<Contribution>("contributions", educatorId ? { owner: educatorId } : undefined);
  return all.filter((c) => c.kind === "upload" && c.status === "pending" && c.media).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

/** Display names for a set of uploaders. */
export async function uploaderNames(ids: string[]) {
  const out = new Map<string, { name: string; tutorId: string | null }>();
  for (const id of [...new Set(ids)]) {
    const who = await uploaderIdentity(id);
    if (who) out.set(id, { name: who.name, tutorId: who.tutorId });
  }
  return out;
}

export function publicUrlFor(path: string) {
  return createAdminClient().storage.from(VIDEO_BUCKET).getPublicUrl(path).data.publicUrl;
}

export type UploadCardData = {
  id: string;
  title: string;
  posterUrl: string | null;
  durationSec: number;
  views: number;
  createdAt: string;
  by: { id: string; name: string; href: string };
  course: { id: string; title: string; slug: string } | null;
  topic: { title: string; href: string } | null;
};

/** Everything a video card needs: who made it and where it lives in the curriculum. */
export async function toUploadCards(list: Contribution[]): Promise<UploadCardData[]> {
  const { getCatalog } = await import("@/lib/catalog");
  const [catalog, names] = await Promise.all([getCatalog(), uploaderNames(list.map((c) => c.educatorId))]);
  return list.map((c) => {
    const who = names.get(c.educatorId);
    const course = catalog.course(c.courseId);
    const topic = catalog.topic(c.topicId);
    return {
      id: c.id,
      title: c.title ?? "Untitled",
      posterUrl: c.media!.posterUrl,
      durationSec: c.media!.durationSec,
      views: c.views ?? 0,
      createdAt: c.createdAt,
      by: { id: c.educatorId, name: who?.name ?? "A Merit tutor", href: who?.tutorId ? `/tutors/${who.tutorId}` : `/educators/${c.educatorId}` },
      course: course ? { id: course.id, title: course.shortTitle, slug: course.slug } : null,
      topic: course && topic ? { title: topic.title, href: `/courses/${course.slug}/${topic.slug}` } : null,
    };
  });
}
