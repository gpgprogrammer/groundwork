import "server-only";
import { PLAN } from "@/lib/env";
import { createAdminClient, createPublicClient, createSessionClient } from "@/lib/supabase/server";
import type { Catalog, Profile, Progress, Subscription, TutoringRequest, Video } from "@/lib/types";
import { emptySubscription, type Store } from "./store";

/* eslint-disable @typescript-eslint/no-explicit-any -- rows are mapped explicitly below */

const CATALOG_TTL_MS = 60_000;
let catalogCache: { at: number; value: Promise<Catalog> } | null = null;

function must<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

const toProfile = (r: any): Profile => ({
  id: r.id,
  email: r.email,
  name: r.name,
  role: r.role,
  educatorId: r.educator_id,
  onboarded: r.onboarded,
  courseIds: r.course_ids ?? [],
  examDate: r.exam_date,
  goal: r.goal,
  dailyMinutes: r.daily_minutes,
  createdAt: r.created_at,
  trialEndsAt: r.trial_ends_at,
});

const toProgress = (r: any): Progress => ({
  videoId: r.video_id,
  position: r.position,
  secondsWatched: r.seconds_watched,
  duration: r.duration,
  completed: r.completed,
  watchCount: r.watch_count,
  updatedAt: r.updated_at,
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

const toTutoring = (r: any): TutoringRequest => ({
  id: r.id,
  educatorId: r.educator_id,
  userId: r.user_id,
  name: r.name,
  email: r.email,
  courseId: r.course_id,
  message: r.message,
  availability: r.availability,
  status: r.status,
  createdAt: r.created_at,
  sourceVideoId: r.source_video_id,
});

async function fetchCatalog(): Promise<Catalog> {
  const db = createPublicClient();
  const [courses, units, concepts, topics, educators, videos, stats] = await Promise.all([
    db.from("courses").select("*").order("position"),
    db.from("units").select("*").order("position"),
    db.from("concepts").select("*").order("position"),
    db.from("topics").select("id, concept_id, unit_id, course_id, slug, title, summary, glyph, key_points, aliases, position").order("position"),
    db.from("educators").select("*"),
    db.from("videos").select("*").eq("status", "published").limit(10000),
    db.from("video_stats").select("*").limit(10000),
  ]);
  const statRows = new Map<string, any>(must(stats).map((s: any) => [s.video_id, s]));

  return {
    courses: must(courses).map((r: any) => ({
      id: r.id, slug: r.slug, title: r.title, shortTitle: r.short_title, exam: r.exam, subject: r.subject,
      description: r.description, hue: r.hue, examMonth: r.exam_month,
    })),
    units: must(units).map((r: any) => ({ id: r.id, courseId: r.course_id, slug: r.slug, title: r.title, order: r.position, summary: r.summary })),
    concepts: must(concepts).map((r: any) => ({ id: r.id, unitId: r.unit_id, courseId: r.course_id, slug: r.slug, title: r.title, order: r.position })),
    topics: must(topics).map((r: any) => ({
      id: r.id, conceptId: r.concept_id, unitId: r.unit_id, courseId: r.course_id, slug: r.slug, title: r.title,
      summary: r.summary, glyph: r.glyph, keyPoints: r.key_points, aliases: r.aliases, order: r.position,
    })),
    educators: must(educators).map((r: any) => ({
      id: r.id, handle: r.handle, name: r.name, firstName: String(r.name).split(" ")[0], headline: r.headline, bio: r.bio,
      subjects: r.subjects, courseIds: r.course_ids, credentials: r.credentials, rating: Number(r.rating),
      ratingCount: r.rating_count, hourlyRate: r.hourly_rate, yearsTeaching: r.years_teaching, location: r.location,
      responseTime: r.response_time, acceptingStudents: r.accepting_students, bookingUrl: r.booking_url, hue: r.hue,
    })),
    videos: must(videos).map((r: any): Video => {
      const s = statRows.get(r.id);
      return {
        id: r.id, topicId: r.topic_id, educatorId: r.educator_id, title: r.title, description: r.description,
        style: r.style, durationSec: r.duration_sec, publishedAt: r.published_at, chapters: r.chapters ?? [],
        mediaUrl: r.media_url, status: r.status,
        stats: {
          views: Number(s?.views ?? 0),
          completions: Number(s?.completions ?? 0),
          avgWatchFraction: Number(s?.avg_watch_fraction ?? 0),
          helpful: Number(s?.helpful ?? 0),
          notHelpful: Number(s?.not_helpful ?? 0),
          saves: Number(s?.saves ?? 0),
          rewatchRate: Number(s?.rewatch_rate ?? 0),
          earlyDropRate: Number(s?.early_drop_rate ?? 0.3),
        },
      };
    }),
  };
}

export function createSupabaseStore(): Store {
  const invalidate = () => {
    catalogCache = null;
  };

  return {
    async loadCatalog() {
      if (!catalogCache || Date.now() - catalogCache.at > CATALOG_TTL_MS) {
        const value = fetchCatalog();
        catalogCache = { at: Date.now(), value };
        value.catch(invalidate);
      }
      return catalogCache.value;
    },

    async getUserState(userId) {
      const db = await createSessionClient();
      const [profile, progress, saves, votes, sub] = await Promise.all([
        db.from("profiles").select("*").eq("id", userId).maybeSingle(),
        db.from("progress").select("*").eq("user_id", userId),
        db.from("saves").select("video_id, created_at").eq("user_id", userId),
        db.from("votes").select("video_id, value").eq("user_id", userId),
        db.from("subscriptions").select("*").eq("user_id", userId).maybeSingle(),
      ]);
      const p = must(profile);
      if (!p) return null;
      return {
        profile: toProfile(p),
        progress: Object.fromEntries(must(progress).map((r: any) => [r.video_id, toProgress(r)])),
        saves: Object.fromEntries(must(saves).map((r: any) => [r.video_id, r.created_at])),
        votes: Object.fromEntries(must(votes).map((r: any) => [r.video_id, r.value])),
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
          .upsert({
            id: user.id,
            email: user.email,
            name: user.name,
            trial_ends_at: new Date(Date.now() + PLAN.trialDays * 86400000).toISOString(),
          })
          .select("*")
          .single(),
      );
      await admin.from("subscriptions").upsert({ user_id: user.id }, { onConflict: "user_id", ignoreDuplicates: true });
      return toProfile(row);
    },

    async updateProfile(userId, patch) {
      const userCols: Record<string, unknown> = {};
      const adminCols: Record<string, unknown> = {};
      if (patch.name !== undefined) userCols.name = patch.name;
      if (patch.onboarded !== undefined) userCols.onboarded = patch.onboarded;
      if (patch.courseIds !== undefined) userCols.course_ids = patch.courseIds;
      if (patch.examDate !== undefined) userCols.exam_date = patch.examDate;
      if (patch.goal !== undefined) userCols.goal = patch.goal;
      if (patch.dailyMinutes !== undefined) userCols.daily_minutes = patch.dailyMinutes;
      if (patch.role !== undefined) adminCols.role = patch.role;
      if (patch.educatorId !== undefined) adminCols.educator_id = patch.educatorId;
      if (patch.trialEndsAt !== undefined) adminCols.trial_ends_at = patch.trialEndsAt;
      if (Object.keys(userCols).length) {
        const db = await createSessionClient();
        must(await db.from("profiles").update(userCols).eq("id", userId).select("id"));
      }
      if (Object.keys(adminCols).length) {
        must(await createAdminClient().from("profiles").update(adminCols).eq("id", userId).select("id"));
      }
    },

    async recordProgress(userId, videoId, { position, duration, watchedDelta }) {
      const db = await createSessionClient();
      const prev = must(await db.from("progress").select("*").eq("user_id", userId).eq("video_id", videoId).maybeSingle()) as any;
      const secondsWatched = Math.round(Math.min(duration * 3, (prev?.seconds_watched ?? 0) + Math.max(0, watchedDelta)));
      // Completion needs real watching, not just a seek to the end.
      const finished = position >= duration * 0.9 && secondsWatched >= duration * 0.5;
      const row = {
        user_id: userId,
        video_id: videoId,
        duration: Math.round(duration),
        position: finished ? 0 : Math.round(Math.max(0, Math.min(position, duration))),
        seconds_watched: secondsWatched,
        completed: Boolean(prev?.completed) || finished,
        watch_count: prev ? prev.watch_count + (prev.position === 0 && prev.completed && position < 15 ? 1 : 0) : 1,
        updated_at: new Date().toISOString(),
      };
      const saved = must(await db.from("progress").upsert(row).select("*").single());
      return toProgress(saved);
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

    async clearHistory(userId) {
      const db = await createSessionClient();
      must(await db.from("progress").delete().eq("user_id", userId).select("video_id"));
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
      const row = must(
        await createAdminClient().from("subscriptions").select("user_id").eq("stripe_customer_id", customerId).maybeSingle(),
      ) as any;
      return row?.user_id ?? null;
    },

    async createTutoringRequest(req) {
      const db = await createSessionClient();
      const row = {
        educator_id: req.educatorId,
        user_id: req.userId,
        name: req.name,
        email: req.email,
        course_id: req.courseId,
        message: req.message,
        availability: req.availability,
        source_video_id: req.sourceVideoId,
      };
      // Insert without reading back: the requester can't select rows they sent.
      must(await db.from("tutoring_requests").insert(row));
      return { ...req, id: "pending", status: "new", createdAt: new Date().toISOString() };
    },

    async listTutoringRequests(educatorId) {
      const db = await createSessionClient();
      const rows = must(await db.from("tutoring_requests").select("*").eq("educator_id", educatorId).order("created_at", { ascending: false }));
      return rows.map(toTutoring);
    },

    async updateTutoringStatus(educatorId, id, status) {
      const db = await createSessionClient();
      must(await db.from("tutoring_requests").update({ status }).eq("id", id).eq("educator_id", educatorId).select("id"));
    },

    async createVideo(video) {
      const db = await createSessionClient();
      must(
        await db
          .from("videos")
          .insert({
            id: video.id,
            topic_id: video.topicId,
            educator_id: video.educatorId,
            title: video.title,
            description: video.description,
            style: video.style,
            duration_sec: video.durationSec,
            published_at: video.publishedAt,
            chapters: video.chapters,
            media_url: video.mediaUrl,
            status: video.status,
          })
          .select("id"),
      );
      invalidate();
    },

    async patchEducator(educatorId, patch) {
      const db = await createSessionClient();
      const cols: Record<string, unknown> = {};
      if (patch.headline !== undefined) cols.headline = patch.headline;
      if (patch.bio !== undefined) cols.bio = patch.bio;
      if (patch.hourlyRate !== undefined) cols.hourly_rate = patch.hourlyRate;
      if (patch.acceptingStudents !== undefined) cols.accepting_students = patch.acceptingStudents;
      if (patch.bookingUrl !== undefined) cols.booking_url = patch.bookingUrl;
      if (patch.subjects !== undefined) cols.subjects = patch.subjects;
      must(await db.from("educators").update(cols).eq("id", educatorId).select("id"));
      invalidate();
    },

    async listDrafts(educatorId) {
      const db = await createSessionClient();
      const rows = must(await db.from("videos").select("*").eq("educator_id", educatorId).eq("status", "draft"));
      return rows.map(
        (r: any): Video => ({
          id: r.id, topicId: r.topic_id, educatorId: r.educator_id, title: r.title, description: r.description,
          style: r.style, durationSec: r.duration_sec, publishedAt: r.published_at, chapters: r.chapters ?? [],
          mediaUrl: r.media_url, status: r.status,
          stats: { views: 0, completions: 0, avgWatchFraction: 0, helpful: 0, notHelpful: 0, saves: 0, rewatchRate: 0, earlyDropRate: 0.3 },
        }),
      );
    },

    async createEducator(ownerId, e) {
      const admin = createAdminClient();
      must(
        await admin
          .from("educators")
          .insert({
            id: e.id, handle: e.handle, owner_id: ownerId, name: e.name, headline: e.headline, bio: e.bio,
            subjects: e.subjects, course_ids: e.courseIds, credentials: e.credentials, rating: 0, rating_count: 0,
            hourly_rate: e.hourlyRate, years_teaching: e.yearsTeaching, location: e.location,
            response_time: e.responseTime, accepting_students: e.acceptingStudents, booking_url: e.bookingUrl, hue: e.hue,
          })
          .select("id"),
      );
      must(await admin.from("profiles").update({ role: "creator", educator_id: e.id }).eq("id", ownerId).select("id"));
      invalidate();
    },
  };
}
