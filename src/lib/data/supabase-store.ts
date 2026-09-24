import "server-only";
import { normalizeSchedule } from "@/lib/schedule-model";
import { createAdminClient, createSessionClient } from "@/lib/supabase/server";
import type { Profile, SiteStats, Tutor, TutoringRequest, TutorReview } from "@/lib/types";
import type { Store } from "./store";

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
  location: r.location ?? null,
  createdAt: r.created_at,
});

const toTutor = (r: any): Tutor => ({
  id: r.id,
  userId: r.user_id,
  name: r.name,
  headline: r.headline,
  bio: r.bio,
  courseIds: r.course_ids ?? [],
  hourlyRate: r.hourly_rate,
  city: r.city,
  region: r.region,
  country: r.country,
  online: r.online,
  inPerson: r.in_person,
  bookingUrl: r.booking_url,
  yearsExperience: r.years_experience,
  credentials: r.credentials,
  createdAt: r.created_at,
});

const toReview = (r: any): TutorReview => ({
  id: r.id,
  tutorId: r.tutor_id,
  userId: r.user_id,
  userName: r.user_name,
  rating: r.rating,
  text: r.text,
  createdAt: r.created_at,
});

const toRequest = (r: any): TutoringRequest => ({
  id: r.id,
  tutorId: r.tutor_id,
  userId: r.user_id,
  name: r.name,
  email: r.email,
  courseId: r.course_id,
  message: r.message,
  availability: r.availability,
  status: r.status,
  createdAt: r.created_at,
});

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
      // Admin client: callers pass an id the server already authorized, and the reminders feed runs without a session.
      const db = createAdminClient();
      const [profile, history, saves, votes, mastered, schedule] = await Promise.all([
        db.from("profiles").select("*").eq("id", userId).maybeSingle(),
        db.from("history").select("*").eq("user_id", userId),
        db.from("saves").select("video_id, created_at").eq("user_id", userId),
        db.from("votes").select("video_id, value").eq("user_id", userId),
        db.from("mastery").select("topic_id, created_at").eq("user_id", userId),
        db.from("schedules").select("data").eq("user_id", userId).maybeSingle(),
      ]);
      const p = must(profile);
      if (!p) return null;
      return {
        profile: toProfile(p),
        history: Object.fromEntries(must(history).map((r: any) => [r.video_id, { videoId: r.video_id, openedAt: r.opened_at, opens: r.opens }])),
        saves: Object.fromEntries(must(saves).map((r: any) => [r.video_id, r.created_at])),
        votes: Object.fromEntries(must(votes).map((r: any) => [r.video_id, r.value])),
        mastered: Object.fromEntries(must(mastered).map((r: any) => [r.topic_id, r.created_at])),
        schedule: normalizeSchedule((must(schedule) as any)?.data ?? null),
      };
    },

    async ensureProfile(user) {
      const db = await createSessionClient();
      const existing = must(await db.from("profiles").select("*").eq("id", user.id).maybeSingle());
      if (existing) return toProfile(existing);
      // The auth trigger normally creates this row; this is a fallback.
      const row = must(await createAdminClient().from("profiles").upsert({ id: user.id, email: user.email, name: user.name }).select("*").single());
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
      if (patch.location !== undefined) cols.location = patch.location;
      if (!Object.keys(cols).length) return;
      const db = await createSessionClient();
      must(await db.from("profiles").update(cols).eq("id", userId).select("id"));
    },

    async recordOpen(_userId, videoId) {
      const db = await createSessionClient();
      must(await db.rpc("record_open", { p_video_id: videoId }));
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

    async listTutors() {
      const rows = must(await createAdminClient().from("tutors").select("*").limit(5000));
      return rows.map(toTutor);
    },

    async listReviews(tutorId) {
      let q = createAdminClient().from("tutor_reviews").select("*").order("created_at", { ascending: false }).limit(5000);
      if (tutorId) q = q.eq("tutor_id", tutorId);
      return must(await q).map(toReview);
    },

    async saveTutor(userId, input) {
      const db = await createSessionClient();
      const row = must(
        await db
          .from("tutors")
          .upsert(
            {
              user_id: userId,
              name: input.name,
              headline: input.headline,
              bio: input.bio,
              course_ids: input.courseIds,
              hourly_rate: input.hourlyRate,
              city: input.city,
              region: input.region,
              country: input.country,
              online: input.online,
              in_person: input.inPerson,
              booking_url: input.bookingUrl,
              years_experience: input.yearsExperience,
              credentials: input.credentials,
            },
            { onConflict: "user_id" },
          )
          .select("*")
          .single(),
      );
      await createAdminClient().from("profiles").update({ role: "tutor" }).eq("id", userId);
      return toTutor(row);
    },

    async removeTutor(userId) {
      const db = await createSessionClient();
      must(await db.from("tutors").delete().eq("user_id", userId).select("id"));
      await createAdminClient().from("profiles").update({ role: "student" }).eq("id", userId);
    },

    async saveReview(r) {
      const db = await createSessionClient();
      must(
        await db
          .from("tutor_reviews")
          .upsert({ tutor_id: r.tutorId, user_id: r.userId, user_name: r.userName, rating: r.rating, text: r.text }, { onConflict: "tutor_id,user_id" })
          .select("id"),
      );
    },

    async createTutoringRequest(req) {
      // Insert without reading back: the requester can't select rows they sent.
      must(
        await createAdminClient().from("tutoring_requests").insert({
          tutor_id: req.tutorId,
          user_id: req.userId,
          name: req.name,
          email: req.email,
          course_id: req.courseId,
          message: req.message,
          availability: req.availability,
        }),
      );
    },

    async listTutoringRequests(tutorId) {
      const db = await createSessionClient();
      return must(await db.from("tutoring_requests").select("*").eq("tutor_id", tutorId).order("created_at", { ascending: false })).map(toRequest);
    },

    async updateTutoringStatus(tutorId, id, status) {
      const db = await createSessionClient();
      must(await db.from("tutoring_requests").update({ status }).eq("id", id).eq("tutor_id", tutorId).select("id"));
    },

    async logReferral(ref) {
      must(await createAdminClient().from("referrals").insert({ partner_id: ref.partnerId, kind: ref.kind, user_id: ref.userId, course_id: ref.courseId }));
    },

    async referralCounts(partnerIds) {
      const rows = must(await createAdminClient().from("referrals").select("partner_id").in("partner_id", partnerIds).limit(100000));
      const out: Record<string, number> = Object.fromEntries(partnerIds.map((p) => [p, 0]));
      for (const r of rows as any[]) out[r.partner_id]++;
      return out;
    },

    async getDoc(collection, id) {
      const rows = must(await createAdminClient().from("docs").select("data").eq("collection", collection).eq("id", id).limit(1));
      return ((rows as any[])[0]?.data ?? null) as any;
    },

    async listDocs(collection, filter) {
      let q = createAdminClient().from("docs").select("data").eq("collection", collection);
      if (filter?.owner) q = q.eq("owner", filter.owner);
      return (must(await q.limit(10000)) as any[]).map((r) => r.data);
    },

    async putDoc(collection, id, data, owner = null) {
      const row: Record<string, unknown> = { collection, id, data, updated_at: new Date().toISOString() };
      if (owner) row.owner = owner;
      must(await createAdminClient().from("docs").upsert(row, { onConflict: "collection,id" }).select("id"));
    },

    async deleteDoc(collection, id) {
      must(await createAdminClient().from("docs").delete().eq("collection", collection).eq("id", id).select("id"));
    },
  };
}
