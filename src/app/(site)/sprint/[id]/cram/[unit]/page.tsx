import { Lock, Printer } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/ask/markdown";
import { CourseIcon } from "@/components/course-icon";
import { cramSheet } from "@/lib/ai/content";
import { getCatalog } from "@/lib/catalog";
import { getSprint } from "@/lib/sprint-store";
import { requireViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Cram sheet" };
export const maxDuration = 60;

export default async function CramPage({ params }: PageProps<"/sprint/[id]/cram/[unit]">) {
  const { id, unit: rawUnit } = await params;
  const unitId = decodeURIComponent(rawUnit);
  const viewer = await requireViewer(`/sprint/${id}`);
  const sprint = await getSprint(id);
  if (!sprint || sprint.userId !== viewer.user.id) notFound();
  const catalog = await getCatalog();
  const unit = catalog.unit(unitId);
  if (!unit || unit.courseId !== sprint.courseId) notFound();
  const course = catalog.course(unit.courseId)!;
  const md = sprint.unlocked ? await cramSheet(unit.id) : null;
  const topics = catalog.topicsForUnit(unit.id);
  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-8 sm:px-6">
      <Link href={`/sprint/${id}`} className="flex items-center gap-3 text-sm text-muted hover:text-ink">
        <CourseIcon id={course.id} size={28} /> {course.title} · Cram sheets
      </Link>
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-ink">
        Unit {unit.order}: {unit.title}
      </h1>
      {!sprint.unlocked ? (
        <p className="mt-6 flex items-center gap-2 rounded-2xl bg-bg-subtle p-5 text-ink">
          <Lock className="size-4" /> Cram sheets come with an unlocked Sprint.
        </p>
      ) : md ? (
        <article className="mt-6 rounded-3xl p-6 ring-1 ring-line sm:p-8">
          <Markdown text={md} />
        </article>
      ) : (
        <div className="mt-6 rounded-3xl p-6 ring-1 ring-line">
          <p className="font-semibold text-ink">Key points for this unit</p>
          <p className="mt-1 text-[13px] text-muted">The full cram sheet appears here as soon as Merit AI is connected.</p>
          <ul className="mt-4 space-y-3 text-[14.5px] text-ink-2">
            {topics.map((t) => (
              <li key={t.id}>
                <span className="font-semibold text-ink">{t.title}.</span> {t.summary} {t.keyPoints.length ? <span className="text-muted">({t.keyPoints.join("; ")})</span> : null}
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="mt-4 flex items-center gap-1.5 text-[12.5px] text-muted">
        <Printer className="size-3.5" /> Tip: print this page for a one-page review.
      </p>
    </div>
  );
}
