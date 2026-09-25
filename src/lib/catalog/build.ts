import type { Concept, Course, Curriculum, Topic, Unit } from "@/lib/types";
import { business, cybersecurity } from "./content/ap-career";
import { csa, csp, precalc, stats } from "./content/ap-math-cs";
import { afam, apush, compGov, euro, gov, humanGeo, macro, micro, psych, worldExtraUnits } from "./content/ap-history";
import { art2d, art3d, artHistory, chinese, drawing, french, german, italian, japanese, lang, latin, lit, musicTheory, research, seminar, spanish, spanishLit } from "./content/ap-humanities";
import { apes, bioExtraUnits, chemExtraUnits, physics1, physics2, physicsCEM, physicsCMech } from "./content/ap-sciences";
import { bio, chem } from "./content/bio-chem";
import { calcBC } from "./content/calc-bc";
import { satMath } from "./content/sat-math";
import { satRW } from "./content/sat-rw";
import type { CourseSpec } from "./content/spec";
import { world } from "./content/world";

/** Small, stable string hash (FNV-1a). */
export function hash(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// Complete the original courses with the rest of their official units.
const biology: CourseSpec = {
  ...bio,
  units: [...bioExtraUnits.before, bio.units[0], ...bioExtraUnits.afterEnergetics, ...bio.units.slice(1), ...bioExtraUnits.after],
};
const chemistry: CourseSpec = {
  ...chem,
  units: [...chem.units.slice(0, 2), ...chemExtraUnits.afterBonding, ...chem.units.slice(2), ...chemExtraUnits.after],
};
const worldHistory: CourseSpec = { ...world, units: [...world.units, ...worldExtraUnits] };

/** Calc AB is the BC course without the BC-only units and techniques; it shares BC's videos. */
const BC_ONLY_UNITS = new Set(["parametric-polar-vector", "infinite-series"]);
const BC_ONLY_TOPICS = new Set(["eulers-method", "logistic-growth", "integration-by-parts", "partial-fractions"]);
const calcAB: CourseSpec & { sameAsCourse: string } = {
  sameAsCourse: calcBC.course.slug,
  course: {
    ...calcBC.course,
    slug: "ap-calculus-ab",
    title: "AP Calculus AB",
    shortTitle: "Calc AB",
    hue: 245,
    description: "Limits, derivatives, integrals, and differential equations: the first full year of college calculus.",
    query: "AP Calculus AB",
    keywords: ["ap calculus ab", "ap calc ab", "calc ab", "calculus ab", "ap calc", "calculus", "calc"],
  },
  units: calcBC.units
    .filter((u) => !BC_ONLY_UNITS.has(u.slug))
    .map((u) => ({ ...u, concepts: u.concepts.map((c) => ({ ...c, topics: c.topics.filter((t) => !BC_ONLY_TOPICS.has(t.slug)) })).filter((c) => c.topics.length) })),
};

export const courseSpecs: (CourseSpec & { sameAsCourse?: string })[] = [
  // Math & Computer Science
  calcAB, calcBC, precalc, stats, csa, csp,
  // Sciences
  biology, chemistry, apes, physics1, physics2, physicsCMech, physicsCEM,
  // History & Social Sciences
  apush, worldHistory, euro, gov, compGov, humanGeo, macro, micro, psych, afam,
  // English
  lang, lit,
  // World Languages & Cultures
  spanish, spanishLit, french, german, italian, chinese, japanese, latin,
  // Arts
  artHistory, musicTheory, art2d, art3d, drawing,
  // AP Capstone
  seminar, research,
  // AP Career Kickstart
  business, cybersecurity,
  // SAT
  satMath, satRW,
];

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
            id: `${course.id}/${t.slug}`,
            conceptId: concept.id,
            unitId: unit.id,
            courseId: course.id,
            slug: t.slug,
            title: t.title,
            summary: t.summary,
            keyPoints: t.points ? [...t.points] : [],
            aliases: t.aliases ?? [],
            order: ++topicOrder,
            ...(spec.sameAsCourse ? { sameAs: `${spec.sameAsCourse}/${t.slug}` } : {}),
          });
        }
      });
    });
  }
  return { courses, units, concepts, topics };
}
