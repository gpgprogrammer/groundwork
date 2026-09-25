import "server-only";
import { plusAccess } from "@/lib/billing/access";
import { getCatalog } from "@/lib/catalog";
import { getStore } from "@/lib/data/store";
import { isSupabaseEnabled } from "@/lib/env";
import { normalizeSchedule } from "@/lib/schedule-model";
import { createAdminClient } from "@/lib/supabase/server";
import type { Billing, Educator, Profile } from "@/lib/types";

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
