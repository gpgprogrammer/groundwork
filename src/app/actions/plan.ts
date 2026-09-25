"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { hasPlus } from "@/lib/billing/access";
import { savePlanPrefs, setTaskDone } from "@/lib/plan-store";
import { getViewer } from "@/lib/viewer";

async function plusViewer() {
  const viewer = await getViewer();
  if (!viewer) throw new Error("Sign in first.");
  if (!hasPlus(viewer.plus)) throw new Error("This is a Merit Plus feature.");
  return viewer;
}

const prefsSchema = z.object({
  minutesPerDay: z.coerce.number({ message: "Enter how much time you have: 10 minutes to 8 hours." }).int().min(10, "At least 10 minutes a day.").max(480, "Up to 8 hours a day."),
  reminderHour: z.coerce.number().int().min(5).max(23),
  studyDays: z.array(z.coerce.number().int().min(0).max(6)).min(1, "Pick at least one day."),
});

export type PrefsState = { error?: string; ok?: boolean };

export async function updatePlanPrefs(_: PrefsState, form: FormData): Promise<PrefsState> {
  const viewer = await plusViewer();
  const parsed = prefsSchema.safeParse({
    minutesPerDay: form.get("minutesPerDay"),
    reminderHour: form.get("reminderHour"),
    studyDays: form.getAll("studyDays"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  await savePlanPrefs(viewer.user.id, parsed.data);
  revalidatePath("/plan");
  return { ok: true };
}

export async function toggleTask(taskId: string, done: boolean) {
  const viewer = await plusViewer();
  if (!/^\d{4}-\d{2}-\d{2}:/.test(taskId) || taskId.length > 200) throw new Error("Bad task.");
  await setTaskDone(viewer.user.id, taskId, done);
  revalidatePath("/plan");
  revalidatePath("/progress");
}
