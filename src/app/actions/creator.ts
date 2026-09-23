"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getCatalog } from "@/lib/catalog";
import { hash } from "@/lib/catalog/build";
import { getStore } from "@/lib/data/store";
import type { Chapter, TutoringRequest, VideoStyle } from "@/lib/types";
import { getViewer } from "@/lib/viewer";

async function requireCreator() {
  const viewer = await getViewer();
  if (!viewer) redirect("/login?next=/creator");
  if (viewer.state.profile.role !== "creator" || !viewer.state.profile.educatorId) redirect("/creator/join");
  return { viewer, educatorId: viewer.state.profile.educatorId };
}

const STYLES: VideoStyle[] = ["Concept", "Practice", "Common mistakes", "Exam strategy"];

const lessonSchema = z.object({
  topicId: z.string().min(1, "Choose the topic this lesson teaches."),
  title: z.string().trim().min(6, "Give the lesson a descriptive title.").max(90),
  description: z.string().trim().min(20, "Add a short description (at least 20 characters).").max(600),
  style: z.enum(STYLES as [VideoStyle, ...VideoStyle[]]),
  minutes: z.coerce.number().min(1, "Lessons should be at least a minute.").max(30, "Keep lessons under 30 minutes."),
  mediaUrl: z
    .string()
    .trim()
    .url("Media link must be a full URL.")
    .refine((u) => /^https:\/\//.test(u), "Use an https:// link.")
    .or(z.literal("")),
  chapters: z.string().max(2000),
  publish: z.enum(["draft", "published"]),
});

export type LessonFormState = { error?: string; ok?: boolean };

function parseChapters(raw: string, durationSec: number): Chapter[] {
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const parsed = lines.map((line) => {
    const m = line.match(/^(\d{1,2}):(\d{2})\s+(.+)$/);
    return m ? { t: Number(m[1]) * 60 + Number(m[2]), title: m[3].trim() } : null;
  });
  const valid = parsed.filter((c): c is Chapter => Boolean(c) && c!.t < durationSec).sort((a, b) => a.t - b.t);
  if (!valid.length || valid[0].t !== 0) valid.unshift({ t: 0, title: "Introduction" });
  return valid;
}

export async function createLesson(_: LessonFormState, form: FormData): Promise<LessonFormState> {
  const { educatorId } = await requireCreator();
  const parsed = lessonSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  const catalog = await getCatalog();
  if (!catalog.topic(d.topicId)) return { error: "That topic doesn't exist." };

  const durationSec = Math.round(d.minutes * 60);
  const id = `v${hash(`${educatorId}|${d.title}|${Date.now()}`).toString(36)}`;
  await (await getStore()).createVideo({
    id,
    topicId: d.topicId,
    educatorId,
    title: d.title,
    description: d.description,
    style: d.style,
    durationSec,
    publishedAt: new Date().toISOString(),
    chapters: parseChapters(d.chapters, durationSec),
    mediaUrl: d.mediaUrl || null,
    status: d.publish,
    stats: { views: 0, completions: 0, avgWatchFraction: 0, helpful: 0, notHelpful: 0, saves: 0, rewatchRate: 0, earlyDropRate: 0.3 },
  });
  revalidatePath("/creator");
  redirect(`/creator?created=${id}`);
}

const educatorSchema = z.object({
  headline: z.string().trim().min(4).max(90),
  bio: z.string().trim().min(40, "Write at least a couple of sentences for your bio.").max(1200),
  hourlyRate: z.coerce.number().int().min(0).max(500),
  acceptingStudents: z.enum(["on", "off"]).default("off"),
  bookingUrl: z.string().trim().url("Booking link must be a full URL.").or(z.literal("")),
  subjects: z.string().trim().max(200),
});

export type EducatorFormState = { ok?: boolean; error?: string };

export async function updateEducatorProfile(_: EducatorFormState, form: FormData): Promise<EducatorFormState> {
  const { educatorId } = await requireCreator();
  const parsed = educatorSchema.safeParse({ ...Object.fromEntries(form), acceptingStudents: form.get("acceptingStudents") ? "on" : "off" });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  await (await getStore()).patchEducator(educatorId, {
    headline: d.headline,
    bio: d.bio,
    hourlyRate: d.hourlyRate,
    acceptingStudents: d.acceptingStudents === "on",
    bookingUrl: d.bookingUrl || null,
    subjects: d.subjects.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 8),
  });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function setRequestStatus(id: string, status: TutoringRequest["status"]) {
  const { educatorId } = await requireCreator();
  if (!["new", "replied", "scheduled", "archived"].includes(status)) throw new Error("Invalid status");
  await (await getStore()).updateTutoringStatus(educatorId, id, status);
  revalidatePath("/creator");
}

const joinSchema = z.object({
  headline: z.string().trim().min(4, "Add a one-line headline.").max(90),
  bio: z.string().trim().min(40, "Write at least a couple of sentences for your bio.").max(1200),
  courseIds: z.array(z.string()).min(1, "Choose at least one course you teach."),
  hourlyRate: z.coerce.number().int().min(0).max(500),
  location: z.string().trim().max(80),
});

export type JoinState = { error?: string };

export async function becomeCreator(_: JoinState, form: FormData): Promise<JoinState> {
  const viewer = await getViewer();
  if (!viewer) redirect("/login?next=/creator/join");
  if (viewer.state.profile.educatorId) redirect("/creator");
  const parsed = joinSchema.safeParse({
    headline: form.get("headline"),
    bio: form.get("bio"),
    courseIds: form.getAll("courseIds").map(String),
    hourlyRate: form.get("hourlyRate") || 0,
    location: form.get("location") ?? "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  const catalog = await getCatalog();
  const courses = d.courseIds.map((id) => catalog.course(id)).filter(Boolean);
  const name = viewer.user.name;
  let handle = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "educator";
  if (catalog.educatorByHandle(handle)) handle = `${handle}-${hash(viewer.user.id).toString(36).slice(0, 4)}`;

  await (await getStore()).createEducator(viewer.user.id, {
    id: `edu_${handle}`,
    handle,
    name,
    firstName: name.split(" ")[0],
    headline: d.headline,
    bio: d.bio,
    subjects: [...new Set(courses.map((c) => c!.subject))],
    courseIds: d.courseIds,
    credentials: [],
    rating: 0,
    ratingCount: 0,
    hourlyRate: d.hourlyRate,
    yearsTeaching: 0,
    location: d.location,
    responseTime: "New on Groundwork",
    acceptingStudents: d.hourlyRate > 0,
    bookingUrl: null,
    hue: hash(handle) % 360,
  });
  revalidatePath("/", "layout");
  redirect("/creator?welcome=1");
}
