import "server-only";
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { PLAN } from "@/lib/env";
import type { HistoryEntry, Profile, Schedule, SiteStats, Subscription, UserState } from "@/lib/types";
import { emptySubscription, type Store } from "./store";

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
  subscriptions: Record<string, Subscription>;
};

const STATE_VERSION = 10;
const DATA_DIR = process.env.DEMO_DATA_DIR || (process.env.VERCEL ? "/tmp/groundwork" : path.join(process.cwd(), ".data"));
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
  subscriptions: {},
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
        profile,
        history: s.history[userId] ?? {},
        saves: s.saves[userId] ?? {},
        votes: s.votes[userId] ?? {},
        mastered: s.mastered[userId] ?? {},
        schedule: s.schedules[userId] ?? null,
        subscription: s.subscriptions[userId] ?? emptySubscription(),
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
          createdAt: new Date().toISOString(),
          trialEndsAt: new Date(Date.now() + PLAN.trialDays * 86400000).toISOString(),
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

    async setSubscription(userId, sub) {
      const s = await load();
      s.subscriptions[userId] = sub;
      await persist();
    },

    async findUserIdByStripeCustomer(customerId) {
      const s = await load();
      return Object.entries(s.subscriptions).find(([, sub]) => sub.stripeCustomerId === customerId)?.[0] ?? null;
    },
  };
}
