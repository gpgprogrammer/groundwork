import { ArrowLeft, CalendarCheck, Clock, ExternalLink, MapPin, MonitorSmartphone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RequestSessionForm, ReviewForm } from "@/components/tutoring-client";
import { Initials, RatingLine, VerifiedNote } from "@/components/tutoring-ui";
import { ago } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";
import { getStore } from "@/lib/data/store";
import { formatPlace, rankTutors } from "@/lib/tutoring";
import { getViewer } from "@/lib/viewer";

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

export default async function TutorPage({ params, searchParams }: PageProps<"/tutors/[id]">) {
  const [{ id }, sp, catalog, viewer] = await Promise.all([params, searchParams, getCatalog(), getViewer()]);
  const { tutor, reviews } = await load(id);
  if (!tutor) notFound();
  const courses = tutor.courseIds.map((c) => catalog.course(c)).filter((c) => c !== undefined);
  const own = viewer?.user.id === tutor.userId;

  return (
    <div className="mx-auto max-w-[1100px] px-4 pb-20 pt-6 sm:px-6">
      <Link href="/tutors" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> All tutors
      </Link>
      {sp.saved ? <p className="mt-4 rounded-xl bg-positive-soft px-4 py-3 text-sm text-positive">Your listing is live. Students can find you on the Tutors page.</p> : null}
      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0">
          <div className="flex items-center gap-5">
            <Initials name={tutor.name} size={88} />
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-ink">{tutor.name}</h1>
              <p className="mt-1 text-[16px] text-ink-2">{tutor.headline}</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <RatingLine rating={tutor.rating} count={tutor.reviewCount} />
                {tutor.inPerson && formatPlace(tutor) ? (
                  <span className="flex items-center gap-1 text-muted">
                    <MapPin className="size-4" /> {formatPlace(tutor)}
                  </span>
                ) : null}
                {tutor.online ? (
                  <span className="flex items-center gap-1 text-muted">
                    <MonitorSmartphone className="size-4" /> Online
                  </span>
                ) : null}
                {tutor.yearsExperience ? (
                  <span className="flex items-center gap-1 text-muted">
                    <Clock className="size-4" /> {tutor.yearsExperience} years tutoring
                  </span>
                ) : null}
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {courses.map((c) => (
              <Link key={c.id} href={`/courses/${c.slug}`} className="rounded-lg bg-bg-subtle px-3 py-1.5 text-[13px] font-medium text-ink hover:bg-line">
                {c.title}
              </Link>
            ))}
          </div>
          <h2 className="mt-10 text-lg font-bold text-ink">About</h2>
          <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-ink-2">{tutor.bio}</p>
          {tutor.credentials ? (
            <>
              <h2 className="mt-8 text-lg font-bold text-ink">Credentials</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{tutor.credentials}</p>
            </>
          ) : null}
          <h2 className="mt-10 text-lg font-bold text-ink">
            Reviews <span className="font-normal text-muted">({reviews.length})</span>
          </h2>
          <div className="mt-4 space-y-5">
            {reviews.map((r) => (
              <div key={r.id} className="border-b border-line pb-5">
                <p className="text-sm">
                  <span className="font-medium text-ink">{r.userName}</span> <span className="text-[#f5b301]">{"★".repeat(r.rating)}</span>
                  <span className="text-line-strong">{"★".repeat(5 - r.rating)}</span> <span className="text-muted">· {ago(r.createdAt)}</span>
                </p>
                {r.text ? <p className="mt-1.5 text-[15px] leading-relaxed text-ink-2">{r.text}</p> : null}
              </div>
            ))}
            {!reviews.length ? <p className="text-sm text-muted">No reviews yet.</p> : null}
            {!own ? (
              <div className="rounded-2xl bg-bg-subtle p-5">
                <p className="mb-3 text-sm font-medium text-ink">Worked with {tutor.name.split(" ")[0]}? Leave a review.</p>
                <ReviewForm tutorId={tutor.id} signedIn={Boolean(viewer)} />
              </div>
            ) : null}
          </div>
        </div>

        <aside>
          <div className="rounded-2xl p-6 ring-1 ring-line lg:sticky lg:top-20">
            <p className="flex items-baseline gap-1">
              <span className="tabular text-3xl font-bold text-ink">{tutor.hourlyRate == null ? "Free" : `$${tutor.hourlyRate}`}</span>
              {tutor.hourlyRate != null ? <span className="text-sm text-muted">/ hour</span> : null}
            </p>
            {own ? (
              <div className="mt-5 space-y-2">
                <Link href="/tutors/join" className="flex h-11 w-full items-center justify-center rounded-full bg-ink text-sm font-medium text-bg">
                  Edit listing
                </Link>
                <Link href="/tutor" className="flex h-11 w-full items-center justify-center rounded-full bg-bg-subtle text-sm font-medium text-ink">
                  Tutor dashboard
                </Link>
              </div>
            ) : (
              <div className="mt-5">
                {tutor.bookingUrl ? (
                  <a
                    href={`/r/tutor/${tutor.id}`}
                    target="_blank"
                    rel="noopener"
                    className="mb-5 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-accent text-sm font-medium text-white hover:bg-accent/90"
                  >
                    <CalendarCheck className="size-4" /> Book a time <ExternalLink className="size-3.5" />
                  </a>
                ) : null}
                <RequestSessionForm
                  tutorId={tutor.id}
                  tutorName={tutor.name}
                  courses={courses.map((c) => ({ id: c.id, title: c.title }))}
                  defaultCourse={courses[0]?.id ?? null}
                  prefill={viewer ? { name: viewer.user.name, email: viewer.user.email } : undefined}
                />
              </div>
            )}
            <div className="mt-6">
              <VerifiedNote />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
