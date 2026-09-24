import { CalendarDays, Clapperboard } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Chips, FeedGrid, Shelf, SortControls } from "@/components/feed";
import { LogoMark } from "@/components/logo";
import { PlusFeedCard, SprintFeedCard } from "@/components/upgrade";
import { Fragment } from "react";
import { ShortCard, VideoCard } from "@/components/video-card";
import { getCatalog } from "@/lib/catalog";
import { CHIP_EXTRAS, pageOf, queryFeed, toFeedVideo } from "@/lib/feed";
import { scheduleShelf } from "@/lib/recommend";
import { getViewer } from "@/lib/viewer";
import { hasPlus } from "@/lib/billing/access";
import { buildPlan } from "@/lib/plan";
import { getPlanPrefs } from "@/lib/plan-store";
import { dueForCheckIn, listLeads } from "@/lib/leads";

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
  const plus = viewer ? hasPlus(viewer.plus) : false;
  // Plus: tonight's plan leads the page; otherwise, videos for upcoming calendar events.
  const tonight = viewer && plus && showShelves ? buildPlan(catalog, viewer.state, await getPlanPrefs(viewer.user.id), 1)[0].tasks : [];
  const upcoming = viewer && showShelves
    ? [...tonight.flatMap((t) => (t.videos[0] ? [{ video: t.videos[0], reason: `Tonight · ${t.reason}` }] : [])), ...(plus ? [] : scheduleShelf(catalog, viewer.state, 8))].slice(0, 4)
    : [];
  // Don't repeat the calendar shelf in the grid below it.
  if (upcoming.length) {
    const shown = new Set(upcoming.map((r) => r.video.id));
    result.ordered = result.ordered.filter((v) => !shown.has(v.id));
  }
  const checkIn = viewer && showShelves ? dueForCheckIn(await listLeads({ studentId: viewer.user.id }))[0] : undefined;
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

      {viewer && showShelves && upcoming.length ? (
        <div className="pt-4">
          <Shelf
            icon={<CalendarDays className="size-5 text-accent" />}
            title={tonight.length ? "Tonight's plan" : "Coming up on your calendar"}
            action={
              <Link href={tonight.length ? "/plan" : "/schedule"} className="rounded-full px-3 py-1.5 text-sm font-medium text-accent hover:bg-accent-soft">
                {tonight.length ? "Open plan" : "See schedule"}
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
            <span className="font-medium">Know what to study tonight.</span>{" "}
            <span className="text-ink-2">Connect your class calendar and Merit plans every night around your next quiz or test.</span>
          </span>
          <span className="hidden shrink-0 font-medium text-accent sm:block">Connect</span>
        </Link>
      ) : null}

      {checkIn ? (
        <Link href="/bookings" className="mt-3 flex items-center gap-4 rounded-xl bg-accent-soft px-4 py-3.5 text-sm text-ink hover:opacity-90">
          <span className="min-w-0 flex-1">
            <span className="font-medium">Did you end up working with the tutor you contacted?</span> <span className="text-ink-2">Tell us in one tap.</span>
          </span>
          <span className="shrink-0 font-medium text-accent">Answer</span>
        </Link>
      ) : null}

      <div className="pt-6">
        <div className="grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {head.map((v, i) => (
            <Fragment key={v.id}>
              {showShelves && i === 2 ? <SprintFeedCard /> : null}
              {showShelves && i === 8 && (!viewer || viewer.plus.kind === "expired") ? <PlusFeedCard /> : null}
              <VideoCard v={v} />
            </Fragment>
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

