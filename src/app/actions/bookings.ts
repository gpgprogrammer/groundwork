"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { TUTOR_COMMISSION } from "@/lib/billing/plans";
import { getBooking, getTutorMeta, listBookings, openSlots, saveBooking, saveTutorMeta, validTimeZone } from "@/lib/bookings";
import { getCatalog } from "@/lib/catalog";
import { getStore } from "@/lib/data/store";
import type { Booking } from "@/lib/types";
import { getViewer } from "@/lib/viewer";

export type BookingState = { error?: string };

const bookingSchema = z.object({
  tutorId: z.string().min(1),
  startsAt: z.string().min(1, "Pick a time."),
  minutes: z.coerce.number().refine((m) => [30, 60, 90].includes(m), "Pick a session length."),
  courseId: z.string().optional(),
  message: z.string().trim().min(10, "Tell your tutor what you'd like to work on.").max(2000),
});

export async function createBooking(_: BookingState, form: FormData): Promise<BookingState> {
  const viewer = await getViewer();
  const tutorId = String(form.get("tutorId") ?? "");
  if (!viewer) redirect(`/login?next=${encodeURIComponent(`/tutors/${tutorId}`)}`);
  const parsed = bookingSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  const store = await getStore();
  const tutor = (await store.listTutors()).find((t) => t.id === d.tutorId);
  if (!tutor) return { error: "That tutor isn't listed anymore." };
  if (tutor.userId === viewer.user.id) return { error: "You can't book yourself." };
  const meta = await getTutorMeta(tutor.id);
  const existing = await listBookings({ tutorId: tutor.id });
  const slot = openSlots(meta, existing, d.minutes).some((day) => day.times.some((t) => t.iso === d.startsAt));
  if (!slot) return { error: "That time was just taken. Pick another." };
  const catalog = await getCatalog();
  const amount = Math.round(((tutor.hourlyRate ?? 0) * d.minutes) / 60 * 100) / 100;
  const booking: Booking = {
    id: `bk_${randomUUID().slice(0, 12)}`,
    tutorId: tutor.id,
    tutorUserId: tutor.userId,
    studentId: viewer.user.id,
    studentName: viewer.user.name,
    studentEmail: viewer.user.email,
    courseId: d.courseId && catalog.course(d.courseId) ? d.courseId : null,
    startsAt: d.startsAt,
    minutes: d.minutes,
    hourlyRate: tutor.hourlyRate ?? 0,
    amount,
    fee: Math.round(amount * (meta.commissionRate || TUTOR_COMMISSION) * 100) / 100,
    message: d.message,
    status: "requested",
    payment: meta.payoutsEnabled && amount > 0 ? "merit" : "direct",
    paid: amount === 0,
    feeSettled: amount === 0,
    source: null,
    createdAt: new Date().toISOString(),
  };
  await saveBooking(booking);
  try {
    await store.logReferral({ partnerId: tutor.id, kind: "tutor-booking", userId: viewer.user.id, courseId: booking.courseId });
  } catch (err) {
    console.error("[referral] failed to log", err);
  }
  revalidatePath("/tutor");
  redirect(`/bookings/${booking.id}?new=1`);
}

/** Tutor actions on a booking, and a student's cancel. */
export async function updateBooking(id: string, action: "confirm" | "decline" | "complete" | "cancel") {
  const viewer = await getViewer();
  if (!viewer) return;
  const b = await getBooking(id);
  if (!b) return;
  const isTutor = b.tutorUserId === viewer.user.id;
  const isStudent = b.studentId === viewer.user.id;
  let status = b.status;
  if (isTutor && action === "confirm" && b.status === "requested") status = "confirmed";
  else if (isTutor && action === "decline" && b.status === "requested") status = "declined";
  else if (isTutor && action === "complete" && b.status === "confirmed") status = "completed";
  else if ((isTutor || isStudent) && action === "cancel" && (b.status === "requested" || b.status === "confirmed") && !(b.payment === "merit" && b.paid && b.amount > 0)) status = "canceled";
  else return;
  await saveBooking({ ...b, status });
  revalidatePath(`/bookings/${id}`);
  revalidatePath("/tutor");
  revalidatePath("/bookings");
}

const availabilitySchema = z.array(z.object({ day: z.number().int().min(0).max(6), start: z.string().regex(/^\d{2}:\d{2}$/), end: z.string().regex(/^\d{2}:\d{2}$/) }));

/** Saves the tutor's weekly hours and time zone. */
export async function saveAvailability(json: string, timezone: string) {
  const viewer = await getViewer();
  if (!viewer) return { error: "Sign in first." };
  const tutor = (await (await getStore()).listTutors()).find((t) => t.userId === viewer.user.id);
  if (!tutor) return { error: "Create your tutor listing first." };
  let rows: unknown;
  try {
    rows = JSON.parse(json);
  } catch {
    return { error: "Couldn't read those hours." };
  }
  const parsed = availabilitySchema.safeParse(rows);
  if (!parsed.success) return { error: "Check your hours." };
  const clean = parsed.data.filter((r) => r.start < r.end).slice(0, 28);
  const meta = await getTutorMeta(tutor.id);
  await saveTutorMeta({ ...meta, availability: clean, timezone: validTimeZone(timezone) ? timezone : meta.timezone });
  revalidatePath("/tutor");
  revalidatePath(`/tutors/${tutor.id}`);
  return { ok: true };
}
