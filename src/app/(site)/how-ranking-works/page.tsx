import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";
import { RANKING_WEIGHTS } from "@/lib/ranking";

export const metadata: Metadata = {
  title: "How ranking works",
  description: "How Groundwork orders lessons: by completion, helpfulness, saves and engagement quality, with views weighted lightly.",
};

const SIGNALS = [
  {
    key: "completion",
    name: "Completion rate",
    body: "The share of students who watch at least 90% of a lesson. It's the clearest sign that a lesson kept people's attention through the hard part. We smooth it toward a prior (45% over 150 views), so a new lesson with a handful of viewers doesn't jump to the top on luck.",
  },
  {
    key: "helpful",
    name: "Helpful votes",
    body: "After watching, students can mark a lesson helpful or not. We use the lower bound of the Wilson score interval instead of the raw ratio. 9 of 10 helpful ranks below 900 of 1,000, because we're less sure about it.",
  },
  {
    key: "saves",
    name: "Saves",
    body: "Saving a lesson to rewatch before an exam is a strong, deliberate signal. We measure saves per viewer, smoothed the same way, and cap it at 12% so one outlier can't dominate.",
  },
  {
    key: "engagement",
    name: "Engagement quality",
    body: "Average watch depth, rewatch rate, and early drop-off (viewers who leave within the first 15%). Rewatching a section is often a good sign: students return to something that finally made sense.",
  },
  {
    key: "reach",
    name: "Views",
    body: "Reach, log-scaled and weighted lightly. It breaks ties between lessons that teach equally well. It isn't used to decide which lesson is better.",
  },
] as const;

export default function HowRankingWorksPage() {
  return (
    <Container size="md" className="py-16">
      <p className="eyebrow">Method</p>
      <h1 className="display mt-3 text-4xl text-ink sm:text-5xl">How ranking works</h1>
      <p className="mt-6 text-[18px] leading-relaxed text-ink-2">
        Most video platforms rank by attention: views, clicks, watch time. We rank by evidence that a lesson helped someone
        learn. Every topic page lists lessons by a quality score from 0 to 100, built from five signals.
      </p>

      <div className="mt-12 space-y-3">
        {SIGNALS.map((s) => {
          const w = RANKING_WEIGHTS[s.key];
          return (
            <section key={s.key} className="rounded-2xl border border-line bg-surface p-6">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-[17px] font-semibold tracking-tight text-ink">{s.name}</h2>
                <span className="tabular font-mono text-sm text-muted">{Math.round(w * 100)}%</span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-bg-subtle">
                <div className="h-full rounded-full bg-ink" style={{ width: `${(w / 0.35) * 100}%` }} />
              </div>
              <p className="mt-4 text-[15px] leading-relaxed text-ink-2">{s.body}</p>
            </section>
          );
        })}
      </div>

      <div className="mt-12 rounded-2xl bg-bg-subtle p-6 font-mono text-[13px] leading-7 text-ink-2">
        score = 100 × ( 0.35·completion + 0.25·wilson(helpful) + 0.20·min(1, saveRate / 0.12)
        <br />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ 0.15·engagement + 0.05·log₁₀(views) / 5 )
      </div>

      <h2 className="headline mt-16 text-2xl text-ink">What we don&apos;t do</h2>
      <ul className="mt-5 space-y-3 text-[15px] leading-relaxed text-ink-2">
        <li>Educators can&apos;t pay for placement. Tutoring bookings have no effect on ranking.</li>
        <li>We don&apos;t use thumbnails, titles, or click-through rate, so there&apos;s no reason to write clickbait.</li>
        <li>Scores are recomputed as students watch, so a strong new lesson can reach the top within its first few hundred views.</li>
      </ul>

      <p className="mt-12 text-sm text-muted">
        See it on any topic, for example{" "}
        <Link href="/courses/ap-calculus-bc/chain-rule" className="text-ink underline underline-offset-4">
          Chain Rule
        </Link>{" "}
        or{" "}
        <Link href="/courses/ap-world-history/champa-rice" className="text-ink underline underline-offset-4">
          Champa Rice
        </Link>
        .
      </p>
    </Container>
  );
}
