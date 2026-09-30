import { BadgeCheck, FileText } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/ask/markdown";
import { ReportButton } from "@/components/report-button";
import { CourseIcon } from "@/components/course-icon";
import { Initials } from "@/components/tutoring-ui";
import { cn, Notice, panelLink } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";
import { getStore } from "@/lib/data/store";
import { getEducator } from "@/lib/educators";
import type { Contribution } from "@/lib/types";

async function getGuide(id: string) {
  const c = await (await getStore()).getDoc<Contribution>("contributions", id);
  return c && c.kind === "guide" && c.status === "published" ? c : null;
}

export async function generateMetadata({ params }: PageProps<"/guides/[id]">): Promise<Metadata> {
  const g = await getGuide((await params).id);
  return g ? { title: g.title } : {};
}

export default async function GuidePage({ params, searchParams }: PageProps<"/guides/[id]">) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const guide = await getGuide(id);
  if (!guide) notFound();
  const [catalog, educator] = await Promise.all([getCatalog(), getEducator(guide.educatorId)]);
  const topic = catalog.topic(guide.topicId);
  const course = catalog.course(guide.courseId);
  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-8 sm:px-6 lg:pt-12">
      {sp.published ? (
        <Notice tone="success" className="mb-8">
          <span className="font-medium">Published. It&apos;s on the topic page now.</span>
        </Notice>
      ) : null}
      <header className="rise">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-positive-soft px-2.5 text-[12.5px] font-semibold text-positive">
            <FileText className="size-3.5" /> Study guide
          </span>
          {topic && course ? (
            <Link href={`/courses/${course.slug}/${topic.slug}`} className="inline-flex h-7 min-w-0 items-center gap-1.5 rounded-full bg-bg-subtle py-0.5 pl-0.5 pr-3 text-[12.5px] font-medium text-ink-2 transition-colors hover:bg-line hover:text-ink">
              <CourseIcon id={course.id} size={22} /> <span className="truncate">{course.shortTitle} · {topic.title}</span>
            </Link>
          ) : null}
        </div>
        <h1 className="display mt-5 text-[32px] text-ink sm:text-[44px]">{guide.title}</h1>
        {educator ? (
          <Link href={`/educators/${educator.id}`} className="group mt-6 flex items-center gap-3 border-y border-line py-4">
            <Initials name={educator.name} size={44} />
            <span className="min-w-0">
              <span className="flex items-center gap-1 text-[15px] font-semibold text-ink group-hover:underline">
                By {educator.name} <BadgeCheck className="size-4 shrink-0 text-accent-ink" aria-label="Merit teacher" />
              </span>
              <span className="block truncate text-[13.5px] text-muted">{educator.headline}</span>
            </span>
          </Link>
        ) : (
          <div className="mt-6 border-t border-line" />
        )}
      </header>
      <article className="rise mt-8" style={{ ["--i" as string]: 1 }}>
        <Markdown text={guide.body ?? ""} variant="prose" />
      </article>
      <footer className="mt-14 space-y-4">
        {topic && course ? (
          <Link href={`/courses/${course.slug}/${topic.slug}`} className={cn(panelLink, "group flex items-center gap-4 p-4 sm:p-5")}>
            <CourseIcon id={course.id} size={40} />
            <span className="min-w-0 flex-1">
              <span className="block text-[12.5px] font-medium text-muted">Keep studying</span>
              <span className="block truncate text-[15px] font-semibold text-ink">{topic.title}</span>
            </span>
            <span aria-hidden className="text-accent-ink transition-transform duration-200 ease-out group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        ) : null}
        <div className="flex justify-end">
          <ReportButton kind="guide" targetId={guide.id} />
        </div>
      </footer>
    </div>
  );
}
