import { ArrowRight, CalendarDays, CirclePlay, GraduationCap, MapPin, MonitorSmartphone, Radio } from "lucide-react";
import { onCallTutors } from "@/lib/on-call";
import type { Metadata } from "next";
import Link from "next/link";
import { readLocation } from "@/app/actions/tutoring";
import { LocationForm, SubjectSelect } from "@/components/tutoring-client";
import { heroBtn, HeroKicker, WORLD_ON_WHITE, WorldHero } from "@/components/marketing";
import { CreatorCard, TutorCard, V, VerifiedNote } from "@/components/tutoring-ui";
import { cn } from "@/components/ui";
import { allTutorMeta } from "@/lib/bookings";
import { getCatalog } from "@/lib/catalog";
import { getStore } from "@/lib/data/store";
import { rankTutors, topCreators, tutorsNear, tutorsOnline } from "@/lib/tutoring";
import { TUTOR_FEE } from "@/lib/billing/plans";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = {
  title: "Tutors",
  description: "Math tutors on call right now, and tutors to book for every math class, AP math course, and SAT Math.",
};

export default async function TutorsPage({ searchParams }: PageProps<"/tutors">) {
  const [sp, catalog, viewer, location, store] = await Promise.all([searchParams, getCatalog(), getViewer(), readLocation(), getStore()]);
  const course = typeof sp.course === "string" ? (catalog.course(sp.course) ?? null) : null;
  const [tutors, reviews, meta] = await Promise.all([store.listTutors(), store.listReviews(), allTutorMeta()]);
  const ranked = rankTutors(tutors, reviews);
  const near = tutorsNear(ranked, location, course?.id).slice(0, 6);
  const online = tutorsOnline(ranked, course?.id).slice(0, 9);
  const creators = topCreators(catalog, { courseId: course?.id }, 12);
  const hasTutors = ranked.length > 0;
  const onCallNow = onCallTutors(ranked, meta, course?.id).length;
  const subject = course?.title ?? "every math class";
  const place = location ? [location.city, location.region].filter(Boolean).join(", ") || location.zip : null;
  const isTutor = viewer?.state.profile.role === "tutor";

  const stats = [
    ...(hasTutors ? [{ n: ranked.length, label: ranked.length === 1 ? "Merit tutor" : "Merit tutors" }] : []),
    { n: creators.length, label: "free teachers" },
  ];

  return (
    <div className="pb-20">
      <WorldHero world="violet" inner="pb-12 pt-8 lg:pb-14 lg:pt-10">
        <HeroKicker>
          <GraduationCap className="size-4" /> Tutors
        </HeroKicker>
        <h1 className="display rise mt-4 max-w-3xl text-[36px] sm:text-5xl lg:text-[58px]">Tutoring help for {subject}.</h1>
        <p className="rise mt-4 max-w-2xl text-[16.5px] leading-relaxed text-white/90" style={{ ["--i" as string]: 1 }}>
          {hasTutors
            ? "Get an on-call tutor in minutes, book a session for later, or find a Merit tutor near you or online."
            : "Merit tutors are just getting started. Get on-call help, book a session, or list yourself as a tutor."}
        </p>
        <div className="rise mt-7 rounded-3xl bg-surface p-3 text-ink shadow-[0_6px_0_0_rgb(0_0_0/0.18)] sm:p-4" style={{ ["--i" as string]: 2 }}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <SubjectSelect courses={catalog.courses.map((c) => ({ id: c.id, title: c.title, category: c.category }))} value={course?.id ?? ""} />
            <LocationForm initial={location} />
          </div>
        </div>
        <ul className="rise mt-6 flex flex-wrap gap-2" style={{ ["--i" as string]: 3 }}>
          {stats.map((s) => (
            <li key={s.label} className="tabular inline-flex h-9 items-center gap-1.5 rounded-full bg-white/15 px-3.5 font-brand text-[14px] font-extrabold ring-1 ring-inset ring-white/25">
              <span className="font-black">{s.n}</span> <span className="text-white/85">{s.label}</span>
            </li>
          ))}
        </ul>
      </WorldHero>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <Link href={`/tutors/on-call${course ? `?course=${course.id}` : ""}`} className="press group flex items-center gap-4 rounded-[28px] bg-[#1e1b2e] p-5 text-white [--ledge:#000] hover:brightness-125 sm:p-6">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/10">
              <Radio className="size-6 text-[#4ade80]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-brand text-[18px] font-black">On call now</span>
              <span className="block text-[14px] text-white/80">{onCallNow ? `${onCallNow} ${onCallNow === 1 ? "tutor is" : "tutors are"} ready right now. Due tonight? Get help in minutes.` : "Due tonight? Get a tutor in minutes when one is on call."}</span>
            </span>
            <ArrowRight className="size-5 shrink-0 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link href={`/tutors/book${course ? `?course=${course.id}` : ""}`} className="press group flex items-center gap-4 rounded-[28px] bg-[#7c3aed] p-5 text-white [--ledge:#5b21b6] hover:brightness-110 sm:p-6">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
              <CalendarDays className="size-6" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-brand text-[18px] font-black">Book a tutor</span>
              <span className="block text-[14px] text-white/85">Pick a time, see the rate up front, and meet online.</span>
            </span>
            <ArrowRight className="size-5 shrink-0 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <Section icon={<MapPin className="size-5" />} title={place ? `Merit tutors near ${place}` : "Merit tutors near you"} sub="Book in-person sessions with tutors in your area, ranked by student reviews.">
          {near.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {near.map((t, i) => (
                <TutorCard key={t.id} t={t} courses={catalog.courses} rank={i + 1} vetted={meta.get(t.id)?.vetted} />
              ))}
            </div>
          ) : (
            <Empty icon={<MapPin className="size-5" />}>
              {place ? `No Merit tutors near ${place} for ${course?.shortTitle ?? "this class"} yet.` : "Set your location to see tutors near you."}{" "}
              <Link href="/tutors/join" className={cn("font-bold hover:underline", V.ink)}>
                Tutor near here? List yourself free.
              </Link>
            </Empty>
          )}
        </Section>

        <Section icon={<MonitorSmartphone className="size-5" />} title="Top online tutors" sub="Meet from anywhere. Ranked by rating, reviews, and experience. Book right on Merit.">
          {online.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {online.map((t, i) => (
                <TutorCard key={t.id} t={t} courses={catalog.courses} rank={i + 1} vetted={meta.get(t.id)?.vetted} />
              ))}
            </div>
          ) : (
            <Empty icon={<MonitorSmartphone className="size-5" />}>
              No online Merit tutors for {course ? course.shortTitle : "this class"} yet.{" "}
              <Link href="/tutors/join" className={cn("font-bold hover:underline", V.ink)}>
                Tutor this class? List yourself free.
              </Link>
            </Empty>
          )}
        </Section>

        <Section
          icon={<CirclePlay className="size-5" />}
          title={`Best free teachers${course ? ` for ${course.shortTitle}` : ""}`}
          sub="The YouTube teachers whose math lessons rank highest on Merit for this class. See how ranking works."
        >
          <ol className="scrollbar-none -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 pt-1 after:block after:w-px after:shrink-0 after:content-[''] sm:-mx-6 sm:scroll-px-6 sm:px-6 sm:after:w-2 lg:-mx-8 lg:scroll-px-8 lg:px-8 lg:after:w-4">
            {creators.map((c, i) => (
              <li key={c.channel.id} className="w-[168px] shrink-0 snap-start sm:w-[184px]">
                <CreatorCard c={c} rank={i + 1} />
              </li>
            ))}
          </ol>
        </Section>

        <div className="mt-14">
          <section className="relative flex flex-col justify-between gap-6 overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#7c3aed,#6d28d9)] px-6 py-8 text-white sm:px-8 sm:py-10">
            <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 size-48 rounded-full border-[28px] border-white/10" />
            <div className="relative">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-white/15 ring-2 ring-inset ring-white/25">
                <GraduationCap className="size-6" />
              </span>
              <h2 className="display mt-4 text-[28px] sm:text-[32px]">{isTutor ? "Your tutor listing is live" : "Tutor on Merit"}</h2>
              <p className="mt-2 max-w-md text-[15.5px] leading-relaxed text-white/90">
                {isTutor ? "Manage bookings, hours, and payouts from your dashboard." : `Online tutors: list yourself and get booked by students studying your subjects. ${TUTOR_FEE}`}
              </p>
            </div>
            <Link href={isTutor ? "/tutor" : "/tutors/join"} className={cn(heroBtn, WORLD_ON_WHITE.violet, "relative w-fit")}>
              {isTutor ? "Open tutor dashboard" : "Become a tutor"} <ArrowRight className="size-4" />
            </Link>
          </section>
        </div>
        <div className="mt-6">
          <VerifiedNote />
        </div>
      </div>
    </div>
  );
}

function Section({ icon, title, sub, children }: { icon: React.ReactNode; title: string; sub: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <div className="mb-5 flex items-center gap-3">
        <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-2xl", V.soft, V.ink)}>{icon}</span>
        <div className="min-w-0">
          <h2 className="headline text-[22px] text-ink sm:text-[24px]">{title}</h2>
          <p className="mt-0.5 text-sm text-muted">{sub}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Empty({ children, icon }: { children: React.ReactNode; icon: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-3xl bg-surface px-5 py-5 text-[14.5px] leading-relaxed text-ink-2 border-2 border-dashed border-line">
      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-bg-subtle text-muted">{icon}</span>
      <p className="min-w-0 pt-1.5">{children}</p>
    </div>
  );
}
