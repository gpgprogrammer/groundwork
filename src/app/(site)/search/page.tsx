import { BookOpen } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Chips, SortControls } from "@/components/feed";
import { ChannelAvatar, VideoRow } from "@/components/video-card";
import { formatViews } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";
import { parseLength, parseSort, toFeedVideo } from "@/lib/feed";
import { compareBy, inLength } from "@/lib/ranking";
import { search } from "@/lib/search";

export async function generateMetadata({ searchParams }: PageProps<"/search">): Promise<Metadata> {
  const q = (await searchParams).q;
  return { title: typeof q === "string" && q ? q : "Search" };
}

const TYPES = [
  { key: "all", label: "All" },
  { key: "video", label: "Videos" },
  { key: "topic", label: "Topics" },
  { key: "channel", label: "Channels" },
];

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const [sp, catalog] = await Promise.all([searchParams, getCatalog()]);
  const q = typeof sp.q === "string" ? sp.q.slice(0, 120) : "";
  const type = TYPES.find((t) => t.key === sp.type)?.key ?? "all";
  const courseId = typeof sp.course === "string" && catalog.course(sp.course) ? sp.course : undefined;
  const sort = parseSort(sp.sort, "best");
  const length = parseLength(sp.length);

  const hits = q ? search(catalog, q, { courseId }, 400) : [];
  const topics = hits.filter((h) => h.kind === "topic" || h.kind === "course").slice(0, type === "topic" ? 40 : 3);
  const channels = hits.filter((h) => h.kind === "channel").slice(0, type === "channel" ? 30 : 2);
  let videos = hits.filter((h) => h.kind === "video").map((h) => (h.kind === "video" ? h.video : null)!).filter((v) => inLength(v, length));
  if (sort !== "best") videos = [...videos].sort(compareBy(sort));
  videos = videos.slice(0, 80);

  return (
    <div className="mx-auto max-w-[1100px] px-4 pb-16 sm:px-6">
      <div className="sticky top-14 z-20 -mx-4 flex flex-wrap items-center gap-3 bg-bg/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <Chips chips={TYPES} active={type} param="type" />
        {type === "all" || type === "video" ? <SortControls sort={sort} length={length} /> : null}
      </div>
      <div className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 pb-2 text-[13px]">
        <Link href={`/search?${new URLSearchParams({ q, ...(type !== "all" ? { type } : {}) })}`} className={!courseId ? "shrink-0 rounded-full bg-accent-soft px-3 py-1 font-medium text-accent" : "shrink-0 rounded-full px-3 py-1 text-muted hover:bg-bg-subtle"}>
          Any course
        </Link>
        {catalog.courses.map((c) => (
          <Link
            key={c.id}
            href={`/search?${new URLSearchParams({ q, course: c.id, ...(type !== "all" ? { type } : {}) })}`}
            className={courseId === c.id ? "shrink-0 rounded-full bg-accent-soft px-3 py-1 font-medium text-accent" : "shrink-0 rounded-full px-3 py-1 text-muted hover:bg-bg-subtle"}
          >
            {c.shortTitle}
          </Link>
        ))}
      </div>

      {!q ? (
        <p className="py-24 text-center text-muted">Search for a topic, a concept, or a channel.</p>
      ) : !hits.length ? (
        <div className="py-24 text-center">
          <p className="text-lg font-medium text-ink">No results for “{q}”</p>
          <p className="mt-2 text-sm text-muted">Try a different spelling or a broader term, or browse <Link href="/courses" className="text-accent hover:underline">courses</Link>.</p>
        </div>
      ) : (
        <div className="space-y-6 pt-3">
          {(type === "all" || type === "topic") && topics.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {topics.map((h) =>
                h.kind === "topic" ? (
                  <Link key={h.topic.id} href={`/courses/${h.course.slug}/${h.topic.slug}`} className="group rounded-xl bg-bg-subtle p-4 transition-colors hover:bg-line">
                    <p className="flex items-center gap-2 text-xs font-medium text-muted">
                      <BookOpen className="size-3.5" /> Topic · {h.course.shortTitle}
                    </p>
                    <p className="mt-1.5 text-[16px] font-medium text-ink">{h.topic.title}</p>
                    <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-muted">{h.topic.summary}</p>
                    <p className="mt-2 text-xs font-medium text-accent">{h.lessons} videos →</p>
                  </Link>
                ) : h.kind === "course" ? (
                  <Link key={h.course.id} href={`/courses/${h.course.slug}`} className="rounded-xl bg-bg-subtle p-4 transition-colors hover:bg-line">
                    <p className="text-xs font-medium text-muted">Course</p>
                    <p className="mt-1.5 text-[16px] font-medium text-ink">{h.course.title}</p>
                    <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-muted">{h.course.description}</p>
                  </Link>
                ) : null,
              )}
            </div>
          ) : null}

          {(type === "all" || type === "channel") && channels.length ? (
            <div className="divide-y divide-line">
              {channels.map((h) =>
                h.kind === "channel" ? (
                  <Link key={h.channel.id} href={`/channel/${h.channel.id}`} className="flex items-center gap-6 py-4 hover:bg-bg-subtle/50 sm:gap-10">
                    <div className="flex w-40 shrink-0 justify-center sm:w-[260px] lg:w-[340px]">
                      <ChannelAvatar title={h.channel.title} src={h.channel.thumbnail} size={96} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-lg font-medium text-ink">{h.channel.title}</p>
                      <p className="tabular mt-1 text-[13px] text-muted">
                        {[h.channel.handle, h.channel.subscribers ? `${formatViews(h.channel.subscribers)} subscribers` : null, `${h.lessons} lessons on Groundwork`].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                  </Link>
                ) : null,
              )}
            </div>
          ) : null}

          {type === "all" || type === "video" ? (
            <div className="space-y-5">
              {videos.map((v) => (
                <VideoRow key={v.id} v={toFeedVideo(catalog, v)} />
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
