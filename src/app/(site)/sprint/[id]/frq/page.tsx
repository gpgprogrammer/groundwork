import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CourseIcon } from "@/components/course-icon";
import { FrqCoach } from "@/components/sprint/frq-coach";
import { getCatalog } from "@/lib/catalog";
import { readiness } from "@/lib/sprint";
import { getSprint } from "@/lib/sprint-store";
import { requireViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Free-response coach" };
export const maxDuration = 60;

export default async function FrqPage({ params, searchParams }: PageProps<"/sprint/[id]/frq">) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const viewer = await requireViewer(`/sprint/${id}/frq`);
  const sprint = await getSprint(id);
  if (!sprint || sprint.userId !== viewer.user.id) notFound();
  const catalog = await getCatalog();
  const course = catalog.course(sprint.courseId)!;
  const units = catalog.unitsForCourse(course.id).map((u) => ({ id: u.id, label: `Unit ${u.order}: ${u.title}` }));
  const weakest = [...readiness(catalog, sprint)].sort((a, b) => a.score - b.score)[0]?.unit.id;
  const initial = typeof sp.unit === "string" && units.some((u) => u.id === sp.unit) ? sp.unit : (weakest ?? units[0]?.id);
  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-8 sm:px-6">
      <Link href={`/sprint/${id}`} className="flex items-center gap-3 text-sm text-muted hover:text-ink">
        <CourseIcon id={course.id} size={28} /> {course.title} · Sprint
      </Link>
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-ink">Free-response coach</h1>
      <p className="mt-2 text-[15px] text-muted">Get an exam-style prompt, write your answer like it&apos;s exam day, and see what a reader would score it, with exactly how to earn the points you missed.</p>
      <div className="mt-8">
        {sprint.unlocked ? <FrqCoach sprintId={id} units={units} initialUnit={initial} past={sprint.frq} /> : <p className="rounded-2xl bg-bg-subtle p-5 text-ink">Unlock your Sprint to use the free-response coach.</p>}
      </div>
    </div>
  );
}
