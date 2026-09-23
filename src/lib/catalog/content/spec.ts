import type { Course } from "@/lib/types";

export type TopicSpec = {
  slug: string;
  title: string;
  glyph: string;
  summary: string;
  points: [string, string, string];
  aliases?: string[];
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
