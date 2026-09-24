"use server";

import { getStore } from "@/lib/data/store";
import { getViewer } from "@/lib/viewer";

/** Remembers that the student closed the "Sync your schedule" popup, on every device. */
export async function dismissSchedulePromo() {
  const viewer = await getViewer();
  if (!viewer) return;
  const store = await getStore();
  const cur = (await store.getDoc<Record<string, string>>("prompts", viewer.user.id)) ?? {};
  await store.putDoc("prompts", viewer.user.id, { ...cur, scheduleDismissedAt: new Date().toISOString() }, viewer.user.id);
}
