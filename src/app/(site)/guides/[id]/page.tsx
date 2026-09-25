import { BadgeCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/ask/markdown";
import { ReportButton } from "@/components/report-button";
import { CourseIcon } from "@/components/course-icon";
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
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-8 sm:px-6">
      {sp.published ? <p className="mb-6 rounded-2xl bg-positive-soft p-4 text-sm font-medium text-ink">Published. It&apos;s on the topic page now.</p> : null}
      {topic && course ? (
        <Link href={`/courses/${course.slug}/${topic.slug}`} className="flex items-center gap-2 text-sm text-muted hover:text-ink">
          <CourseIcon id={course.id} size={22} /> {course.shortTitle} · {topic.title}
        </Link>
      ) : null}
      <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-ink">{guide.title}</h1>
      {educator ? (
        <Link href={`/educators/${educator.id}`} className="mt-3 inline-flex items-center gap-1.5 text-[14px] font-medium text-ink-2 hover:underline">
          By {educator.name} <BadgeCheck className="size-4 text-accent" /> <span className="font-normal text-muted">· {educator.headline}</span>
        </Link>
      ) : null}
      <article className="mt-8">
        <Markdown text={guide.body ?? ""} />
      </article>
      <div className="mt-10 border-t border-line pt-4">
        <ReportButton kind="guide" targetId={guide.id} />
      </div>
    </div>
  );
}
