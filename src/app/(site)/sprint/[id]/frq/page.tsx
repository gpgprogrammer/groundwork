import type { Metadata } from "next";
import { Lock, PenLine } from "lucide-react";
import Link from "next/link";
import { buttonClass } from "@/components/ui";
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
    <div className="pb-20">
      <header className="relative overflow-hidden bg-sprint text-white">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-28 size-[380px] rounded-full border-[52px] border-white/[0.08]" />
        <div className="relative mx-auto max-w-3xl px-4 pb-10 pt-8 sm:px-6">
          <Link href={`/sprint/${id}`} className="inline-flex items-center gap-2 font-brand text-[13.5px] font-bold text-white/80 hover:text-white">
            <CourseIcon id={course.id} size={22} /> {course.title} · Sprint
          </Link>
          <div className="rise mt-5 flex items-center gap-4">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/20">
              <PenLine className="size-7" />
            </span>
            <h1 className="display text-[34px] sm:text-[48px]">Free-response coach</h1>
          </div>
          <p className="rise mt-4 max-w-2xl text-[16px] leading-relaxed text-white/90" style={{ ["--i" as string]: 1 }}>
            Get an exam-style prompt, write your answer like it&apos;s exam day, and see what a reader would score it, with exactly how to earn the points you missed.
          </p>
          <ol className="rise mt-6 flex flex-wrap gap-2" style={{ ["--i" as string]: 2 }}>
            {["Pick a unit", "Write your answer", "Get rubric feedback"].map((t, i) => (
              <li key={t} className="flex items-center gap-2 rounded-2xl bg-white/15 py-1.5 pl-1.5 pr-3.5 font-brand text-[13.5px] font-extrabold ring-2 ring-inset ring-white/25">
                <span className="flex size-6 items-center justify-center rounded-lg bg-white text-[12.5px] font-black text-[#b3400f]">{i + 1}</span>
                {t}
              </li>
            ))}
          </ol>
        </div>
      </header>
      <div className="mx-auto mt-8 max-w-3xl px-4 sm:px-6">
        {sprint.unlocked ? (
          <FrqCoach sprintId={id} units={units} initialUnit={initial} past={sprint.frq} />
        ) : (
          <div className="flex flex-col items-center rounded-3xl bg-surface p-8 text-center ring-2 ring-line">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-sprint text-white">
              <Lock className="size-7" />
            </span>
            <p className="headline mt-4 text-[22px] text-ink">Unlock your Sprint to use the free-response coach.</p>
            <Link href={`/sprint/${id}`} className={buttonClass("sprint", "lg", "mt-6")}>
              Back to my Sprint
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
