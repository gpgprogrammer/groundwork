import { ArrowUpRight, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge, Container, EmptyState, LinkButton, formatCount, formatDuration, timeAgo } from "@/components/ui";
import { getCatalog, type RankedVideo } from "@/lib/catalog";
import { getStore } from "@/lib/data/store";
import { completionRate, helpfulRate } from "@/lib/ranking";
import { requireViewer } from "@/lib/viewer";
import { RequestActions } from "./request-actions";

export const metadata: Metadata = { title: "Creator studio" };

/**
 * The single most useful thing an educator could improve, in plain language:
 * the ranking component where this lesson trails its topic peers the most.
 */
function insightFor(v: RankedVideo, peers: RankedVideo[]) {
  if (v.stats.views < 50) return { tone: "neutral" as const, text: "Collecting data. Scores settle after about 150 views." };
  const others = peers.filter((p) => p.id !== v.id);
  if (!others.length) return { tone: "positive" as const, text: "The only lesson on this topic so far." };
  const avg = (k: "completion" | "helpful" | "saves" | "engagement") => others.reduce((n, p) => n + p.rank[k], 0) / others.length;
  const gaps = (
    [
      ["completion", "Fewer viewers finish this than other lessons on the topic. Consider trimming or splitting it."],
      ["helpful", "Helpful votes trail the topic. Adding a worked example often lifts this."],
      ["saves", "Saved less often than its peers. A clear one-line takeaway at the end tends to help."],
      ["engagement", `${Math.round(v.stats.earlyDropRate * 100)}% leave early. Try getting to the idea in the first 30 seconds.`],
    ] as const
  )
    .map(([k, text]) => ({ gap: avg(k) - v.rank[k], text }))
    .sort((a, b) => b.gap - a.gap);
  if (gaps[0].gap > 0.04) return { tone: "warn" as const, text: gaps[0].text };
  const top = peers[0];
  if (top && top.id !== v.id) {
    const names = { completion: "completion", helpful: "helpful votes", saves: "saves", engagement: "engagement" } as const;
    const weakest = (Object.keys(names) as (keyof typeof names)[]).sort((x, y) => top.rank[y] - v.rank[y] - (top.rank[x] - v.rank[x]))[0];
    return { tone: "neutral" as const, text: `Above the topic average, just behind the #1 lesson. A small gain in ${names[weakest]} would move it up.` };
  }
  return { tone: "positive" as const, text: "The top lesson on this topic. Students finish it and come back to it." };
}

export default async function CreatorPage({ searchParams }: PageProps<"/creator">) {
  const [viewer, catalog, sp] = await Promise.all([requireViewer("/creator"), getCatalog(), searchParams]);
  const educatorId = viewer.state.profile.educatorId;
  if (viewer.state.profile.role !== "creator" || !educatorId) redirect("/creator/join");
  const educator = catalog.educator(educatorId);
  if (!educator) redirect("/creator/join");

  const showAll = sp.all === "1";
  const store = await getStore();
  const [requests, drafts] = await Promise.all([store.listTutoringRequests(educatorId), store.listDrafts(educatorId)]);
  const lessons = catalog.videosForEducator(educatorId);
  const views = lessons.reduce((n, v) => n + v.stats.views, 0);
  const weighted = (f: (v: RankedVideo) => number) => (views ? lessons.reduce((n, v) => n + f(v) * v.stats.views, 0) / views : 0);
  const avgCompletion = weighted((v) => completionRate(v.stats));
  const avgHelpful = weighted((v) => helpfulRate(v.stats));
  const saves = lessons.reduce((n, v) => n + v.stats.saves, 0);
  const openRequests = requests.filter((r) => r.status === "new").length;
  const topPicks = lessons.filter((v) => catalog.videosForTopic(v.topicId)[0]?.id === v.id).length;

  return (
    <Container size="xl" className="py-10 sm:py-12">
      {sp.welcome ? (
        <div className="rise mb-8 rounded-xl border border-line bg-surface p-5">
          <p className="text-[15px] font-medium text-ink">Welcome to the studio, {educator.firstName}.</p>
          <p className="mt-1 text-sm text-muted">Publish your first lesson. Students will find it on its topic page, ranked on how well it teaches.</p>
        </div>
      ) : null}
      {sp.created ? (
        <div className="rise mb-8 rounded-xl border border-positive/20 bg-positive-soft px-4 py-3 text-sm text-positive">
          Lesson saved.{" "}
          {catalog.video(String(sp.created)) ? (
            <Link href={`/watch/${sp.created}`} className="font-medium underline underline-offset-4">
              View it live
            </Link>
          ) : (
            "It's in your drafts."
          )}
        </div>
      ) : null}

      <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Creator studio</p>
          <h1 className="headline mt-2 text-3xl text-ink">{educator.name}</h1>
        </div>
        <div className="flex gap-2">
          <LinkButton href={`/educators/${educator.handle}`} variant="ghost" size="sm">
            Public profile <ArrowUpRight className="size-3.5" />
          </LinkButton>
          <LinkButton href="/creator/profile" variant="secondary" size="sm">
            Edit profile
          </LinkButton>
          <LinkButton href="/creator/new" size="sm">
            <Plus className="size-4" /> New lesson
          </LinkButton>
        </div>
      </header>

      <dl className="tabular mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-5">
        {[
          ["Views", formatCount(views), "All time"],
          ["Finish rate", `${Math.round(avgCompletion * 100)}%`, "Weighted by views"],
          ["Found helpful", `${Math.round(avgHelpful * 100)}%`, "Of votes cast"],
          ["Saves", formatCount(saves), "Students keeping it"],
          ["Top picks", `${topPicks}/${lessons.length}`, "Ranked #1 on the topic"],
        ].map(([k, v, note]) => (
          <div key={k} className="bg-surface p-5">
            <dt className="text-xs text-muted">{k}</dt>
            <dd className="mt-1.5 text-2xl font-semibold tracking-tight text-ink">{v}</dd>
            <p className="mt-0.5 text-[11px] text-faint">{note}</p>
          </div>
        ))}
      </dl>

      <div className="mt-12 grid gap-10 xl:grid-cols-[1fr_380px]">
        <section className="min-w-0">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="headline text-[17px] text-ink">Lessons</h2>
            <Link href="/how-ranking-works" className="text-xs text-muted hover:text-ink">
              How scores work
            </Link>
          </div>
          {lessons.length || drafts.length ? (
            <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs text-muted">
                    <th className="px-4 py-3 font-medium">Lesson</th>
                    <th className="px-3 py-3 text-right font-medium">Views</th>
                    <th className="px-3 py-3 text-right font-medium">Finish</th>
                    <th className="px-3 py-3 text-right font-medium">Helpful</th>
                    <th className="px-3 py-3 text-right font-medium">Score</th>
                    <th className="px-4 py-3 text-right font-medium">Topic rank</th>
                  </tr>
                </thead>
                <tbody className="tabular divide-y divide-line">
                  {drafts.map((v) => (
                    <tr key={v.id} className="align-top">
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-ink">{v.title}</p>
                        <p className="mt-0.5 text-xs text-muted">
                          {catalog.topic(v.topicId)?.title} · {v.style} · {formatDuration(v.durationSec)}
                        </p>
                      </td>
                      <td colSpan={5} className="px-4 py-3.5 text-right">
                        <Badge tone="outline">Draft</Badge>
                      </td>
                    </tr>
                  ))}
                  {[...lessons]
                    .sort((a, b) => b.stats.views - a.stats.views)
                    .slice(0, showAll ? undefined : 12)
                    .map((v) => {
                      const topicVideos = catalog.videosForTopic(v.topicId);
                      const pos = topicVideos.findIndex((x) => x.id === v.id) + 1;
                      return (
                        <tr key={v.id} className="align-top transition-colors hover:bg-bg">
                          <td className="max-w-md px-4 py-3.5">
                            <Link href={`/watch/${v.id}`} className="font-medium text-ink hover:underline">
                              {v.title}
                            </Link>
                            <p className="mt-0.5 text-xs text-muted">
                              {catalog.topic(v.topicId)?.title} · {v.style} · {formatDuration(v.durationSec)}
                            </p>
                            {(() => {
                              const insight = insightFor(v, topicVideos);
                              return (
                                <p className={`mt-2 flex gap-1.5 text-xs leading-relaxed ${insight.tone === "warn" ? "text-warn" : insight.tone === "positive" ? "text-positive" : "text-muted"}`}>
                                  <span aria-hidden>{insight.tone === "warn" ? "↗" : insight.tone === "positive" ? "✓" : "…"}</span>
                                  {insight.text}
                                </p>
                              );
                            })()}
                          </td>
                          <td className="px-3 py-3.5 text-right text-ink-2">{formatCount(v.stats.views)}</td>
                          <td className="px-3 py-3.5 text-right text-ink-2">{Math.round(completionRate(v.stats) * 100)}%</td>
                          <td className="px-3 py-3.5 text-right text-ink-2">{Math.round(helpfulRate(v.stats) * 100)}%</td>
                          <td className="px-3 py-3.5 text-right font-semibold text-ink">{v.rank.score.toFixed(0)}</td>
                          <td className="px-4 py-3.5 text-right">
                            {pos === 1 ? <Badge tone="positive">#1 of {topicVideos.length}</Badge> : <span className="text-muted">#{pos} of {topicVideos.length}</span>}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
              {lessons.length > 12 ? (
                <div className="border-t border-line px-4 py-3 text-center">
                  <Link href={showAll ? "/creator" : "/creator?all=1"} scroll={false} className="text-[13px] font-medium text-ink hover:underline">
                    {showAll ? "Show top 12" : `Show all ${lessons.length} lessons`}
                  </Link>
                </div>
              ) : null}
            </div>
          ) : (
            <EmptyState title="No lessons yet" body="Publish a short lesson on a topic you teach well." action={<LinkButton href="/creator/new">New lesson</LinkButton>} />
          )}
        </section>

        <section>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="headline text-[17px] text-ink">Tutoring requests</h2>
            {openRequests ? <Badge tone="accent">{openRequests} new</Badge> : null}
          </div>
          {requests.length ? (
            <ul className="space-y-3">
              {requests.map((r) => {
                const course = r.courseId ? catalog.course(r.courseId) : undefined;
                const source = r.sourceVideoId ? catalog.video(r.sourceVideoId) : undefined;
                return (
                  <li key={r.id} className="rounded-xl border border-line bg-surface p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">{r.name}</p>
                        <a href={`mailto:${r.email}`} className="truncate text-xs text-muted hover:text-ink">
                          {r.email}
                        </a>
                      </div>
                      <span className="shrink-0 text-xs text-faint">{timeAgo(r.createdAt)}</span>
                    </div>
                    <p className="mt-3 text-[13px] leading-relaxed text-ink-2">{r.message}</p>
                    <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
                      {course ? <span>{course.shortTitle}</span> : null}
                      {r.availability ? <span>{r.availability}</span> : null}
                      {source ? <span>From “{source.title}”</span> : null}
                    </div>
                    <RequestActions id={r.id} status={r.status} email={r.email} name={r.name} educatorFirstName={educator.firstName} />
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState title="No requests yet" body="When a student asks to learn with you, it shows up here." />
          )}
        </section>
      </div>
    </Container>
  );
}
