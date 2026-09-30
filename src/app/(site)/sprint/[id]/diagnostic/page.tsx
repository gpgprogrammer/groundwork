import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CourseIcon } from "@/components/course-icon";
import { SprintRunner } from "@/components/sprint/runner";
import { getCatalog } from "@/lib/catalog";
import { getSprint } from "@/lib/sprint-store";
import { requireViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Diagnostic" };

export default async function DiagnosticPage({ params }: PageProps<"/sprint/[id]/diagnostic">) {
  const { id } = await params;
  const viewer = await requireViewer(`/sprint/${id}/diagnostic`);
  const sprint = await getSprint(id);
  if (!sprint || sprint.userId !== viewer.user.id) notFound();
  const catalog = await getCatalog();
  const course = catalog.course(sprint.courseId)!;
  const units = catalog.unitsForCourse(course.id).map((u) => ({ id: u.id, order: u.order, title: u.title }));
  const topicTitles = Object.fromEntries(catalog.topicsForCourse(course.id).map((t) => [t.id, t.title]));
  return (
    <div className="mx-auto max-w-3xl px-4 pt-6 sm:px-6">
      <p className="flex items-center gap-2.5 font-brand text-[14px] font-extrabold text-muted">
        <CourseIcon id={course.id} size={26} /> <span className="truncate">{course.title} · Diagnostic</span>
      </p>
      <div className="mt-5">
        <SprintRunner sprintId={id} mode="diagnostic" units={units} topicTitles={topicTitles} initialConfidence={sprint.confidence} />
      </div>
    </div>
  );
}
