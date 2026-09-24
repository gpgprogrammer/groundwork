import type { Course, Profile } from "@/lib/types";

const DAY = 86400000;

/** AP exams run over the first two weeks of May; this is the first Monday of that window. */
export function nextApExamStart(now = Date.now()) {
  const d = new Date(now);
  let year = d.getFullYear();
  const cutoff = new Date(year, 4, 20).getTime();
  if (now > cutoff) year += 1;
  const may1 = new Date(year, 4, 1);
  const offset = (8 - may1.getDay()) % 7; // days to the first Monday
  return new Date(year, 4, 1 + offset);
}

export const isoDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function daysUntil(date: string | Date, now = Date.now()) {
  const t = typeof date === "string" ? new Date(`${date}T12:00:00`).getTime() : date.getTime();
  return Math.max(0, Math.ceil((new Date(new Date(t).toDateString()).getTime() - new Date(new Date(now).toDateString()).getTime()) / DAY));
}

/** The student's exam date for a course: their own if set, otherwise the AP window. SAT has no default. */
export function examDateFor(course: Pick<Course, "exam">, profile: Pick<Profile, "examDate"> | null, now = Date.now()) {
  if (profile?.examDate && new Date(`${profile.examDate}T12:00:00`).getTime() > now) return profile.examDate;
  return course.exam === "AP" ? isoDate(nextApExamStart(now)) : null;
}
