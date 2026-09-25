"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getCatalog } from "@/lib/catalog";
import { getStore } from "@/lib/data/store";
import type { Contribution } from "@/lib/types";
import { getUpload, MAX_VIDEO_BYTES, objectSize, publicUrlFor, removeObjects, signedUpload, uploaderIdentity, uploadsEnabled } from "@/lib/uploads";
import { getViewer } from "@/lib/viewer";

const VIDEO_TYPES: Record<string, string> = { "video/mp4": "mp4", "video/quicktime": "mov", "video/webm": "webm" };

export type Ticket = { ok: true; video: { uploadUrl: string; path: string }; poster: { uploadUrl: string; path: string } } | { ok: false; error: string };

/** Step 1: check the file and hand back one-time upload URLs for the video and its thumbnail. */
export async function startUpload(input: { type: string; size: number }): Promise<Ticket> {
  const viewer = await getViewer();
  if (!viewer) return { ok: false, error: "Sign in first." };
  if (!uploadsEnabled) return { ok: false, error: "Video uploads need the database connected." };
  if (!(await uploaderIdentity(viewer.user.id))) return { ok: false, error: "Set up your teacher profile or tutor listing first." };
  const ext = VIDEO_TYPES[input.type];
  if (!ext) return { ok: false, error: "Upload an MP4, MOV, or WebM video." };
  if (!(input.size > 0) || input.size > MAX_VIDEO_BYTES) return { ok: false, error: `Videos can be up to ${MAX_VIDEO_BYTES / 1024 / 1024} MB. Try exporting at 720p.` };
  const id = randomUUID();
  const [video, poster] = await Promise.all([signedUpload(`${viewer.user.id}/${id}.${ext}`), signedUpload(`${viewer.user.id}/${id}.jpg`)]);
  return { ok: true, video: { uploadUrl: video.uploadUrl, path: `${viewer.user.id}/${id}.${ext}` }, poster: { uploadUrl: poster.uploadUrl, path: `${viewer.user.id}/${id}.jpg` } };
}

const publishSchema = z.object({
  path: z.string().min(5).max(200),
  posterPath: z.string().max(200).nullable(),
  title: z.string().trim().min(4, "Give the video a title.").max(120),
  description: z.string().trim().max(4000),
  topicId: z.string().min(1, "Choose the topic this video teaches."),
  durationSec: z.number().min(1).max(4 * 3600),
});

/** Step 2: after the browser finishes uploading, publish the video. */
export async function publishUpload(input: z.infer<typeof publishSchema>): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const viewer = await getViewer();
  if (!viewer) return { ok: false, error: "Sign in first." };
  const parsed = publishSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const d = parsed.data;
  // Only files in the uploader's own folder.
  if (!d.path.startsWith(`${viewer.user.id}/`) || (d.posterPath && !d.posterPath.startsWith(`${viewer.user.id}/`))) return { ok: false, error: "That upload isn't yours." };
  const size = await objectSize(d.path);
  if (!size) return { ok: false, error: "The upload didn't finish. Try again." };
  const topic = (await getCatalog()).topic(d.topicId);
  if (!topic) return { ok: false, error: "Choose a topic." };
  const posterOk = d.posterPath ? Boolean(await objectSize(d.posterPath)) : false;
  const c: Contribution = {
    id: `up_${randomUUID().slice(0, 12)}`,
    educatorId: viewer.user.id,
    kind: "upload",
    courseId: topic.courseId,
    topicId: topic.id,
    // Every upload is reviewed before students can see it (admins' own uploads go straight up).
    status: viewer.isAdmin ? "published" : "pending",
    createdAt: new Date().toISOString(),
    note: "",
    title: d.title,
    body: d.description,
    media: { videoUrl: publicUrlFor(d.path), posterUrl: posterOk && d.posterPath ? publicUrlFor(d.posterPath) : null, durationSec: Math.round(d.durationSec), bytes: size, path: d.path },
    views: 0,
  };
  await (await getStore()).putDoc("contributions", c.id, c, viewer.user.id);
  revalidatePath("/", "layout");
  return { ok: true, id: c.id };
}

export async function deleteUpload(id: string) {
  const viewer = await getViewer();
  if (!viewer) return;
  const c = await getUpload(id);
  if (!c || (c.educatorId !== viewer.user.id && !viewer.isAdmin)) return;
  await (await getStore()).putDoc("contributions", id, { ...c, status: "removed" });
  await removeObjects([c.media!.path, ...(c.media!.posterUrl ? [c.media!.path.replace(/\.\w+$/, ".jpg")] : [])]).catch(() => {});
  revalidatePath("/", "layout");
  redirect(c.educatorId === viewer.user.id ? "/studio/upload" : "/videos");
}

/** Counted when a student presses play. */
export async function recordUploadView(id: string) {
  const c = await getUpload(id);
  if (!c) return;
  await (await getStore()).putDoc("contributions", id, { ...c, views: (c.views ?? 0) + 1 });
}
