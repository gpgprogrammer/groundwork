import { CalendarDays, Clapperboard, MonitorPlay } from "lucide-react";
import { LearnBand } from "@/components/learn-band";
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
import { learningPlan } from "@/lib/learning-plan";
import { dueForCheckIn, listLeads } from "@/lib/leads";
import { UploadCard } from "@/components/upload-card";
import { listUploads, toUploadCards } from "@/lib/uploads";

const FIRST_ROWS = 12;

export default async function Lessons({ searchParams }: PageProps<"/lessons">) {
  const [catalog, viewer, sp] = await Promise.all([getCatalog(), getViewer(), searchParams]);
  if (viewer && !viewer.state.profile.onboarded && viewer.user.accountType !== "teacher") redirect("/onboarding");

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
  // Plus: your learning plan leads the page; otherwise, videos for upcoming calendar events.
  const fromPlan = viewer && plus && showShelves ? learningPlan(catalog, viewer.state, 8).flatMap((g) => g.videos.slice(0, 1).map((v) => ({ video: v, reason: g.source === "test" ? g.reason : `${g.reason}: ${g.topic.title}` }))) : [];
  const upcoming = viewer && showShelves ? [...fromPlan, ...(plus ? [] : scheduleShelf(catalog, viewer.state, 8))].slice(0, 4) : [];
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
  const uploads = showShelves ? await toUploadCards((await listUploads()).slice(0, 4)) : [];
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
    <>
    <LearnBand title="Lessons" lede="The best lesson for every topic, ranked by how well it teaches." />
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sticky top-[var(--nav-h)] z-20 -mx-4 flex items-center gap-3 border-b-2 border-line bg-bg/90 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <Chips chips={chips} active={chip} />
        <SortControls sort={result.sort} length={result.length} />
      </div>

      {viewer && showShelves && upcoming.length ? (
        <div className="pt-4">
          <Shelf
            icon={<CalendarDays className="size-5 text-accent-ink" />}
            title={fromPlan.length ? "Your learning plan" : "Coming up on your calendar"}
            action={
              <Link href={fromPlan.length ? "/plan" : "/schedule"} className="rounded-full px-3 py-1.5 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-soft">
                {fromPlan.length ? "Open plan" : "See schedule"}
              </Link>
            }
          >
            <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
              {upcoming.map((r) => (
                <VideoCard key={r.video.id} v={toFeedVideo(catalog, r.video, r.reason)} />
              ))}
            </div>
          </Shelf>
        </div>
      ) : viewer && showShelves && !viewer.state.schedule ? (
        <Link href="/schedule" className="group mt-5 flex items-center gap-4 rounded-2xl bg-accent-soft px-5 py-4 text-sm text-ink transition-transform duration-200 active:scale-[0.99]">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface text-accent-ink"><CalendarDays className="size-5" /></span>
          <span className="min-w-0 flex-1">
            <span className="font-medium">Get videos for every quiz and test.</span>{" "}
            <span className="text-ink-2">Connect your class calendar and Merit lines up the right lessons before each one.</span>
          </span>
          <span className="hidden shrink-0 items-center gap-1 font-semibold text-accent-ink sm:flex">Connect <span className="transition-transform group-hover:translate-x-0.5">→</span></span>
        </Link>
      ) : null}

      {sp.password === "updated" ? (
        <p role="status" className="fade mt-5 rounded-2xl bg-positive-soft px-5 py-3.5 text-sm font-semibold text-positive">
          Your password is updated.
        </p>
      ) : null}

      {checkIn ? (
        <Link href="/bookings" className="mt-5 flex items-center gap-4 rounded-2xl bg-accent-soft px-5 py-4 text-sm text-ink transition-transform duration-200 active:scale-[0.99]">
          <span className="min-w-0 flex-1">
            <span className="font-medium">Did you end up working with the tutor you contacted?</span> <span className="text-ink-2">Tell us in one tap.</span>
          </span>
          <span className="shrink-0 font-semibold text-accent-ink">Answer</span>
        </Link>
      ) : null}

      <div className="pt-6">
        <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {head.map((v, i) => (
            <Fragment key={v.id}>
              {showShelves && i === 2 ? <SprintFeedCard /> : null}
              {showShelves && i === 8 && (!viewer || viewer.plus.kind === "expired") ? <PlusFeedCard /> : null}
              <VideoCard v={v} />
            </Fragment>
          ))}
        </div>
      </div>

      {uploads.length ? (
        <div className="mt-12 border-t border-line pt-8">
          <Shelf
            icon={<MonitorPlay className="size-5 text-accent-ink" />}
            title="Merit Tutors' Videos"
            action={
              <Link href="/videos" className="rounded-full px-3 py-1.5 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-soft">
                See all
              </Link>
            }
          >
            <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
              {uploads.map((u) => (
                <UploadCard key={u.id} u={u} />
              ))}
            </div>
          </Shelf>
        </div>
      ) : null}

      {shorts.length >= 6 ? (
        <div className="mt-12 border-t border-line pt-8">
          <Shelf
            icon={<Clapperboard className="size-5 text-danger" />}
            title="Quick lessons"
            action={
              <Link href="/shorts" className="rounded-full px-3 py-1.5 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-soft">
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
    </>
  );
}

