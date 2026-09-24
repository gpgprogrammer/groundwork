"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getCatalog } from "@/lib/catalog";
import { getStore } from "@/lib/data/store";
import { getTutorMeta, saveTutorMeta } from "@/lib/bookings";
import { createLead } from "@/lib/leads";
import type { Location, TutoringRequest } from "@/lib/types";
import { getViewer } from "@/lib/viewer";

export type FormState = { ok?: boolean; error?: string };

const LOC_COOKIE = "gw_loc";

/** The student's location: from their profile, or a cookie for signed-out visitors. */
export async function readLocation(): Promise<Location | null> {
  const viewer = await getViewer();
  if (viewer?.state.profile.location) return viewer.state.profile.location;
  const raw = (await cookies()).get(LOC_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Location;
  } catch {
    return null;
  }
}

const locationSchema = z.object({
  city: z.string().trim().max(80),
  region: z.string().trim().max(80),
  zip: z.string().trim().max(12),
  country: z.string().trim().max(60),
});

export async function setLocation(_: FormState, form: FormData): Promise<FormState> {
  const parsed = locationSchema.safeParse({
    city: form.get("city") ?? "",
    region: form.get("region") ?? "",
    zip: form.get("zip") ?? "",
    country: form.get("country") || "United States",
  });
  if (!parsed.success) return { error: "Check your location." };
  if (!parsed.data.city && !parsed.data.region && !parsed.data.zip) return { error: "Add a city, state, or ZIP code." };
  const viewer = await getViewer();
  if (viewer) await (await getStore()).updateProfile(viewer.user.id, { location: parsed.data });
  else (await cookies()).set(LOC_COOKIE, JSON.stringify(parsed.data), { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
  revalidatePath("/tutors");
  return { ok: true };
}

const tutorSchema = z.object({
  name: z.string().trim().min(1, "Add your name.").max(80),
  headline: z.string().trim().min(8, "Add a one-line headline.").max(120),
  bio: z.string().trim().min(60, "Tell students a bit more about how you teach (60+ characters).").max(2000),
  courseIds: z.array(z.string()).min(1, "Pick at least one subject you tutor.").max(12),
  hourlyRate: z.union([z.literal(""), z.coerce.number().int().min(0).max(1000)]),
  city: z.string().trim().max(80),
  region: z.string().trim().max(80),
  country: z.string().trim().min(2, "Add your country.").max(60),
  online: z.boolean(),
  inPerson: z.boolean(),
  bookingUrl: z.union([z.literal(""), z.string().trim().url("Booking link must be a full https:// URL.").refine((u) => u.startsWith("https://"), "Booking link must start with https://")]),
  yearsExperience: z.coerce.number().int().min(0).max(60),
  credentials: z.string().trim().max(300),
});

export async function saveTutorProfile(_: FormState, form: FormData): Promise<FormState> {
  const viewer = await getViewer();
  if (!viewer) redirect("/login?next=/tutors/join");
  const parsed = tutorSchema.safeParse({
    name: form.get("name"),
    headline: form.get("headline"),
    bio: form.get("bio"),
    courseIds: form.getAll("courseIds").map(String),
    hourlyRate: form.get("hourlyRate") ?? "",
    city: form.get("city") ?? "",
    region: form.get("region") ?? "",
    country: form.get("country") || "United States",
    online: form.get("online") === "on",
    inPerson: form.get("inPerson") === "on",
    bookingUrl: form.get("bookingUrl") ?? "",
    yearsExperience: form.get("yearsExperience") || 0,
    credentials: form.get("credentials") ?? "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  if (!d.online && !d.inPerson) return { error: "Choose online, in person, or both." };
  if (d.inPerson && !d.city && !d.region) return { error: "Add your city or state so nearby students can find you." };
  const store = await getStore();
  const prior = (await store.listTutors()).find((t) => t.userId === viewer.user.id);
  const priorMeta = prior ? await getTutorMeta(prior.id) : null;
  if (!priorMeta?.agreedAt && form.get("agreeTerms") !== "on") return { error: "Please accept the Merit Partner Terms to list." };
  const catalog = await getCatalog();
  const tutor = await store.saveTutor(viewer.user.id, {
    ...d,
    courseIds: d.courseIds.filter((id) => catalog.course(id)),
    hourlyRate: d.hourlyRate === "" ? null : d.hourlyRate,
    bookingUrl: d.bookingUrl || null,
  });
  const meta = await getTutorMeta(tutor.id);
  if (!meta.agreedAt) await saveTutorMeta({ ...meta, agreedAt: new Date().toISOString() });
  revalidatePath("/", "layout");
  redirect(`/tutors/${tutor.id}?saved=1`);
}

export async function removeTutorProfile() {
  const viewer = await getViewer();
  if (!viewer) redirect("/login");
  await (await getStore()).removeTutor(viewer.user.id);
  revalidatePath("/", "layout");
  redirect("/tutors");
}

const requestSchema = z.object({
  tutorId: z.string().min(1),
  name: z.string().trim().min(1, "Add your name.").max(120),
  email: z.string().trim().email("Add an email the tutor can reply to."),
  courseId: z.string().nullable(),
  message: z.string().trim().min(10, "Tell the tutor what you'd like help with.").max(2000),
  availability: z.string().trim().max(200),
});

export async function requestSession(_: FormState, form: FormData): Promise<FormState> {
  const parsed = requestSchema.safeParse({
    tutorId: form.get("tutorId"),
    name: form.get("name"),
    email: form.get("email"),
    courseId: form.get("courseId") || null,
    message: form.get("message"),
    availability: form.get("availability") ?? "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const store = await getStore();
  const tutor = (await store.listTutors()).find((t) => t.id === parsed.data.tutorId);
  if (!tutor) return { error: "That tutor isn't available anymore." };
  const viewer = await getViewer();
  if (viewer?.user.id === tutor.userId) return { error: "You can't request a session with yourself." };
  await store.createTutoringRequest({ ...parsed.data, userId: viewer?.user.id ?? null });
  await store.logReferral({ partnerId: tutor.id, kind: "tutor-request", userId: viewer?.user.id ?? null, courseId: parsed.data.courseId });
  await createLead({ tutorId: tutor.id, tutorUserId: tutor.userId, studentId: viewer?.user.id ?? null, studentName: parsed.data.name, studentEmail: parsed.data.email, courseId: parsed.data.courseId });
  return { ok: true };
}

const reviewSchema = z.object({
  tutorId: z.string().min(1),
  rating: z.coerce.number().int().min(1, "Choose a rating.").max(5),
  text: z.string().trim().max(2000),
});

export async function reviewTutor(_: FormState, form: FormData): Promise<FormState> {
  const viewer = await getViewer();
  if (!viewer) return { error: "Sign in to leave a review." };
  const parsed = reviewSchema.safeParse({ tutorId: form.get("tutorId"), rating: form.get("rating"), text: form.get("text") ?? "" });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const store = await getStore();
  const tutor = (await store.listTutors()).find((t) => t.id === parsed.data.tutorId);
  if (!tutor) return { error: "That tutor isn't available anymore." };
  if (tutor.userId === viewer.user.id) return { error: "You can't review yourself." };
  await store.saveReview({ ...parsed.data, userId: viewer.user.id, userName: viewer.user.name.split(" ")[0] });
  revalidatePath(`/tutors/${tutor.id}`);
  revalidatePath("/tutors");
  return { ok: true };
}

export async function setRequestStatus(id: string, status: TutoringRequest["status"]) {
  const viewer = await getViewer();
  if (!viewer) redirect("/login?next=/tutor");
  if (!["new", "replied", "scheduled", "archived"].includes(status)) throw new Error("Invalid status");
  const store = await getStore();
  const tutor = (await store.listTutors()).find((t) => t.userId === viewer.user.id);
  if (!tutor) throw new Error("Not a tutor");
  await store.updateTutoringStatus(tutor.id, id, status);
  revalidatePath("/tutor");
}
