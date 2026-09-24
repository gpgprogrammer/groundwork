import { CirclePlay, GraduationCap, MapPin, MonitorSmartphone, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { readLocation } from "@/app/actions/tutoring";
import { LocationForm, SubjectSelect } from "@/components/tutoring-client";
import { CreatorCard, ServiceCard, TutorCard, VerifiedNote } from "@/components/tutoring-ui";
import { getCatalog } from "@/lib/catalog";
import { getStore } from "@/lib/data/store";
import { rankTutors, SERVICES, topCreators, tutorsNear, tutorsOnline } from "@/lib/tutoring";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = {
  title: "Tutors",
  description: "The best tutors near you and online for every AP and SAT subject, plus the top free teachers on YouTube.",
};

export default async function TutorsPage({ searchParams }: PageProps<"/tutors">) {
  const [sp, catalog, viewer, location, store] = await Promise.all([searchParams, getCatalog(), getViewer(), readLocation(), getStore()]);
  const course = typeof sp.course === "string" ? (catalog.course(sp.course) ?? null) : null;
  const [tutors, reviews] = await Promise.all([store.listTutors(), store.listReviews()]);
  const ranked = rankTutors(tutors, reviews);
  const near = tutorsNear(ranked, location, course?.id).slice(0, 6);
  const online = tutorsOnline(ranked, course?.id).slice(0, 9);
  const creators = topCreators(catalog, { courseId: course?.id }, 12);
  const services = SERVICES.filter((s) => s.covers(course));
  const subject = course?.title ?? "every AP and SAT subject";
  const place = location ? [location.city, location.region].filter(Boolean).join(", ") || location.zip : null;
  const isTutor = viewer?.state.profile.role === "tutor";

  return (
    <div className="mx-auto max-w-[1280px] px-4 pb-20 pt-6 sm:px-6">
      <header className="rounded-3xl bg-[#0f0f0f] px-6 py-10 text-white sm:px-10">
        <p className="flex items-center gap-2 text-sm font-medium text-white/60">
          <GraduationCap className="size-4" /> Tutors
        </p>
        <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight sm:text-[40px] sm:leading-tight">The best help for {subject}.</h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-white/70">
          Top-rated tutors near you and online, the best free teachers on YouTube, and trusted tutoring services, ranked for each subject.
        </p>
        <div className="mt-7 flex flex-col gap-3 lg:flex-row lg:items-center">
          <SubjectSelect courses={catalog.courses.map((c) => ({ id: c.id, title: c.title, category: c.category }))} value={course?.id ?? ""} />
          <LocationForm initial={location} />
        </div>
      </header>

{near.length || online.length ? (
        <>
      <Section
        icon={<MapPin className="size-5 text-accent" />}
        title={place ? `Top tutors near ${place}` : "Top tutors near you"}
        sub="In-person tutors in your area, ranked by student reviews."
      >
        {near.length ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {near.map((t, i) => (
              <TutorCard key={t.id} t={t} courses={catalog.courses} rank={i + 1} />
            ))}
          </div>
        ) : (
          <Empty>
            {place ? `No Groundwork tutors near ${place} for ${course?.shortTitle ?? "this subject"} yet.` : "Set your location to see tutors near you."}{" "}
            {location?.zip ? (
              <a href={`/r/wyzant?${new URLSearchParams({ ...(course ? { course: course.id } : {}), zip: location.zip })}`} target="_blank" rel="noopener" className="font-medium text-accent hover:underline">
                Search local tutors on Wyzant
              </a>
            ) : null}
          </Empty>
        )}
      </Section>

      <Section icon={<MonitorSmartphone className="size-5 text-accent" />} title="Top online tutors worldwide" sub="Meet from anywhere. Ranked by rating, reviews, and experience.">
        {online.length ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {online.map((t, i) => (
              <TutorCard key={t.id} t={t} courses={catalog.courses} rank={i + 1} />
            ))}
          </div>
        ) : (
          <Empty>No online tutors have listed {course ? course.shortTitle : "this subject"} yet. The services below can match you right away.</Empty>
        )}
      </Section>

        </>
      ) : null}
      <Section
        icon={<CirclePlay className="size-5 text-[#e5484d]" />}
        title={`Best free teachers${course ? ` for ${course.shortTitle}` : ""}`}
        sub="The YouTube creators whose lessons rank highest on Groundwork, from real views, likes, and student votes."
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {creators.map((c, i) => (
            <CreatorCard key={c.channel.id} c={c} rank={i + 1} />
          ))}
        </div>
      </Section>

      <Section icon={<Sparkles className="size-5 text-accent" />} title="Tutoring services" sub={`Trusted services that cover ${course?.shortTitle ?? "AP and SAT"}, from free peer tutoring to full test prep.`}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <ServiceCard key={s.id} s={s} course={course} zip={location?.zip || null} />
          ))}
        </div>
      </Section>

{!near.length && !online.length ? (
        <section className="mt-12 rounded-2xl bg-bg-subtle px-6 py-6">
          <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-ink">
            <MapPin className="size-5 text-accent" /> Groundwork tutors{course ? ` for ${course.shortTitle}` : ""}{place ? ` near ${place}` : ""}
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-2">
            Independent tutors are just starting to list on Groundwork{course ? ` for ${course.shortTitle}` : ""}. Until more join, the services above can
            match you today{location?.zip ? " with tutors near your ZIP code" : ""}.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {location?.zip ? (
              <a href={`/r/wyzant?${new URLSearchParams({ ...(course ? { course: course.id } : {}), zip: location.zip })}`} target="_blank" rel="noopener" className="flex h-9 items-center rounded-full bg-ink px-4 text-sm font-medium text-bg">
                Local tutors near {location.zip}
              </a>
            ) : null}
            <Link href="/tutors/join" className="flex h-9 items-center rounded-full bg-bg px-4 text-sm font-medium text-ink ring-1 ring-line hover:bg-line">
              List yourself as a tutor
            </Link>
          </div>
        </section>
      ) : null}

      <section className="mt-14 flex flex-col items-start justify-between gap-5 rounded-3xl bg-accent-soft px-6 py-8 sm:flex-row sm:items-center sm:px-10">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-ink">{isTutor ? "Your tutor listing is live" : "Tutor on Groundwork"}</h2>
          <p className="mt-1 max-w-xl text-[15px] text-ink-2">
            {isTutor ? "See requests from students and keep your profile up to date." : "List yourself for free and get found by students studying your subjects, near you and around the world."}
          </p>
        </div>
        <Link href={isTutor ? "/tutor" : "/tutors/join"} className="flex h-11 shrink-0 items-center rounded-full bg-ink px-5 text-sm font-medium text-bg hover:bg-ink/85">
          {isTutor ? "Open tutor dashboard" : "Become a tutor"}
        </Link>
      </section>
      <div className="mt-6">
        <VerifiedNote />
      </div>
    </div>
  );
}

function Section({ icon, title, sub, children }: { icon: React.ReactNode; title: string; sub: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-ink">
        {icon}
        {title}
      </h2>
      <p className="mb-5 mt-1 text-sm text-muted">{sub}</p>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl bg-bg-subtle px-5 py-6 text-sm leading-relaxed text-ink-2">{children}</div>;
}
