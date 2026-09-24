"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getCatalog } from "@/lib/catalog";
import { detectCourse, matchTopics } from "@/lib/catalog/match";
import { getStore } from "@/lib/data/store";
import type { Contribution, Educator } from "@/lib/types";
import { getViewer } from "@/lib/viewer";
import { fetchYoutubeMeta, youtubeId } from "@/lib/youtube-meta";

export type StudioState = { error?: string; ok?: boolean };

async function requireEducator() {
  const viewer = await getViewer();
  if (!viewer) redirect("/login?next=/studio");
  const educator = await (await getStore()).getDoc<Educator>("educators", viewer.user.id);
  if (!educator) redirect("/studio");
  return { viewer, educator };
}

const profileSchema = z.object({
  name: z.string().trim().min(2, "Add the name students will see.").max(60),
  headline: z.string().trim().min(4, "Add a one-line headline, like “AP Chemistry teacher, 12 years”.").max(100),
  school: z.string().trim().max(100),
  bio: z.string().trim().max(1200),
  courseIds: z.array(z.string()).min(1, "Pick at least one course you teach."),
});

export async function saveEducatorProfile(_: StudioState, form: FormData): Promise<StudioState> {
  const viewer = await getViewer();
  if (!viewer) redirect("/login?next=/studio");
  const parsed = profileSchema.safeParse({ ...Object.fromEntries(form), courseIds: form.getAll("courseIds") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (form.get("pledge") !== "on") return { error: "Please confirm the content guidelines." };
  const catalog = await getCatalog();
  const store = await getStore();
  const existing = await store.getDoc<Educator>("educators", viewer.user.id);
  const educator: Educator = {
    id: viewer.user.id,
    ...parsed.data,
    courseIds: parsed.data.courseIds.filter((id) => catalog.course(id)),
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  };
  await store.putDoc("educators", educator.id, educator, viewer.user.id);
  revalidatePath("/studio");
  redirect("/studio?welcome=1");
}

export type VideoPreview = {
  ok: true;
  id: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  durationSec: number;
  views: number;
  suggestedCourse: string | null;
  suggestedTopics: { id: string; title: string; courseId: string }[];
  alreadyListed: boolean;
};

/** Looks up a YouTube link and suggests where it belongs in the curriculum. */
export async function previewVideo(url: string): Promise<VideoPreview | { ok: false; error: string }> {
  const { educator } = await requireEducator();
  const id = youtubeId(url);
  if (!id) return { ok: false, error: "That doesn't look like a YouTube link." };
  const meta = await fetchYoutubeMeta(id);
  if (!meta) return { ok: false, error: "We couldn't find that video. Check that it's public." };
  const catalog = await getCatalog();
  const text = `${meta.title} ${meta.description}`;
  const suggestedCourse = detectCourse(catalog, text, educator.courseIds) ?? educator.courseIds[0] ?? null;
  const topics = matchTopics(catalog, text, { courseIds: suggestedCourse ? [suggestedCourse] : educator.courseIds, limit: 5 })
    .map((m) => catalog.topic(m.topicId))
    .filter((t) => t !== undefined)
    .map((t) => ({ id: t.id, title: t.title, courseId: t.courseId }));
  return {
    ok: true,
    id,
    title: meta.title,
    channelTitle: meta.channelTitle,
    thumbnail: meta.thumbnail,
    durationSec: meta.durationSec,
    views: meta.views,
    suggestedCourse,
    suggestedTopics: topics,
    alreadyListed: Boolean(catalog.video(id)),
  };
}

async function underDailyCap(educatorId: string) {
  const today = new Date().toISOString().slice(0, 10);
  const mine = await (await getStore()).listDocs<Contribution>("contributions", { owner: educatorId });
  return mine.filter((c) => c.createdAt.startsWith(today)).length < 40;
}

const videoSchema = z.object({
  videoId: z.string().regex(/^[\w-]{11}$/, "Look up a video first."),
  topicId: z.string().min(1, "Choose the topic this video teaches."),
  note: z.string().trim().max(1000),
});

export async function publishVideo(_: StudioState, form: FormData): Promise<StudioState> {
  const { educator } = await requireEducator();
  const parsed = videoSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (!(await underDailyCap(educator.id))) return { error: "You've added a lot today. Come back tomorrow to add more." };
  const catalog = await getCatalog();
  const topic = catalog.topic(parsed.data.topicId);
  if (!topic) return { error: "Choose a topic." };
  const meta = await fetchYoutubeMeta(parsed.data.videoId);
  if (!meta) return { error: "We couldn't load that video. Check that it's public." };
  const store = await getStore();
  const mine = await store.listDocs<Contribution>("contributions", { owner: educator.id });
  if (mine.some((c) => c.video?.id === meta.id && c.topicId === topic.id && c.status === "published")) return { error: "You've already added this video to that topic." };
  const c: Contribution = {
    id: `con_${randomUUID().slice(0, 12)}`,
    educatorId: educator.id,
    kind: "video",
    courseId: topic.courseId,
    topicId: topic.id,
    status: "published",
    createdAt: new Date().toISOString(),
    note: parsed.data.note,
    video: {
      id: meta.id,
      title: meta.title,
      description: meta.description,
      channelId: meta.channelId,
      channelTitle: meta.channelTitle,
      thumbnail: meta.thumbnail,
      durationSec: meta.durationSec,
      views: meta.views,
      publishedAt: meta.publishedAt,
      isShort: meta.isShort,
    },
  };
  await store.putDoc("contributions", c.id, c, educator.id);
  revalidatePath("/", "layout");
  redirect(`/studio?added=video`);
}

const guideSchema = z.object({
  topicId: z.string().min(1, "Choose the topic this guide covers."),
  title: z.string().trim().min(4, "Give the guide a title.").max(120),
  body: z.string().trim().min(80, "Write a little more: at least a few sentences.").max(20000),
});

export async function publishGuide(_: StudioState, form: FormData): Promise<StudioState> {
  const { educator } = await requireEducator();
  const parsed = guideSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (!(await underDailyCap(educator.id))) return { error: "You've added a lot today. Come back tomorrow to add more." };
  const catalog = await getCatalog();
  const topic = catalog.topic(parsed.data.topicId);
  if (!topic) return { error: "Choose a topic." };
  const id = `con_${randomUUID().slice(0, 12)}`;
  const c: Contribution = {
    id,
    educatorId: educator.id,
    kind: "guide",
    courseId: topic.courseId,
    topicId: topic.id,
    status: "published",
    createdAt: new Date().toISOString(),
    note: "",
    title: parsed.data.title,
    body: parsed.data.body,
  };
  await (await getStore()).putDoc("contributions", id, c, educator.id);
  revalidatePath("/", "layout");
  redirect(`/guides/${id}?published=1`);
}

export async function removeContribution(id: string) {
  const viewer = await getViewer();
  if (!viewer) return;
  const store = await getStore();
  const c = await store.getDoc<Contribution>("contributions", id);
  if (!c || (c.educatorId !== viewer.user.id && !viewer.isAdmin)) return;
  await store.putDoc("contributions", id, { ...c, status: "removed" });
  revalidatePath("/", "layout");
}
