"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { TUTOR_COMMISSION } from "@/lib/billing/plans";
import { getTutorMeta, saveBooking, saveTutorMeta } from "@/lib/bookings";
import { getCatalog } from "@/lib/catalog";
import { getStore } from "@/lib/data/store";
import { allTutorMeta } from "@/lib/bookings";
import { cleanMeetUrl, getOnCallRequest, isOnCall, MAX_ON_CALL_RATE, MIN_ON_CALL_RATE, ON_CALL_HOURS, ON_CALL_LENGTHS, onCallRate, onCallTutors, saveOnCallRequest, sessionPrice, stateOf, URGENCY, type OnCallRequest } from "@/lib/on-call";
import { rankTutors } from "@/lib/tutoring";
import type { Booking } from "@/lib/types";
import { getViewer } from "@/lib/viewer";

export type OnCallState = { error?: string };

const requestSchema = z.object({
  courseId: z.string().min(1, "Pick your class."),
  topicId: z.string().optional(),
  urgency: z.enum(Object.keys(URGENCY) as [keyof typeof URGENCY, ...(keyof typeof URGENCY)[]]),
  minutes: z.coerce.number().refine((m) => (ON_CALL_LENGTHS as readonly number[]).includes(m), "Pick a session length."),
  message: z.string().trim().min(10, "Tell the tutor what you're stuck on (a sentence is enough).").max(1500),
});

/** A student asks for help now. Goes to every on-call tutor for the course. */
export async function requestOnCall(_: OnCallState, form: FormData): Promise<OnCallState> {
  const viewer = await getViewer();
  if (!viewer) redirect(`/login?next=${encodeURIComponent("/tutors/on-call")}`);
  const parsed = requestSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  const catalog = await getCatalog();
  if (!catalog.course(d.courseId)) return { error: "Pick your class." };
  const [tutors, reviews, meta] = await Promise.all([(await getStore()).listTutors(), (await getStore()).listReviews(), allTutorMeta()]);
  const available = onCallTutors(rankTutors(tutors, reviews), meta, d.courseId).filter((t) => t.userId !== viewer.user.id);
  if (!available.length) return { error: "No tutors are on call for this class right now. Book the soonest open time below instead." };
  const r: OnCallRequest = {
    id: `oc_${randomUUID().slice(0, 12)}`,
    studentId: viewer.user.id,
    studentName: viewer.user.name,
    studentEmail: viewer.user.email,
    courseId: d.courseId,
    topicId: d.topicId && catalog.topic(d.topicId)?.courseId === d.courseId ? d.topicId : null,
    urgency: d.urgency,
    minutes: d.minutes as OnCallRequest["minutes"],
    message: d.message,
    status: "waiting",
    createdAt: new Date().toISOString(),
  };
  try {
    await saveOnCallRequest(r);
  } catch {
    return { error: "Couldn't send your request. Try again in a moment." };
  }
  revalidatePath("/tutor");
  redirect(`/tutors/on-call/${r.id}`);
}

export async function cancelOnCall(id: string) {
  const viewer = await getViewer();
  if (!viewer) return;
  const r = await getOnCallRequest(id);
  if (!r || r.studentId !== viewer.user.id || r.status !== "waiting") return;
  await saveOnCallRequest({ ...r, status: "canceled" });
  revalidatePath(`/tutors/on-call/${id}`);
  revalidatePath("/tutor");
}

/** First tutor to accept gets the session; it starts now at their video link. */
export async function acceptOnCall(id: string): Promise<{ error?: string }> {
  const viewer = await getViewer();
  if (!viewer) return { error: "Sign in first." };
  const store = await getStore();
  const tutor = (await store.listTutors()).find((t) => t.userId === viewer.user.id);
  if (!tutor) return { error: "Only tutors can accept requests." };
  const meta = await getTutorMeta(tutor.id);
  if (!isOnCall(meta) || !meta.onCall) return { error: "Go on call first." };
  // Re-read right before claiming so two tutors can't both take it.
  const r = await getOnCallRequest(id);
  if (!r || stateOf(r) !== "waiting") return { error: "Another tutor already took this one, or it expired." };
  if (!tutor.courseIds.includes(r.courseId)) return { error: "This request is for a class you don't tutor." };
  const now = new Date().toISOString();
  // On-call sessions use the rate the tutor set when going on call.
  const rate = onCallRate(meta, tutor.hourlyRate);
  if (!(rate > 0)) return { error: "Set your on-call rate first." };
  const amount = sessionPrice(rate, r.minutes);
  const booking: Booking = {
    id: `bk_${randomUUID().slice(0, 12)}`,
    tutorId: tutor.id,
    tutorUserId: tutor.userId,
    studentId: r.studentId,
    studentName: r.studentName,
    studentEmail: r.studentEmail,
    courseId: r.courseId,
    startsAt: now,
    minutes: r.minutes,
    hourlyRate: rate,
    amount,
    fee: Math.round(amount * (meta.commissionRate || TUTOR_COMMISSION) * 100) / 100,
    message: r.message,
    status: "confirmed",
    payment: meta.payoutsEnabled ? "merit" : "direct",
    paid: false,
    feeSettled: false,
    source: null,
    createdAt: now,
    onCall: true,
    meetUrl: meta.onCall.meetUrl,
  };
  await saveBooking(booking);
  await saveOnCallRequest({ ...r, status: "claimed", tutorId: tutor.id, tutorName: tutor.name, bookingId: booking.id, claimedAt: now });
  try {
    await store.logReferral({ partnerId: tutor.id, kind: "tutor-booking", userId: r.studentId, courseId: r.courseId });
  } catch (err) {
    console.error("[referral] failed to log", err);
  }
  revalidatePath("/tutor");
  revalidatePath(`/tutors/on-call/${id}`);
  redirect(`/bookings/${booking.id}`);
}

const goSchema = z.object({
  hours: z.coerce.number().refine((h) => (ON_CALL_HOURS as readonly number[]).includes(h)),
  meetUrl: z.string().min(1, "Add your video link."),
  rate: z.coerce.number({ message: "Set your on-call rate." }).min(MIN_ON_CALL_RATE, `On-call rates start at $${MIN_ON_CALL_RATE}/hour.`).max(MAX_ON_CALL_RATE, `On-call rates can be up to $${MAX_ON_CALL_RATE}/hour.`),
});

/** Tutor goes on call for a few hours, or comes off call. */
export async function setOnCall(_: OnCallState, form: FormData): Promise<OnCallState> {
  const viewer = await getViewer();
  if (!viewer) return { error: "Sign in first." };
  const tutor = (await (await getStore()).listTutors()).find((t) => t.userId === viewer.user.id);
  if (!tutor) return { error: "Create your tutor listing first." };
  const meta = await getTutorMeta(tutor.id);
  if (form.get("off")) {
    await saveTutorMeta({ ...meta, onCall: null });
  } else {
    if (!tutor.online) return { error: "On-call sessions are online. Turn on online tutoring in your listing first." };
    const parsed = goSchema.safeParse(Object.fromEntries(form));
    if (!parsed.success) return { error: parsed.error.issues[0].message };
    const meetUrl = cleanMeetUrl(parsed.data.meetUrl);
    if (!meetUrl) return { error: "Use a full https:// link to your Zoom, Google Meet, or Teams room." };
    const now = Date.now();
    await saveTutorMeta({ ...meta, onCall: { since: new Date(now).toISOString(), until: new Date(now + parsed.data.hours * 3600000).toISOString(), meetUrl, rate: Math.round(parsed.data.rate * 100) / 100 } });
  }
  revalidatePath("/tutor");
  revalidatePath("/tutors/on-call");
  revalidatePath("/tutors");
  return {};
}
