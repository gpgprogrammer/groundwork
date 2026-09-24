import { Flame, PlayCircle, Target, Trophy } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CourseIcon, courseColor } from "@/components/course-icon";
import { PlusBadge, PlusLocked } from "@/components/upgrade";
import { cn } from "@/components/ui";
import { hasPlus } from "@/lib/billing/access";
import { getCatalog } from "@/lib/catalog";
import { getStore } from "@/lib/data/store";
import { getDoneTasks } from "@/lib/plan-store";
import { courseProgress, nextTopicInCourse } from "@/lib/recommend";
import type { Sprint } from "@/lib/types";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Progress" };

const DAY = 86400000;
const key = (iso: string) => new Date(iso).toDateString();

function activityStats(stamps: string[], now = Date.now()) {
  const active = new Set(stamps.map(key));
  // A streak survives until the end of today even if you haven't studied yet.
  let streak = 0;
  let t = now;
  if (!active.has(new Date(t).toDateString())) t -= DAY;
  while (active.has(new Date(t).toDateString())) {
    streak++;
    t -= DAY;
  }
  const thisWeek = stamps.filter((s) => new Date(s).getTime() > now - 7 * DAY).length;
  return { streak, thisWeek };
}

function heatmapStart() {
  const end = new Date(new Date().toDateString());
  return { end, start: new Date(end.getTime() - (7 * 12 - 1 + end.getDay()) * DAY) };
}

export default async function ProgressPage() {
  const [viewer, catalog] = await Promise.all([getViewer(), getCatalog()]);
  if (!viewer || !hasPlus(viewer.plus)) {
    return (
      <div className="mx-auto max-w-[1100px] px-4 pb-16 pt-8 sm:px-6">
        <PlusLocked access={viewer?.plus ?? { kind: "anonymous" }} feature="Progress tracking" returnTo="/progress" />
      </div>
    );
  }
  const { state } = viewer;
  const [done, sprints] = await Promise.all([getDoneTasks(viewer.user.id), (await getStore()).listDocs<Sprint>("sprints", { owner: viewer.user.id })]);

  // Every dated thing the student did.
  const stamps = [
    ...Object.values(state.history).map((h) => h.openedAt),
    ...Object.values(state.mastered),
    ...Object.values(done),
    ...sprints.flatMap((s) => s.answers.map((a) => a.at)),
  ];
  const { streak, thisWeek } = activityStats(stamps);
  const mastered = Object.keys(state.mastered).length;
  const watched = Object.keys(state.history).length;

  // 12-week heatmap, Sunday-aligned columns.
  const counts = new Map<string, number>();
  for (const s of stamps) counts.set(key(s), (counts.get(key(s)) ?? 0) + 1);
  const { start, end } = heatmapStart();
  const cells = Array.from({ length: Math.round((end.getTime() - start.getTime()) / DAY) + 1 }, (_, i) => {
    const d = new Date(start.getTime() + i * DAY);
    return { d, n: counts.get(d.toDateString()) ?? 0 };
  });

  const courses = state.profile.courseIds.map((id) => catalog.course(id)).filter((c) => c !== undefined);

  return (
    <div className="mx-auto max-w-[1100px] px-4 pb-16 pt-8 sm:px-6">
      <PlusBadge />
      <h1 className="mt-3 text-[34px] font-bold tracking-tight text-ink">Your progress</h1>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { icon: Flame, label: "Day streak", value: streak, tone: "text-[#e0531c]" },
          { icon: Trophy, label: "Topics understood", value: mastered, tone: "text-[#d99a00]" },
          { icon: PlayCircle, label: "Lessons watched", value: watched, tone: "text-accent" },
          { icon: Target, label: "Study actions this week", value: thisWeek, tone: "text-positive" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-5 ring-1 ring-line">
            <s.icon className={cn("size-5", s.tone)} />
            <p className="tabular mt-3 text-3xl font-bold text-ink">{s.value}</p>
            <p className="text-[13px] text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <section className="mt-8 rounded-2xl p-5 ring-1 ring-line">
        <h2 className="text-[15px] font-semibold text-ink">Last 12 weeks</h2>
        <div className="mt-4 overflow-x-auto">
          <div className="grid w-max grid-flow-col grid-rows-7 gap-1">
            {cells.map((c) => (
              <span
                key={c.d.toISOString()}
                title={`${c.d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}: ${c.n} ${c.n === 1 ? "action" : "actions"}`}
                className={cn(
                  "size-3.5 rounded-[4px]",
                  c.n === 0 ? "bg-bg-subtle" : c.n < 3 ? "bg-accent/30" : c.n < 6 ? "bg-accent/60" : "bg-accent",
                )}
              />
            ))}
          </div>
        </div>
      </section>

      <h2 className="mt-10 text-xl font-bold tracking-tight text-ink">By course</h2>
      {!courses.length ? <p className="mt-3 text-muted">Add courses in onboarding to track them here.</p> : null}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {courses.map((c) => {
          const p = courseProgress(catalog, state, c.id);
          const next = nextTopicInCourse(catalog, state, c.id);
          const units = catalog.unitsForCourse(c.id);
          return (
            <section key={c.id} className="rounded-2xl p-5 ring-1 ring-line">
              <div className="flex items-center gap-3">
                <CourseIcon id={c.id} size={40} />
                <div className="min-w-0 flex-1">
                  <Link href={`/courses/${c.slug}`} className="block truncate font-semibold text-ink hover:underline">
                    {c.title}
                  </Link>
                  <p className="tabular text-[13px] text-muted">
                    {p.done} of {p.total} topics · {Math.round((p.done / Math.max(1, p.total)) * 100)}%
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {units.map((u) => {
                  const ts = catalog.topicsForUnit(u.id);
                  const d = ts.filter((t) => state.mastered[t.id]).length;
                  return (
                    <div key={u.id} className="flex items-center gap-3 text-[12.5px]">
                      <span className="w-40 truncate text-ink-2" title={u.title}>
                        {u.order}. {u.title}
                      </span>
                      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                        <span className="block h-full rounded-full" style={{ width: `${(d / Math.max(1, ts.length)) * 100}%`, background: courseColor(c.id) }} />
                      </span>
                      <span className="tabular w-10 text-right text-muted">
                        {d}/{ts.length}
                      </span>
                    </div>
                  );
                })}
              </div>
              {next ? (
                <Link href={`/courses/${c.slug}/${next.slug}`} className="mt-4 block text-[13px] font-medium text-accent hover:underline">
                  Next up: {next.title} →
                </Link>
              ) : null}
            </section>
          );
        })}
      </div>
    </div>
  );
}
