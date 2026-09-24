import "server-only";
import { TUTOR_COMMISSION } from "@/lib/billing/plans";
import { getStore } from "@/lib/data/store";
import type { Booking, TutorMeta } from "@/lib/types";

export const defaultMeta = (tutorId: string): TutorMeta => ({
  tutorId,
  agreedAt: null,
  commissionRate: TUTOR_COMMISSION,
  vetted: false,
  stripeAccountId: null,
  payoutsEnabled: false,
  availability: [],
  timezone: "America/New_York",
});

export async function getTutorMeta(tutorId: string) {
  return { ...defaultMeta(tutorId), ...((await (await getStore()).getDoc<TutorMeta>("tutorMeta", tutorId)) ?? {}) };
}

export async function allTutorMeta() {
  const rows = await (await getStore()).listDocs<TutorMeta>("tutorMeta");
  return new Map(rows.map((m) => [m.tutorId, { ...defaultMeta(m.tutorId), ...m }]));
}

export async function saveTutorMeta(meta: TutorMeta) {
  await (await getStore()).putDoc("tutorMeta", meta.tutorId, meta);
}

export async function listBookings(filter: { tutorId?: string; studentId?: string } = {}) {
  const all = await (await getStore()).listDocs<Booking>("bookings");
  return all
    .filter((b) => (!filter.tutorId || b.tutorId === filter.tutorId) && (!filter.studentId || b.studentId === filter.studentId))
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt));
}

export async function getBooking(id: string) {
  return (await getStore()).getDoc<Booking>("bookings", id);
}

export async function saveBooking(b: Booking) {
  await (await getStore()).putDoc("bookings", b.id, b, b.studentId ?? undefined);
}

// ── Time zones without a library ─────────────────────────────────────────────

/** Minutes the zone is ahead of UTC at a moment. */
function offsetMinutes(at: number, tz: string) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" })
      .formatToParts(new Date(at))
      .map((p) => [p.type, p.value]),
  );
  const asUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
  return Math.round((asUtc - at) / 60000);
}

/** "2026-10-02" + "16:30" in a zone → the UTC instant. */
export function zonedToUtc(date: string, time: string, tz: string) {
  const [y, m, d] = date.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  const guess = Date.UTC(y, m - 1, d, h, mi);
  const first = guess - offsetMinutes(guess, tz) * 60000;
  return first - (offsetMinutes(first, tz) - offsetMinutes(guess, tz)) * 60000;
}

export function validTimeZone(tz: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
const fromMin = (n: number) => `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;

export type DaySlots = { date: string; label: string; times: { time: string; iso: string }[] };

/** Open 30-minute start times over the next `days`, in the tutor's zone, skipping booked times. */
export function openSlots(meta: TutorMeta, booked: Booking[], minutes: number, days = 21, now = Date.now()): DaySlots[] {
  const tz = validTimeZone(meta.timezone) ? meta.timezone : "America/New_York";
  const taken = booked
    .filter((b) => b.status === "requested" || b.status === "confirmed")
    .map((b) => [new Date(b.startsAt).getTime(), new Date(b.startsAt).getTime() + b.minutes * 60000] as const);
  const out: DaySlots[] = [];
  const fmtDate = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" });
  const fmtLabel = new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short", month: "short", day: "numeric" });
  const fmtDow = new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short" });
  const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  for (let i = 0; i < days; i++) {
    const at = now + i * 86400000;
    const date = fmtDate.format(new Date(at));
    const dow = DOW.indexOf(fmtDow.format(new Date(at)));
    const times: DaySlots["times"] = [];
    for (const w of meta.availability.filter((a) => a.day === dow)) {
      for (let t = toMin(w.start); t + minutes <= toMin(w.end); t += 30) {
        const start = zonedToUtc(date, fromMin(t), tz);
        const end = start + minutes * 60000;
        if (start < now + 12 * 3600000) continue; // at least 12 hours' notice
        if (taken.some(([a, b]) => start < b && end > a)) continue;
        times.push({ time: fromMin(t), iso: new Date(start).toISOString() });
      }
    }
    if (times.length) out.push({ date, label: fmtLabel.format(new Date(at)), times });
  }
  return out;
}

export function formatInZone(iso: string, tz: string) {
  return new Intl.DateTimeFormat("en-US", { timeZone: validTimeZone(tz) ? tz : "America/New_York", weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" }).format(new Date(iso));
}

/** What the tutor has earned and what they owe Merit. */
export function ledger(bookings: Booking[]) {
  const done = bookings.filter((b) => b.status === "completed" || (b.payment === "merit" && b.paid));
  const gross = done.reduce((s, b) => s + b.amount, 0);
  const fees = done.reduce((s, b) => s + b.fee, 0);
  const owed = bookings.filter((b) => b.status === "completed" && b.payment === "direct" && !b.feeSettled);
  return { sessions: done.length, gross, fees, net: gross - fees, owed, owedTotal: owed.reduce((s, b) => s + b.fee, 0) };
}
