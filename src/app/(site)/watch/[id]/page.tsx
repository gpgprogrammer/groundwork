import { BadgeCheck, Clock, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LessonActions } from "@/components/lesson-actions";
import { LessonListItem } from "@/components/lesson-cards";
import { LessonPlayer, type PlayerGate } from "@/components/lesson-player";
import { TutoringDialogButton } from "@/components/tutoring";
import { Avatar, Container, Stars, formatCount, formatDuration, timeAgo } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";
import { completionRate, helpfulRate } from "@/lib/ranking";
import { getViewer } from "@/lib/viewer";

export async function generateMetadata({ params }: PageProps<"/watch/[id]">): Promise<Metadata> {
  const catalog = await getCatalog();
  const video = catalog.video((await params).id);
  if (!video) return {};
  const educator = catalog.educator(video.educatorId);
  return { title: video.title, description: `${video.description} Taught by ${educator?.name}.` };
}

export default async function WatchPage({ params }: PageProps<"/watch/[id]">) {
  const { id } = await params;
  const [catalog, viewer] = await Promise.all([getCatalog(), getViewer()]);
  const video = catalog.video(id);
  if (!video) notFound();

  const topic = catalog.topic(video.topicId)!;
  const course = catalog.course(topic.courseId)!;
  const unit = catalog.unit(topic.unitId)!;
  const educator = catalog.educator(video.educatorId)!;
  const progress = viewer?.state.progress[video.id];

  const gate: PlayerGate = !viewer ? "preview" : viewer.access.kind === "expired" ? "expired" : "none";

  // Up next: other lessons on this topic, then the best lesson on the next topic.
  const sameTopic = catalog.videosForTopic(topic.id).filter((v) => v.id !== video.id);
  const courseTopics = catalog.topicsForCourse(course.id);
  const nextTopic = courseTopics[courseTopics.findIndex((t) => t.id === topic.id) + 1];
  const nextTopicLesson = nextTopic ? catalog.videosForTopic(nextTopic.id)[0] : undefined;
  const upNext = sameTopic[0] ?? nextTopicLesson;
  const moreFromEducator = catalog.videosForEducator(educator.id).filter((v) => v.id !== video.id && v.topicId !== topic.id && v.id !== nextTopicLesson?.id).slice(0, 3);

  const position = all(catalog.videosForTopic(topic.id)).indexOf(video.id) + 1;
  const prefill = viewer ? { name: viewer.user.name, email: viewer.user.email } : undefined;

  const tutoringCta = (
    <div className="flex items-center gap-4 rounded-xl bg-white/[0.06] p-4 text-left ring-1 ring-white/10">
      <Avatar name={educator.name} hue={educator.hue} size={40} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-white">Liked this lesson? Learn with {educator.firstName}.</p>
        <p className="tabular mt-0.5 text-xs text-white/55">
          1:1 tutoring · ${educator.hourlyRate}/hr · <Stars rating={educator.rating} className="text-white/70" />
        </p>
      </div>
      <Link href={`/educators/${educator.handle}#book`} className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-[13px] font-medium text-[#111113] hover:bg-white/90">
        Book
      </Link>
    </div>
  );

  return (
    <Container size="xl" className="py-6 sm:py-8">
      <div className="grid gap-10 xl:grid-cols-[1fr_360px]">
        <div className="min-w-0">
          <LessonPlayer
            videoId={video.id}
            durationSec={video.durationSec}
            chapters={video.chapters}
            mediaUrl={video.mediaUrl}
            hue={course.hue}
            glyph={topic.glyph}
            topicTitle={topic.title}
            educatorName={educator.name}
            initialPosition={gate === "none" && progress && !progress.completed ? progress.position : 0}
            signedIn={Boolean(viewer)}
            gate={gate}
            next={upNext ? { href: `/watch/${upNext.id}`, title: upNext.title } : null}
            endCard={educator.acceptingStudents ? tutoringCta : null}
          />

          <div className="mt-6">
            <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted" aria-label="Breadcrumb">
              <Link href={`/courses/${course.slug}`} className="hover:text-ink">
                {course.shortTitle}
              </Link>
              <span className="text-faint">/</span>
              <Link href={`/courses/${course.slug}#${unit.slug}`} className="hover:text-ink">
                {unit.title}
              </Link>
              <span className="text-faint">/</span>
              <Link href={`/courses/${course.slug}/${topic.slug}`} className="font-medium text-ink-2 hover:text-ink">
                {topic.title}
              </Link>
            </nav>
            <h1 className="headline mt-3 text-[26px] text-ink sm:text-[30px]">{video.title}</h1>

            <div className="mt-5 flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-center sm:justify-between">
              <Link href={`/educators/${educator.handle}`} className="group flex items-center gap-3">
                <Avatar name={educator.name} hue={educator.hue} size={40} />
                <div>
                  <p className="flex items-center gap-1 text-[15px] font-medium text-ink group-hover:underline">
                    {educator.name}
                    <BadgeCheck className="size-4 text-accent" aria-label="Verified educator" />
                  </p>
                  <p className="text-[13px] text-muted">{educator.headline}</p>
                </div>
              </Link>
              <LessonActions
                videoId={video.id}
                signedIn={Boolean(viewer)}
                initialVote={viewer?.state.votes[video.id] ?? 0}
                initialSaved={Boolean(viewer?.state.saves[video.id])}
                helpfulCount={video.stats.helpful}
              />
            </div>

            <div className="grid gap-10 pt-6 lg:grid-cols-[1fr_260px]">
              <div className="min-w-0">
                <div className="tabular flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted">
                  <span>{formatCount(video.stats.views)} views</span>
                  <span>{timeAgo(video.publishedAt)}</span>
                  <span>{video.style}</span>
                  <span>#{position} of {catalog.videosForTopic(topic.id).length} for this topic</span>
                </div>
                <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-2">{video.description}</p>

                <div className="mt-8 rounded-xl border border-line bg-surface p-5">
                  <p className="text-[13px] font-medium text-ink">The idea in two sentences</p>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{topic.summary}</p>
                </div>

                <div className="mt-8">
                  <h2 className="text-[13px] font-medium text-ink">Chapters</h2>
                  <ol className="mt-3 divide-y divide-line border-y border-line">
                    {video.chapters.map((c) => (
                      <li key={c.t} className="flex items-center gap-4 py-2.5 text-sm">
                        <span className="tabular w-10 shrink-0 font-mono text-xs text-faint">{formatDuration(c.t)}</span>
                        <span className="text-ink-2">{c.title}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              <dl className="tabular grid h-fit grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line text-center">
                {[
                  ["Finished by", `${Math.round(completionRate(video.stats) * 100)}%`],
                  ["Found it helpful", `${Math.round(helpfulRate(video.stats) * 100)}%`],
                  ["Saves", formatCount(video.stats.saves)],
                  ["Quality score", video.rank.score.toFixed(0)],
                ].map(([k, v]) => (
                  <div key={k} className="bg-surface px-3 py-4">
                    <dd className="text-lg font-semibold text-ink">{v}</dd>
                    <dt className="mt-0.5 text-xs text-muted">{k}</dt>
                  </div>
                ))}
              </dl>
            </div>

            {/* Educator spotlight: the natural next step, never a pop-up. */}
            <section id="educator" className="mt-12 overflow-hidden rounded-2xl border border-line bg-surface">
              <div className="grid gap-8 p-6 sm:p-8 md:grid-cols-[1fr_260px]">
                <div>
                  <p className="eyebrow">About the educator</p>
                  <div className="mt-4 flex items-center gap-4">
                    <Avatar name={educator.name} hue={educator.hue} size={56} />
                    <div>
                      <Link href={`/educators/${educator.handle}`} className="text-lg font-semibold tracking-tight text-ink hover:underline">
                        {educator.name}
                      </Link>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted">
                        <Stars rating={educator.rating} className="text-ink-2" />
                        <span>{formatCount(educator.ratingCount)} reviews</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3" /> {educator.location}
                        </span>
                      </p>
                    </div>
                  </div>
                  <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink-2">{educator.bio}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {educator.subjects.map((s) => (
                      <span key={s} className="rounded-full border border-line px-2.5 py-0.5 text-xs text-ink-2">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col justify-between rounded-xl bg-bg p-5 ring-1 ring-line">
                  <div>
                    <p className="text-[15px] font-medium text-ink">Liked this lesson? Learn with {educator.firstName}.</p>
                    <p className="mt-2 text-[13px] leading-relaxed text-muted">
                      One-on-one sessions for {course.shortTitle} and more, at your pace.
                    </p>
                    <p className="mt-4 flex items-baseline gap-1">
                      <span className="tabular text-2xl font-semibold text-ink">${educator.hourlyRate}</span>
                      <span className="text-sm text-muted">/ hour</span>
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                      <Clock className="size-3" /> {educator.responseTime}
                    </p>
                  </div>
                  <TutoringDialogButton educator={educator} courseId={course.id} sourceVideoId={video.id} prefill={prefill} className="mt-5 w-full">
                    Request a session
                  </TutoringDialogButton>
                </div>
              </div>
            </section>
          </div>
        </div>

        <aside className="min-w-0 space-y-8">
          {sameTopic.length ? (
            <div>
              <div className="mb-2 flex items-baseline justify-between px-2">
                <h2 className="text-[13px] font-medium text-ink">More on {topic.title}</h2>
                <Link href={`/courses/${course.slug}/${topic.slug}`} className="text-xs text-muted hover:text-ink">
                  Topic page
                </Link>
              </div>
              <div className="space-y-1">
                {sameTopic.map((v, i) => {
                  const p = viewer?.state.progress[v.id];
                  return (
                    <LessonListItem
                      key={v.id}
                      video={v}
                      catalog={catalog}
                      label={i === 0 ? "Up next" : undefined}
                      progress={p ? (p.completed ? 1 : p.position / p.duration) : undefined}
                    />
                  );
                })}
              </div>
            </div>
          ) : null}
          {nextTopic && nextTopicLesson ? (
            <div>
              <h2 className="mb-2 px-2 text-[13px] font-medium text-ink">Next topic: {nextTopic.title}</h2>
              <LessonListItem video={nextTopicLesson} catalog={catalog} />
            </div>
          ) : null}
          {moreFromEducator.length ? (
            <div>
              <h2 className="mb-2 px-2 text-[13px] font-medium text-ink">More from {educator.firstName}</h2>
              <div className="space-y-1">
                {moreFromEducator.map((v) => (
                  <LessonListItem key={v.id} video={v} catalog={catalog} />
                ))}
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </Container>
  );
}

function all(videos: { id: string }[]) {
  return videos.map((v) => v.id);
}
