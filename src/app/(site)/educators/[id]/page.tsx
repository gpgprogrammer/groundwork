import { BadgeCheck, FileText } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CourseIcon } from "@/components/course-icon";
import { Initials } from "@/components/tutoring-ui";
import { VideoCard } from "@/components/video-card";
import { getCatalog } from "@/lib/catalog";
import { contributionsBy, getEducator } from "@/lib/educators";
import { toFeedVideo } from "@/lib/feed";
import { UploadGrid } from "@/components/upload-card";
import { toUploadCards } from "@/lib/uploads";

export async function generateMetadata({ params }: PageProps<"/educators/[id]">): Promise<Metadata> {
  const e = await getEducator((await params).id);
  return e ? { title: e.name, description: e.headline } : {};
}

export default async function EducatorPage({ params }: PageProps<"/educators/[id]">) {
  const { id } = await params;
  const [educator, catalog] = await Promise.all([getEducator(id), getCatalog()]);
  if (!educator) notFound();
  const items = await contributionsBy(educator.id);
  const videos = items.flatMap((c) => (c.kind === "video" && catalog.video(c.video!.id) ? [catalog.video(c.video!.id)!] : []));
  const guides = items.filter((c) => c.kind === "guide");
  const uploads = await toUploadCards(items.filter((c) => c.kind === "upload" && c.media));
  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-20 pt-8 sm:px-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <Initials name={educator.name} size={88} />
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-extrabold tracking-tight text-ink">
            {educator.name} <BadgeCheck className="size-6 text-accent" aria-label="Merit teacher" />
          </h1>
          <p className="text-[15px] text-ink-2">
            {educator.headline}
            {educator.school ? ` · ${educator.school}` : ""}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {educator.courseIds.map((cid) => {
              const c = catalog.course(cid);
              return c ? (
                <Link key={cid} href={`/courses/${c.slug}`} className="flex items-center gap-1.5 rounded-full bg-bg-subtle py-1 pl-1 pr-3 text-[12.5px] font-medium text-ink hover:bg-line">
                  <CourseIcon id={c.id} size={20} /> {c.shortTitle}
                </Link>
              ) : null;
            })}
          </div>
        </div>
      </div>
      {educator.bio ? <p className="mt-6 max-w-3xl whitespace-pre-wrap text-[15px] leading-relaxed text-ink-2">{educator.bio}</p> : null}

      {uploads.length ? (
        <section className="mt-10">
          <h2 className="text-xl font-bold tracking-tight text-ink">Videos by {educator.name.split(" ")[0]}</h2>
          <div className="mt-4">
            <UploadGrid items={uploads} hideBy />
          </div>
        </section>
      ) : null}

      {guides.length ? (
        <section className="mt-10">
          <h2 className="text-xl font-bold tracking-tight text-ink">Study guides</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((g) => {
              const t = catalog.topic(g.topicId);
              return (
                <Link key={g.id} href={`/guides/${g.id}`} className="rounded-2xl p-5 ring-1 ring-line hover:bg-bg-subtle">
                  <FileText className="size-5 text-accent" />
                  <p className="mt-3 font-semibold text-ink">{g.title}</p>
                  {t ? <p className="mt-1 text-[13px] text-muted">{t.title}</p> : null}
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="mt-10">
        <h2 className="text-xl font-bold tracking-tight text-ink">Lessons {educator.name.split(" ")[0]} recommends</h2>
        {videos.length ? (
          <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((v) => (
              <VideoCard key={v.id} v={toFeedVideo(catalog, v)} />
            ))}
          </div>
        ) : (
          <p className="mt-3 text-muted">No lessons added yet.</p>
        )}
      </section>
    </div>
  );
}
