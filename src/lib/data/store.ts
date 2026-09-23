import "server-only";
import { isSupabaseEnabled } from "@/lib/env";
import type { Profile, Schedule, SiteStats, Subscription, UserState } from "@/lib/types";

export type ProfilePatch = Partial<Pick<Profile, "name" | "onboarded" | "courseIds" | "examDate" | "goal" | "focusTopicIds">>;

/** Per-user data. The video library itself is static (src/data/youtube.json). */
export interface Store {
  /** Aggregate Groundwork engagement per video (opens, saves, votes). */
  siteStats(): Promise<Record<string, SiteStats>>;
  getUserState(userId: string): Promise<UserState | null>;
  ensureProfile(user: { id: string; email: string; name: string }): Promise<Profile>;
  updateProfile(userId: string, patch: ProfilePatch): Promise<void>;
  recordOpen(userId: string, videoId: string): Promise<void>;
  toggleSave(userId: string, videoId: string): Promise<boolean>;
  setVote(userId: string, videoId: string, value: 1 | -1 | 0): Promise<void>;
  setMastered(userId: string, topicId: string, mastered: boolean): Promise<void>;
  clearHistory(userId: string): Promise<void>;
  setSchedule(userId: string, schedule: Schedule | null): Promise<void>;
  setSubscription(userId: string, sub: Subscription): Promise<void>;
  findUserIdByStripeCustomer(customerId: string): Promise<string | null>;
}

let instance: Promise<Store> | null = null;

export function getStore(): Promise<Store> {
  instance ??= isSupabaseEnabled
    ? import("./supabase-store").then((m) => m.createSupabaseStore())
    : import("./demo-store").then((m) => m.createLocalStore());
  return instance;
}

export const emptySubscription = (): Subscription => ({
  status: "none",
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
});
