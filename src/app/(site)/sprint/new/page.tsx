import type { Metadata } from "next";
import { Target } from "lucide-react";
import Link from "next/link";
import { TestSprintForm } from "@/components/sprint/test-form";
import { getCatalog } from "@/lib/catalog";
import { requireViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Sprint for a test" };

export default async function NewTestSprintPage({ searchParams }: PageProps<"/sprint/new">) {
  const [viewer, catalog, sp] = await Promise.all([requireViewer("/sprint/new"), getCatalog(), searchParams]);
  const uid = typeof sp.event === "string" ? sp.event : null;
  const event = uid ? viewer.state.schedule?.events.find((e) => e.uid === uid) : undefined;
  const mine = viewer.state.profile.courseIds;
  const ordered = [...catalog.courses].sort((a, b) => Number(mine.includes(b.id)) - Number(mine.includes(a.id)));
  const courses = ordered.map((c) => ({ id: c.id, title: c.title, units: catalog.unitsForCourse(c.id).map((u) => ({ id: u.id, label: `Unit ${u.order}: ${u.title}` })) }));
  const unitIds = [...new Set((event?.topicIds ?? []).map((t) => catalog.topic(t)?.unitId).filter((u): u is string => Boolean(u)))];
  const initialCourse = event?.courseId ?? (typeof sp.course === "string" ? sp.course : "");
  return (
    <div className="pb-20">
      <header className="relative overflow-hidden bg-sprint text-white">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-28 size-[380px] rounded-full border-[52px] border-white/[0.08]" />
        <div className="relative mx-auto max-w-3xl px-4 pb-24 pt-8 sm:px-6">
          <Link href="/sprint" className="inline-flex items-center gap-1.5 font-brand text-[13.5px] font-bold text-white/80 hover:text-white">
            <Target className="size-3.5" /> Exam Sprint
          </Link>
          <h1 className="display rise mt-4 text-[40px] sm:text-[52px]">Sprint for a test</h1>
          <p className="rise mt-3 max-w-xl text-[16.5px] leading-relaxed text-white/90" style={{ ["--i" as string]: 1 }}>
            A day-by-day plan to this test: lessons and practice for just the units it covers. Take the free diagnostic first to see where you stand.
          </p>
        </div>
      </header>
      <div className="relative mx-auto -mt-16 max-w-3xl px-4 sm:px-6">
        <div className="rise rounded-3xl bg-surface p-5 ring-2 ring-line shadow-[0_6px_0_0_var(--line)] sm:p-8" style={{ ["--i" as string]: 2 }}>
          {event && !event.courseId ? (
            <p className="mb-6 rounded-2xl bg-warn-soft p-4 text-[14.5px] font-semibold text-ink">Your calendar didn&apos;t say which class this is for, so pick it below.</p>
          ) : null}
          <TestSprintForm
            courses={courses}
            initial={{ courseId: initialCourse, title: event?.title ?? "", date: event ? event.start.slice(0, 10) : "", unitIds, eventUid: event?.uid ?? null }}
          />
        </div>
      </div>
    </div>
  );
}
