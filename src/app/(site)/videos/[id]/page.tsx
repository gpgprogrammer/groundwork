import { BadgeCheck, Trash2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteUpload } from "@/app/actions/uploads";
import { CourseIcon } from "@/components/course-icon";
import { MeritPlayer } from "@/components/merit-player";
import { Initials } from "@/components/tutoring-ui";
import { ago, formatViews } from "@/components/ui";
import { UploadCard } from "@/components/upload-card";
import { getCatalog } from "@/lib/catalog";
import { getStore } from "@/lib/data/store";
import { ReportButton } from "@/components/report-button";
import { getUpload, getUploadFor, listUploads, toUploadCards, uploaderIdentity } from "@/lib/uploads";
import { getViewer } from "@/lib/viewer";

export async function generateMetadata({ params }: PageProps<"/videos/[id]">): Promise<Metadata> {
  const c = await getUpload((await params).id);
  return c ? { title: c.title, description: c.body?.slice(0, 160) } : {};
}

export default async function WatchPage({ params, searchParams }: PageProps<"/videos/[id]">) {
  const [{ id }, sp, viewer, catalog] = await Promise.all([params, searchParams, getViewer(), getCatalog()]);
  const c = await getUploadFor(id, viewer);
  if (!c) notFound();
  const pending = c.status === "pending";
  const who = await uploaderIdentity(c.educatorId);
  const tutor = who?.tutorId ? (await (await getStore()).listTutors()).find((t) => t.id === who.tutorId) : undefined;
  const course = catalog.course(c.courseId);
  const topic = catalog.topic(c.topicId);
  const [byThem, onTopic] = await Promise.all([listUploads({ educatorId: c.educatorId }), listUploads({ courseId: c.courseId })]);
  const more = await toUploadCards([...byThem, ...onTopic.filter((x) => x.educatorId !== c.educatorId)].filter((x) => x.id !== c.id).slice(0, 8));
  const canDelete = viewer && (viewer.user.id === c.educatorId || viewer.isAdmin);
  const profileHref = who?.tutorId ? `/tutors/${who.tutorId}` : `/educators/${c.educatorId}`;

  return (
    <div className="mx-auto grid max-w-[1400px] gap-8 px-4 pb-20 pt-6 sm:px-6 lg:grid-cols-[1fr_380px]">
      <div className="min-w-0">
        {pending ? (
          <p className="mb-4 rounded-xl bg-accent-soft px-4 py-3 text-sm text-ink">
            <span className="font-semibold">{sp.submitted ? "Submitted! " : ""}Waiting for review.</span> Merit checks every video before students can see it, usually within a day. Until then, only you can watch it here.
          </p>
        ) : sp.published ? (
          <p className="mb-4 rounded-xl bg-positive-soft px-4 py-3 text-sm text-positive">Published. Students can watch it now.</p>
        ) : null}
        <MeritPlayer id={c.id} src={c.media!.videoUrl} poster={c.media!.posterUrl} count={!pending} />
        <h1 className="mt-4 text-xl font-bold leading-snug text-ink sm:text-2xl">{c.title}</h1>
        <p className="mt-1 text-sm text-muted">
          {formatViews(c.views ?? 0)} {(c.views ?? 0) === 1 ? "view" : "views"} · {ago(c.createdAt)} · <span className="font-medium text-accent">Merit exclusive</span>
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl p-4 ring-1 ring-line">
          <Link href={profileHref} className="flex items-center gap-3">
            <Initials name={who?.name ?? "M"} size={48} />
            <span>
              <span className="flex items-center gap-1 font-semibold text-ink">
                {who?.name ?? "A Merit tutor"} <BadgeCheck className="size-4 text-accent" />
              </span>
              <span className="block text-[13px] text-muted">{who?.headline}</span>
            </span>
          </Link>
          {tutor && viewer?.user.id !== c.educatorId ? (
            <Link href={`/tutors/${tutor.id}`} className="inline-flex h-10 items-center rounded-full bg-accent px-5 text-sm font-semibold text-white">
              Book a session{tutor.hourlyRate != null ? ` · $${tutor.hourlyRate}/hr` : ""}
            </Link>
          ) : null}
        </div>
        {course && topic ? (
          <Link href={`/courses/${course.slug}/${topic.slug}`} className="mt-4 inline-flex items-center gap-2 rounded-full bg-bg-subtle py-1 pl-1 pr-3 text-[13px] font-medium text-ink hover:bg-line">
            <CourseIcon id={course.id} size={22} /> {course.shortTitle} · {topic.title}
          </Link>
        ) : null}
        {c.body ? <p className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed text-ink-2">{c.body}</p> : null}
        {!pending && viewer?.user.id !== c.educatorId ? (
          <div className="mt-4">
            <ReportButton kind="upload" targetId={c.id} signedIn={Boolean(viewer)} />
          </div>
        ) : null}
        {canDelete ? (
          <form action={deleteUpload.bind(null, c.id)} className="mt-6">
            <button className="inline-flex h-9 items-center gap-2 rounded-full px-4 text-[13px] text-muted ring-1 ring-line hover:text-ink">
              <Trash2 className="size-4" /> Delete video
            </button>
          </form>
        ) : null}
      </div>
      <aside>
        <h2 className="mb-4 text-[15px] font-semibold text-ink">More Merit tutors&apos; videos</h2>
        {more.length ? (
          <div className="space-y-6">
            {more.map((u) => (
              <UploadCard key={u.id} u={u} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">
            More coming soon. <Link href="/videos" className="text-accent hover:underline">Browse all</Link>
          </p>
        )}
      </aside>
    </div>
  );
}
