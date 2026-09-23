import "server-only";
import { randomUUID, scryptSync, randomBytes, timingSafeEqual } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { buildCatalog } from "@/lib/catalog/build";
import { PLAN } from "@/lib/env";
import type { Educator, Profile, Progress, Subscription, TutoringRequest, UserState, Video } from "@/lib/types";
import {
  applyOverlay,
  emptySubscription,
  type CatalogOverlay,
  type EducatorPatch,
  type StatDelta,
  type Store,
} from "./store";

/**
 * Demo mode persistence: a single JSON file. It gives every flow (auth, progress,
 * saves, votes, billing, tutoring, creator uploads) real, durable behavior
 * locally, with zero setup. Production uses the Supabase store instead.
 */

type DemoUser = { id: string; email: string; name: string; salt: string; hash: string };

type DemoState = {
  version: number;
  users: Record<string, DemoUser>;
  profiles: Record<string, Profile>;
  progress: Record<string, Record<string, Progress>>;
  saves: Record<string, Record<string, string>>;
  votes: Record<string, Record<string, 1 | -1>>;
  subscriptions: Record<string, Subscription>;
  tutoring: TutoringRequest[];
  videos: Video[];
  educators: Educator[];
  educatorPatches: Record<string, EducatorPatch>;
};

const STATE_VERSION = 5;
const DATA_DIR = process.env.DEMO_DATA_DIR || (process.env.VERCEL ? "/tmp/groundwork" : path.join(process.cwd(), ".data"));
const FILE = path.join(DATA_DIR, "demo-state.json");

export const DEMO_ACCOUNTS = {
  student: { email: "maya@demo.groundwork.study", password: "groundwork", name: "Maya Alvarez" },
  creator: { email: "sarah@demo.groundwork.study", password: "groundwork", name: "Sarah Chen" },
} as const;

function hashPassword(password: string, salt = randomBytes(16).toString("hex")) {
  return { salt, hash: scryptSync(password, salt, 32).toString("hex") };
}

export function verifyPassword(user: DemoUser, password: string) {
  const candidate = scryptSync(password, user.salt, 32);
  const actual = Buffer.from(user.hash, "hex");
  return actual.length === candidate.length && timingSafeEqual(actual, candidate);
}

const daysFromNow = (d: number) => new Date(Date.now() + d * 86400000).toISOString();

function seedState(): DemoState {
  const catalog = buildCatalog();
  const state: DemoState = {
    version: STATE_VERSION,
    users: {},
    profiles: {},
    progress: {},
    saves: {},
    votes: {},
    subscriptions: {},
    tutoring: [],
    videos: [],
    educators: [],
    educatorPatches: {},
  };

  const maya = { id: "user_demo_maya", ...DEMO_ACCOUNTS.student };
  const sarah = { id: "user_demo_sarah", ...DEMO_ACCOUNTS.creator };
  for (const u of [maya, sarah]) {
    state.users[u.id] = { id: u.id, email: u.email, name: u.name, ...hashPassword(u.password) };
  }

  state.profiles[maya.id] = {
    id: maya.id,
    email: maya.email,
    name: maya.name,
    role: "student",
    educatorId: null,
    onboarded: true,
    courseIds: ["ap-calculus-bc", "ap-world-history", "sat-math"],
    examDate: "2027-05-10",
    goal: "Score a 5 on Calc BC",
    dailyMinutes: 30,
    createdAt: daysFromNow(-12),
    trialEndsAt: daysFromNow(PLAN.trialDays - 12),
  };
  state.profiles[sarah.id] = {
    id: sarah.id,
    email: sarah.email,
    name: sarah.name,
    role: "creator",
    educatorId: "edu_sarah-chen",
    onboarded: true,
    courseIds: ["ap-calculus-bc", "sat-math"],
    examDate: null,
    goal: null,
    dailyMinutes: null,
    createdAt: daysFromNow(-240),
    trialEndsAt: daysFromNow(-210),
  };
  state.subscriptions[maya.id] = emptySubscription();
  state.subscriptions[sarah.id] = emptySubscription();

  // Maya's history: partway through derivatives, a little AP World and SAT Math.
  const byTopic = (slug: string) => catalog.videos.filter((v) => v.topicId === slug);
  const watched: [string, number, number][] = [
    ["power-rule", 0, 1],
    ["product-and-quotient-rules", 0, 1],
    ["chain-rule", 0, 1],
    ["chain-rule", 1, 0.42],
    ["implicit-differentiation", 0, 0.63],
    ["champa-rice", 0, 1],
    ["silk-roads", 0, 0.3],
    ["quadratic-forms", 0, 1],
    ["percent-change", 0, 0.8],
  ];
  state.progress[maya.id] = {};
  state.saves[maya.id] = {};
  state.votes[maya.id] = {};
  watched.forEach(([slug, idx, frac], i) => {
    const v = byTopic(slug)[idx];
    if (!v) return;
    state.progress[maya.id][v.id] = {
      videoId: v.id,
      position: frac >= 1 ? 0 : Math.round(v.durationSec * frac),
      secondsWatched: Math.round(v.durationSec * frac),
      duration: v.durationSec,
      completed: frac >= 0.9,
      watchCount: 1,
      updatedAt: new Date(Date.now() - (watched.length - i) * 3600_000 * 7).toISOString(),
    };
    if (frac >= 1 && i % 2 === 0) state.votes[maya.id][v.id] = 1;
  });
  for (const [slug, idx] of [["chain-rule", 0], ["champa-rice", 0], ["related-rates", 0], ["lhopitals-rule", 0]] as const) {
    const v = byTopic(slug)[idx];
    if (v) state.saves[maya.id][v.id] = daysFromNow(-3);
  }

  const reqs: [string, string, string, string, number][] = [
    ["Jonah Park", "jonah.p@example.com", "My BC exam is in May and I keep freezing on series FRQs, especially Lagrange error. Could we do weekly sessions through April?", "Weeknights after 6pm PT", -0.2],
    ["Leila Haddad", "leila.h@example.com", "Your chain rule lesson finally clicked for me. I'd love help with related rates before my unit test on Friday.", "Wednesday or Thursday afternoon", -1.3],
    ["Chris Nguyen (parent)", "c.nguyen@example.com", "Looking for SAT Math help for my daughter, currently at 640 and aiming for 740+. Is a 6-week plan realistic?", "Weekends", -4],
  ];
  state.tutoring = reqs.map(([name, email, message, availability, days], i) => ({
    id: `treq_seed_${i}`,
    educatorId: "edu_sarah-chen",
    userId: null,
    name,
    email,
    courseId: i === 2 ? "sat-math" : "ap-calculus-bc",
    message,
    availability,
    status: i === 2 ? "replied" : "new",
    createdAt: daysFromNow(days),
    sourceVideoId: i === 1 ? (byTopic("chain-rule")[0]?.id ?? null) : null,
  }));

  return state;
}

let cache: DemoState | null = null;
let cacheMtime = 0;
let writing: Promise<void> = Promise.resolve();

async function load(): Promise<DemoState> {
  // Route handlers and pages can hold separate module instances in dev, so
  // reload whenever another instance has written a newer file.
  const mtime = await fs.stat(FILE).then((s) => s.mtimeMs, () => 0);
  if (cache && mtime <= cacheMtime) return cache;
  try {
    const parsed = JSON.parse(await fs.readFile(FILE, "utf8")) as DemoState;
    if (parsed.version === STATE_VERSION) {
      cache = parsed;
      cacheMtime = mtime;
      return cache;
    }
  } catch {
    // First run or unreadable file: fall through and reseed.
  }
  cache = seedState();
  await persist();
  return cache;
}

function persist() {
  const snapshot = JSON.stringify(cache);
  writing = writing
    .then(async () => {
      await fs.mkdir(DATA_DIR, { recursive: true });
      const tmp = `${FILE}.${process.pid}.tmp`;
      await fs.writeFile(tmp, snapshot);
      await fs.rename(tmp, FILE);
      cacheMtime = (await fs.stat(FILE)).mtimeMs;
    })
    .catch((err) => console.error("[demo-store] failed to persist", err));
  return writing;
}

const emptyDelta = (): StatDelta => ({
  views: 0,
  completions: 0,
  watchFractionSum: 0,
  helpful: 0,
  notHelpful: 0,
  saves: 0,
  rewatches: 0,
});

export async function demoFindUserByEmail(email: string) {
  const s = await load();
  const e = email.trim().toLowerCase();
  return Object.values(s.users).find((u) => u.email === e) ?? null;
}

export async function demoGetUser(id: string) {
  const s = await load();
  return s.users[id] ?? null;
}

export async function demoCreateUser(name: string, email: string, password: string) {
  const s = await load();
  const id = `user_${randomUUID()}`;
  s.users[id] = { id, name: name.trim(), email: email.trim().toLowerCase(), ...hashPassword(password) };
  await persist();
  return s.users[id];
}

export function createDemoStore(): Store {
  return {
    async loadCatalog() {
      const s = await load();
      const deltas: Record<string, StatDelta> = {};
      const d = (id: string) => (deltas[id] ??= emptyDelta());
      for (const rows of Object.values(s.progress)) {
        for (const p of Object.values(rows)) {
          const x = d(p.videoId);
          x.views += 1;
          x.completions += p.completed ? 1 : 0;
          x.watchFractionSum += p.duration ? Math.min(1, p.secondsWatched / p.duration) : 0;
          x.rewatches += p.watchCount > 1 ? 1 : 0;
        }
      }
      for (const rows of Object.values(s.saves)) {
        for (const id of Object.keys(rows)) d(id).saves += 1;
      }
      for (const rows of Object.values(s.votes)) {
        for (const [id, v] of Object.entries(rows)) {
          if (v === 1) d(id).helpful += 1;
          else d(id).notHelpful += 1;
        }
      }
      const overlay: CatalogOverlay = {
        extraVideos: s.videos,
        extraEducators: s.educators,
        educatorPatches: s.educatorPatches as Record<string, Partial<Educator>>,
        deltas,
      };
      return applyOverlay(buildCatalog(), overlay);
    },

    async getUserState(userId) {
      const s = await load();
      const profile = s.profiles[userId];
      if (!profile) return null;
      const state: UserState = {
        profile,
        progress: s.progress[userId] ?? {},
        saves: s.saves[userId] ?? {},
        votes: s.votes[userId] ?? {},
        subscription: s.subscriptions[userId] ?? emptySubscription(),
      };
      return structuredClone(state);
    },

    async ensureProfile(user) {
      const s = await load();
      if (!s.profiles[user.id]) {
        s.profiles[user.id] = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: "student",
          educatorId: null,
          onboarded: false,
          courseIds: [],
          examDate: null,
          goal: null,
          dailyMinutes: null,
          createdAt: new Date().toISOString(),
          trialEndsAt: daysFromNow(PLAN.trialDays),
        };
        s.subscriptions[user.id] = emptySubscription();
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

    async recordProgress(userId, videoId, { position, duration, watchedDelta }) {
      const s = await load();
      const rows = (s.progress[userId] ??= {});
      const prev = rows[videoId];
      const secondsWatched = Math.min(duration * 3, (prev?.secondsWatched ?? 0) + Math.max(0, watchedDelta));
      // Completion needs real watching, not just a seek to the end.
      const finished = position >= duration * 0.9 && secondsWatched >= duration * 0.5;
      const next: Progress = {
        videoId,
        duration,
        position: finished ? 0 : Math.max(0, Math.min(position, duration)),
        secondsWatched,
        completed: Boolean(prev?.completed) || finished,
        watchCount: prev ? prev.watchCount + (prev.position === 0 && prev.completed && position < 15 ? 1 : 0) : 1,
        updatedAt: new Date().toISOString(),
      };
      rows[videoId] = next;
      await persist();
      return next;
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

    async clearHistory(userId) {
      const s = await load();
      s.progress[userId] = {};
      await persist();
    },

    async setSubscription(userId, sub) {
      const s = await load();
      s.subscriptions[userId] = sub;
      await persist();
    },

    async findUserIdByStripeCustomer(customerId) {
      const s = await load();
      return Object.entries(s.subscriptions).find(([, sub]) => sub.stripeCustomerId === customerId)?.[0] ?? null;
    },

    async createTutoringRequest(req) {
      const s = await load();
      const row: TutoringRequest = { ...req, id: `treq_${randomUUID()}`, status: "new", createdAt: new Date().toISOString() };
      s.tutoring.unshift(row);
      await persist();
      return row;
    },

    async listTutoringRequests(educatorId) {
      const s = await load();
      return structuredClone(s.tutoring.filter((r) => r.educatorId === educatorId));
    },

    async updateTutoringStatus(educatorId, id, status) {
      const s = await load();
      const row = s.tutoring.find((r) => r.id === id && r.educatorId === educatorId);
      if (row) row.status = status;
      await persist();
    },

    async createVideo(video) {
      const s = await load();
      s.videos.push(video);
      await persist();
    },

    async patchEducator(educatorId, patch) {
      const s = await load();
      s.educatorPatches[educatorId] = { ...s.educatorPatches[educatorId], ...patch };
      await persist();
    },

    async listDrafts(educatorId) {
      const s = await load();
      return structuredClone(s.videos.filter((v) => v.educatorId === educatorId && v.status === "draft"));
    },

    async createEducator(ownerId, educator) {
      const s = await load();
      s.educators.push(educator);
      if (s.profiles[ownerId]) s.profiles[ownerId] = { ...s.profiles[ownerId], role: "creator", educatorId: educator.id };
      await persist();
    },
  };
}
