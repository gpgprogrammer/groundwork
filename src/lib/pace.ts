import type { IndexedCatalog } from "@/lib/catalog";
import { nextApExamStart } from "@/lib/exams";
import type { Topic } from "@/lib/types";

const DAY = 86400000;

/**
 * Where a typical AP class is in a course today, for students who haven't told Merit what they're
 * covering. The school year starts around August 20 and new material wraps up about three weeks
 * before the May exam (the rest is review); topics are spread evenly across that window, so bigger
 * units take proportionally longer. It's an estimate, and the UI always labels it as one.
 */
export function paceFraction(now = Date.now()) {
  const d = new Date(now);
  const year = d.getMonth() >= 6 ? d.getFullYear() : d.getFullYear() - 1; // school year starting this summer
  const start = new Date(year, 7, 20).getTime();
  const end = nextApExamStart(start).getTime() - 21 * DAY;
  return Math.min(1, Math.max(0, (now - start) / (end - start)));
}

/** The topic a typical class is on today in an AP course, or null for non-AP courses. */
export function typicalPaceTopic(catalog: IndexedCatalog, courseId: string, now = Date.now()): Topic | null {
  const course = catalog.course(courseId);
  if (!course || course.exam !== "AP") return null;
  const topics = catalog.topicsForCourse(courseId);
  if (!topics.length) return null;
  return topics[Math.min(topics.length - 1, Math.floor(paceFraction(now) * topics.length))];
}

/** "early October", "late January": how the plan labels a typical-pace estimate. */
export function paceLabel(now = Date.now()) {
  const d = new Date(now);
  const part = d.getDate() <= 10 ? "early" : d.getDate() <= 20 ? "mid" : "late";
  return `${part} ${d.toLocaleDateString("en-US", { month: "long" })}`;
}
