import "server-only";
import { PLAN } from "@/lib/env";
import { createAdminClient, createSessionClient } from "@/lib/supabase/server";
import type { Profile, SiteStats, Subscription } from "@/lib/types";
import { emptySubscription, type Store } from "./store";

/* eslint-disable @typescript-eslint/no-explicit-any -- rows are mapped explicitly below */

function must<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

const toProfile = (r: any): Profile => ({
  id: r.id,
  email: r.email,
  name: r.name,
  role: r.role,
  onboarded: r.onboarded,
  courseIds: r.course_ids ?? [],
  examDate: r.exam_date,
  goal: r.goal,
  focusTopicIds: r.focus_topic_ids ?? [],
  createdAt: r.created_at,
  trialEndsAt: r.trial_ends_at,
});

const toSubscription = (r: any): Subscription =>
  r
    ? {
        status: r.status,
        stripeCustomerId: r.stripe_customer_id,
        stripeSubscriptionId: r.stripe_subscription_id,
        currentPeriodEnd: r.current_period_end,
        cancelAtPeriodEnd: r.cancel_at_period_end,
      }
    : emptySubscription();

const STATS_TTL_MS = 60_000;
let statsCache: { at: number; value: Promise<Record<string, SiteStats>> } | null = null;

export function createSupabaseStore(): Store {
  return {
    async siteStats() {
      if (!statsCache || Date.now() - statsCache.at > STATS_TTL_MS) {
        const value = (async () => {
          const rows = must(await createAdminClient().from("video_site_stats").select("*").limit(50000));
          return Object.fromEntries(
            rows.map((r: any) => [r.video_id, { opens: Number(r.opens), saves: Number(r.saves), helpful: Number(r.helpful), notHelpful: Number(r.not_helpful) }]),
          );
        })();
        statsCache = { at: Date.now(), value };
        value.catch(() => (statsCache = null));
      }
      return statsCache.value;
    },

    async getUserState(userId) {
      const db = await createSessionClient();
      const [profile, history, saves, votes, mastered, schedule, sub] = await Promise.all([
        db.from("profiles").select("*").eq("id", userId).maybeSingle(),
        db.from("history").select("*").eq("user_id", userId),
        db.from("saves").select("video_id, created_at").eq("user_id", userId),
        db.from("votes").select("video_id, value").eq("user_id", userId),
        db.from("mastery").select("topic_id, created_at").eq("user_id", userId),
        db.from("schedules").select("data").eq("user_id", userId).maybeSingle(),
        db.from("subscriptions").select("*").eq("user_id", userId).maybeSingle(),
      ]);
      const p = must(profile);
      if (!p) return null;
      return {
        profile: toProfile(p),
        history: Object.fromEntries(must(history).map((r: any) => [r.video_id, { videoId: r.video_id, openedAt: r.opened_at, opens: r.opens }])),
        saves: Object.fromEntries(must(saves).map((r: any) => [r.video_id, r.created_at])),
        votes: Object.fromEntries(must(votes).map((r: any) => [r.video_id, r.value])),
        mastered: Object.fromEntries(must(mastered).map((r: any) => [r.topic_id, r.created_at])),
        schedule: (must(schedule) as any)?.data ?? null,
        subscription: toSubscription(must(sub)),
      };
    },

    async ensureProfile(user) {
      const db = await createSessionClient();
      const existing = must(await db.from("profiles").select("*").eq("id", user.id).maybeSingle());
      if (existing) return toProfile(existing);
      // The auth trigger normally creates this row; this is a fallback.
      const admin = createAdminClient();
      const row = must(
        await admin
          .from("profiles")
          .upsert({ id: user.id, email: user.email, name: user.name, trial_ends_at: new Date(Date.now() + PLAN.trialDays * 86400000).toISOString() })
          .select("*")
          .single(),
      );
      await admin.from("subscriptions").upsert({ user_id: user.id }, { onConflict: "user_id", ignoreDuplicates: true });
      return toProfile(row);
    },

    async updateProfile(userId, patch) {
      const cols: Record<string, unknown> = {};
      if (patch.name !== undefined) cols.name = patch.name;
      if (patch.onboarded !== undefined) cols.onboarded = patch.onboarded;
      if (patch.courseIds !== undefined) cols.course_ids = patch.courseIds;
      if (patch.examDate !== undefined) cols.exam_date = patch.examDate;
      if (patch.goal !== undefined) cols.goal = patch.goal;
      if (patch.focusTopicIds !== undefined) cols.focus_topic_ids = patch.focusTopicIds;
      if (!Object.keys(cols).length) return;
      const db = await createSessionClient();
      must(await db.from("profiles").update(cols).eq("id", userId).select("id"));
    },

    async recordOpen(userId, videoId) {
      const db = await createSessionClient();
      must(await db.rpc("record_open", { p_video_id: videoId }));
      void userId;
    },

    async toggleSave(userId, videoId) {
      const db = await createSessionClient();
      const existing = must(await db.from("saves").select("video_id").eq("user_id", userId).eq("video_id", videoId).maybeSingle());
      if (existing) {
        must(await db.from("saves").delete().eq("user_id", userId).eq("video_id", videoId).select("video_id"));
        return false;
      }
      must(await db.from("saves").insert({ user_id: userId, video_id: videoId }).select("video_id"));
      return true;
    },

    async setVote(userId, videoId, value) {
      const db = await createSessionClient();
      if (value === 0) must(await db.from("votes").delete().eq("user_id", userId).eq("video_id", videoId).select("video_id"));
      else must(await db.from("votes").upsert({ user_id: userId, video_id: videoId, value }).select("video_id"));
    },

    async setMastered(userId, topicId, mastered) {
      const db = await createSessionClient();
      if (mastered) must(await db.from("mastery").upsert({ user_id: userId, topic_id: topicId }).select("topic_id"));
      else must(await db.from("mastery").delete().eq("user_id", userId).eq("topic_id", topicId).select("topic_id"));
    },

    async clearHistory(userId) {
      const db = await createSessionClient();
      must(await db.from("history").delete().eq("user_id", userId).select("video_id"));
    },

    async setSchedule(userId, schedule) {
      const db = await createSessionClient();
      if (!schedule) must(await db.from("schedules").delete().eq("user_id", userId).select("user_id"));
      else must(await db.from("schedules").upsert({ user_id: userId, data: schedule, updated_at: new Date().toISOString() }).select("user_id"));
    },

    async setSubscription(userId, sub) {
      must(
        await createAdminClient()
          .from("subscriptions")
          .upsert({
            user_id: userId,
            status: sub.status,
            stripe_customer_id: sub.stripeCustomerId,
            stripe_subscription_id: sub.stripeSubscriptionId,
            current_period_end: sub.currentPeriodEnd,
            cancel_at_period_end: sub.cancelAtPeriodEnd,
            updated_at: new Date().toISOString(),
          })
          .select("user_id"),
      );
    },

    async findUserIdByStripeCustomer(customerId) {
      const row = must(await createAdminClient().from("subscriptions").select("user_id").eq("stripe_customer_id", customerId).maybeSingle()) as any;
      return row?.user_id ?? null;
    },
  };
}
