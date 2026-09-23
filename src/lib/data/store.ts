import "server-only";
import { isSupabaseEnabled } from "@/lib/env";
import type { Catalog, Educator, Profile, Progress, Subscription, TutoringRequest, UserState, Video } from "@/lib/types";

export type StatDelta = {
  views: number;
  completions: number;
  watchFractionSum: number;
  helpful: number;
  notHelpful: number;
  saves: number;
  rewatches: number;
};

export type CatalogOverlay = {
  extraVideos: Video[];
  extraEducators: Educator[];
  educatorPatches: Record<string, Partial<Educator>>;
  deltas: Record<string, StatDelta>;
};

export type ProgressInput = { position: number; duration: number; watchedDelta: number };

export type EducatorPatch = Partial<
  Pick<Educator, "headline" | "bio" | "hourlyRate" | "acceptingStudents" | "bookingUrl" | "subjects">
>;

export interface Store {
  /** Full catalog with live engagement stats merged in. */
  loadCatalog(): Promise<Catalog>;
  getUserState(userId: string): Promise<UserState | null>;
  ensureProfile(user: { id: string; email: string; name: string }): Promise<Profile>;
  updateProfile(userId: string, patch: Partial<Omit<Profile, "id" | "email" | "createdAt">>): Promise<void>;
  recordProgress(userId: string, videoId: string, input: ProgressInput): Promise<Progress>;
  toggleSave(userId: string, videoId: string): Promise<boolean>;
  setVote(userId: string, videoId: string, value: 1 | -1 | 0): Promise<void>;
  clearHistory(userId: string): Promise<void>;
  setSubscription(userId: string, sub: Subscription): Promise<void>;
  findUserIdByStripeCustomer(customerId: string): Promise<string | null>;
  createTutoringRequest(req: Omit<TutoringRequest, "id" | "createdAt" | "status">): Promise<TutoringRequest>;
  listTutoringRequests(educatorId: string): Promise<TutoringRequest[]>;
  updateTutoringStatus(educatorId: string, id: string, status: TutoringRequest["status"]): Promise<void>;
  createVideo(video: Video): Promise<void>;
  patchEducator(educatorId: string, patch: EducatorPatch): Promise<void>;
  /** Creates an educator profile owned by a user and links it to their profile. */
  createEducator(ownerId: string, educator: Educator): Promise<void>;
  /** Unpublished lessons belonging to an educator. */
  listDrafts(educatorId: string): Promise<Video[]>;
}

let instance: Promise<Store> | null = null;

export function getStore(): Promise<Store> {
  if (!instance) {
    instance = isSupabaseEnabled
      ? import("./supabase-store").then((m) => m.createSupabaseStore())
      : import("./demo-store").then((m) => m.createDemoStore());
  }
  return instance;
}

export const emptySubscription = (): Subscription => ({
  status: "none",
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
});

/** Merge live engagement (from real users) into a catalog's baseline stats. */
export function applyOverlay(base: Catalog, overlay: CatalogOverlay): Catalog {
  const educators = [...base.educators, ...overlay.extraEducators].map((e) => ({ ...e, ...overlay.educatorPatches[e.id] }));
  const videos = [...base.videos, ...overlay.extraVideos].map((v) => {
    const d = overlay.deltas[v.id];
    if (!d) return v;
    const s = v.stats;
    const views = s.views + d.views;
    return {
      ...v,
      stats: {
        views,
        completions: s.completions + d.completions,
        avgWatchFraction: views ? (s.avgWatchFraction * s.views + d.watchFractionSum) / views : 0,
        helpful: s.helpful + d.helpful,
        notHelpful: s.notHelpful + d.notHelpful,
        saves: s.saves + d.saves,
        rewatchRate: views ? (s.rewatchRate * s.views + d.rewatches) / views : 0,
        earlyDropRate: s.earlyDropRate,
      },
    };
  });
  return { ...base, educators, videos };
}
