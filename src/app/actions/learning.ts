"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getCatalog } from "@/lib/catalog";
import { getStore } from "@/lib/data/store";
import { getViewer } from "@/lib/viewer";

async function viewerOrLogin(next: string) {
  const viewer = await getViewer();
  if (!viewer) redirect(`/login?next=${encodeURIComponent(next)}`);
  return viewer;
}

export async function toggleSave(videoId: string): Promise<{ saved: boolean }> {
  const viewer = await viewerOrLogin(`/watch/${videoId}`);
  const catalog = await getCatalog();
  if (!catalog.video(videoId)) throw new Error("Unknown lesson");
  const saved = await (await getStore()).toggleSave(viewer.user.id, videoId);
  revalidatePath("/library");
  return { saved };
}

export async function vote(videoId: string, value: 1 | -1 | 0) {
  const viewer = await viewerOrLogin(`/watch/${videoId}`);
  if (![1, -1, 0].includes(value)) throw new Error("Invalid vote");
  const catalog = await getCatalog();
  if (!catalog.video(videoId)) throw new Error("Unknown lesson");
  await (await getStore()).setVote(viewer.user.id, videoId, value);
}

export async function clearHistory() {
  const viewer = await viewerOrLogin("/library?tab=history");
  await (await getStore()).clearHistory(viewer.user.id);
  revalidatePath("/library");
  revalidatePath("/dashboard");
}

const onboardingSchema = z.object({
  courseIds: z.array(z.string()).min(1, "Pick at least one course.").max(8),
  examDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  goal: z.string().trim().max(120).nullable(),
  dailyMinutes: z.number().int().min(5).max(240).nullable(),
});

export async function completeOnboarding(input: z.infer<typeof onboardingSchema>) {
  const viewer = await viewerOrLogin("/onboarding");
  const data = onboardingSchema.parse(input);
  const catalog = await getCatalog();
  const courseIds = data.courseIds.filter((id) => catalog.course(id));
  await (await getStore()).updateProfile(viewer.user.id, { ...data, courseIds, onboarded: true });
  revalidatePath("/", "layout");
  return { ok: true };
}

const profileSchema = z.object({
  name: z.string().trim().min(1).max(80),
  courseIds: z.array(z.string()).max(8),
  examDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).or(z.literal("")),
  goal: z.string().trim().max(120),
  dailyMinutes: z.coerce.number().int().min(0).max(240),
});

export type ProfileFormState = { ok?: boolean; error?: string };

export async function updateProfile(_: ProfileFormState, form: FormData): Promise<ProfileFormState> {
  const viewer = await viewerOrLogin("/settings");
  const parsed = profileSchema.safeParse({
    name: form.get("name"),
    courseIds: form.getAll("courseIds").map(String),
    examDate: form.get("examDate") ?? "",
    goal: form.get("goal") ?? "",
    dailyMinutes: form.get("dailyMinutes") || 0,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  await (await getStore()).updateProfile(viewer.user.id, {
    name: d.name,
    courseIds: d.courseIds,
    examDate: d.examDate || null,
    goal: d.goal || null,
    dailyMinutes: d.dailyMinutes || null,
  });
  revalidatePath("/", "layout");
  return { ok: true };
}

const tutoringSchema = z.object({
  educatorId: z.string().min(1),
  name: z.string().trim().min(1, "Add your name.").max(120),
  email: z.string().trim().email("Add an email the educator can reply to."),
  courseId: z.string().nullable(),
  message: z.string().trim().min(10, "Tell them a little about what you need help with.").max(2000),
  availability: z.string().trim().max(200),
  sourceVideoId: z.string().nullable(),
});

export type TutoringState = { ok?: boolean; error?: string };

export async function requestTutoring(_: TutoringState, form: FormData): Promise<TutoringState> {
  const parsed = tutoringSchema.safeParse({
    educatorId: form.get("educatorId"),
    name: form.get("name"),
    email: form.get("email"),
    courseId: form.get("courseId") || null,
    message: form.get("message"),
    availability: form.get("availability") ?? "",
    sourceVideoId: form.get("sourceVideoId") || null,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const catalog = await getCatalog();
  const educator = catalog.educator(parsed.data.educatorId);
  if (!educator) return { error: "That educator isn't available." };
  if (!educator.acceptingStudents) return { error: `${educator.firstName} isn't taking new students right now.` };
  const viewer = await getViewer();
  await (await getStore()).createTutoringRequest({ ...parsed.data, userId: viewer?.user.id ?? null });
  return { ok: true };
}
