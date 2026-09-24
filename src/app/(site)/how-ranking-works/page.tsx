import type { Metadata } from "next";
import Link from "next/link";
import { RANKING_WEIGHTS, SORTS } from "@/lib/ranking";

export const metadata: Metadata = {
  title: "How ranking works",
  description: "How Merit orders lessons: topic fit and what Merit students find helpful.",
};

const SIGNALS = [
  ["relevance", "Topic fit", "How squarely the video covers the topic, from its title and description. A focused 8-minute lesson on the chain rule beats a 2-hour unit review that mentions it."],
  ["helpful", "Helpfulness", "Merit students mark videos as helpful (or not) for studying. Votes are smoothed so a lesson with three votes isn't ranked on luck, and one with three thousand is ranked on what students said. We show a \"% helpful\" figure once at least 5 students have voted."],
  ["saves", "Saves", "How often Merit students save a lesson to watch again before an exam."],
] as const;

export default function HowRankingWorksPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 pb-20 pt-10">
      <h1 className="text-4xl font-bold tracking-tight text-ink">How ranking works</h1>
      <p className="mt-4 text-[17px] leading-relaxed text-ink-2">
        YouTube orders videos by what keeps people watching. We order them by what helps students study. Each lesson gets a score from 0 to
        100 built only from Merit&apos;s own signals, recomputed as students use Merit. When two lessons tie, the one with more YouTube views comes first.
      </p>
      <div className="mt-10 space-y-3">
        {SIGNALS.map(([key, name, body]) => {
          const w = RANKING_WEIGHTS[key];
          return (
            <section key={key} className="rounded-xl bg-bg-subtle p-6">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-lg font-bold tracking-tight text-ink">{name}</h2>
                <span className="tabular text-sm font-medium text-muted">{Math.round(w * 100)}%</span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line">
                <div className="h-full rounded-full bg-accent" style={{ width: `${(w / 0.5) * 100}%` }} />
              </div>
              <p className="mt-4 text-[15px] leading-relaxed text-ink-2">{body}</p>
            </section>
          );
        })}
      </div>
      <h2 className="mt-14 text-2xl font-bold tracking-tight text-ink">Sort it your way</h2>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-2">
        Every feed and topic page can also be sorted by {Object.values(SORTS).slice(1).map((s) => s.toLowerCase()).join(", ")}, and filtered by length.
      </p>
      <h2 className="mt-14 text-2xl font-bold tracking-tight text-ink">What we don&apos;t do</h2>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-ink-2">
        <li>Channels can&apos;t pay for placement.</li>
        <li>Songs, parodies, and ASMR aren&apos;t lessons, so they rank below real ones. They&apos;re still there, and sorting by views treats them like any other video.</li>
        <li>We don&apos;t turn YouTube&apos;s likes, views, or comments into scores of our own. View counts are shown exactly as YouTube reports them.</li>
        <li>We don&apos;t rank on thumbnails or click-through rate.</li>
        <li>Your individual activity is never shown to other students. Only totals feed into rankings.</li>
      </ul>
      <p className="mt-12 text-sm text-muted">
        See it in action on <Link href="/courses/ap-calculus-bc/chain-rule" className="text-accent hover:underline">Chain Rule</Link> or{" "}
        <Link href="/courses/ap-world-history/champa-rice" className="text-accent hover:underline">Champa Rice</Link>.
      </p>
    </div>
  );
}
