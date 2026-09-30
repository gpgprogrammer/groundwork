import { BadgeCheck, FileText, MonitorPlay, Upload } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CourseIcon } from "@/components/course-icon";
import { Initials } from "@/components/tutoring-ui";
import { VideoCard } from "@/components/video-card";
import { getCatalog } from "@/lib/catalog";
import { contributionsBy, getEducator } from "@/lib/educators";
import { toFeedVideo } from "@/lib/feed";
import { ReportButton } from "@/components/report-button";
import { UploadGrid } from "@/components/upload-card";
import { cn, EmptyState, LinkButton, panelLink, SectionHeading } from "@/components/ui";
import { listPendingUploads, toUploadCards } from "@/lib/uploads";
import { getViewer } from "@/lib/viewer";

export async function generateMetadata({ params }: PageProps<"/educators/[id]">): Promise<Metadata> {
  const e = await getEducator((await params).id);
  return e ? { title: e.name, description: e.headline } : {};
}

export default async function EducatorPage({ params }: PageProps<"/educators/[id]">) {
  const { id } = await params;
  const [educator, catalog, viewer] = await Promise.all([getEducator(id), getCatalog(), getViewer()]);
  if (!educator) notFound();
  const own = viewer?.user.id === educator.id;
  const [items, pending] = await Promise.all([contributionsBy(educator.id), own ? listPendingUploads(educator.id) : []]);
  const videos = items.flatMap((c) => (c.kind === "video" && catalog.video(c.video!.id) ? [catalog.video(c.video!.id)!] : []));
  const guides = items.filter((c) => c.kind === "guide");
  const uploads = await toUploadCards(items.filter((c) => c.kind === "upload" && c.media));
  const first = educator.name.split(" ")[0];
  return (
    <div className="pb-20">
      <header className="relative overflow-hidden bg-[linear-gradient(135deg,#8b5cf6,#6d28d9)] text-white [&_.headline]:text-white [&_.text-ink]:text-white [&_.text-ink-2]:text-white/90 [&_.text-muted]:text-white/80 [&_.text-accent-ink]:text-white">
        <div className="rise mx-auto max-w-6xl px-4 pb-8 pt-8 sm:px-6 lg:px-8 lg:pb-10 lg:pt-12">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
            <span className="rounded-full p-1 ring-1 ring-line">
              <Initials name={educator.name} size={88} />
            </span>
            <div className="min-w-0">
              <p className="eyebrow">Merit teacher</p>
              <h1 className="headline mt-1 flex items-center gap-2 text-[28px] text-ink sm:text-[34px]">
                <span className="min-w-0">{educator.name}</span> <BadgeCheck className="size-6 shrink-0 text-accent-ink" aria-label="Merit teacher" />
              </h1>
              <p className="mt-1 text-[15px] text-ink-2">
                {educator.headline}
                {educator.school ? <span className="text-muted">{` · ${educator.school}`}</span> : ""}
              </p>
              {educator.courseIds.length ? (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {educator.courseIds.map((cid) => {
                    const c = catalog.course(cid);
                    return c ? (
                      <Link key={cid} href={`/courses/${c.slug}`} className="flex h-8 items-center gap-1.5 rounded-full bg-surface pl-1 pr-3 text-[12.5px] font-semibold text-ink-2 ring-1 ring-line transition-[background-color,color] duration-150 hover:bg-bg-subtle hover:text-ink">
                        <CourseIcon id={c.id} size={22} /> {c.shortTitle}
                      </Link>
                    ) : null;
                  })}
                </div>
              ) : null}
            </div>
          </div>
          {educator.bio ? <p className="mt-6 max-w-[68ch] whitespace-pre-wrap text-[15.5px] leading-relaxed text-ink-2">{educator.bio}</p> : null}
          <div className="mt-4 flex flex-wrap gap-2 sm:justify-end">
            {own ? (
              <>
                <LinkButton href="/studio/upload">
                  <Upload className="size-4" /> Upload a video
                </LinkButton>
                <LinkButton href="/studio" variant="outline">
                  Teacher studio
                </LinkButton>
              </>
            ) : (
              <ReportButton kind="educator" targetId={educator.id} />
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-12 px-4 pt-10 sm:px-6 lg:px-8">
        {uploads.length || pending.length || own ? (
          <section className="rise" style={{ ["--i" as string]: 1 }}>
            <SectionHeading title={`Videos by ${first}`} />
            {pending.length ? (
              <div className="mb-5 rounded-2xl bg-warn-soft px-4 py-3 text-[13.5px] font-semibold text-ink ring-1 ring-inset ring-warn/15">
                <p>{pending.length} {pending.length === 1 ? "video is" : "videos are"} waiting for review. Only you can see {pending.length === 1 ? "it" : "them"} until approved.</p>
                <ul className="mt-2 space-y-1.5">
                  {pending.map((video) => (
                    <li key={video.id}>
                      <Link href={`/videos/${video.id}`} className="inline-flex items-center gap-1 text-warn underline decoration-warn/30 underline-offset-2 hover:decoration-warn">
                        {video.title ?? "Untitled video"} <span aria-hidden>→</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {uploads.length ? (
              <UploadGrid items={uploads} hideBy />
            ) : (
              <EmptyState
                icon={<MonitorPlay className="size-5" />}
                title="No published videos yet."
                body={pending.length ? "Approved videos appear here automatically." : "Upload a lesson here or anywhere else on Merit, and it will appear on this profile automatically after review."}
                action={
                  own ? (
                    <LinkButton href="/studio/upload">
                      <Upload className="size-4" /> Upload a video
                    </LinkButton>
                  ) : undefined
                }
              />
            )}
          </section>
        ) : null}

        {guides.length ? (
          <section className="rise" style={{ ["--i" as string]: 2 }}>
            <SectionHeading title="Study guides" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {guides.map((g) => {
                const t = catalog.topic(g.topicId);
                const c = catalog.course(g.courseId);
                return (
                  <Link key={g.id} href={`/guides/${g.id}`} className={cn(panelLink, "group flex flex-col p-5")}>
                    <span className="flex items-center justify-between">
                      <span className="flex size-9 items-center justify-center rounded-xl bg-positive-soft text-positive">
                        <FileText className="size-[18px]" />
                      </span>
                      {c ? <CourseIcon id={c.id} size={24} /> : null}
                    </span>
                    <span className="mt-4 line-clamp-2 text-[16px] font-semibold leading-snug text-ink">{g.title}</span>
                    {t ? <span className="mt-1 truncate text-[13px] text-muted">{t.title}</span> : null}
                    <span className="mt-auto pt-4 text-[13px] font-semibold text-accent-ink">
                      Read guide{" "}
                      <span aria-hidden className="inline-block transition-transform duration-200 ease-out group-hover:translate-x-0.5">
                        →
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}

        <section className="rise" style={{ ["--i" as string]: 3 }}>
          <SectionHeading title={`Lessons ${first} recommends`} />
          {videos.length ? (
            <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 sm:gap-y-10 lg:grid-cols-3">
              {videos.map((v) => (
                <VideoCard key={v.id} v={toFeedVideo(catalog, v)} />
              ))}
            </div>
          ) : (
            <EmptyState icon={<MonitorPlay className="size-5" />} title="No lessons added yet." body={`When ${first} picks a lesson for a topic, it shows up here.`} />
          )}
        </section>
      </div>
    </div>
  );
}
