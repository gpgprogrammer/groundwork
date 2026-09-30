import { BadgeCheck, CalendarPlus, Clock, Trash2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteUpload } from "@/app/actions/uploads";
import { CourseIcon } from "@/components/course-icon";
import { MeritPlayer } from "@/components/merit-player";
import { Initials } from "@/components/tutoring-ui";
import { ago, Badge, cn, formatViews, LinkButton, MoreLink, Notice, panel } from "@/components/ui";
import { UploadRow } from "@/components/upload-card";
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
    <div className="mx-auto grid max-w-[1400px] gap-8 px-4 pb-20 pt-4 sm:px-6 sm:pt-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-8 grid-cols-[minmax(0,1fr)]">
      <div className="min-w-0">
        {pending ? (
          <div role="status" className="fade mb-4 flex items-start gap-3 rounded-2xl bg-warn-soft px-4 py-3.5 text-sm leading-relaxed text-ink">
            <Clock className="mt-0.5 size-[18px] shrink-0 text-warn" />
            <p>
              <span className="font-semibold">{sp.submitted ? "Submitted! " : ""}Waiting for review.</span> Merit checks every video before students can see it, usually within a day. Until then, only you can watch it here.
            </p>
          </div>
        ) : sp.published ? (
          <Notice tone="success" className="mb-4">
            <span className="font-medium">Published. Students can watch it now.</span>
          </Notice>
        ) : null}
        <div className="-mx-4 sm:mx-0">
          <MeritPlayer id={c.id} src={c.media!.videoUrl} poster={c.media!.posterUrl} count={!pending} />
        </div>
        <div className="rise">
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge tone="accent">Merit exclusive</Badge>
            {course && topic ? (
              <Link href={`/courses/${course.slug}/${topic.slug}`} className="inline-flex h-6 min-w-0 max-w-full items-center gap-1.5 rounded-full bg-bg-subtle pl-0.5 pr-2.5 text-xs font-semibold text-ink-2 transition-colors hover:bg-line hover:text-ink">
                <CourseIcon id={course.id} size={20} /> <span className="truncate">{course.shortTitle} · {topic.title}</span>
              </Link>
            ) : null}
          </div>
          <h1 className="headline mt-3 text-[22px] text-ink sm:text-[26px]">{c.title}</h1>
          <p className="tabular mt-1.5 text-[13.5px] text-muted">
            {formatViews(c.views ?? 0)} {(c.views ?? 0) === 1 ? "view" : "views"} · {ago(c.createdAt)}
          </p>

          <div className={cn(panel, "mt-5 flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between")}>
            <Link href={profileHref} className="group flex min-w-0 items-center gap-3">
              <Initials name={who?.name ?? "M"} size={48} />
              <span className="min-w-0">
                <span className="flex items-center gap-1 text-[15px] font-semibold text-ink group-hover:underline">
                  <span className="truncate">{who?.name ?? "A Merit tutor"}</span> <BadgeCheck className="size-4 shrink-0 text-accent-ink" />
                </span>
                {who?.headline ? <span className="block truncate text-[13px] text-muted">{who.headline}</span> : null}
              </span>
            </Link>
            {tutor && viewer?.user.id !== c.educatorId ? (
              <LinkButton href={`/tutors/${tutor.id}`} size="lg" className="w-full sm:w-auto">
                <CalendarPlus className="size-4" /> Book a session
                {tutor.hourlyRate != null ? <span className="tabular font-medium opacity-80">{`· $${tutor.hourlyRate}/hr`}</span> : null}
              </LinkButton>
            ) : null}
          </div>

          {c.body ? <p className="mt-5 max-w-[68ch] whitespace-pre-wrap rounded-2xl bg-bg-subtle/70 p-4 text-[15px] leading-relaxed text-ink-2 sm:p-5">{c.body}</p> : null}

          {(!pending && viewer?.user.id !== c.educatorId) || canDelete ? (
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {!pending && viewer?.user.id !== c.educatorId ? <ReportButton kind="upload" targetId={c.id} signedIn={Boolean(viewer)} /> : null}
              {canDelete ? (
                <form action={deleteUpload.bind(null, c.id)}>
                  <button className="press font-brand inline-flex h-10 items-center gap-2 rounded-2xl px-4 text-[13px] font-extrabold text-muted ring-1 ring-inset ring-line hover:bg-danger-soft hover:text-danger hover:ring-transparent [--ledge:var(--line)]">
                    <Trash2 className="size-4" /> Delete video
                  </button>
                </form>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
      <aside className="rise min-w-0" style={{ ["--i" as string]: 2 }}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="headline text-[17px] text-ink">More Merit tutors&apos; videos</h2>
          {more.length ? <MoreLink href="/videos">All</MoreLink> : null}
        </div>
        {more.length ? (
          <div className="space-y-1">
            {more.map((u) => (
              <UploadRow key={u.id} u={u} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl bg-bg-subtle/70 p-5 text-sm text-muted">
            More coming soon.{" "}
            <Link href="/videos" className="font-semibold text-accent-ink hover:underline">
              Browse all
            </Link>
          </p>
        )}
      </aside>
    </div>
  );
}
