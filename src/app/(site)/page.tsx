import { CalendarDays, Clapperboard } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Chips, FeedGrid, Shelf, SortControls } from "@/components/feed";
import { LogoMark } from "@/components/logo";
import { ShortCard, VideoCard } from "@/components/video-card";
import { getCatalog } from "@/lib/catalog";
import { CHIP_EXTRAS, pageOf, queryFeed, toFeedVideo } from "@/lib/feed";
import { scheduleShelf } from "@/lib/recommend";
import { getViewer } from "@/lib/viewer";

const FIRST_ROWS = 12;

export default async function Home({ searchParams }: PageProps<"/">) {
  const [catalog, viewer, sp] = await Promise.all([getCatalog(), getViewer(), searchParams]);
  if (viewer && !viewer.state.profile.onboarded) redirect("/onboarding");

  const str = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);
  const chip = str(sp.chip) ?? (viewer ? "foryou" : "all");
  const chips = [
    ...(viewer ? [{ key: "foryou", label: "For you" }] : []),
    { key: "all", label: "All" },
    ...catalog.courses.map((c) => ({ key: c.id, label: c.title })),
    ...CHIP_EXTRAS,
  ];

  const result = queryFeed(catalog, viewer?.state ?? null, { chip, sort: str(sp.sort), length: str(sp.length) });
  const showShelves = (chip === "all" || chip === "foryou") && result.sort === "best";
  const upcoming = viewer && showShelves ? scheduleShelf(catalog, viewer.state, 8).slice(0, 4) : [];
  // Don't repeat the calendar shelf in the grid below it.
  if (upcoming.length) {
    const shown = new Set(upcoming.map((r) => r.video.id));
    result.ordered = result.ordered.filter((v) => !shown.has(v.id));
  }
  const page = pageOf(catalog, result, 0, FIRST_ROWS + 24);
  const head = page.items.slice(0, FIRST_ROWS);
  const rest = page.items.slice(FIRST_ROWS);
  const query = new URLSearchParams({ chip, ...(str(sp.sort) ? { sort: str(sp.sort)! } : {}), ...(str(sp.length) ? { length: str(sp.length)! } : {}) }).toString();
  const shorts = showShelves ? catalog.videos.filter((v) => v.isShort).slice(0, 12).map((v) => toFeedVideo(catalog, v)) : [];

  if (!catalog.videos.length) {
    return (
      <div className="px-6 py-24 text-center">
        <LogoMark className="mx-auto size-12" />
        <h1 className="mt-6 text-2xl font-bold text-ink">The video library is being built</h1>
        <p className="mx-auto mt-2 max-w-md text-muted">
          Run <code className="rounded bg-bg-subtle px-1.5 py-0.5 text-sm">npm run ingest</code> with a YouTube Data API key to pull lessons.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6">
      <div className="sticky top-14 z-20 -mx-4 flex items-center gap-3 bg-bg/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <Chips chips={chips} active={chip} />
        <SortControls sort={result.sort} length={result.length} />
      </div>

      {!viewer && chip === "all" ? <Welcome videoCount={catalog.videos.length} channelCount={catalog.channels.length} /> : null}

      {viewer && showShelves && upcoming.length ? (
        <div className="pt-4">
          <Shelf
            icon={<CalendarDays className="size-5 text-accent" />}
            title="Coming up on your calendar"
            action={
              <Link href="/schedule" className="rounded-full px-3 py-1.5 text-sm font-medium text-accent hover:bg-accent-soft">
                See schedule
              </Link>
            }
          >
            <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
              {upcoming.map((r) => (
                <VideoCard key={r.video.id} v={toFeedVideo(catalog, r.video, r.reason)} />
              ))}
            </div>
          </Shelf>
        </div>
      ) : viewer && showShelves && !viewer.state.schedule ? (
        <Link href="/schedule" className="mt-3 flex items-center gap-4 rounded-xl bg-accent-soft px-4 py-3.5 text-sm text-ink transition-opacity hover:opacity-90">
          <CalendarDays className="size-5 shrink-0 text-accent" />
          <span className="min-w-0 flex-1">
            <span className="font-medium">Sync your class calendar.</span>{" "}
            <span className="text-ink-2">We&apos;ll line up videos for your next quiz or test before it happens.</span>
          </span>
          <span className="hidden shrink-0 font-medium text-accent sm:block">Connect</span>
        </Link>
      ) : null}

      <div className="pt-6">
        <div className="grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {head.map((v) => (
            <VideoCard key={v.id} v={v} />
          ))}
        </div>
      </div>

      {shorts.length >= 6 ? (
        <div className="mt-10 border-t border-line pt-6">
          <Shelf
            icon={<Clapperboard className="size-5 text-[#e5484d]" />}
            title="Shorts"
            action={
              <Link href="/shorts" className="rounded-full px-3 py-1.5 text-sm font-medium text-ink hover:bg-bg-subtle">
                See all
              </Link>
            }
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {shorts.slice(0, 6).map((v, i) => (
                <div key={v.id} className={i >= 2 ? (i >= 4 ? "hidden lg:block" : "hidden sm:block") : undefined}>
                  <ShortCard v={v} />
                </div>
              ))}
            </div>
          </Shelf>
        </div>
      ) : null}

      <div className="pb-10 pt-8">
        <FeedGrid key={query} initial={rest} nextOffset={page.nextOffset} query={query} />
      </div>
    </div>
  );
}

function Welcome({ videoCount, channelCount }: { videoCount: number; channelCount: number }) {
  return (
    <section className="mt-3 overflow-hidden rounded-2xl bg-[#0f0f0f] px-6 py-8 text-white sm:px-10 sm:py-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Every AP course. The best lessons. The best tutors. Free.</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-white/70">
            {videoCount.toLocaleString()} lessons from {channelCount.toLocaleString()} educators, sorted into every course, unit, and topic and
            ranked by how well they teach. Matched to your class calendar, with top tutors a click away.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Link href="/signup" className="flex h-10 items-center rounded-full bg-white px-5 text-sm font-medium text-[#0f0f0f] hover:bg-white/90">
            Sign up free
          </Link>
          <Link href="/tutors" className="flex h-10 items-center rounded-full bg-white/10 px-5 text-sm font-medium text-white hover:bg-white/20">
            Find a tutor
          </Link>
        </div>
      </div>
    </section>
  );
}
