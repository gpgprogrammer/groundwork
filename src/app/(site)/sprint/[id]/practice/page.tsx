import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CourseIcon } from "@/components/course-icon";
import { SprintRunner } from "@/components/sprint/runner";
import { getCatalog } from "@/lib/catalog";
import { getSprint } from "@/lib/sprint-store";
import { requireViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Practice" };

export default async function PracticePage({ params, searchParams }: PageProps<"/sprint/[id]/practice">) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const viewer = await requireViewer(`/sprint/${id}`);
  const sprint = await getSprint(id);
  if (!sprint || sprint.userId !== viewer.user.id) notFound();
  const catalog = await getCatalog();
  const course = catalog.course(sprint.courseId)!;
  const mode = sp.mode === "checkpoint" ? "checkpoint" : sp.mode === "topic" ? "topic" : "daily";
  const topics = typeof sp.topics === "string" ? sp.topics.split(",").filter(Boolean).slice(0, 4) : [];
  const task = typeof sp.task === "string" ? sp.task : null;
  const topicTitles = Object.fromEntries(catalog.topicsForCourse(course.id).map((t) => [t.id, t.title]));
  const label = mode === "checkpoint" ? "Checkpoint" : topics.length ? topics.map((t) => topicTitles[t]).filter(Boolean).join(" · ") : "Practice";
  return (
    <div className="mx-auto max-w-3xl px-4 pt-6 sm:px-6">
      <p className="flex items-center gap-2.5 font-brand text-[14px] font-extrabold text-muted">
        <CourseIcon id={course.id} size={26} /> <span className="truncate">{course.title} · {label}</span>
      </p>
      <div className="mt-5">
        <SprintRunner sprintId={id} mode={mode} topicIds={topics} taskId={task} topicTitles={topicTitles} />
      </div>
    </div>
  );
}
