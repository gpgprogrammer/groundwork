import { Building2, CirclePlay, Gift, GraduationCap, Handshake, Languages, MapPin, MonitorSmartphone, Sparkles, Target } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { readLocation } from "@/app/actions/tutoring";
import { LocationForm, SubjectSelect } from "@/components/tutoring-client";
import { CreatorCard, ServiceCard, TutorCard, VerifiedNote } from "@/components/tutoring-ui";
import { allTutorMeta } from "@/lib/bookings";
import { getCatalog } from "@/lib/catalog";
import { getStore } from "@/lib/data/store";
import { allServices } from "@/lib/partners";
import { rankTutors, topCreators, tutorsNear, tutorsOnline, type ServiceKind } from "@/lib/tutoring";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = {
  title: "Tutors",
  description: "The best tutors near you and online for every AP and SAT subject, top free teachers, and trusted tutoring services.",
};

const GROUPS: { kinds: ServiceKind[]; title: string; sub: string; icon: typeof Gift }[] = [
  { kinds: ["Free"], title: "Free help", sub: "Volunteer tutoring and official practice, at no cost.", icon: Gift },
  { kinds: ["Online", "Local and online"], title: "One-on-one tutoring", sub: "Matched with a tutor online or at home.", icon: MonitorSmartphone },
  { kinds: ["Learning center"], title: "Learning centers near you", sub: "In-person centers with local locations.", icon: Building2 },
  { kinds: ["Test prep"], title: "Test prep", sub: "Courses and coaching built around the exam.", icon: Target },
  { kinds: ["Languages"], title: "Language tutors", sub: "Speaking practice with native speakers, great for AP language exams.", icon: Languages },
];

export default async function TutorsPage({ searchParams }: PageProps<"/tutors">) {
  const [sp, catalog, viewer, location, store] = await Promise.all([searchParams, getCatalog(), getViewer(), readLocation(), getStore()]);
  const course = typeof sp.course === "string" ? (catalog.course(sp.course) ?? null) : null;
  const [tutors, reviews, meta, services] = await Promise.all([store.listTutors(), store.listReviews(), allTutorMeta(), allServices()]);
  const ranked = rankTutors(tutors, reviews);
  const near = tutorsNear(ranked, location, course?.id).slice(0, 6);
  const online = tutorsOnline(ranked, course?.id).slice(0, 9);
  const creators = topCreators(catalog, { courseId: course?.id }, 12);
  const covered = services.filter((s) => s.covers(course));
  const subject = course?.title ?? "every AP and SAT subject";
  const place = location ? [location.city, location.region].filter(Boolean).join(", ") || location.zip : null;
  const isTutor = viewer?.state.profile.role === "tutor";
  const zipQs = (extra: Record<string, string> = {}) => new URLSearchParams({ ...(course ? { course: course.id } : {}), ...(location?.zip ? { zip: location.zip } : {}), ...extra }).toString();

  return (
    <div className="mx-auto max-w-[1280px] px-4 pb-20 pt-6 sm:px-6">
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#12225a] via-[#1b3aa8] to-[#2d5ff0] px-6 py-10 text-white sm:px-10">
        <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-white/10 blur-3xl" />
        <p className="relative flex items-center gap-2 text-sm font-medium text-white/70">
          <GraduationCap className="size-4" /> Tutors
        </p>
        <h1 className="relative mt-3 max-w-3xl text-3xl font-bold tracking-tight sm:text-[40px] sm:leading-tight">The best help for {subject}.</h1>
        <p className="relative mt-3 max-w-2xl text-[15px] leading-relaxed text-white/75">
          Book top-rated tutors near you or online, learn from the best free teachers, or pick a trusted tutoring service. All in one place, ranked for your subject.
        </p>
        <div className="relative mt-7 flex flex-col gap-3 lg:flex-row lg:items-center">
          <SubjectSelect courses={catalog.courses.map((c) => ({ id: c.id, title: c.title, category: c.category }))} value={course?.id ?? ""} />
          <LocationForm initial={location} />
        </div>
      </header>

      <Section icon={<MapPin className="size-5 text-accent" />} title={place ? `Merit tutors near ${place}` : "Merit tutors near you"} sub="Book in-person sessions with tutors in your area, ranked by student reviews.">
        {near.length ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {near.map((t, i) => (
              <TutorCard key={t.id} t={t} courses={catalog.courses} rank={i + 1} vetted={meta.get(t.id)?.vetted} />
            ))}
          </div>
        ) : (
          <Empty>
            {place ? `No Merit tutors near ${place} for ${course?.shortTitle ?? "this subject"} yet.` : "Set your location to see tutors near you."}{" "}
            {location?.zip ? (
              <>
                Meanwhile,{" "}
                <a href={`/r/wyzant?${zipQs()}`} target="_blank" rel="noopener" className="font-medium text-accent hover:underline">
                  search local tutors near {location.zip}
                </a>{" "}
                or see learning centers below.
              </>
            ) : null}
          </Empty>
        )}
      </Section>

      <Section icon={<MonitorSmartphone className="size-5 text-accent" />} title="Top online tutors" sub="Meet from anywhere. Ranked by rating, reviews, and experience. Book right on Merit.">
        {online.length ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {online.map((t, i) => (
              <TutorCard key={t.id} t={t} courses={catalog.courses} rank={i + 1} vetted={meta.get(t.id)?.vetted} />
            ))}
          </div>
        ) : (
          <Empty>
            No online Merit tutors for {course ? course.shortTitle : "this subject"} yet.{" "}
            <Link href="/tutors/join" className="font-medium text-accent hover:underline">
              Tutor this subject? List yourself free.
            </Link>
          </Empty>
        )}
      </Section>

      <Section
        icon={<CirclePlay className="size-5 text-[#e5484d]" />}
        title={`Best free teachers${course ? ` for ${course.shortTitle}` : ""}`}
        sub="The teachers whose lessons rank highest on Merit, from real results: views, likes, and student votes."
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {creators.map((c, i) => (
            <CreatorCard key={c.channel.id} c={c} rank={i + 1} />
          ))}
        </div>
      </Section>

      <section className="mt-14">
        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-ink">
          <Sparkles className="size-5 text-accent" /> Tutoring services{course ? ` for ${course.shortTitle}` : ""}
        </h2>
        <p className="mt-1 text-sm text-muted">{covered.length} trusted options, from free volunteer tutoring to local centers and full test prep.</p>
        {GROUPS.map((g) => {
          const items = covered.filter((s) => g.kinds.includes(s.kind));
          if (!items.length) return null;
          return (
            <div key={g.title} className="mt-8">
              <h3 className="flex items-center gap-2 text-[16px] font-semibold text-ink">
                <g.icon className="size-4 text-muted" /> {g.title}
              </h3>
              <p className="mb-4 mt-0.5 text-[13px] text-muted">{g.sub}</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((s) => (
                  <ServiceCard key={s.id} s={s} course={course} zip={location?.zip || null} />
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <div className="mt-14 grid gap-4 md:grid-cols-2">
        <section className="flex flex-col justify-between gap-5 rounded-3xl bg-accent-soft px-6 py-8 sm:px-8">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-ink">{isTutor ? "Your tutor listing is live" : "Tutor on Merit"}</h2>
            <p className="mt-1 text-[15px] text-ink-2">
              {isTutor ? "Manage bookings, hours, and payouts from your dashboard." : "List yourself free and get booked by students studying your subjects. Merit keeps 10% of sessions booked here, nothing else."}
            </p>
          </div>
          <Link href={isTutor ? "/tutor" : "/tutors/join"} className="flex h-11 w-fit items-center rounded-full bg-ink px-5 text-sm font-medium text-bg hover:bg-ink/85">
            {isTutor ? "Open tutor dashboard" : "Become a tutor"}
          </Link>
        </section>
        <section className="flex flex-col justify-between gap-5 rounded-3xl bg-bg-subtle px-6 py-8 sm:px-8">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-ink">
              <Handshake className="size-5 text-accent" /> Run a tutoring business?
            </h2>
            <p className="mt-1 text-[15px] text-ink-2">Become a Merit partner. Get listed for your subjects and pay only for the students we send you.</p>
          </div>
          <Link href="/tutors/partners" className="flex h-11 w-fit items-center rounded-full bg-bg px-5 text-sm font-medium text-ink ring-1 ring-line-strong hover:bg-line">
            Partner with Merit
          </Link>
        </section>
      </div>
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
