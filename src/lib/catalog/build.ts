import type { Concept, Course, Curriculum, Topic, Unit } from "@/lib/types";
import { bio, chem } from "./content/bio-chem";
import { calcBC } from "./content/calc-bc";
import { satMath } from "./content/sat-math";
import { satRW } from "./content/sat-rw";
import type { CourseSpec } from "./content/spec";
import { world } from "./content/world";

export const courseSpecs: CourseSpec[] = [calcBC, world, satMath, bio, chem, satRW];

/** Small, stable string hash (FNV-1a). */
export function hash(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Flattens the authored course specs into courses, units, concepts, and topics. */
export function buildCurriculum(): Curriculum {
  const courses: Course[] = [];
  const units: Unit[] = [];
  const concepts: Concept[] = [];
  const topics: Topic[] = [];

  for (const spec of courseSpecs) {
    const course: Course = { ...spec.course, id: spec.course.slug };
    courses.push(course);
    let topicOrder = 0;
    spec.units.forEach((u, ui) => {
      const unit: Unit = { id: `${course.id}/${u.slug}`, courseId: course.id, slug: u.slug, title: u.title, order: ui + 1, summary: u.summary };
      units.push(unit);
      u.concepts.forEach((c, ci) => {
        const concept: Concept = {
          id: `${unit.id}/${ci + 1}`,
          unitId: unit.id,
          courseId: course.id,
          slug: c.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          title: c.title,
          order: ci + 1,
        };
        concepts.push(concept);
        for (const t of c.topics) {
          topics.push({
            id: t.slug,
            conceptId: concept.id,
            unitId: unit.id,
            courseId: course.id,
            slug: t.slug,
            title: t.title,
            summary: t.summary,
            glyph: t.glyph,
            keyPoints: [...t.points],
            aliases: t.aliases ?? [],
            order: ++topicOrder,
          });
        }
      });
    });
  }
  return { courses, units, concepts, topics };
}
