import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Chips, FeedGrid, SortControls } from "@/components/feed";
import { ChannelAvatar } from "@/components/video-card";
import { formatViews } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";
import { pageOf, queryFeed } from "@/lib/feed";

export async function generateMetadata({ params }: PageProps<"/channel/[id]">): Promise<Metadata> {
  const c = (await getCatalog()).channel((await params).id);
  return c ? { title: c.title } : {};
}

export default async function ChannelPage({ params, searchParams }: PageProps<"/channel/[id]">) {
  const [{ id }, sp, catalog] = await Promise.all([params, searchParams, getCatalog()]);
  const channel = catalog.channel(id);
  if (!channel) notFound();
  const all = catalog.videosForChannel(id);
  const courseIds = [...new Set(all.map((v) => v.courseId))];
  const str = (v: unknown) => (typeof v === "string" ? v : undefined);
  const course = str(sp.course) && courseIds.includes(str(sp.course)!) ? str(sp.course) : undefined;
  const shortsOnly = sp.tab === "shorts";

  const result = queryFeed(catalog, null, { channelId: id, courseId: course, chip: shortsOnly ? "shorts" : "all", sort: str(sp.sort) ?? "views", length: str(sp.length) });
  const page = pageOf(catalog, result, 0, 24);
  const query = new URLSearchParams({
    channel: id,
    ...(course ? { course } : {}),
    chip: shortsOnly ? "shorts" : "all",
    sort: result.sort,
    ...(result.length !== "any" ? { length: result.length } : {}),
  }).toString();
  const totalViews = all.reduce((n, v) => n + v.views, 0);
  const topicCount = new Set(all.map((v) => v.topicId).filter(Boolean)).size;

  return (
    <div className="px-4 pb-10 sm:px-6 lg:px-10">
      <header className="flex flex-col gap-5 py-8 sm:flex-row sm:items-center">
        <ChannelAvatar title={channel.title} src={channel.thumbnail?.replace(/=s\d+/, "=s240") ?? null} size={120} />
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">{channel.title}</h1>
          <p className="tabular mt-2 flex flex-wrap gap-x-2 text-sm text-muted">
            {channel.handle ? <span className="font-medium text-ink-2">{channel.handle}</span> : null}
            {channel.subscribers ? <span>· {formatViews(channel.subscribers)} subscribers</span> : null}
            <span>· {all.length} lessons on Merit</span>
            <span>· {topicCount} topics</span>
            <span>· {formatViews(totalViews)} views</span>
          </p>
          <p className="mt-2 text-sm text-muted">
            {courseIds.map((cid) => catalog.course(cid)?.title).filter(Boolean).join(" · ")}
          </p>
          <a
            href={`https://www.youtube.com/channel/${channel.id}`}
            target="_blank"
            rel="noopener"
            className="mt-4 inline-flex h-9 items-center gap-2 rounded-full bg-ink px-4 text-sm font-medium text-bg hover:bg-ink/85"
          >
            View on YouTube <ExternalLink className="size-4" />
          </a>
        </div>
      </header>

      <div className="sticky top-14 z-20 -mx-4 flex items-center gap-3 border-b border-line bg-bg/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
        <Chips chips={[{ key: "all", label: "All courses" }, ...courseIds.map((c) => ({ key: c, label: catalog.course(c)!.shortTitle }))]} active={course ?? "all"} param="course" />
        <Chips chips={[{ key: "all", label: "Videos" }, { key: "shorts", label: "Shorts" }]} active={shortsOnly ? "shorts" : "all"} param="tab" />
        <SortControls sort={result.sort} length={result.length} defaultSort="views" />
      </div>
      <div className="pt-6">
        <FeedGrid key={query} layout={shortsOnly ? "shorts" : "grid"} initial={page.items} nextOffset={page.nextOffset} query={query} />
      </div>
    </div>
  );
}
