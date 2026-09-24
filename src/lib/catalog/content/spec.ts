import type { Category, Course } from "@/lib/types";

export type TopicSpec = {
  slug: string;
  title: string;
  summary: string;
  points?: string[];
  aliases?: string[];
  glyph?: string;
};

export type ConceptSpec = { title: string; topics: TopicSpec[] };

export type UnitSpec = {
  slug: string;
  title: string;
  summary: string;
  concepts: ConceptSpec[];
};

export type CourseSpec = {
  course: Omit<Course, "id">;
  units: UnitSpec[];
};

// ── Compact authoring helpers ────────────────────────────────────────────────

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/** A topic: title, one or two sentence summary, optional search aliases. */
export const t = (title: string, summary: string, aliases: string[] = []): TopicSpec => ({ slug: slugify(title), title, summary, aliases });

/** A unit whose topics form a single concept group. */
export const u = (title: string, summary: string, topics: TopicSpec[]): UnitSpec => ({
  slug: slugify(title),
  title,
  summary,
  concepts: [{ title, topics }],
});

type CourseMeta = {
  slug: string;
  title: string;
  shortTitle: string;
  category: Category;
  hue: number;
  description: string;
  query?: string;
  keywords: string[];
  exam?: "AP" | "SAT";
  examMonth?: string;
};

export const course = (m: CourseMeta, units: UnitSpec[]): CourseSpec => ({
  course: {
    slug: m.slug,
    title: m.title,
    shortTitle: m.shortTitle,
    exam: m.exam ?? "AP",
    category: m.category,
    description: m.description,
    hue: m.hue,
    examMonth: m.examMonth ?? "May",
    query: m.query ?? m.title,
    keywords: m.keywords,
  },
  units,
});
