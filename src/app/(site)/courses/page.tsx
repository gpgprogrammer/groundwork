import type { Metadata } from "next";
import { CoursesBrowser } from "@/components/courses-browser";
import { getCatalog } from "@/lib/catalog";
import { courseProgress } from "@/lib/recommend";
import { CATEGORIES } from "@/lib/types";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Courses" };

export default async function CoursesPage() {
  const [catalog, viewer] = await Promise.all([getCatalog(), getViewer()]);
  const mine = new Set(viewer?.state.profile.courseIds ?? []);
  const tiles = catalog.courses.map((c) => {
    const prog = viewer && mine.has(c.id) ? courseProgress(catalog, viewer.state, c.id) : null;
    return {
      id: c.id,
      slug: c.slug,
      title: c.title,
      shortTitle: c.shortTitle,
      category: c.category,
      hue: c.hue,
      units: catalog.unitsForCourse(c.id).length,
      videos: catalog.videosForCourse(c.id).length,
      studying: mine.has(c.id),
      progress: prog ? prog.done / prog.total : null,
    };
  });

  return (
    <div className="mx-auto max-w-[1280px] px-4 pb-20 pt-6 sm:px-6">
      <h1 className="text-[32px] font-bold tracking-tight text-ink">Courses</h1>
      <p className="mb-6 mt-1 max-w-2xl text-[15px] text-muted">
        Every AP course and the SAT, organized the way the exam is: units, then the exact topics you&apos;ll be tested on, each with the best
        videos for it.
      </p>
      <CoursesBrowser courses={tiles} categories={[...CATEGORIES]} />
    </div>
  );
}
