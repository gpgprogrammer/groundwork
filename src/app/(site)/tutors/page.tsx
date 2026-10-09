import { ArrowRight, Building2, CirclePlay, Gift, GraduationCap, Handshake, Languages, MapPin, MonitorSmartphone, Sparkles, Target } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { readLocation } from "@/app/actions/tutoring";
import { LocationForm, SubjectSelect } from "@/components/tutoring-client";
import { heroBtn, heroBtnGhost, HeroKicker, WORLD_ON_WHITE, WorldHero } from "@/components/marketing";
import { CreatorCard, ServiceCard, TutorCard, V, VerifiedNote } from "@/components/tutoring-ui";
import { cn } from "@/components/ui";
import { allTutorMeta } from "@/lib/bookings";
import { getCatalog } from "@/lib/catalog";
import { getStore } from "@/lib/data/store";
import { allServices } from "@/lib/partners";
import { rankTutors, topCreators, tutorsNear, tutorsOnline, type ServiceKind } from "@/lib/tutoring";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = {
  title: "Tutors",
  description: "The best tutors near you and online for every high school, AP, and SAT subject, top free teachers, and trusted tutoring services.",
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
  const subject = course?.title ?? "every high school, AP, and SAT subject";
  const place = location ? [location.city, location.region].filter(Boolean).join(", ") || location.zip : null;
  const isTutor = viewer?.state.profile.role === "tutor";
  const zipQs = (extra: Record<string, string> = {}) => new URLSearchParams({ ...(course ? { course: course.id } : {}), ...(location?.zip ? { zip: location.zip } : {}), ...extra }).toString();

  const stats = [
    { n: ranked.length, label: ranked.length === 1 ? "Merit tutor" : "Merit tutors" },
    { n: creators.length, label: "top free teachers" },
    { n: covered.length, label: "tutoring services" },
  ];

  return (
    <div className="pb-20">
      <WorldHero world="violet" inner="pb-12 pt-8 lg:pb-14 lg:pt-10">
        <HeroKicker>
          <GraduationCap className="size-4" /> Tutors
        </HeroKicker>
        <h1 className="display rise mt-4 max-w-3xl text-[36px] sm:text-5xl lg:text-[58px]">The best help for {subject}.</h1>
        <p className="rise mt-4 max-w-2xl text-[16.5px] leading-relaxed text-white/90" style={{ ["--i" as string]: 1 }}>
          Book top-rated tutors near you or online, learn from the best free teachers, or pick a trusted tutoring service. All in one place, ranked for your subject.
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
        <Section icon={<MapPin className="size-5" />} title={place ? `Merit tutors near ${place}` : "Merit tutors near you"} sub="Book in-person sessions with tutors in your area, ranked by student reviews.">
          {near.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {near.map((t, i) => (
                <TutorCard key={t.id} t={t} courses={catalog.courses} rank={i + 1} vetted={meta.get(t.id)?.vetted} />
              ))}
            </div>
          ) : (
            <Empty icon={<MapPin className="size-5" />}>
              {place ? `No Merit tutors near ${place} for ${course?.shortTitle ?? "this subject"} yet.` : "Set your location to see tutors near you."}{" "}
              {location?.zip ? (
                <>
                  Meanwhile,{" "}
                  <a href={`/r/wyzant?${zipQs()}`} target="_blank" rel="noopener" className={cn("font-bold hover:underline", V.ink)}>
                    search local tutors near {location.zip}
                  </a>{" "}
                  or see learning centers below.
                </>
              ) : null}
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
              No online Merit tutors for {course ? course.shortTitle : "this subject"} yet.{" "}
              <Link href="/tutors/join" className={cn("font-bold hover:underline", V.ink)}>
                Tutor this subject? List yourself free.
              </Link>
            </Empty>
          )}
        </Section>

        <Section
          icon={<CirclePlay className="size-5" />}
          title={`Best free teachers${course ? ` for ${course.shortTitle}` : ""}`}
          sub="The teachers whose lessons rank highest on Merit, from real results: views, likes, and student votes."
        >
          <ol className="scrollbar-none -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 pt-1 after:block after:w-px after:shrink-0 after:content-[''] sm:-mx-6 sm:scroll-px-6 sm:px-6 sm:after:w-2 lg:-mx-8 lg:scroll-px-8 lg:px-8 lg:after:w-4">
            {creators.map((c, i) => (
              <li key={c.channel.id} className="w-[168px] shrink-0 snap-start sm:w-[184px]">
                <CreatorCard c={c} rank={i + 1} />
              </li>
            ))}
          </ol>
        </Section>

        <section className="mt-14">
          <div className="flex items-center gap-3">
            <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-2xl", V.solid)}>
              <Sparkles className="size-5" />
            </span>
            <div className="min-w-0">
              <h2 className="headline text-[24px] text-ink sm:text-[28px]">Tutoring services{course ? ` for ${course.shortTitle}` : ""}</h2>
              <p className="mt-0.5 text-sm text-muted">{covered.length} trusted options, from free volunteer tutoring to local centers and full test prep.</p>
            </div>
          </div>
          <div className="mt-6 space-y-5">
            {GROUPS.map((g, gi) => {
              const items = covered.filter((s) => g.kinds.includes(s.kind));
              if (!items.length) return null;
              return (
                <div key={g.title} className={cn("rounded-[28px] p-4 sm:p-6", GROUP_TONES[gi % GROUP_TONES.length].wrap)}>
                  <div className="mb-4 flex items-center gap-3">
                    <span className={cn("press-sm flex size-10 shrink-0 items-center justify-center rounded-2xl text-white", GROUP_TONES[gi % GROUP_TONES.length].icon)}>
                      <g.icon className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-brand text-[18px] font-extrabold leading-tight text-ink">{g.title}</h3>
                      <p className="text-[13px] text-ink-2">{g.sub}</p>
                    </div>
                    <span className="tabular ml-auto hidden h-7 shrink-0 items-center rounded-full bg-surface px-3 font-brand text-[13px] font-extrabold text-ink-2 ring-2 ring-line sm:inline-flex">{items.length}</span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((s) => (
                      <ServiceCard key={s.id} s={s} course={course} zip={location?.zip || null} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="mt-14 grid gap-4 md:grid-cols-2">
          <section className="relative flex flex-col justify-between gap-6 overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#7c3aed,#6d28d9)] px-6 py-8 text-white sm:px-8 sm:py-10">
            <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 size-48 rounded-full border-[28px] border-white/10" />
            <div className="relative">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-white/15 ring-2 ring-inset ring-white/25">
                <GraduationCap className="size-6" />
              </span>
              <h2 className="display mt-4 text-[28px] sm:text-[32px]">{isTutor ? "Your tutor listing is live" : "Tutor on Merit"}</h2>
              <p className="mt-2 max-w-md text-[15.5px] leading-relaxed text-white/90">
                {isTutor ? "Manage bookings, hours, and payouts from your dashboard." : "List yourself free and get booked by students studying your subjects. Merit keeps 10% of sessions booked here, nothing else."}
              </p>
            </div>
            <Link href={isTutor ? "/tutor" : "/tutors/join"} className={cn(heroBtn, WORLD_ON_WHITE.violet, "relative w-fit")}>
              {isTutor ? "Open tutor dashboard" : "Become a tutor"} <ArrowRight className="size-4" />
            </Link>
          </section>
          <section className="relative flex flex-col justify-between gap-6 overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#1e1b2e,#2e2748)] px-6 py-8 text-white sm:px-8 sm:py-10">
            <div aria-hidden className="pointer-events-none absolute -bottom-14 -right-10 size-48 rounded-full border-[28px] border-white/[0.07]" />
            <div className="relative">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-white/10 ring-2 ring-inset ring-white/20">
                <Handshake className="size-6" />
              </span>
              <h2 className="display mt-4 text-[28px] sm:text-[32px]">Run a tutoring business?</h2>
              <p className="mt-2 max-w-md text-[15.5px] leading-relaxed text-white/85">Become a Merit partner. Get listed for your subjects and pay only for the students we send you.</p>
            </div>
            <Link href="/tutors/partners" className={cn(heroBtnGhost, "relative w-fit")}>
              Partner with Merit <ArrowRight className="size-4" />
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

const GROUP_TONES = [
  { wrap: "bg-positive-soft", icon: "bg-positive [--ledge:var(--positive-press)]" },
  { wrap: "bg-[#f3edff] dark:bg-[#2a1f45]", icon: "bg-[#7c3aed] [--ledge:#5b21b6]" },
  { wrap: "bg-accent-soft", icon: "bg-accent [--ledge:var(--accent-press)]" },
  { wrap: "bg-sprint-soft", icon: "bg-sprint [--ledge:var(--sprint-press)]" },
  { wrap: "bg-[#fdeef6] dark:bg-[#3a1a2c]", icon: "bg-[#db2777] [--ledge:#9d174d]" },
];

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
