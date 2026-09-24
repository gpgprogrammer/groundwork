"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getCatalog } from "@/lib/catalog";
import { getStore } from "@/lib/data/store";
import { getViewer } from "@/lib/viewer";

async function viewerOr401() {
  const viewer = await getViewer();
  if (!viewer) throw new Error("unauthenticated");
  return viewer;
}

async function requireViewerOrLogin(next: string) {
  const viewer = await getViewer();
  if (!viewer) redirect(`/login?next=${encodeURIComponent(next)}`);
  return viewer;
}

export async function toggleSave(videoId: string): Promise<{ saved: boolean } | { error: "auth" }> {
  const viewer = await getViewer();
  if (!viewer) return { error: "auth" };
  if (!(await getCatalog()).video(videoId)) throw new Error("Unknown video");
  const saved = await (await getStore()).toggleSave(viewer.user.id, videoId);
  revalidatePath("/library");
  return { saved };
}

export async function vote(videoId: string, value: 1 | -1 | 0): Promise<{ ok: true } | { error: "auth" }> {
  const viewer = await getViewer();
  if (!viewer) return { error: "auth" };
  if (![1, -1, 0].includes(value)) throw new Error("Invalid vote");
  if (!(await getCatalog()).video(videoId)) throw new Error("Unknown video");
  await (await getStore()).setVote(viewer.user.id, videoId, value);
  revalidatePath("/library");
  return { ok: true };
}

export async function setMastered(topicId: string, mastered: boolean): Promise<{ ok: true } | { error: "auth" }> {
  const viewer = await getViewer();
  if (!viewer) return { error: "auth" };
  if (!(await getCatalog()).topic(topicId)) throw new Error("Unknown topic");
  await (await getStore()).setMastered(viewer.user.id, topicId, mastered);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function clearHistory() {
  const viewer = await requireViewerOrLogin("/library?tab=history");
  await (await getStore()).clearHistory(viewer.user.id);
  revalidatePath("/", "layout");
}

const onboardingSchema = z.object({
  courseIds: z.array(z.string()).min(1, "Pick at least one course.").max(8),
  examDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
});

export async function completeOnboarding(input: z.infer<typeof onboardingSchema>) {
  const viewer = await viewerOr401();
  const data = onboardingSchema.parse(input);
  const catalog = await getCatalog();
  await (await getStore()).updateProfile(viewer.user.id, {
    courseIds: data.courseIds.filter((id) => catalog.course(id)),
    examDate: data.examDate,
    onboarded: true,
  });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function setFocusTopics(topicIds: string[]) {
  const viewer = await viewerOr401();
  const catalog = await getCatalog();
  const valid = [...new Set(topicIds)].filter((id) => catalog.topic(id)).slice(0, 12);
  await (await getStore()).updateProfile(viewer.user.id, { focusTopicIds: valid });
  revalidatePath("/", "layout");
  return { ok: true };
}

const profileSchema = z.object({
  name: z.string().trim().min(1, "Add your name.").max(80),
  courseIds: z.array(z.string()).max(8),
  examDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).or(z.literal("")),
  goal: z.string().trim().max(120),
});

export type ProfileFormState = { ok?: boolean; error?: string };

export async function updateProfile(_: ProfileFormState, form: FormData): Promise<ProfileFormState> {
  const viewer = await requireViewerOrLogin("/settings");
  const parsed = profileSchema.safeParse({
    name: form.get("name"),
    courseIds: form.getAll("courseIds").map(String),
    examDate: form.get("examDate") ?? "",
    goal: form.get("goal") ?? "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  await (await getStore()).updateProfile(viewer.user.id, { name: d.name, courseIds: d.courseIds, examDate: d.examDate || null, goal: d.goal || null });
  revalidatePath("/", "layout");
  return { ok: true };
}
