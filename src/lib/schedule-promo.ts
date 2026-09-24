import "server-only";
import { getStore } from "@/lib/data/store";
import { normalizeSchedule } from "@/lib/schedule-model";
import type { Viewer } from "@/lib/viewer";

const DELAY_MS = 5 * 60_000;

/** When to show the "Sync your schedule" popup, or null if it shouldn't show. */
export async function schedulePromoFor(viewer: Viewer | null) {
  if (!viewer || !viewer.state.profile.onboarded) return null;
  if (normalizeSchedule(viewer.state.schedule)?.sources.length) return null;
  const seen = await (await getStore()).getDoc<{ scheduleDismissedAt?: string }>("prompts", viewer.user.id);
  if (seen?.scheduleDismissedAt) return null;
  const showAt = new Date(new Date(viewer.state.profile.createdAt).getTime() + DELAY_MS).toISOString();
  const trialDaysLeft = viewer.plus.kind === "trial" ? viewer.plus.daysLeft : null;
  return { showAt, trialDaysLeft };
}
