import { Upload } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CourseIcon } from "@/components/course-icon";
import { cn } from "@/components/ui";
import { UploadGrid } from "@/components/upload-card";
import { getCatalog } from "@/lib/catalog";
import { listUploads, toUploadCards } from "@/lib/uploads";

export const metadata: Metadata = { title: "Merit Tutors' Videos", description: "Lessons recorded by Merit tutors and teachers, published only on Merit." };

export default async function VideosPage({ searchParams }: PageProps<"/videos">) {
  const [sp, catalog] = await Promise.all([searchParams, getCatalog()]);
  const course = typeof sp.course === "string" ? catalog.course(sp.course) : undefined;
  const all = await listUploads();
  const shown = course ? all.filter((c) => c.courseId === course.id) : all;
  const cards = await toUploadCards(shown);
  const courseIds = [...new Set(all.map((c) => c.courseId))];
  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-20 pt-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-accent">Only on Merit</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Merit Tutors&apos; Videos</h1>
          <p className="mt-2 max-w-2xl text-[15px] text-muted">Lessons recorded by the tutors and teachers on Merit. Like one? Book a session with them from their profile.</p>
        </div>
        <Link href="/studio/upload" className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold text-ink ring-1 ring-line-strong hover:bg-bg-subtle">
          <Upload className="size-4" /> Upload a video
        </Link>
      </div>
      {courseIds.length > 1 ? (
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/videos" className={cn("rounded-full px-3 py-1.5 text-[13px] font-medium", !course ? "bg-ink text-bg" : "bg-bg-subtle text-ink hover:bg-line")}>
            All
          </Link>
          {courseIds.map((id) => {
            const c = catalog.course(id);
            return c ? (
              <Link key={id} href={`/videos?course=${id}`} className={cn("flex items-center gap-1.5 rounded-full py-1 pl-1 pr-3 text-[13px] font-medium", course?.id === id ? "bg-ink text-bg" : "bg-bg-subtle text-ink hover:bg-line")}>
                <CourseIcon id={id} size={20} /> {c.shortTitle}
              </Link>
            ) : null;
          })}
        </div>
      ) : null}
      <div className="mt-8">
        {cards.length ? (
          <UploadGrid items={cards} />
        ) : (
          <div className="rounded-2xl bg-bg-subtle p-8 text-center">
            <p className="font-semibold text-ink">No videos {course ? `for ${course.shortTitle} ` : ""}yet.</p>
            <p className="mt-1 text-sm text-muted">Tutors and teachers: record the lesson you always give, and publish it here.</p>
            <Link href="/studio/upload" className="mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-white">
              <Upload className="size-4" /> Upload the first one
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
