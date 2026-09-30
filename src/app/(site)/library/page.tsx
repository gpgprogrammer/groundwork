import { Clock, History, Library, ThumbsUp } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { clearHistory } from "@/app/actions/learning";
import { VideoCard } from "@/components/video-card";
import { buttonClass, cn, LinkButton } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";
import { toFeedVideo } from "@/lib/feed";
import { history } from "@/lib/recommend";
import { requireViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Your library" };

const TABS = [
  { key: "history", label: "History", icon: History },
  { key: "saved", label: "Watch later", icon: Clock },
  { key: "liked", label: "Helpful videos", icon: ThumbsUp },
] as const;

export default async function LibraryPage({ searchParams }: PageProps<"/library">) {
  const [viewer, catalog, sp] = await Promise.all([requireViewer("/library"), getCatalog(), searchParams]);
  const tab = TABS.find((t) => t.key === sp.tab)?.key ?? "history";
  const s = viewer.state;

  const videos =
    tab === "history"
      ? history(catalog, s).map((h) => h.video)
      : tab === "saved"
        ? Object.entries(s.saves)
            .sort((a, b) => b[1].localeCompare(a[1]))
            .map(([id]) => catalog.video(id))
            .filter((v) => v !== undefined)
        : Object.entries(s.votes)
            .filter(([, v]) => v === 1)
            .map(([id]) => catalog.video(id))
            .filter((v) => v !== undefined);

  const EmptyIcon = TABS.find((x) => x.key === tab)!.icon;
  const empty = {
    history: ["No history yet", "Videos you open from Merit show up here, so you can find them again."],
    saved: ["Nothing saved", "Use the ⋮ menu on any video and choose “Save to Watch later.”"],
    liked: ["No helpful votes yet", "Mark videos that helped you. Your votes improve rankings for every student."],
  }[tab];

  const counts = { history: history(catalog, s).length, saved: Object.keys(s.saves).length, liked: Object.values(s.votes).filter((v) => v === 1).length };

  return (
    <div className="px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <header className="rise flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="press-sm flex size-14 shrink-0 items-center justify-center rounded-2xl bg-accent text-white [--ledge:var(--accent-press)] sm:size-16">
            <Library className="size-7 sm:size-8" strokeWidth={2.2} />
          </span>
          <div className="min-w-0">
            <h1 className="headline text-[30px] text-ink sm:text-[38px]">Your library</h1>
            <p className="text-[15px] text-muted">Everything you&apos;ve opened, saved, and marked helpful.</p>
          </div>
        </div>
        {tab === "history" && videos.length ? (
          <form action={clearHistory}>
            <button className={buttonClass("outline", "md")}>Clear history</button>
          </form>
        ) : null}
      </header>
      <nav aria-label="Library" className="scrollbar-none -mx-4 mt-7 flex gap-2.5 overflow-x-auto px-4 pb-2 pt-0.5 sm:mx-0 sm:px-0">
        {TABS.map((x) => {
          const on = tab === x.key;
          return (
            <Link
              key={x.key}
              href={`/library?tab=${x.key}`}
              aria-current={on ? "page" : undefined}
              className={cn(
                "press-sm flex h-12 shrink-0 items-center gap-2 rounded-2xl px-4 font-brand text-[15px] font-extrabold",
                on ? "bg-accent text-white [--ledge:var(--accent-press)]" : "border-2 border-line bg-surface text-ink-2 [--ledge:var(--line)] hover:bg-bg-subtle",
              )}
            >
              <x.icon className="size-[18px]" strokeWidth={2.4} /> {x.label}
              <span className={cn("tabular rounded-full px-2 py-0.5 text-[12px]", on ? "bg-white/20" : "bg-bg-subtle text-muted")}>{counts[x.key]}</span>
            </Link>
          );
        })}
      </nav>
      {videos.length ? (
        <div className="grid grid-cols-1 gap-x-5 gap-y-10 pt-8 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {videos.map((v) => (
            <VideoCard key={v.id} v={toFeedVideo(catalog, v)} />
          ))}
        </div>
      ) : (
        <div className="pt-8">
          <div className="rounded-3xl bg-surface px-6 py-14 text-center ring-2 ring-line">
            <span className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-accent-soft text-accent-ink">
              <EmptyIcon className="size-8" />
            </span>
            <p className="headline mt-5 text-[22px] text-ink">{empty[0]}</p>
            <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-muted">{empty[1]}</p>
            <LinkButton href="/lessons" size="lg" className="mt-6">
              Browse lessons
            </LinkButton>
          </div>
        </div>
      )}
    </div>
  );
}
