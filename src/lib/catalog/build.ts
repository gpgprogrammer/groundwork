import type { Concept, Course, Curriculum, Topic, Unit } from "@/lib/types";
import { cybersecurity } from "./content/ap-career";
import { art2d, art3d, drawing } from "./content/ap-humanities";
import { BC_ONLY_TOPICS, BC_ONLY_UNITS, calcBC } from "./content/calc-bc";
import { chem as chemistry } from "./content/ced/ap-chemistry";
import { csa } from "./content/ced/ap-computer-science-a";
import { physics1 } from "./content/ced/ap-physics-1";
import { physics2 } from "./content/ced/ap-physics-2";
import { physicsCEM } from "./content/ced/ap-physics-c-electricity-and-magnetism";
import { physicsCMech } from "./content/ced/ap-physics-c-mechanics";
import { artHistory } from "./content/ced/ap-art-history";
import { business } from "./content/ced/ap-business-personal-finance";
import { chinese } from "./content/ced/ap-chinese-language";
import { lang } from "./content/ced/ap-english-language";
import { lit } from "./content/ced/ap-english-literature";
import { french } from "./content/ced/ap-french-language";
import { german } from "./content/ced/ap-german-language";
import { italian } from "./content/ced/ap-italian-language";
import { japanese } from "./content/ced/ap-japanese-language";
import { latin } from "./content/ced/ap-latin";
import { musicTheory } from "./content/ced/ap-music-theory";
import { research } from "./content/ced/ap-research";
import { seminar } from "./content/ced/ap-seminar";
import { spanish } from "./content/ced/ap-spanish-language";
import { spanishLit } from "./content/ced/ap-spanish-literature";
import { worldHistory } from "./content/ced/ap-world-history";
import { satMath } from "./content/ced/sat-math";
import { satRW } from "./content/ced/sat-reading-writing";
import { afam } from "./content/ced/ap-african-american-studies";
import { biology } from "./content/ced/ap-biology";
import { compGov } from "./content/ced/ap-comparative-government";
import { csp } from "./content/ced/ap-computer-science-principles";
import { apes } from "./content/ced/ap-environmental-science";
import { euro } from "./content/ced/ap-european-history";
import { humanGeo } from "./content/ced/ap-human-geography";
import { macro } from "./content/ced/ap-macroeconomics";
import { micro } from "./content/ced/ap-microeconomics";
import { precalc } from "./content/ced/ap-precalculus";
import { psych } from "./content/ced/ap-psychology";
import { stats } from "./content/ced/ap-statistics";
import { gov } from "./content/ced/ap-us-government";
import { apush } from "./content/ced/ap-us-history";
import { algebra1, honorsAlgebra1 } from "./content/hs/algebra-1";
import { algebra2, honorsAlgebra2 } from "./content/hs/algebra-2";
import { anatomyPhysiology } from "./content/hs/anatomy-physiology";
import { biology as hsBiology, honorsBiology } from "./content/hs/biology";
import { chemistry as hsChemistry, honorsChemistry } from "./content/hs/chemistry";
import { earthScience } from "./content/hs/earth-science";
import { environmentalScience } from "./content/hs/environmental-science";
import { geometry, honorsGeometry } from "./content/hs/geometry";
import { marineScience } from "./content/hs/marine-science";
import { physicalScience } from "./content/hs/physical-science";
import { honorsPhysics, physics } from "./content/hs/physics";
import { honorsPrecalculus, precalculus } from "./content/hs/precalculus";
import { statistics } from "./content/hs/statistics";
import type { CourseSpec } from "./content/spec";

/** Small, stable string hash (FNV-1a). */
export function hash(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}


/** Calc AB is the BC course without the BC-only units and topics (units 1–8 of the CED); it shares BC's videos. */
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

export const courseSpecs: (CourseSpec & { sameAsCourse?: string; ownTopics?: Set<string> })[] = [
  // Math & Computer Science: high school classes in the order students take them, then AP
  algebra1, honorsAlgebra1, geometry, honorsGeometry, algebra2, honorsAlgebra2, precalculus, honorsPrecalculus, statistics,
  calcAB, calcBC, precalc, stats, csa, csp,
  // Sciences: high school classes, then AP
  physicalScience, earthScience, hsBiology, honorsBiology, hsChemistry, honorsChemistry, physics, honorsPhysics, environmentalScience, anatomyPhysiology, marineScience,
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

/**
 * High school classes that are live on the site. A class launches once the video import has covered
 * its topics; until then it exists only for the importer and local previews (MERIT_ALL_CLASSES=1).
 * An honors class launches with its regular class.
 */
export const LAUNCHED_CLASSES = new Set<string>(["algebra-1", "geometry", "algebra-2", "precalculus", "statistics", "physical-science", "earth-science"]);

const isLaunched = (spec: CourseSpec & { sameAsCourse?: string }) =>
  spec.course.exam !== "Class" || LAUNCHED_CLASSES.has(spec.course.slug) || Boolean(spec.course.honorsOf && LAUNCHED_CLASSES.has(spec.course.honorsOf));

/**
 * Flattens the authored course specs into courses, units, concepts, and topics. Unlaunched high school
 * classes are left out unless `allClasses` is set (or MERIT_ALL_CLASSES=1, for local previews).
 */
export function buildCurriculum({ allClasses = process.env.MERIT_ALL_CLASSES === "1" }: { allClasses?: boolean } = {}): Curriculum {
  const courses: Course[] = [];
  const units: Unit[] = [];
  const concepts: Concept[] = [];
  const topics: Topic[] = [];

  for (const spec of courseSpecs) {
    if (!allClasses && !isLaunched(spec)) continue;
    const course: Course = { ...spec.course, id: spec.course.slug };
    courses.push(course);
    let topicOrder = 0;
    spec.units.forEach((u, ui) => {
      // `order` is the College Board's unit number (it usually starts at 1). Titles drop any "Unit 3:"
      // prefix, since the number is shown on its own.
      const unit: Unit = {
        id: `${course.id}/${u.slug}`,
        courseId: course.id,
        slug: u.slug,
        title: u.title.replace(/^(Unit|Unidad)\s+\d+\s*:\s*/i, ""),
        order: ui + (spec.unitStart ?? 1),
        summary: u.summary,
      };
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
            // Cross-listed courses (Calc AB, honors classes) share their twin's topics, except the ones they own.
            ...(spec.sameAsCourse && !spec.ownTopics?.has(t.slug) ? { sameAs: `${spec.sameAsCourse}/${t.slug}` } : {}),
          });
        }
      });
    });
  }
  return { courses, units, concepts, topics };
}
