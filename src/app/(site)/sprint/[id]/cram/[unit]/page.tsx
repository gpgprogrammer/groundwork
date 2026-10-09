import { Lock, Printer } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/ask/markdown";
import { CourseIcon } from "@/components/course-icon";
import { cramSheet } from "@/lib/ai/content";
import { getCatalog } from "@/lib/catalog";
import { consumeCredit, getSprint } from "@/lib/sprint-store";
import { requireViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Cram sheet" };
export const maxDuration = 60;

export default async function CramPage({ params }: PageProps<"/sprint/[id]/cram/[unit]">) {
  const { id, unit: rawUnit } = await params;
  const unitId = decodeURIComponent(rawUnit);
  const viewer = await requireViewer(`/sprint/${id}`);
  const stored = await getSprint(id);
  if (!stored || stored.userId !== viewer.user.id) notFound();
  const sprint = await consumeCredit(stored);
  const catalog = await getCatalog();
  const unit = catalog.unit(unitId);
  if (!unit || unit.courseId !== sprint.courseId) notFound();
  const course = catalog.course(unit.courseId)!;
  const md = sprint.unlocked ? await cramSheet(unit.id) : null;
  const topics = catalog.topicsForUnit(unit.id);
  return (
    <div className="pb-20">
      <header className="relative overflow-hidden bg-sprint text-white print:bg-transparent print:text-ink">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-28 size-[380px] rounded-full border-[52px] border-white/[0.08] print:hidden" />
        <div className="relative mx-auto max-w-3xl px-4 pb-10 pt-8 sm:px-6">
          <Link href={`/sprint/${id}`} className="inline-flex items-center gap-2 font-brand text-[13.5px] font-bold text-white/80 hover:text-white print:hidden">
            <CourseIcon id={course.id} size={22} /> {course.title} · Cram sheets
          </Link>
          <div className="rise mt-5 flex items-center gap-4">
            <span className="tabular flex size-16 shrink-0 items-center justify-center rounded-2xl bg-white font-brand text-[30px] font-black text-[#b3400f]">{unit.order}</span>
            <div className="min-w-0">
              <p className="font-brand text-[13.5px] font-extrabold uppercase tracking-wide text-white/80">Unit {unit.order} cram sheet</p>
              <h1 className="display text-[30px] sm:text-[42px]">
                <span className="sr-only">Unit {unit.order}: </span>
                {unit.title}
              </h1>
            </div>
          </div>
        </div>
      </header>
      <div className="mx-auto mt-8 max-w-3xl px-4 sm:px-6">
        {!sprint.unlocked ? (
          <div className="flex items-center gap-4 rounded-3xl bg-surface p-6 ring-2 ring-line">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-sprint text-white">
              <Lock className="size-6" />
            </span>
            <p className="font-brand text-[16px] font-extrabold text-ink">Cram sheets come with an unlocked Sprint.</p>
          </div>
        ) : md ? (
          <article className="rounded-3xl bg-surface p-6 ring-2 ring-line sm:p-8">
            <Markdown text={md} variant="prose" />
          </article>
        ) : (
          <div className="rounded-3xl bg-surface p-6 ring-2 ring-line sm:p-8">
            <p className="font-brand text-[18px] font-extrabold text-ink">Key points for this unit</p>
            <p className="mt-1 text-[13.5px] text-muted">The full cram sheet appears here as soon as Merit AI is connected.</p>
            <ol className="mt-5 space-y-3">
              {topics.map((t, i) => (
                <li key={t.id} className="flex gap-3.5 rounded-2xl bg-bg-subtle p-4 text-[14.5px] text-ink-2">
                  <span className="tabular flex size-8 shrink-0 items-center justify-center rounded-xl bg-sprint font-brand text-[14px] font-black text-white">{i + 1}</span>
                  <span className="min-w-0">
                    <span className="block font-brand text-[16px] font-extrabold text-ink">{t.title}</span>
                    {t.summary} {t.keyPoints.length ? <span className="text-muted">({t.keyPoints.join("; ")})</span> : null}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}
        <p className="mt-4 flex items-center gap-1.5 font-brand text-[13px] font-bold text-muted print:hidden">
          <Printer className="size-4" /> Tip: print this page for a one-page review.
        </p>
      </div>
    </div>
  );
}
