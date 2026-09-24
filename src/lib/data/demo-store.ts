import "server-only";
import { normalizeSchedule } from "@/lib/schedule-model";
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { HistoryEntry, Profile, Referral, Schedule, SiteStats, Tutor, TutoringRequest, TutorReview, UserState } from "@/lib/types";
import type { Store } from "./store";

/**
 * Local persistence for development and single-server hosting: one JSON file.
 * Production with real users uses the Supabase store instead.
 */

type LocalUser = { id: string; email: string; name: string; salt: string; hash: string };

type LocalState = {
  version: number;
  users: Record<string, LocalUser>;
  profiles: Record<string, Profile>;
  history: Record<string, Record<string, HistoryEntry>>;
  saves: Record<string, Record<string, string>>;
  votes: Record<string, Record<string, 1 | -1>>;
  mastered: Record<string, Record<string, string>>;
  schedules: Record<string, Schedule | null>;
  tutors: Record<string, Tutor>; // by tutor id
  reviews: TutorReview[];
  requests: TutoringRequest[];
  referrals: Referral[];
  docs?: Record<string, Record<string, { owner: string | null; data: unknown; updatedAt: string }>>;
};

const STATE_VERSION = 11;
const DATA_DIR = process.env.DEMO_DATA_DIR || (process.env.VERCEL ? "/tmp/merit" : path.join(process.cwd(), ".data"));
const FILE = path.join(DATA_DIR, "state.json");

function hashPassword(password: string, salt = randomBytes(16).toString("hex")) {
  return { salt, hash: scryptSync(password, salt, 32).toString("hex") };
}

export function verifyPassword(user: LocalUser, password: string) {
  const candidate = scryptSync(password, user.salt, 32);
  const actual = Buffer.from(user.hash, "hex");
  return actual.length === candidate.length && timingSafeEqual(actual, candidate);
}

const empty = (): LocalState => ({
  version: STATE_VERSION,
  users: {},
  profiles: {},
  history: {},
  saves: {},
  votes: {},
  mastered: {},
  schedules: {},
  tutors: {},
  reviews: [],
  requests: [],
  referrals: [],
});

let cache: LocalState | null = null;
let cacheMtime = 0;
let writing: Promise<void> = Promise.resolve();

async function load(): Promise<LocalState> {
  // Route handlers and pages can hold separate module instances in dev, so
  // reload whenever another instance has written a newer file.
  const mtime = await fs.stat(FILE).then((s) => s.mtimeMs, () => 0);
  if (cache && mtime <= cacheMtime) return cache;
  try {
    const parsed = JSON.parse(await fs.readFile(FILE, "utf8")) as LocalState;
    if (parsed.version === STATE_VERSION) {
      cache = parsed;
      cacheMtime = mtime;
      return cache;
    }
  } catch {
    // First run or unreadable file.
  }
  cache = empty();
  await persist();
  return cache;
}

function persist() {
  const snapshot = JSON.stringify(cache);
  writing = writing
    .then(async () => {
      await fs.mkdir(DATA_DIR, { recursive: true });
      const tmp = `${FILE}.${process.pid}.${randomUUID()}.tmp`;
      await fs.writeFile(tmp, snapshot);
      await fs.rename(tmp, FILE);
      cacheMtime = (await fs.stat(FILE)).mtimeMs;
    })
    .catch((err) => console.error("[store] failed to persist", err));
  return writing;
}

export async function localFindUserByEmail(email: string) {
  const s = await load();
  const e = email.trim().toLowerCase();
  return Object.values(s.users).find((u) => u.email === e) ?? null;
}

export async function localGetUser(id: string) {
  return (await load()).users[id] ?? null;
}

export async function localCreateUser(name: string, email: string, password: string) {
  const s = await load();
  const id = `user_${randomUUID()}`;
  s.users[id] = { id, name: name.trim(), email: email.trim().toLowerCase(), ...hashPassword(password) };
  await persist();
  return s.users[id];
}

export function createLocalStore(): Store {
  return {
    async siteStats() {
      const s = await load();
      const out: Record<string, SiteStats> = {};
      const get = (id: string) => (out[id] ??= { opens: 0, saves: 0, helpful: 0, notHelpful: 0 });
      for (const rows of Object.values(s.history)) for (const h of Object.values(rows)) get(h.videoId).opens += h.opens;
      for (const rows of Object.values(s.saves)) for (const id of Object.keys(rows)) get(id).saves += 1;
      for (const rows of Object.values(s.votes))
        for (const [id, v] of Object.entries(rows)) {
          if (v === 1) get(id).helpful += 1;
          else get(id).notHelpful += 1;
        }
      return out;
    },

    async getUserState(userId) {
      const s = await load();
      const profile = s.profiles[userId];
      if (!profile) return null;
      return structuredClone({
        profile: { ...profile, location: profile.location ?? null },
        history: s.history[userId] ?? {},
        saves: s.saves[userId] ?? {},
        votes: s.votes[userId] ?? {},
        mastered: s.mastered[userId] ?? {},
        schedule: normalizeSchedule(s.schedules[userId] ?? null),
      } satisfies UserState);
    },

    async ensureProfile(user) {
      const s = await load();
      if (!s.profiles[user.id]) {
        s.profiles[user.id] = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: "student",
          onboarded: false,
          courseIds: [],
          examDate: null,
          goal: null,
          focusTopicIds: [],
          location: null,
          createdAt: new Date().toISOString(),
        };
        await persist();
      }
      return structuredClone(s.profiles[user.id]);
    },

    async updateProfile(userId, patch) {
      const s = await load();
      if (!s.profiles[userId]) return;
      s.profiles[userId] = { ...s.profiles[userId], ...patch };
      if (patch.name && s.users[userId]) s.users[userId].name = patch.name;
      await persist();
    },

    async recordOpen(userId, videoId) {
      const s = await load();
      const rows = (s.history[userId] ??= {});
      const prev = rows[videoId];
      rows[videoId] = { videoId, openedAt: new Date().toISOString(), opens: (prev?.opens ?? 0) + 1 };
      await persist();
    },

    async toggleSave(userId, videoId) {
      const s = await load();
      const rows = (s.saves[userId] ??= {});
      const saved = !rows[videoId];
      if (saved) rows[videoId] = new Date().toISOString();
      else delete rows[videoId];
      await persist();
      return saved;
    },

    async setVote(userId, videoId, value) {
      const s = await load();
      const rows = (s.votes[userId] ??= {});
      if (value === 0) delete rows[videoId];
      else rows[videoId] = value;
      await persist();
    },

    async setMastered(userId, topicId, mastered) {
      const s = await load();
      const rows = (s.mastered[userId] ??= {});
      if (mastered) rows[topicId] = new Date().toISOString();
      else delete rows[topicId];
      await persist();
    },

    async clearHistory(userId) {
      const s = await load();
      s.history[userId] = {};
      await persist();
    },

    async setSchedule(userId, schedule) {
      const s = await load();
      s.schedules[userId] = schedule;
      await persist();
    },

    async listTutors() {
      return structuredClone(Object.values((await load()).tutors));
    },

    async listReviews(tutorId) {
      const s = await load();
      return structuredClone(tutorId ? s.reviews.filter((r) => r.tutorId === tutorId) : s.reviews);
    },

    async saveTutor(userId, input) {
      const s = await load();
      const existing = Object.values(s.tutors).find((t) => t.userId === userId);
      const tutor: Tutor = { ...input, id: existing?.id ?? `tutor_${randomUUID().slice(0, 12)}`, userId, createdAt: existing?.createdAt ?? new Date().toISOString() };
      s.tutors[tutor.id] = tutor;
      if (s.profiles[userId]) s.profiles[userId].role = "tutor";
      await persist();
      return structuredClone(tutor);
    },

    async removeTutor(userId) {
      const s = await load();
      for (const [id, t] of Object.entries(s.tutors)) if (t.userId === userId) delete s.tutors[id];
      if (s.profiles[userId]) s.profiles[userId].role = "student";
      await persist();
    },

    async saveReview(review) {
      const s = await load();
      s.reviews = s.reviews.filter((r) => !(r.tutorId === review.tutorId && r.userId === review.userId));
      s.reviews.unshift({ ...review, id: `rev_${randomUUID()}`, createdAt: new Date().toISOString() });
      await persist();
    },

    async createTutoringRequest(req) {
      const s = await load();
      s.requests.unshift({ ...req, id: `req_${randomUUID()}`, status: "new", createdAt: new Date().toISOString() });
      await persist();
    },

    async listTutoringRequests(tutorId) {
      return structuredClone((await load()).requests.filter((r) => r.tutorId === tutorId));
    },

    async updateTutoringStatus(tutorId, id, status) {
      const s = await load();
      const r = s.requests.find((x) => x.id === id && x.tutorId === tutorId);
      if (r) r.status = status;
      await persist();
    },

    async logReferral(ref) {
      const s = await load();
      s.referrals.push({ ...ref, id: `ref_${randomUUID()}`, createdAt: new Date().toISOString() });
      await persist();
    },

    async referralCounts(partnerIds) {
      const s = await load();
      const out: Record<string, number> = Object.fromEntries(partnerIds.map((p) => [p, 0]));
      for (const r of s.referrals) if (r.partnerId in out) out[r.partnerId]++;
      return out;
    },

    async getDoc<T>(collection: string, id: string) {
      const row = (await load()).docs?.[collection]?.[id];
      return row ? (structuredClone(row.data) as T) : null;
    },

    async listDocs<T>(collection: string, filter?: { owner?: string }) {
      const rows = Object.values((await load()).docs?.[collection] ?? {});
      return structuredClone(rows.filter((r) => !filter?.owner || r.owner === filter.owner).map((r) => r.data)) as T[];
    },

    async putDoc(collection, id, data, owner = null) {
      const s = await load();
      const col = ((s.docs ??= {})[collection] ??= {});
      col[id] = { owner: owner ?? col[id]?.owner ?? null, data: structuredClone(data), updatedAt: new Date().toISOString() };
      await persist();
    },

    async deleteDoc(collection, id) {
      const s = await load();
      if (s.docs?.[collection]) delete s.docs[collection][id];
      await persist();
    },
  };
}
