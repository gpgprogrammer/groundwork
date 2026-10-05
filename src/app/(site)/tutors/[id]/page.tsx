import { BadgeCheck, CalendarDays, Check, ChevronDown, Clock, GraduationCap, MapPin, MessageSquare, MonitorSmartphone, Star, Upload } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RequestSessionForm, ReviewForm } from "@/components/tutoring-client";
import { WorldHero } from "@/components/marketing";
import { Initials, V, VerifiedNote, violetButton } from "@/components/tutoring-ui";
import { ago, cn, LinkButton, panel } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";
import { getStore } from "@/lib/data/store";
import { formatPlace, rankTutors } from "@/lib/tutoring";
import { greetingName } from "@/lib/names";
import { getViewer } from "@/lib/viewer";
import { BookingForm } from "@/components/booking-client";
import { getTutorMeta, listBookings, openSlots } from "@/lib/bookings";
import { ReportButton } from "@/components/report-button";
import { UploadCard } from "@/components/upload-card";
import { canUploadVideos } from "@/lib/auth/permissions";
import { listUploads, toUploadCards } from "@/lib/uploads";

async function load(id: string) {
  const store = await getStore();
  const [tutors, reviews] = await Promise.all([store.listTutors(), store.listReviews(id)]);
  const tutor = rankTutors(tutors.filter((t) => t.id === id), reviews)[0];
  return { tutor, reviews };
}

export async function generateMetadata({ params }: PageProps<"/tutors/[id]">): Promise<Metadata> {
  const { tutor } = await load((await params).id);
  return tutor ? { title: `${tutor.name}, tutor`, description: tutor.headline } : {};
}

const sectionTitle = "headline text-[22px] text-ink";

export default async function TutorPage({ params, searchParams }: PageProps<"/tutors/[id]">) {
  const [{ id }, sp, catalog, viewer] = await Promise.all([params, searchParams, getCatalog(), getViewer()]);
  const { tutor, reviews } = await load(id);
  if (!tutor) notFound();
  const courses = tutor.courseIds.map((c) => catalog.course(c)).filter((c) => c !== undefined);
  const own = viewer?.user.id === tutor.userId;
  const canUpload = own && canUploadVideos(viewer);
  const [meta, booked] = await Promise.all([getTutorMeta(tutor.id), listBookings({ tutorId: tutor.id })]);
  const slots = Object.fromEntries([30, 60, 90].map((m) => [String(m), openSlots(meta, booked, m)]));
  const uploads = await toUploadCards(await listUploads({ educatorId: tutor.userId }));
  const tzLabel = meta.timezone.replace(/_/g, " ");
  const first = greetingName(tutor.name);
  const place = tutor.inPerson ? formatPlace(tutor) : null;

  const pill = "inline-flex h-8 items-center gap-1.5 rounded-full bg-white/15 px-3 font-brand text-[13.5px] font-extrabold ring-1 ring-inset ring-white/25";

  return (
    <div className="pb-20">
      <WorldHero world="violet" inner="pb-10 pt-6 lg:pb-12 lg:pt-8">
        <div className="flex items-center justify-between gap-3">
          <Link href="/tutors" className="-ml-1 inline-flex min-h-9 items-center gap-1 rounded-full px-1 font-brand text-[13.5px] font-extrabold text-white/80 transition-colors hover:text-white">
            <span aria-hidden>←</span> All tutors
          </Link>
          {!own ? <ReportButton kind="tutor" targetId={tutor.id} onDark className="px-2" /> : null}
        </div>

        {sp.saved ? (
          <div className="fade mt-4 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-[14.5px] font-semibold text-ink shadow-[0_4px_0_0_rgb(0_0_0/0.18)]" role="status">
            <span className="check-pop flex size-8 shrink-0 items-center justify-center rounded-full bg-positive text-white">
              <Check className="size-4" strokeWidth={3} />
            </span>
            Your listing is live. Students can find you on the Tutors page.
          </div>
        ) : null}

        <div className="rise mt-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-7">
          <div className="relative w-fit shrink-0">
            <span className="block rounded-full bg-white p-1.5 shadow-[0_5px_0_0_rgb(0_0_0/0.2)]">
              <Initials name={tutor.name} size={112} />
            </span>
            {meta.vetted ? (
              <span className="absolute -bottom-1 -right-1 flex size-10 items-center justify-center rounded-full bg-white text-[#6d28d9] ring-4 ring-[#7c3aed]" aria-hidden>
                <BadgeCheck className="size-6" />
              </span>
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <h1 className="display text-[36px] sm:text-5xl">{tutor.name}</h1>
              {meta.vetted ? (
                <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-white px-3 font-brand text-[13.5px] font-extrabold text-[#6d28d9]">
                  <BadgeCheck className="size-4" aria-hidden /> Merit Verified
                </span>
              ) : null}
            </div>
            <p className="mt-2 max-w-2xl text-[17px] leading-snug text-white/90">{tutor.headline}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className={pill}>
                {tutor.reviewCount && tutor.rating != null ? (
                  <>
                    <Star className="size-4 fill-[#ffd34d] text-[#ffd34d]" aria-hidden />
                    <span className="tabular">{tutor.rating.toFixed(1)}</span>
                    <span className="tabular font-bold text-white/75">({tutor.reviewCount})</span>
                  </>
                ) : (
                  "New tutor"
                )}
              </span>
              {place ? (
                <span className={pill}>
                  <MapPin className="size-4" aria-hidden /> {place}
                </span>
              ) : null}
              {tutor.online ? (
                <span className={pill}>
                  <MonitorSmartphone className="size-4" aria-hidden /> Online
                </span>
              ) : null}
              {tutor.yearsExperience ? (
                <span className={cn(pill, "tabular")}>
                  <Clock className="size-4" aria-hidden /> {tutor.yearsExperience} years tutoring
                </span>
              ) : null}
            </div>
          </div>
        </div>
        {courses.length ? (
          <div className="rise mt-6 flex flex-wrap gap-2" style={{ ["--i" as string]: 1 }}>
            {courses.map((c) => (
              <Link
                key={c.id}
                href={`/courses/${c.slug}`}
                className="press-sm inline-flex h-9 items-center rounded-xl bg-white px-3.5 font-brand text-[13.5px] font-extrabold text-[#6d28d9] [--ledge:rgb(0_0_0/0.2)] hover:brightness-95"
              >
                {c.title}
              </Link>
            ))}
          </div>
        ) : null}
      </WorldHero>

      <div className="mx-auto mt-6 grid w-full max-w-6xl gap-6 px-4 sm:px-6 lg:mt-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:grid-rows-[auto_1fr] lg:gap-x-8 lg:px-8 grid-cols-[minmax(0,1fr)]">
        <div className="min-w-0 space-y-6 lg:col-start-1 lg:row-start-1">
          <section className={cn(panel, "rise p-5 sm:p-7")} style={{ ["--i" as string]: 1 }}>
            <h2 className={sectionTitle}>About {first}</h2>
            <p className="mt-3 whitespace-pre-line text-[16px] leading-relaxed text-ink-2">{tutor.bio}</p>
            {tutor.credentials ? (
              <div className={cn("mt-5 flex items-start gap-3 rounded-2xl p-4", V.soft)}>
                <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", V.solid)}>
                  <GraduationCap className="size-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <h3 className={cn("font-brand text-[14px] font-extrabold", V.ink)}>Credentials</h3>
                  <p className="mt-0.5 text-[14.5px] leading-relaxed text-ink">{tutor.credentials}</p>
                </div>
              </div>
            ) : null}
          </section>
        </div>

        <aside id="book" className="min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <div className="rise space-y-4 lg:sticky lg:top-[calc(var(--nav-h)+16px)]" style={{ ["--i" as string]: 2 }}>
            <div className="overflow-hidden rounded-3xl bg-surface ring-2 ring-[#7c3aed]/30 shadow-[0_5px_0_0_#7c3aed26]">
              <div className={cn("flex items-center justify-between gap-3 px-5 py-4 sm:px-6", V.soft)}>
                <p className="flex items-baseline gap-1">
                  <span className="tabular font-brand text-[36px] font-black leading-none text-ink">{tutor.hourlyRate == null ? "Free" : `$${tutor.hourlyRate}`}</span>
                  {tutor.hourlyRate != null ? <span className="font-brand text-sm font-extrabold text-muted">/ hour</span> : null}
                </p>
                {!own ? (
                  <span className={cn("inline-flex h-8 items-center gap-1.5 rounded-full px-3 font-brand text-[13px] font-extrabold", V.solid)}>
                    <CalendarDays className="size-4" aria-hidden /> Book a session
                  </span>
                ) : null}
              </div>
              <div className="p-5 sm:p-6">
                {own ? (
                  <div className="grid gap-2.5">
                    <Link href="/tutors/join" className={violetButton("lg", "w-full")}>
                      Edit listing
                    </Link>
                    <LinkButton href="/tutor" variant="outline" size="lg" className="w-full">
                      Tutor dashboard
                    </LinkButton>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <BookingForm
                      tutorId={tutor.id}
                      tutorName={tutor.name}
                      hourlyRate={tutor.hourlyRate}
                      slots={slots}
                      courses={courses.map((c) => ({ id: c.id, title: c.title }))}
                      defaultCourse={courses[0]?.id ?? null}
                      timezoneLabel={tzLabel}
                      signedIn={Boolean(viewer)}
                    />
                    <details className="group rounded-2xl bg-bg-subtle ring-2 ring-line">
                      <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2.5 rounded-2xl px-4 font-brand text-[14.5px] font-extrabold text-ink transition-colors hover:bg-line/60 [&::-webkit-details-marker]:hidden">
                        <MessageSquare className={cn("size-4 shrink-0", V.ink)} aria-hidden />
                        <span className="flex-1">Send a message instead</span>
                        <ChevronDown className="size-4 shrink-0 text-muted transition-transform duration-200 ease-out group-open:rotate-180" aria-hidden />
                      </summary>
                      <div className="fade px-4 pb-4 pt-1">
                        <RequestSessionForm
                          tutorId={tutor.id}
                          tutorName={tutor.name}
                          courses={courses.map((c) => ({ id: c.id, title: c.title }))}
                          defaultCourse={courses[0]?.id ?? null}
                          prefill={viewer ? { name: viewer.user.name, email: viewer.user.email } : undefined}
                        />
                      </div>
                    </details>
                  </div>
                )}
              </div>
            </div>
            <div className="px-1">
              <VerifiedNote />
            </div>
          </div>
        </aside>

        <div className="min-w-0 space-y-6 lg:col-start-1 lg:row-start-2">
          {uploads.length || canUpload ? (
            <section className={cn(panel, "p-5 sm:p-7")}>
              <div className="flex items-center justify-between gap-3">
                <h2 className={sectionTitle}>
                  Videos <span className="tabular font-bold text-muted">({uploads.length})</span>
                </h2>
                {canUpload ? (
                  <LinkButton href="/studio/upload" variant="secondary" size="sm">
                    <Upload className="size-3.5" aria-hidden /> Upload a video
                  </LinkButton>
                ) : null}
              </div>
              {uploads.length ? (
                <div className="mt-5 grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                  {uploads.map((u) => (
                    <UploadCard key={u.id} u={u} hideBy />
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm leading-relaxed text-muted">Students who watch your videos are more likely to book. Upload a short lesson to show how you teach.</p>
              )}
            </section>
          ) : null}

          <section>
            <div className="flex items-end justify-between gap-3">
              <h2 className={sectionTitle}>
                Reviews <span className="tabular font-bold text-muted">({reviews.length})</span>
              </h2>
              {tutor.reviewCount && tutor.rating != null ? (
                <span className="tabular inline-flex h-9 items-center gap-1.5 rounded-full bg-[#fff4d1] px-3.5 font-brand text-[15px] font-black text-[#6b4a00] dark:bg-[#3a2f10] dark:text-[#ffd34d]">
                  <Star className="size-4 fill-current" aria-hidden /> {tutor.rating.toFixed(1)}
                </span>
              ) : null}
            </div>
            {reviews.length ? (
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {reviews.map((r, i) => (
                  <li key={r.id} className={cn(panel, "rise flex flex-col p-5")} style={{ ["--i" as string]: Math.min(i, 6) }}>
                    <span role="img" aria-label={`${r.rating} out of 5 stars`} className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} className={cn("size-5", n <= r.rating ? "fill-[#f5b301] text-[#f5b301]" : "fill-line text-line")} aria-hidden />
                      ))}
                    </span>
                    {r.text ? <p className="mt-3 flex-1 text-[15px] leading-relaxed text-ink">{r.text}</p> : <div className="flex-1" />}
                    <div className="mt-4 flex items-center gap-2.5 border-t-2 border-line pt-3">
                      <Initials name={r.userName} size={32} />
                      <span className="min-w-0 flex-1 truncate font-brand text-[14px] font-extrabold text-ink">{r.userName}</span>
                      <span className="shrink-0 text-[12.5px] text-muted">{ago(r.createdAt)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 rounded-3xl border-2 border-dashed border-line px-5 py-6 text-center text-sm font-semibold text-muted">No reviews yet.</p>
            )}
            {!own ? (
              <div className={cn("mt-4 rounded-3xl p-5 sm:p-6", V.soft)}>
                <p className="mb-3 font-brand text-[16px] font-extrabold text-ink">Worked with {first}? Leave a review.</p>
                <ReviewForm tutorId={tutor.id} signedIn={Boolean(viewer)} />
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}
