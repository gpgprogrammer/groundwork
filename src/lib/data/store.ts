import "server-only";
import { isSupabaseEnabled } from "@/lib/env";
import type { Profile, Referral, Schedule, SiteStats, Tutor, TutoringRequest, TutorReview, UserState } from "@/lib/types";

export type ProfilePatch = Partial<Pick<Profile, "name" | "onboarded" | "courseIds" | "examDate" | "goal" | "focusTopicIds" | "location">>;
export type TutorInput = Omit<Tutor, "id" | "userId" | "createdAt">;

/** Per-user data. The video library itself is static (src/data/youtube.json). */
export interface Store {
  /** Aggregate Merit engagement per video (opens, saves, votes). */
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

  // Tutoring marketplace
  listTutors(): Promise<Tutor[]>;
  listReviews(tutorId?: string): Promise<TutorReview[]>;
  saveTutor(userId: string, input: TutorInput): Promise<Tutor>;
  removeTutor(userId: string): Promise<void>;
  saveReview(review: Omit<TutorReview, "id" | "createdAt">): Promise<void>;
  createTutoringRequest(req: Omit<TutoringRequest, "id" | "createdAt" | "status">): Promise<void>;
  listTutoringRequests(tutorId: string): Promise<TutoringRequest[]>;
  updateTutoringStatus(tutorId: string, id: string, status: TutoringRequest["status"]): Promise<void>;
  logReferral(ref: Omit<Referral, "id" | "createdAt">): Promise<void>;
  referralCounts(partnerIds: string[]): Promise<Record<string, number>>;

  // Documents for newer features (billing, sprints, educator content, bookings…).
  // Access control happens in server actions; these are never exposed to clients directly.
  getDoc<T>(collection: string, id: string): Promise<T | null>;
  listDocs<T>(collection: string, filter?: { owner?: string }): Promise<T[]>;
  putDoc<T>(collection: string, id: string, data: T, owner?: string | null): Promise<void>;
  deleteDoc(collection: string, id: string): Promise<void>;
}

let instance: Promise<Store> | null = null;

/**
 * Reads that fall back to "nothing yet" when the database can't be reached, so a database outage
 * shows an emptier page instead of an error page (or a page that hangs). Writes still throw, so a
 * form never pretends it saved.
 */
const READ_FALLBACKS: Partial<Record<keyof Store, () => unknown>> = {
  siteStats: () => ({}),
  getUserState: () => null,
  listTutors: () => [],
  listReviews: () => [],
  listTutoringRequests: () => [],
  referralCounts: () => ({}),
  getDoc: () => null,
  listDocs: () => [],
};

function withReadFallbacks(store: Store): Store {
  return new Proxy(store, {
    get(target, key: keyof Store) {
      const value = target[key];
      const fallback = READ_FALLBACKS[key];
      if (typeof value !== "function" || !fallback) return value;
      return async (...args: unknown[]) => {
        try {
          return await (value as (...a: unknown[]) => Promise<unknown>).apply(target, args);
        } catch (err) {
          console.error(`[store] ${String(key)} failed; showing the page without live data`, (err as Error)?.message ?? err);
          return fallback();
        }
      };
    },
  });
}

export function getStore(): Promise<Store> {
  instance ??= isSupabaseEnabled
    ? import("./supabase-store").then((m) => withReadFallbacks(m.createSupabaseStore()))
    : import("./demo-store").then((m) => m.createLocalStore());
  return instance;
}
