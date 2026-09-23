import { Clock, History, ThumbsUp } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { clearHistory } from "@/app/actions/learning";
import { VideoCard } from "@/components/video-card";
import { cn } from "@/components/ui";
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

  const empty = {
    history: ["No history yet", "Videos you open from Groundwork show up here, so you can find them again."],
    saved: ["Nothing saved", "Use the ⋮ menu on any video and choose “Save to Watch later.”"],
    liked: ["No helpful votes yet", "Mark videos that helped you. Your votes improve rankings for every student."],
  }[tab];

  return (
    <div className="px-4 pb-16 pt-6 sm:px-6">
      <h1 className="text-[28px] font-bold tracking-tight text-ink">Your library</h1>
      <div className="mt-4 flex items-center justify-between gap-4 border-b border-line">
        <div className="scrollbar-none flex gap-6 overflow-x-auto">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={`/library?tab=${t.key}`}
              className={cn(
                "-mb-px flex shrink-0 items-center gap-2 border-b-2 pb-3 text-[15px] font-medium",
                tab === t.key ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink",
              )}
            >
              <t.icon className="size-4" /> {t.label}
            </Link>
          ))}
        </div>
        {tab === "history" && videos.length ? (
          <form action={clearHistory} className="pb-2">
            <button className="rounded-full px-3 py-1.5 text-sm font-medium text-ink hover:bg-bg-subtle">Clear history</button>
          </form>
        ) : null}
      </div>
      {videos.length ? (
        <div className="grid grid-cols-1 gap-x-4 gap-y-10 pt-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {videos.map((v) => (
            <VideoCard key={v.id} v={toFeedVideo(catalog, v)} />
          ))}
        </div>
      ) : (
        <div className="py-24 text-center">
          <p className="text-lg font-medium text-ink">{empty[0]}</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">{empty[1]}</p>
          <Link href="/" className="mt-6 inline-flex h-9 items-center rounded-full bg-ink px-4 text-sm font-medium text-bg">
            Browse videos
          </Link>
        </div>
      )}
    </div>
  );
}
