import type { Metadata } from "next";
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
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-8 sm:px-6">
      <Link href="/sprint" className="text-sm text-muted hover:text-ink">
        ← Exam Sprint
      </Link>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink">Sprint for a test</h1>
      <p className="mt-2 text-[15px] text-muted">
        A day-by-day plan to this test: the best lessons and practice for just the units it covers. Take the free diagnostic first to see where you stand.
      </p>
      {event && !event.courseId ? (
        <p className="mt-4 rounded-xl bg-warn-soft p-3 text-sm text-ink">Your calendar didn&apos;t say which class this is for, so pick it below.</p>
      ) : null}
      <div className="mt-8">
        <TestSprintForm
          courses={courses}
          initial={{ courseId: initialCourse, title: event?.title ?? "", date: event ? event.start.slice(0, 10) : "", unitIds, eventUid: event?.uid ?? null }}
        />
      </div>
    </div>
  );
}
