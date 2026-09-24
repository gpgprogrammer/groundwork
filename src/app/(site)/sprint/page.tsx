import { ArrowRight, BookOpenCheck, CalendarRange, ClipboardCheck, Gauge as GaugeIcon, NotebookText, PenLine, Target, Zap } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutNotice } from "@/components/checkout-notice";
import { CourseIcon } from "@/components/course-icon";
import { Faq } from "@/components/marketing";
import { ReadinessBars } from "@/components/sprint/readiness";
import { SprintStartForm } from "@/components/sprint/start-form";
import { SPRINT, usd } from "@/lib/billing/plans";
import { getCatalog } from "@/lib/catalog";
import { getStore } from "@/lib/data/store";
import { examDateFor } from "@/lib/exams";
import { daysLeft, estimatedScore, overall, readiness } from "@/lib/sprint";
import type { Sprint } from "@/lib/types";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = {
  title: "Exam Sprint",
  description: `A day-by-day plan to your AP or SAT exam, unlimited exam-style practice, and a live readiness score. Free diagnostic, then ${usd(SPRINT.price)} once.`,
};

const ICONS = [ClipboardCheck, CalendarRange, Zap, GaugeIcon, BookOpenCheck, NotebookText, PenLine];

export default async function SprintHome({ searchParams }: PageProps<"/sprint">) {
  const [viewer, catalog, sp] = await Promise.all([getViewer(), getCatalog(), searchParams]);
  const sprints = viewer ? (await (await getStore()).listDocs<Sprint>("sprints", { owner: viewer.user.id })).sort((a, b) => b.createdAt.localeCompare(a.createdAt)) : [];
  const initial = typeof sp.course === "string" && catalog.course(sp.course) ? sp.course : (viewer?.state.profile.courseIds[0] ?? null);
  const options = catalog.courses.map((c) => ({ id: c.id, title: c.title, category: c.category, defaultDate: examDateFor(c, null) }));
  const example = catalog.course("ap-biology")
    ? readiness(catalog, { id: "x", userId: "x", courseId: "ap-biology", examDate: "2099-01-01", minutesPerDay: 45, createdAt: "", unlocked: true, answers: [], done: {}, frq: [], confidence: Object.fromEntries(catalog.unitsForCourse("ap-biology").map((u, i) => [u.id, [4, 3, 2, 4, 1, 3, 2, 5][i % 8]])) })
    : [];

  return (
    <div className="pb-20">
      <div className="mx-auto max-w-[1200px] px-4 pt-6 sm:px-6">
        <CheckoutNotice sp={sp} />
        {sprints.length ? (
          <section className="mb-8">
            <h2 className="text-lg font-bold tracking-tight text-ink">Your Sprints</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {sprints.map((s) => {
                const c = catalog.course(s.courseId);
                if (!c) return null;
                const r = readiness(catalog, s);
                const est = estimatedScore(c, r);
                return (
                  <Link key={s.id} href={`/sprint/${s.id}`} className="flex items-center gap-4 rounded-2xl p-4 ring-1 ring-line hover:bg-bg-subtle">
                    <CourseIcon id={c.id} size={44} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-ink">{c.title}</p>
                      <p className="tabular text-[13px] text-muted">
                        {daysLeft(s)} days left · {Math.round(overall(r) * 100)}% ready · est. {est.label}
                      </p>
                    </div>
                    <ArrowRight className="size-4 text-muted" />
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}

        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#ff8a3d] via-[#ef5b25] to-[#9a2d0e] px-6 py-10 text-white sm:px-12 sm:py-14">
          <div className="pointer-events-none absolute -right-20 -top-20 size-96 rounded-full bg-white/10 blur-3xl" />
          <div className="relative grid gap-10 lg:grid-cols-[1fr_400px] lg:items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[12px] font-bold uppercase tracking-wide">
                <Target className="size-3.5" /> {SPRINT.name}
              </p>
              <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">Your exam, planned day by day.</h1>
              <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-white/85">
                Find out where you stand in 10 minutes. Then get exactly what to watch and practice every day until exam day, with a readiness score that climbs as you go.
              </p>
              <p className="mt-6 text-[15px] font-semibold">
                Diagnostic free · then {usd(SPRINT.price)} once <span className="font-normal text-white/75">· not a subscription</span>
              </p>
            </div>
            <div className="rounded-3xl bg-black/15 p-6 backdrop-blur">
              <SprintStartForm courses={options} initialCourse={initial} signedIn={Boolean(viewer)} />
            </div>
          </div>
        </section>

        <section className="mt-16 grid gap-10 lg:grid-cols-[1fr_440px] lg:items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-ink">See exactly where the points are.</h2>
            <p className="mt-3 text-[16px] leading-relaxed text-ink-2">
              Every unit gets a live readiness score from your diagnostic and every practice question after it. Units that count more on the exam and units you&apos;re weakest in move to the front of your plan.
            </p>
          </div>
          <div className="rounded-3xl p-6 ring-1 ring-line">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-ink">AP Biology readiness</p>
              <span className="rounded-full bg-bg-subtle px-2 py-0.5 text-[11px] font-medium text-muted">Example</span>
            </div>
            <div className="mt-4">
              <ReadinessBars units={example} compact />
            </div>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-3xl font-bold tracking-tight text-ink">Everything in a Sprint</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SPRINT.features.map((f, i) => {
              const Icon = ICONS[i % ICONS.length];
              return (
                <div key={f.title} className="rounded-2xl p-6 ring-1 ring-line">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-[#fff1e8] text-[#e0531c] dark:bg-[#3a1d0c]">
                    <Icon className="size-5" />
                  </span>
                  <p className="mt-4 font-semibold text-ink">{f.title}</p>
                  <p className="mt-1 text-[14px] leading-relaxed text-muted">{f.body}</p>
                </div>
              );
            })}
            <div className="flex flex-col justify-center rounded-2xl bg-gradient-to-br from-[#ff8a3d] to-[#c2410c] p-6 text-white">
              <p className="text-4xl font-extrabold">{usd(SPRINT.price)}</p>
              <p className="mt-1 text-[14px] text-white/85">Once, for one exam. Less than a single hour of tutoring.</p>
              <Link href="/pricing/parents" className="mt-4 text-[13px] font-semibold underline underline-offset-2">
                A parent can pay for it →
              </Link>
            </div>
          </div>
        </section>

        <div className="mx-auto mt-16 max-w-3xl">
          <Faq
            items={[
              ["What do I get for free?", "The full diagnostic, your readiness by unit, an estimated score, and a preview of your first days. You only pay to unlock the full plan, unlimited practice, checkpoints, cram sheets, and the free-response coach."],
              ["How is the estimated score calculated?", "From your accuracy on exam-style questions in each unit, weighted by how much of the course each unit covers, with your own confidence as a starting point. It's a guide to where you stand, not a guarantee, and it gets sharper the more you practice."],
              ["What if my exam is less than 30 days away?", "The plan compresses to the days you have: the heaviest, weakest units first, then checkpoints and review."],
              ["Which exams are covered?", "Every AP exam and both SAT sections."],
              ["Where do the questions come from?", "Merit writes exam-style questions for every topic, each with an explanation for every answer choice, and pairs them with the best-ranked lessons in our library."],
            ]}
          />
        </div>
      </div>
    </div>
  );
}
