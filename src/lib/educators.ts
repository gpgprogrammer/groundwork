import "server-only";
import type { IndexedCatalog } from "@/lib/catalog";
import { getStore } from "@/lib/data/store";
import type { Contribution, Educator } from "@/lib/types";
import type { CourseTopics } from "@/components/studio-forms";

export async function getEducator(id: string) {
  return (await getStore()).getDoc<Educator>("educators", id);
}

export async function contributionsBy(educatorId: string) {
  return (await (await getStore()).listDocs<Contribution>("contributions", { owner: educatorId }))
    .filter((c) => c.status === "published")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function guidesForTopic(topicId: string) {
  return (await (await getStore()).listDocs<Contribution>("contributions")).filter((c) => c.kind === "guide" && c.status === "published" && c.topicId === topicId);
}

/** Courses with their topics, the educator's own courses first. */
export function courseTopics(catalog: IndexedCatalog, first: string[] = []): CourseTopics[] {
  const courses = [...catalog.courses].sort((a, b) => Number(first.includes(b.id)) - Number(first.includes(a.id)));
  return courses.map((c) => ({
    id: c.id,
    title: c.title,
    category: c.category,
    topics: catalog.topicsForCourse(c.id).map((t) => ({ id: t.id, title: t.title, unit: `Unit ${catalog.unit(t.unitId)!.order}: ${catalog.unit(t.unitId)!.title}` })),
  }));
}

export async function guidesForCourse(courseId?: string) {
  return (await (await getStore()).listDocs<Contribution>("contributions")).filter((c) => c.kind === "guide" && c.status === "published" && (!courseId || c.courseId === courseId));
}
