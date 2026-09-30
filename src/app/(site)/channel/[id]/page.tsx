import { ExternalLink } from "lucide-react";
import { bandCta } from "@/components/learn-band";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Chips, FeedGrid, SortControls } from "@/components/feed";
import { ChannelAvatar } from "@/components/video-card";
import { cn, formatViews } from "@/components/ui";
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
  const topicCount = new Set(all.map((v) => v.topicId).filter(Boolean)).size;

  const courseTitles = courseIds.map((cid) => catalog.course(cid)?.title).filter(Boolean);
  const stats = [
    channel.subscribers ? { n: formatViews(channel.subscribers), l: "subscribers" } : null,
    { n: String(all.length), l: all.length === 1 ? "lesson on Merit" : "lessons on Merit" },
    { n: String(topicCount), l: topicCount === 1 ? "topic" : "topics" },
  ].filter((x) => x !== null);

  return (
    <div className="px-4 pb-10 sm:px-6 lg:px-8">
      <header className="rise relative -mx-4 overflow-hidden bg-[linear-gradient(135deg,#3b82f6,#1d4ed8)] px-4 pb-8 pt-8 text-white sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 lg:pt-10 [&_.headline]:text-white [&_.text-ink]:text-white [&_.text-ink-2]:text-white/90 [&_.text-muted]:text-white/80 [&_.ring-line]:ring-white/40">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-7">
          <span className="w-fit shrink-0 rounded-full p-1 ring-1 ring-line">
            <span className="block sm:hidden">
              <ChannelAvatar title={channel.title} src={channel.thumbnail?.replace(/=s\d+/, "=s240") ?? null} size={80} />
            </span>
            <span className="hidden sm:block">
              <ChannelAvatar title={channel.title} src={channel.thumbnail?.replace(/=s\d+/, "=s240") ?? null} size={120} />
            </span>
          </span>
          <div className="min-w-0">
            <h1 className="headline text-[28px] text-ink sm:text-[36px]">{channel.title}</h1>
            {channel.handle ? <p className="mt-0.5 text-[14px] font-medium text-ink-2">{channel.handle}</p> : null}
            <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[13.5px] text-muted">
              {stats.map((x) => (
                <div key={x.l} className="flex items-baseline gap-1">
                  <dt className="sr-only">{x.l}</dt>
                  <dd className="tabular font-semibold text-ink">{x.n}</dd>
                  <span aria-hidden>{x.l}</span>
                </div>
              ))}
            </dl>
            {courseTitles.length ? <p className="mt-2 line-clamp-2 text-[13px] text-muted">{courseTitles.join(" · ")}</p> : null}
            <a href={`https://www.youtube.com/channel/${channel.id}`} target="_blank" rel="noopener" className={cn(bandCta, "mt-4 h-11")}>
              View on YouTube <ExternalLink className="size-4" />
            </a>
          </div>
        </div>
      </header>

      <div className="sticky top-[var(--nav-h)] z-20 -mx-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-y border-line bg-bg/90 px-4 py-2.5 backdrop-blur-xl sm:-mx-6 sm:flex-nowrap sm:px-6 sm:py-3 lg:-mx-8 lg:px-8">
        <div className="flex min-w-0 basis-full sm:basis-auto sm:flex-1">
          <Chips chips={[{ key: "all", label: "All courses" }, ...courseIds.map((c) => ({ key: c, label: catalog.course(c)!.shortTitle }))]} active={course ?? "all"} param="course" />
        </div>
        <div className="flex min-w-0 flex-1 sm:flex-none">
          <Chips chips={[{ key: "all", label: "Videos" }, { key: "shorts", label: "Quick lessons" }]} active={shortsOnly ? "shorts" : "all"} param="tab" />
        </div>
        <SortControls sort={result.sort} length={result.length} defaultSort="views" />
      </div>
      <div className="pt-6">
        <FeedGrid key={query} layout={shortsOnly ? "shorts" : "grid"} initial={page.items} nextOffset={page.nextOffset} query={query} />
      </div>
    </div>
  );
}
