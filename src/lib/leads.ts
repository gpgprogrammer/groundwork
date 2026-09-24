import "server-only";
import { randomUUID } from "node:crypto";
import { getStore } from "@/lib/data/store";
import type { Lead } from "@/lib/types";

export const LEAD_WINDOW_DAYS = 365;

export async function createLead(l: Omit<Lead, "id" | "createdAt" | "status" | "reportedAt">) {
  const store = await getStore();
  const existing = (await store.listDocs<Lead>("leads")).find(
    (x) => x.tutorId === l.tutorId && ((l.studentId && x.studentId === l.studentId) || x.studentEmail === l.studentEmail.toLowerCase()),
  );
  if (existing) return existing;
  const lead: Lead = { ...l, studentEmail: l.studentEmail.toLowerCase(), id: `lead_${randomUUID().slice(0, 10)}`, createdAt: new Date().toISOString(), status: "open", reportedAt: null };
  await store.putDoc("leads", lead.id, lead);
  return lead;
}

export async function listLeads(filter: { tutorId?: string; studentId?: string } = {}) {
  return (await (await getStore()).listDocs<Lead>("leads"))
    .filter((l) => (!filter.tutorId || l.tutorId === filter.tutorId) && (!filter.studentId || l.studentId === filter.studentId))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function saveLead(l: Lead) {
  await (await getStore()).putDoc("leads", l.id, l);
}

/** Leads old enough to ask the student how it went. */
export function dueForCheckIn(leads: Lead[], now = Date.now()) {
  return leads.filter((l) => l.status === "open" && now - new Date(l.createdAt).getTime() > 2 * 86400000);
}
