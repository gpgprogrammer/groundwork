import { ArrowRight, BadgeCheck, FileText, Film, Plus, Trash2, Upload, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { removeContribution } from "@/app/actions/educator";
import { CourseIcon } from "@/components/course-icon";
import { EducatorForm } from "@/components/studio-forms";
import { formatViews } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";
import { contributionsBy, getEducator } from "@/lib/educators";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Teacher studio", description: "Teachers: add the lessons you trust and write study guides for every AP and SAT topic." };

export default async function StudioPage({ searchParams }: PageProps<"/studio">) {
  const [viewer, catalog, sp] = await Promise.all([getViewer(), getCatalog(), searchParams]);
  const courses = catalog.courses.map((c) => ({ id: c.id, title: c.title, category: c.category }));

  if (!viewer) {
    return (
      <div className="mx-auto max-w-[1100px] px-4 pb-20 pt-10 sm:px-6">
        <p className="text-sm font-semibold text-accent">For teachers and tutors</p>
        <h1 className="mt-2 max-w-3xl text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">Put the lessons you trust in front of every student.</h1>
        <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-ink-2">
          Add the videos that actually work in your classroom and write study guides for the topics students struggle with. Your picks get a teacher badge and your name, on the exact topic page students study from.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/signup?next=/studio" className="inline-flex h-12 items-center gap-2 rounded-full bg-accent px-6 text-[15px] font-semibold text-white">
            Create a free teacher account <ArrowRight className="size-4" />
          </Link>
          <Link href="/login?next=/studio" className="inline-flex h-12 items-center rounded-full px-6 text-[15px] font-semibold text-ink ring-1 ring-line-strong hover:bg-bg-subtle">
            Sign in
          </Link>
        </div>
        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            [Upload, "Publish your own videos", "Upload lessons you record. They're Merit exclusives, shown under your name on the topic page and your profile."],
            [Film, "Add any YouTube lesson", "Paste a link. Merit suggests the right topic; you add a note on why it works."],
            [FileText, "Write study guides", "Step-by-step methods, worked examples, common mistakes. Published on the topic page."],
            [Users, "Reach students everywhere", "Your picks show up in feeds, study plans, and Exam Sprints for every student on that topic."],
          ].map(([Icon, t, b]) => {
            const I = Icon as typeof Film;
            return (
              <div key={t as string} className="rounded-2xl p-6 ring-1 ring-line">
                <I className="size-6 text-accent" />
                <p className="mt-4 font-semibold text-ink">{t as string}</p>
                <p className="mt-1 text-[14px] leading-relaxed text-muted">{b as string}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const educator = await getEducator(viewer.user.id);
  if (!educator || sp.edit === "1") {
    return (
      <div className="mx-auto max-w-3xl px-4 pb-20 pt-10 sm:px-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">{educator ? "Edit your teacher profile" : "Set up your teacher profile"}</h1>
        <p className="mt-2 text-[15px] text-muted">This is what students see next to the lessons and guides you add.</p>
        <div className="mt-8">
          <EducatorForm courses={courses} initial={educator ?? { name: viewer.user.name, headline: "", school: "", bio: "", courseIds: viewer.state.profile.courseIds }} />
        </div>
      </div>
    );
  }

  const items = await contributionsBy(educator.id);
  const videos = items.filter((c) => c.kind === "video");
  const uploads = items.filter((c) => c.kind === "upload");
  const guides = items.filter((c) => c.kind === "guide");
  const opens = videos.reduce((s, c) => s + (catalog.video(c.video!.id)?.site.opens ?? 0), 0);

  return (
    <div className="mx-auto max-w-[1100px] px-4 pb-20 pt-8 sm:px-6">
      {sp.welcome ? <p className="mb-6 rounded-2xl bg-positive-soft p-4 text-sm font-medium text-ink">Your studio is ready. Add your first lesson below.</p> : null}
      {sp.added ? <p className="mb-6 rounded-2xl bg-positive-soft p-4 text-sm font-medium text-ink">Added. It&apos;s live on the topic page now.</p> : null}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-semibold text-accent">
            <BadgeCheck className="size-4" /> Teacher studio
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink">{educator.name}</h1>
          <p className="text-[15px] text-muted">
            {educator.headline}
            {educator.school ? ` · ${educator.school}` : ""}
          </p>
          <div className="mt-2 flex gap-3 text-[13px]">
            <Link href={`/educators/${educator.id}`} className="font-medium text-accent hover:underline">
              View public profile
            </Link>
            <Link href="/studio?edit=1" className="text-muted hover:text-ink">
              Edit profile
            </Link>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/studio/upload" className="inline-flex h-11 items-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-white">
            <Upload className="size-4" /> Upload a video
          </Link>
          <Link href="/studio/video" className="inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold text-ink ring-1 ring-line-strong hover:bg-bg-subtle">
            <Plus className="size-4" /> Add from YouTube
          </Link>
          <Link href="/studio/guide" className="inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold text-ink ring-1 ring-line-strong hover:bg-bg-subtle">
            <FileText className="size-4" /> Write a guide
          </Link>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-3">
        {[
          ["Videos added", videos.length + uploads.length],
          ["Study guides", guides.length],
          ["Student opens", opens],
        ].map(([l, v]) => (
          <div key={l as string} className="rounded-2xl p-5 ring-1 ring-line">
            <p className="tabular text-3xl font-bold text-ink">{formatViews(v as number)}</p>
            <p className="text-[13px] text-muted">{l as string}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-xl font-bold tracking-tight text-ink">Your content</h2>
      {items.length ? (
        <ul className="mt-4 divide-y divide-line rounded-2xl ring-1 ring-line">
          {items.map((c) => {
            const topic = catalog.topic(c.topicId);
            const course = catalog.course(c.courseId);
            return (
              <li key={c.id} className="flex items-center gap-4 px-4 py-3">
                {c.kind === "upload" ? (
                  c.media?.posterUrl ? <img src={c.media.posterUrl} alt="" className="aspect-video w-24 shrink-0 rounded-md object-cover" /> : <span className="flex aspect-video w-24 shrink-0 items-center justify-center rounded-md bg-accent-soft"><Film className="size-6 text-accent" /></span>
                ) : c.kind === "video" ? (
                  <img src={c.video!.thumbnail} alt="" className="aspect-video w-24 shrink-0 rounded-md object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span className="flex aspect-video w-24 shrink-0 items-center justify-center rounded-md bg-accent-soft">
                    <FileText className="size-6 text-accent" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <Link href={c.kind === "guide" ? `/guides/${c.id}` : c.kind === "upload" ? `/videos/${c.id}` : `/go/${c.video!.id}`} className="line-clamp-1 font-medium text-ink hover:underline">
                    {c.kind === "video" ? c.video!.title : c.title}
                  </Link>
                  {topic && course ? (
                    <Link href={`/courses/${course.slug}/${topic.slug}`} className="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-muted hover:text-ink">
                      <CourseIcon id={course.id} size={16} /> {course.shortTitle} · {topic.title}
                    </Link>
                  ) : null}
                </div>
                <form action={removeContribution.bind(null, c.id)}>
                  <button className="flex size-9 items-center justify-center rounded-full text-muted hover:bg-bg-subtle hover:text-ink" aria-label="Remove">
                    <Trash2 className="size-4" />
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-4 rounded-2xl bg-bg-subtle p-6 text-[15px] text-ink-2">Nothing yet. Start with the one video you always send students.</p>
      )}
    </div>
  );
}
