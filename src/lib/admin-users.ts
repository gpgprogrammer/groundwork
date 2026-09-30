import "server-only";
import { plusAccess } from "@/lib/billing/access";
import { getCatalog } from "@/lib/catalog";
import { getStore } from "@/lib/data/store";
import { isStripeEnabled, isSupabaseEnabled } from "@/lib/env";
import { normalizeSchedule } from "@/lib/schedule-model";
import { createAdminClient } from "@/lib/supabase/server";
import type { Billing, Educator, Profile } from "@/lib/types";
import { removeUserObjects } from "@/lib/uploads";

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  signedUpAt: string;
  lastSignInAt: string | null;
  method: string;
  confirmed: boolean;
  onboarded: boolean;
  roles: ("student" | "tutor" | "teacher" | "admin")[];
  courses: string[];
  plan: "Plus (paid)" | "Plus trial" | "Free";
  sprint: "Pass" | "Trial" | null;
  calendar: boolean;
};

/** Everyone who has signed up, newest first, with what they've set up. Admin only. */
export async function listAdminUsers(adminEmails: string[]): Promise<AdminUser[]> {
  if (!isSupabaseEnabled) return [];
  const db = createAdminClient();
  const authUsers: { id: string; email?: string; created_at: string; last_sign_in_at?: string | null; email_confirmed_at?: string | null; app_metadata?: { provider?: string; providers?: string[] }; user_metadata?: { name?: string; full_name?: string; account_type?: string } }[] = [];
  for (let page = 1; page < 100; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error(error.message);
    authUsers.push(...data.users);
    if (data.users.length < 1000) break;
  }
  const store = await getStore();
  const [profiles, schedules, billing, educators, tutors, catalog] = await Promise.all([
    db.from("profiles").select("id,name,role,onboarded,course_ids").limit(100000).then((r) => r.data ?? []),
    db.from("schedules").select("user_id,data").limit(100000).then((r) => r.data ?? []),
    store.listDocs<Billing>("billing"),
    store.listDocs<Educator>("educators"),
    store.listTutors(),
    getCatalog(),
  ]);
  const prof = new Map(profiles.map((p) => [p.id as string, p]));
  const cal = new Set(schedules.filter((s) => normalizeSchedule(s.data)?.sources.length).map((s) => s.user_id as string));
  const bill = new Map(billing.map((b) => [b.userId, b]));
  const teachers = new Set(educators.map((e) => e.id));
  const tutorIds = new Set(tutors.map((t) => t.userId));
  const now = Date.now();

  return authUsers
    .map((u) => {
      const p = prof.get(u.id);
      const b = bill.get(u.id) ?? null;
      const access = plusAccess({ createdAt: u.created_at } as Profile, b, now);
      const email = (u.email ?? "").toLowerCase();
      const roles: AdminUser["roles"] = [];
      if (tutorIds.has(u.id) || p?.role === "tutor") roles.push("tutor");
      if (teachers.has(u.id) || u.user_metadata?.account_type === "teacher") roles.push("teacher");
      if (!roles.length) roles.push("student");
      if (adminEmails.includes(email)) roles.push("admin");
      const trialLive = Boolean(b?.sprintTrialEndsAt && new Date(b.sprintTrialEndsAt).getTime() > now);
      return {
        id: u.id,
        email,
        name: (p?.name as string) || u.user_metadata?.full_name || u.user_metadata?.name || "",
        signedUpAt: u.created_at,
        lastSignInAt: u.last_sign_in_at ?? null,
        method: u.app_metadata?.provider === "email" || !u.app_metadata?.provider ? "Email" : u.app_metadata.provider[0].toUpperCase() + u.app_metadata.provider.slice(1),
        confirmed: Boolean(u.email_confirmed_at),
        onboarded: Boolean(p?.onboarded),
        roles,
        courses: ((p?.course_ids as string[]) ?? []).map((id) => catalog.course(id)?.shortTitle ?? id),
        plan: access.kind === "active" ? "Plus (paid)" : access.kind === "trial" ? "Plus trial" : "Free",
        sprint: b?.sprintPass ? "Pass" : trialLive ? "Trial" : null,
        calendar: cal.has(u.id),
      } satisfies AdminUser;
    })
    .sort((a, b) => b.signedUpAt.localeCompare(a.signedUpAt));
}

export const FILTERS = {
  all: { label: "Everyone", test: () => true },
  students: { label: "Students", test: (u: AdminUser) => u.roles.includes("student") },
  tutors: { label: "Tutors", test: (u: AdminUser) => u.roles.includes("tutor") },
  teachers: { label: "Teachers", test: (u: AdminUser) => u.roles.includes("teacher") },
  paid: { label: "Paid Plus", test: (u: AdminUser) => u.plan === "Plus (paid)" },
  sprint: { label: "Exam Sprint", test: (u: AdminUser) => u.sprint !== null },
  calendar: { label: "Calendar connected", test: (u: AdminUser) => u.calendar },
  unfinished: { label: "Didn't finish setup", test: (u: AdminUser) => !u.onboarded },
} as const;
export type FilterKey = keyof typeof FILTERS;

export function filterUsers(users: AdminUser[], q: string, filter: FilterKey) {
  const needle = q.trim().toLowerCase();
  return users.filter((u) => FILTERS[filter].test(u) && (!needle || u.email.includes(needle) || u.name.toLowerCase().includes(needle)));
}

export type RemoveAdminUserResult = { ok: true } | { ok: false; error: string };

/** Permanently removes a non-admin account and the data owned by it. */
export async function removeAdminUserAccount(input: { actorId: string; targetId: string; adminEmails: string[] }): Promise<RemoveAdminUserResult> {
  if (!isSupabaseEnabled) return { ok: false, error: "Account removal is only available when the live database is connected." };
  if (input.actorId === input.targetId) return { ok: false, error: "You cannot remove your own admin account." };

  const db = createAdminClient();
  const { data, error } = await db.auth.admin.getUserById(input.targetId);
  if (error || !data.user) return { ok: false, error: "That account no longer exists." };
  const email = (data.user.email ?? "").trim().toLowerCase();
  if (input.adminEmails.includes(email)) return { ok: false, error: "Admin accounts are protected and cannot be removed here." };

  const store = await getStore();
  const [billing, planPrefs, tutor] = await Promise.all([
    store.getDoc<Billing>("billing", input.targetId),
    store.getDoc<{ feedToken?: string }>("planPrefs", input.targetId),
    store.listTutors().then((tutors) => tutors.find((item) => item.userId === input.targetId) ?? null),
  ]);

  // Supabase will not delete an auth user while that user owns Storage files.
  try {
    await removeUserObjects(input.targetId);
  } catch (error) {
    console.error("[admin-users] upload cleanup failed", error);
    return { ok: false, error: "This account's uploaded files could not be removed. Try again." };
  }

  const hasLiveStripeSubscription = billing?.plus.source === "stripe" && (billing.plus.status === "active" || billing.plus.status === "past_due");
  const subscriptionId = hasLiveStripeSubscription ? billing.plus.stripeSubscriptionId : null;
  if (hasLiveStripeSubscription && !subscriptionId) {
    return { ok: false, error: "Cancel this account's active Stripe subscription before removing it." };
  }
  if (subscriptionId) {
    if (!isStripeEnabled) return { ok: false, error: "Cancel this account's active Stripe subscription before removing it." };
    try {
      const { getStripe } = await import("@/lib/billing/stripe");
      await getStripe().subscriptions.cancel(subscriptionId);
    } catch (error) {
      if ((error as { code?: string }).code === "resource_missing") {
        console.warn(`[admin-users] Stripe subscription ${subscriptionId} was already removed`);
      } else {
        console.error("[admin-users] subscription cancellation failed", error);
        return { ok: false, error: "The paid subscription could not be canceled, so the account was not removed. Try again." };
      }
    }
    if (billing) {
      await store.putDoc("billing", input.targetId, { ...billing, plus: { ...billing.plus, status: "canceled", cancelAtPeriodEnd: false } }, input.targetId);
    }
  }

  const { error: deleteError } = await db.auth.admin.deleteUser(input.targetId);
  if (deleteError) {
    console.error("[admin-users] auth account deletion failed", deleteError);
    return { ok: false, error: "The account could not be removed. Try again." };
  }

  await Promise.all([
    planPrefs?.feedToken ? store.deleteDoc("planFeeds", planPrefs.feedToken) : Promise.resolve(),
    tutor ? store.deleteDoc("tutorMeta", tutor.id) : Promise.resolve(),
  ]).catch((cleanupError) => console.error("[admin-users] post-deletion cleanup failed", cleanupError));

  return { ok: true };
}
