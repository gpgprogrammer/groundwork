import type { Metadata } from "next";
import { WorldBand } from "@/components/learn-band";
import { ArrowUpDown, Ban } from "lucide-react";
import Link from "next/link";
import { Container, cn } from "@/components/ui";
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

const TONES = ["bg-accent", "bg-accent/55", "bg-accent/25"];

export default function HowRankingWorksPage() {
  const sorts = Object.values(SORTS).slice(1);
  return (
    <>
    <WorldBand
      kicker="Ranking"
      title="How ranking works"
      lede="YouTube orders videos by what keeps people watching. We order them by what helps students study. Each lesson gets a score from 0 to 100 built only from Merit's own signals, recomputed as students use Merit. When two lessons tie, the one with more YouTube views comes first."
    />
    <Container size="md" className="pb-24 pt-2">

      {/* The score, split into its signals */}
      <section aria-labelledby="score-h" className="rise mt-10 rounded-2xl bg-surface p-5 ring-2 ring-line sm:p-7" style={{ ["--i" as string]: 1 }}>
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="score-h" className="text-[13px] font-semibold text-muted">
            What goes into a lesson&apos;s score
          </h2>
          <span className="tabular text-[13px] font-semibold text-muted">100 points</span>
        </div>
        <div className="mt-3 flex h-3 gap-1 overflow-hidden rounded-full" aria-hidden>
          {SIGNALS.map(([key], i) => (
            <div key={key} className={cn("h-full first:rounded-l-full last:rounded-r-full", TONES[i])} style={{ width: `${RANKING_WEIGHTS[key] * 100}%` }} />
          ))}
        </div>
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[13px] text-ink-2">
          {SIGNALS.map(([key, name], i) => (
            <li key={key} className="flex items-center gap-2">
              <span className={cn("size-2.5 rounded-full", TONES[i])} aria-hidden />
              {name} <span className="tabular font-semibold text-ink">{Math.round(RANKING_WEIGHTS[key] * 100)}%</span>
            </li>
          ))}
        </ul>

        <ol className="mt-7 divide-y divide-line border-t border-line">
          {SIGNALS.map(([key, name, body], i) => {
            const w = RANKING_WEIGHTS[key];
            return (
              <li key={key} className="grid gap-3 py-6 last:pb-0 sm:grid-cols-[160px_1fr] sm:gap-8">
                <div>
                  <h3 className="headline flex items-center gap-2 text-[17px] text-ink">
                    <span className={cn("size-2.5 shrink-0 rounded-full", TONES[i])} aria-hidden />
                    {name}
                  </h3>
                  <p className="tabular mt-1 text-[28px] font-bold tracking-tight text-ink">
                    {Math.round(w * 100)}
                    <span className="text-[15px] font-semibold text-muted">%</span>
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-bg-subtle" role="img" aria-label={`${Math.round(w * 100)}% of the score`}>
                    <div className="h-full rounded-full bg-accent" style={{ width: `${w * 100}%` }} />
                  </div>
                </div>
                <p className="text-[15px] leading-relaxed text-ink-2">{body}</p>
              </li>
            );
          })}
        </ol>
      </section>

      <section aria-labelledby="sort-h" className="mt-14">
        <h2 id="sort-h" className="headline flex items-center gap-2.5 text-2xl text-ink">
          <ArrowUpDown className="size-5 text-accent-ink" /> Sort it your way
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-2">
          Every feed and topic page can also be sorted by {sorts.map((s) => s.toLowerCase()).join(", ")}, and filtered by length.
        </p>
        <ul className="mt-4 flex flex-wrap gap-2" aria-hidden>
          {sorts.map((s) => (
            <li key={s} className="inline-flex h-8 items-center rounded-full bg-bg-subtle px-3.5 text-[13px] font-semibold text-ink-2">
              {s}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="dont-h" className="mt-14">
        <h2 id="dont-h" className="headline text-2xl text-ink">
          What we don&apos;t do
        </h2>
        <ul className="mt-5 space-y-3">
          {[
            <>Channels can&apos;t pay for placement.</>,
            <>Songs, parodies, and ASMR aren&apos;t lessons, so they rank below real ones. They&apos;re still there, and sorting by views treats them like any other video.</>,
            <>We don&apos;t turn YouTube&apos;s likes, views, or comments into scores of our own. View counts are shown exactly as YouTube reports them.</>,
            <>We don&apos;t rank on thumbnails or click-through rate.</>,
            <>Your individual activity is never shown to other students. Only totals feed into rankings.</>,
          ].map((item, i) => (
            <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-ink-2">
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-bg-subtle text-muted">
                <Ban className="size-3.5" />
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-14 rounded-2xl bg-bg-subtle px-5 py-4 text-[14px] text-ink-2">
        See it in action on{" "}
        <Link href="/courses/ap-calculus-bc/chain-rule" className="font-semibold text-accent-ink hover:underline">
          Chain Rule
        </Link>{" "}
        or{" "}
        <Link href="/courses/ap-world-history/champa-rice" className="font-semibold text-accent-ink hover:underline">
          Champa Rice
        </Link>
        .
      </p>
    </Container>
    </>
  );
}
