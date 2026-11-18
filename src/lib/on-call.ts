import "server-only";
import { getStore } from "@/lib/data/store";
import type { TutorMeta, TutorWithStats } from "@/lib/types";

/**
 * On-call tutoring: tutors mark themselves ready for the next couple of hours; a student who needs
 * help now sends one request to every on-call tutor for their course, and the first to accept gets
 * the session. Requests that nobody takes within WAIT_MINUTES expire.
 */

export const ON_CALL_COLLECTION = "onCallRequests";
export const WAIT_MINUTES = 20;
export const ON_CALL_LENGTHS = [15, 30, 60] as const;
export const ON_CALL_HOURS = [1, 2, 3, 4] as const;
export const URGENCY = { now: "Due in the next hour", tonight: "Due tonight", tomorrow: "Due tomorrow morning", test: "Test or quiz soon" } as const;
export type Urgency = keyof typeof URGENCY;

export type OnCallRequest = {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  topicId: string | null;
  urgency: Urgency;
  minutes: (typeof ON_CALL_LENGTHS)[number];
  message: string;
  status: "waiting" | "claimed" | "canceled";
  createdAt: string;
  tutorId?: string;
  tutorName?: string;
  bookingId?: string;
  claimedAt?: string;
};

/** On-call rates are set by each tutor when they go on call (USD per hour). */
export const MIN_ON_CALL_RATE = 5;
export const MAX_ON_CALL_RATE = 300;

/** A tutor's on-call hourly rate (older on-call sessions fall back to their listing rate). */
export const onCallRate = (meta: Pick<TutorMeta, "onCall"> | undefined, hourlyRate: number | null) => meta?.onCall?.rate || hourlyRate || 0;

/** Price of a session at an hourly rate, rounded to cents. */
export const sessionPrice = (rate: number, minutes: number) => Math.round(((rate * minutes) / 60) * 100) / 100;

export const isOnCall = (meta: Pick<TutorMeta, "onCall"> | undefined, now = Date.now()) => Boolean(meta?.onCall && new Date(meta.onCall.until).getTime() > now);

/** A waiting request nobody accepted in time. */
export const isExpired = (r: OnCallRequest, now = Date.now()) => r.status === "waiting" && now - new Date(r.createdAt).getTime() > WAIT_MINUTES * 60000;

export type RequestState = "waiting" | "claimed" | "canceled" | "expired";
export const stateOf = (r: OnCallRequest, now = Date.now()): RequestState => (isExpired(r, now) ? "expired" : r.status);

/** Tutors on call right now who teach this course (or any course when none is given). */
export function onCallTutors(tutors: TutorWithStats[], meta: Map<string, TutorMeta>, courseId?: string | null, now = Date.now()) {
  return tutors.filter((t) => t.online && isOnCall(meta.get(t.id), now) && onCallRate(meta.get(t.id), t.hourlyRate) > 0 && (!courseId || t.courseIds.includes(courseId)));
}

export async function listOnCallRequests() {
  return (await getStore()).listDocs<OnCallRequest>(ON_CALL_COLLECTION);
}

export async function getOnCallRequest(id: string) {
  return (await getStore()).getDoc<OnCallRequest>(ON_CALL_COLLECTION, id);
}

export async function saveOnCallRequest(r: OnCallRequest) {
  await (await getStore()).putDoc(ON_CALL_COLLECTION, r.id, r, r.studentId);
}

/** Open requests a tutor can take: waiting, not expired, for a course they teach. Oldest first. */
export function openRequestsFor(requests: OnCallRequest[], courseIds: string[], now = Date.now()) {
  return requests.filter((r) => stateOf(r, now) === "waiting" && courseIds.includes(r.courseId)).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

/** Only https video links (Zoom, Google Meet, Teams, Whereby…). */
export function cleanMeetUrl(raw: string): string | null {
  try {
    const u = new URL(raw.trim());
    return u.protocol === "https:" ? u.toString() : null;
  } catch {
    return null;
  }
}
