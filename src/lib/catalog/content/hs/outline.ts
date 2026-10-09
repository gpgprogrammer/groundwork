import type { Category } from "@/lib/types";
import { slugify, type CourseSpec, type TopicSpec, type UnitSpec } from "../spec";

/**
 * High school classes are written as compact outlines rather than JSON:
 *
 *   # Unit title | one-line summary
 *   ## Concept title                     (optional; defaults to the unit title)
 *   - Topic title | summary | key point; key point; key point | alias; alias
 *   + Honors-only topic (same fields)
 *   #+ Honors-only unit | summary
 *
 * One outline describes a class and, when it has one, its honors version: the honors class is
 * every regular topic (sharing its videos) plus the "+" topics and "#+" units.
 */

type Meta = {
  slug: string;
  title: string;
  shortTitle: string;
  category: Category;
  hue: number;
  description: string;
  grades: string;
  /** Appended to topic titles when searching YouTube. Defaults to the title. */
  query?: string;
  keywords: string[];
};

type Parsed = { units: (UnitSpec & { honors: boolean })[]; honorsTopics: Set<string> };

function parse(outline: string, where: string): Parsed {
  const units: Parsed["units"] = [];
  const honorsTopics = new Set<string>();
  const seen = new Set<string>();
  for (const raw of outline.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const head = line.match(/^(#\+|##|#|-|\+)\s+(.*)$/);
    if (!head) throw new Error(`${where}: can't read "${line}"`);
    const [, mark, rest] = head;
    const f = rest.split("|").map((s) => s.trim());
    if (mark === "#" || mark === "#+") {
      units.push({ slug: slugify(f[0]), title: f[0], summary: f[1] ?? "", concepts: [], honors: mark === "#+" });
      continue;
    }
    const unit = units.at(-1);
    if (!unit) throw new Error(`${where}: "${line}" comes before any unit`);
    if (mark === "##") {
      unit.concepts.push({ title: f[0], topics: [] });
      continue;
    }
    if (!unit.concepts.length) unit.concepts.push({ title: unit.title, topics: [] });
    if (f.length > 4) throw new Error(`${where}: too many "|" in "${line}"`);
    const [title, summary, points, aliases] = f;
    if (!summary) throw new Error(`${where}: topic "${title}" needs a summary`);
    const topic: TopicSpec = {
      slug: slugify(title),
      title,
      summary,
      points: points ? points.split(";").map((s) => s.trim()).filter(Boolean) : [],
      aliases: aliases ? aliases.split(";").map((s) => s.trim()).filter(Boolean) : [],
    };
    if (seen.has(topic.slug)) throw new Error(`${where}: duplicate topic "${title}"`);
    seen.add(topic.slug);
    if (mark === "+" || unit.honors) honorsTopics.add(topic.slug);
    unit.concepts.at(-1)!.topics.push(topic);
  }
  return { units, honorsTopics };
}

const strip = ({ honors: _, ...u }: UnitSpec & { honors: boolean }): UnitSpec => u;

const meta = (m: Meta, extra: { honorsOf?: string } = {}): CourseSpec["course"] => ({
  slug: m.slug,
  title: m.title,
  shortTitle: m.shortTitle,
  exam: "Class",
  category: m.category,
  description: m.description,
  hue: m.hue,
  examMonth: "June",
  grades: m.grades,
  query: m.query ?? m.title,
  keywords: m.keywords,
  ...extra,
});

export type ClassSpec = CourseSpec & { sameAsCourse?: string; ownTopics?: Set<string> };

/** A high school class from its outline (honors-only topics are left out). */
export function hsCourse(m: Meta, outline: string): ClassSpec {
  const { units } = parse(outline, m.slug);
  return {
    course: meta(m),
    units: units
      .filter((u) => !u.honors)
      .map((u) => ({ ...strip(u), concepts: u.concepts })),
  };
}

/**
 * A class and its honors version from one outline. The regular class owns the shared topics'
 * videos; the honors class borrows them and owns only its honors-only topics.
 */
export function hsPair(regular: Meta, honors: Omit<Meta, "category" | "keywords" | "query"> & { keywords: string[] }, outline: string): [ClassSpec, ClassSpec] {
  const { units, honorsTopics } = parse(outline, regular.slug);
  const base: ClassSpec = {
    course: meta(regular),
    units: units
      .filter((u) => !u.honors)
      .map((u) => ({ ...strip(u), concepts: u.concepts.map((c) => ({ ...c, topics: c.topics.filter((t) => !honorsTopics.has(t.slug)) })).filter((c) => c.topics.length) })),
  };
  const full: ClassSpec = {
    course: meta({ ...honors, category: regular.category, query: regular.query ?? regular.title }, { honorsOf: regular.slug }),
    units: units.map(strip),
    sameAsCourse: regular.slug,
    ownTopics: honorsTopics,
  };
  return [base, full];
}
