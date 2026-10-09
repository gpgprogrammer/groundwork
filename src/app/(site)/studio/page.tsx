import { ArrowRight, BadgeCheck, Check, Eye, FileText, Film, Link2, PenLine, Plus, Sparkles, Trash2, Upload, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { removeContribution } from "@/app/actions/educator";
import { CourseIcon } from "@/components/course-icon";
import { EducatorForm } from "@/components/studio-forms";
import { Initials } from "@/components/tutoring-ui";
import { heroBtn, heroBtnGhost, HeroKicker, WORLD_ON_WHITE, WorldHero } from "@/components/marketing";
import { Avatar, Badge, cn, EmptyState, formatViews, LinkButton, panel, SectionHeading } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";
import { canUploadVideos } from "@/lib/auth/permissions";
import { contributionsBy, getEducator } from "@/lib/educators";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Teacher studio", description: "Teachers: add the lessons you trust and write study guides for every topic on Merit." };

export default async function StudioPage({ searchParams }: PageProps<"/studio">) {
  const [viewer, catalog, sp] = await Promise.all([getViewer(), getCatalog(), searchParams]);
  const courses = catalog.courses.map((c) => ({ id: c.id, title: c.title, category: c.category }));

  if (!viewer) return <StudioLanding />;

  const educator = await getEducator(viewer.user.id);
  const canUpload = canUploadVideos(viewer);
  if (!educator || sp.edit === "1") {
    return (
      <div className="pb-20">
        <WorldHero world="accent" narrow inner="pb-10 pt-6 lg:pt-8">
          {educator ? (
            <Link href="/studio" className="-ml-1 inline-flex min-h-9 items-center gap-1 rounded-full px-1 font-brand text-[13.5px] font-extrabold text-white/80 transition-colors hover:text-white">
              <span aria-hidden>←</span> Teacher studio
            </Link>
          ) : null}
          <div className={educator ? "mt-4" : ""}>
            <HeroKicker>
              <BadgeCheck className="size-4" aria-hidden /> Teacher profile
            </HeroKicker>
          </div>
          <h1 className="display rise mt-4 text-[36px] sm:text-5xl">{educator ? "Edit your teacher profile" : "Set up your teacher profile"}</h1>
          <p className="rise mt-3 max-w-xl text-[16px] leading-relaxed text-white/90" style={{ ["--i" as string]: 1 }}>
            This is what students see next to the lessons and guides you add.
          </p>
          {!educator ? (
            <div className="rise mt-6 flex items-start gap-3.5 rounded-3xl bg-white p-4 text-ink shadow-[0_5px_0_0_rgb(0_0_0/0.18)] sm:p-5" style={{ ["--i" as string]: 2 }} role="status">
              <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-2xl text-white", sp.welcome === "teacher" ? "check-pop bg-positive" : "bg-accent")}>
                {sp.welcome === "teacher" ? <Check className="size-6" strokeWidth={3} /> : <Sparkles className="size-5" />}
              </span>
              <div className="min-w-0">
                <p className="font-brand text-[17px] font-extrabold">{sp.welcome === "teacher" ? "Welcome to Merit! Your teacher account is ready." : "Teachers and tutors start here."}</p>
                <p className="mt-1 text-[14.5px] leading-relaxed text-ink-2">
                  Set up your profile to add lessons and write study guides{canUpload ? ", including videos you record yourself" : ""}. Tutoring students privately?{" "}
                  <Link href="/tutors/join" className="font-bold text-[#6d28d9] underline decoration-[#6d28d9]/30 underline-offset-2 hover:decoration-[#6d28d9] dark:text-[#c9b5ff]">
                    Create a tutor listing
                  </Link>{" "}
                  so students can book you.
                </p>
              </div>
            </div>
          ) : null}
        </WorldHero>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className={cn(panel, "rise mt-8 p-5 sm:p-7")} style={{ ["--i" as string]: 1 }}>
            <EducatorForm courses={courses} initial={educator ?? { name: viewer.user.name, headline: "", school: "", bio: "", courseIds: viewer.state.profile.courseIds }} />
          </div>
        </div>
      </div>
    );
  }

  const items = await contributionsBy(educator.id);
  const videos = items.filter((c) => c.kind === "video");
  const uploads = items.filter((c) => c.kind === "upload");
  const guides = items.filter((c) => c.kind === "guide");
  const opens = videos.reduce((s, c) => s + (catalog.video(c.video!.id)?.site.opens ?? 0), 0);
  const stats = [
    { label: "Videos added", value: videos.length + uploads.length, Icon: Film },
    { label: "Study guides", value: guides.length, Icon: FileText },
    { label: "Student opens", value: opens, Icon: Eye },
  ];

  const actions = [
    ...(canUpload ? [{ href: "/studio/upload", label: "Upload a video", sub: "Record once, teach every student.", Icon: Upload, tone: "bg-accent [--ledge:var(--accent-press)]" }] : []),
    { href: "/studio/video", label: "Add from YouTube", sub: "Paste the lesson you always send.", Icon: Plus, tone: "bg-sprint [--ledge:var(--sprint-press)]" },
    { href: "/studio/guide", label: "Write a guide", sub: "Steps, examples, common mistakes.", Icon: FileText, tone: "bg-positive [--ledge:var(--positive-press)]" },
  ];

  return (
    <div className="pb-20">
      <WorldHero world="accent" inner="pb-10 pt-8 lg:pt-10">
        {sp.welcome || sp.added ? (
          <div className="fade mb-6 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 font-semibold text-ink shadow-[0_4px_0_0_rgb(0_0_0/0.18)]" role="status">
            <span className="check-pop flex size-8 shrink-0 items-center justify-center rounded-full bg-positive text-white">
              <Check className="size-4" strokeWidth={3} />
            </span>
            {sp.welcome ? "Your studio is ready. Add your first lesson below." : "Added. It's live on the topic page now."}
          </div>
        ) : null}
        <div className="rise flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex min-w-0 items-center gap-4 sm:gap-5">
            <span className="shrink-0 rounded-full bg-white p-1 shadow-[0_4px_0_0_rgb(0_0_0/0.2)]">
              <Initials name={educator.name} size={76} />
            </span>
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 font-brand text-[14px] font-extrabold text-white/80">
                <BadgeCheck className="size-4" /> Teacher studio
              </p>
              <h1 className="display mt-0.5 truncate text-[32px] sm:text-[44px]">{educator.name}</h1>
              <p className="truncate text-[15px] text-white/85">
                {educator.headline}
                {educator.school ? ` · ${educator.school}` : ""}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link href={`/educators/${educator.id}`} className={cn(heroBtn, WORLD_ON_WHITE.accent)}>
              View public profile
            </Link>
            <Link href="/studio?edit=1" className={heroBtnGhost}>
              <PenLine className="size-4" /> Edit profile
            </Link>
          </div>
        </div>
        <dl className="rise mt-7 grid grid-cols-3 gap-2.5 sm:gap-3" style={{ ["--i" as string]: 1 }}>
          {stats.map(({ label, value, Icon }) => (
            <div key={label} className="rounded-2xl bg-white/15 p-3.5 ring-2 ring-inset ring-white/20 sm:p-4">
              <dt className="flex items-center gap-1.5 font-brand text-[12.5px] font-extrabold text-white/80 sm:text-[13px]">
                <Icon className="hidden size-4 sm:block" aria-hidden /> {label}
              </dt>
              <dd className="tabular mt-1 font-brand text-[28px] font-black leading-none sm:text-[36px]">{formatViews(value)}</dd>
            </div>
          ))}
        </dl>
      </WorldHero>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <section aria-label="Add content" className={cn("rise mt-8 grid gap-4", canUpload ? "sm:grid-cols-3" : "sm:grid-cols-2")} style={{ ["--i" as string]: 2 }}>
        {actions.map(({ href, label, sub, Icon, tone }) => (
          <Link key={href} href={href} className={cn("press group relative flex items-center gap-4 overflow-hidden rounded-3xl p-5 text-white hover:brightness-110 sm:min-h-[152px] sm:flex-col sm:items-start sm:justify-between", tone)}>
            <span aria-hidden className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full border-[14px] border-white/10" />
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/20">
              <Icon className="size-6" />
            </span>
            <span className="min-w-0 flex-1 sm:w-full sm:flex-none">
              <span className="flex items-center justify-between gap-2 font-brand text-[18px] font-extrabold">
                {label}
                <ArrowRight aria-hidden className="size-5 transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
              </span>
              <span className="mt-0.5 block text-[13.5px] text-white/85">{sub}</span>
            </span>
          </Link>
        ))}
      </section>

      <section className="rise mt-10" style={{ ["--i" as string]: 3 }}>
        <SectionHeading className="[&_h2]:text-[22px]" title="Your content" description={items.length ? `${items.length} ${items.length === 1 ? "item" : "items"} on Merit` : undefined} />
        {items.length ? (
          <ul className="grid gap-3">
            {items.map((c) => {
              const topic = catalog.topic(c.topicId);
              const course = catalog.course(c.courseId);
              const kind = { upload: { label: "Your video", tone: "accent" as const }, video: { label: "YouTube pick", tone: "neutral" as const }, guide: { label: "Study guide", tone: "positive" as const } }[c.kind];
              return (
                <li key={c.id} className={cn(panel, "flex items-center gap-3 p-3 sm:gap-4 sm:p-4")}>
                  <span className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-2xl bg-bg-subtle ring-2 ring-line sm:w-36">
                    {c.kind === "upload" && c.media?.posterUrl ? (
                      <img src={c.media.posterUrl} alt="" className="absolute inset-0 size-full object-cover" />
                    ) : c.kind === "video" ? (
                      <img src={c.video!.thumbnail} alt="" className="absolute inset-0 size-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <span className={cn("absolute inset-0 flex items-center justify-center", c.kind === "guide" ? "bg-positive-soft text-positive" : "bg-accent-soft text-accent-ink")}>
                        {c.kind === "guide" ? <FileText className="size-6" /> : <Film className="size-6" />}
                      </span>
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Badge tone={kind.tone} className="h-6 px-2.5 font-brand text-[11.5px] font-extrabold">
                      {kind.label}
                    </Badge>
                    <Link href={c.kind === "guide" ? `/guides/${c.id}` : c.kind === "upload" ? `/videos/${c.id}` : `/go/${c.video!.id}`} className="mt-1.5 line-clamp-2 font-brand text-[16px] font-extrabold leading-snug text-ink hover:underline sm:line-clamp-1">
                      {c.kind === "video" ? c.video!.title : c.title}
                    </Link>
                    {topic && course ? (
                      <Link href={`/courses/${course.slug}/${topic.slug}`} className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[12.5px] text-muted hover:text-ink">
                        <CourseIcon id={course.id} size={16} /> <span className="truncate">{course.shortTitle} · {topic.title}</span>
                      </Link>
                    ) : null}
                  </div>
                  <form action={removeContribution.bind(null, c.id)}>
                    <button className="flex size-11 items-center justify-center rounded-full text-faint transition-[background-color,color,transform] duration-150 hover:bg-danger-soft hover:text-danger active:scale-[0.94]" aria-label="Remove">
                      <Trash2 className="size-4" />
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState icon={<Film className="size-5" />} title="Nothing yet" body="Start with the one video you always send students." action={<LinkButton href="/studio/video" variant="outline"><Plus className="size-4" /> Add from YouTube</LinkButton>} />
        )}
      </section>
      </div>
    </div>
  );
}

/** Signed-out: the pitch to teachers. */
function StudioLanding() {
  return (
    <div className="pb-20">
      <WorldHero world="accent" inner="pb-14 pt-10 lg:pb-20 lg:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14 grid-cols-[minmax(0,1fr)]">
          <div className="rise">
            <HeroKicker>For teachers and tutors</HeroKicker>
            <h1 className="display mt-4 text-[38px] sm:text-[54px]">Put the lessons you trust in front of every student.</h1>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-white/90">
              Add the videos that actually work in your classroom and write study guides for the topics students struggle with. Your picks get a teacher badge and your name, on the exact topic page students study from.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup?next=/studio" className={cn(heroBtn, WORLD_ON_WHITE.accent, "h-[52px]")}>
                Create a free teacher account <ArrowRight className="size-4" />
              </Link>
              <Link href="/login?next=/studio" className={cn(heroBtnGhost, "h-[52px]")}>
                Sign in
              </Link>
            </div>
          </div>

          {/* An illustration of how a teacher pick appears on a topic page. */}
          <div aria-hidden className="rise relative mx-auto w-full max-w-md" style={{ ["--i" as string]: 2 }}>
            <div className="rotate-[1.5deg] rounded-3xl bg-surface p-4 text-ink shadow-[0_8px_0_0_rgb(0_0_0/0.18)] ring-2 ring-white/40 sm:p-5">
              <div className="flex items-center justify-between gap-2 text-[12.5px] text-muted">
                <span>AP Calculus BC · The chain rule</span>
                <span className="rounded-full bg-bg-subtle px-2 py-0.5 text-[11px] font-semibold">Example</span>
              </div>
              <div className="thumb relative mt-3 aspect-video overflow-hidden rounded-xl" style={{ ["--h" as string]: 255 }}>
                <div className="thumb-grid absolute inset-0" />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex size-12 items-center justify-center rounded-full bg-surface/90 shadow-soft">
                    <span className="ml-1 size-0 border-y-[8px] border-l-[13px] border-y-transparent border-l-accent" />
                  </span>
                </span>
                <span className="absolute left-2 top-2">
                  <Badge tone="accent" className="bg-surface/90">
                    <BadgeCheck className="size-3.5" /> Teacher pick
                  </Badge>
                </span>
              </div>
              <div className="mt-4 flex gap-3">
                <Avatar name="Ms Rivera" hue={255} size={36} />
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-ink">Ms. Rivera</p>
                  <p className="text-[12.5px] text-muted">AP Calculus teacher</p>
                  <p className="mt-2 rounded-xl rounded-tl-sm bg-bg-subtle px-3 py-2 text-[13px] leading-relaxed text-ink-2">Best explanation of the chain rule I&apos;ve found. Skip to 4:10 for the worked example.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </WorldHero>

      <section className="mx-auto max-w-6xl px-4 pt-14 sm:px-6 lg:px-8">
        <h2 className="headline max-w-xl text-[24px] text-ink sm:text-[28px]">Everything you already do for your students, in one place they actually look.</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-6">
          <article className={cn(panel, "relative overflow-hidden p-6 md:col-span-4 sm:p-7")}>
            <span className="flex size-12 items-center justify-center rounded-2xl bg-accent text-white">
              <Upload className="size-6" />
            </span>
            <h3 className="headline mt-5 text-[20px] text-ink">Publish your own videos</h3>
            <p className="mt-2 max-w-md text-[15px] leading-relaxed text-muted">Upload lessons you record. They&apos;re Merit exclusives, shown under your name on the topic page and your profile.</p>
            <div aria-hidden className="mt-6 flex items-center gap-3 rounded-xl border-2 border-dashed border-line-strong bg-bg-subtle/60 px-4 py-3 text-[13px] text-muted">
              <Film className="size-4 shrink-0 text-accent-ink" /> <span className="truncate">Drop a video here, or click to choose</span>
            </div>
          </article>
          <article className={cn(panel, "p-6 md:col-span-2 sm:p-7")}>
            <span className="flex size-12 items-center justify-center rounded-2xl bg-sprint text-white">
              <Link2 className="size-6" />
            </span>
            <h3 className="headline mt-5 text-[18px] text-ink">Add any YouTube lesson</h3>
            <p className="mt-2 text-[14.5px] leading-relaxed text-muted">Paste a link. Merit suggests the right topic; you add a note on why it works.</p>
          </article>
          <article className={cn(panel, "p-6 md:col-span-2 sm:p-7")}>
            <span className="flex size-12 items-center justify-center rounded-2xl bg-positive text-white">
              <FileText className="size-6" />
            </span>
            <h3 className="headline mt-5 text-[18px] text-ink">Write study guides</h3>
            <p className="mt-2 text-[14.5px] leading-relaxed text-muted">Step-by-step methods, worked examples, common mistakes. Published on the topic page.</p>
          </article>
          <article className="rounded-3xl bg-accent-soft p-6 md:col-span-4 sm:p-7">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="flex size-12 items-center justify-center rounded-2xl bg-[#7c3aed] text-white">
                  <Users className="size-6" />
                </span>
                <h3 className="headline mt-5 text-[18px] text-ink">Reach students everywhere</h3>
                <p className="mt-2 max-w-sm text-[14.5px] leading-relaxed text-muted">Your picks show up in feeds, learning plans, and Exam Sprints for every student on that topic.</p>
              </div>
              <ul aria-hidden className="flex flex-wrap gap-2 sm:max-w-[200px] sm:flex-col sm:items-end">
                {["Feeds", "Learning plans", "Exam Sprints"].map((x) => (
                  <li key={x} className="rounded-full bg-surface px-3.5 py-1.5 font-brand text-[13.5px] font-extrabold text-ink ring-2 ring-line">
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        </div>

        <div className="relative mt-10 flex flex-col items-start gap-5 overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,var(--accent),var(--accent-press))] p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-9">
          <span aria-hidden className="pointer-events-none absolute -right-10 -top-14 size-48 rounded-full border-[28px] border-white/10" />
          <div className="relative">
            <p className="display text-[26px] sm:text-[30px]">Start with the one video you always send students.</p>
            <p className="mt-1 text-[15px] text-white/85">Teacher accounts are free.</p>
          </div>
          <Link href="/signup?next=/studio" className={cn(heroBtn, WORLD_ON_WHITE.accent, "relative h-[52px] w-full sm:w-auto")}>
            Get started <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
