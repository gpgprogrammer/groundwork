import type { IndexedCatalog } from "@/lib/catalog";
import type { FocusCourse } from "@/components/focus-picker";

/** Units and topics for the "what are you covering in class" picker. */
export function focusCourses(catalog: IndexedCatalog, courseIds: string[]): FocusCourse[] {
  return courseIds
    .map((id) => catalog.course(id))
    .filter((c) => c !== undefined)
    .map((c) => ({
      id: c.id,
      title: c.shortTitle,
      units: catalog.unitsForCourse(c.id).map((u) => ({
        id: u.id,
        title: u.title,
        order: u.order,
        topics: catalog.topicsForUnit(u.id).map((t) => ({ id: t.id, title: t.title })),
      })),
    }));
}
