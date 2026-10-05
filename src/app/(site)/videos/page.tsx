import { Film, Upload } from "lucide-react";
import { bandCta, WorldBand } from "@/components/learn-band";
import type { Metadata } from "next";
import Link from "next/link";
import { CourseIcon } from "@/components/course-icon";
import { cn, EmptyState, LinkButton } from "@/components/ui";
import { UploadGrid } from "@/components/upload-card";
import { canUploadVideos } from "@/lib/auth/permissions";
import { getCatalog } from "@/lib/catalog";
import { listUploads, toUploadCards } from "@/lib/uploads";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Merit Tutors' Videos", description: "Lessons recorded by Merit tutors and teachers, published only on Merit." };

export default async function VideosPage({ searchParams }: PageProps<"/videos">) {
  const [sp, catalog, viewer] = await Promise.all([searchParams, getCatalog(), getViewer()]);
  const canUpload = canUploadVideos(viewer);
  const course = typeof sp.course === "string" ? catalog.course(sp.course) : undefined;
  const all = await listUploads();
  const shown = course ? all.filter((c) => c.courseId === course.id) : all;
  const cards = await toUploadCards(shown);
  const courseIds = [...new Set(all.map((c) => c.courseId))];
  const chip = "flex h-9 shrink-0 items-center gap-1.5 rounded-full text-[13.5px] font-semibold transition-[background-color,color,transform] duration-150 active:scale-[0.97]";
  return (
    <>
    <WorldBand kicker="Only on Merit" title="Merit Tutors' Videos" lede="Lessons recorded by the tutors and teachers on Merit. Like one? Book a session with them from their profile.">
      {canUpload ? (
        <div className="rise mt-6" style={{ ["--i" as string]: 2 }}>
          <Link href="/studio/upload" className={bandCta}>
            <Upload className="size-4" /> Upload a video
          </Link>
        </div>
      ) : null}
    </WorldBand>
    <div className="mx-auto max-w-[1400px] px-4 pb-20 sm:px-6 lg:px-8">
      {courseIds.length > 1 ? (
        <nav aria-label="Filter by course" className="scrollbar-none -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          <Link href="/videos" aria-current={!course ? "page" : undefined} className={cn(chip, "px-4", !course ? "bg-ink text-bg" : "bg-bg-subtle text-ink-2 hover:bg-line hover:text-ink")}>
            All
          </Link>
          {courseIds.map((id) => {
            const c = catalog.course(id);
            return c ? (
              <Link key={id} href={`/videos?course=${id}`} aria-current={course?.id === id ? "page" : undefined} className={cn(chip, "pl-1 pr-3.5", course?.id === id ? "bg-ink text-bg" : "bg-bg-subtle text-ink-2 hover:bg-line hover:text-ink")}>
                <CourseIcon id={id} size={26} /> {c.shortTitle}
              </Link>
            ) : null;
          })}
        </nav>
      ) : null}
      <div className="rise mt-8" style={{ ["--i" as string]: 1 }}>
        {cards.length ? (
          <UploadGrid items={cards} />
        ) : (
          <EmptyState
            icon={<Film className="size-5" />}
            title={`No videos ${course ? `for ${course.shortTitle} ` : ""}yet.`}
            body="Teachers can record the lesson they always give and publish it here."
            action={
              canUpload ? (
                <LinkButton href="/studio/upload">
                  <Upload className="size-4" /> Upload the first one
                </LinkButton>
              ) : undefined
            }
          />
        )}
      </div>
    </div>
    </>
  );
}
