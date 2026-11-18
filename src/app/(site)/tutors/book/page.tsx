import { ArrowRight, BadgeCheck, CalendarDays, Clock, Radio } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { money } from "@/components/booking-ui";
import { HeroKicker, WorldHero } from "@/components/marketing";
import { SubjectSelect } from "@/components/tutoring-client";
import { Initials, RatingLine, V } from "@/components/tutoring-ui";
import { cn, panel, panelLink, SegmentedLinks } from "@/components/ui";
import { allTutorMeta, listBookings, openSlots } from "@/lib/bookings";
import { getCatalog } from "@/lib/catalog";
import { getStore } from "@/lib/data/store";
import { isOnCall } from "@/lib/on-call";
import { rankTutors } from "@/lib/tutoring";

export const metadata: Metadata = {
  title: "Book a math tutor",
  description: "Book a one-on-one math tutor for Algebra through AP Calculus and SAT Math. See each tutor's next open time, rate, and reviews, and book right on Merit.",
};

const SORTS = { soonest: "Soonest available", rating: "Top rated", price: "Lowest price" } as const;
type Sort = keyof typeof SORTS;

/** Tutors you can schedule on Merit, with each one's next open time. */
export default async function BookTutorPage({ searchParams }: PageProps<"/tutors/book">) {
  const [sp, catalog, store] = await Promise.all([searchParams, getCatalog(), getStore()]);
  const course = typeof sp.course === "string" ? (catalog.course(sp.course) ?? null) : null;
  const sort: Sort = typeof sp.sort === "string" && sp.sort in SORTS ? (sp.sort as Sort) : "soonest";
  const [tutors, reviews, meta, bookings] = await Promise.all([store.listTutors(), store.listReviews(), allTutorMeta(), listBookings()]);
  const rows = rankTutors(tutors, reviews)
    .filter((t) => t.online && (!course || t.courseIds.includes(course.id)))
    .map((t) => {
      const m = meta.get(t.id);
      const next = m ? openSlots(m, bookings.filter((b) => b.tutorId === t.id), 60, 14)[0] : undefined;
      return { t, m, next, onCall: isOnCall(m) };
    })
    .filter((r) => r.next || r.onCall);
  rows.sort((a, b) => {
    if (sort === "rating") return b.t.score - a.t.score;
    if (sort === "price") return (a.t.hourlyRate ?? 0) - (b.t.hourlyRate ?? 0);
    const at = a.onCall ? 0 : a.next ? new Date(a.next.times[0].iso).getTime() : Infinity;
    const bt = b.onCall ? 0 : b.next ? new Date(b.next.times[0].iso).getTime() : Infinity;
    return at - bt;
  });
  const qs = (s: Sort) => new URLSearchParams({ ...(course ? { course: course.id } : {}), sort: s }).toString();

  return (
    <div className="pb-20">
      <WorldHero world="violet" inner="pb-12 pt-8 lg:pb-14 lg:pt-10">
        <HeroKicker>
          <CalendarDays className="size-4" /> Book a tutor
        </HeroKicker>
        <h1 className="display rise mt-4 max-w-3xl text-[38px] sm:text-5xl lg:text-[58px]">Book a math tutor{course ? ` for ${course.shortTitle}` : ""}.</h1>
        <p className="rise mt-4 max-w-2xl text-[16.5px] leading-relaxed text-white/90" style={{ ["--i" as string]: 1 }}>
          Pick a time that works, tell your tutor what you&apos;re working on, and meet online. Every tutor sets their own rate; you see it before you book.
        </p>
        <div className="rise mt-7 max-w-md rounded-3xl bg-surface p-3 text-ink shadow-[0_6px_0_0_rgb(0_0_0/0.18)]" style={{ ["--i" as string]: 2 }}>
          <SubjectSelect courses={catalog.courses.map((c) => ({ id: c.id, title: c.title, category: c.category }))} value={course?.id ?? ""} />
        </div>
      </WorldHero>

      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:px-8">
        <Link href={`/tutors/on-call${course ? `?course=${course.id}` : ""}`} className="press flex items-center gap-4 rounded-3xl bg-[#1e1b2e] p-5 text-white [--ledge:#000] hover:brightness-125">
          <Radio className="size-7 shrink-0 text-[#4ade80]" />
          <span className="min-w-0 flex-1">
            <span className="block font-brand text-[17px] font-black">Need help in the next hour?</span>
            <span className="block text-[14px] text-white/80">Skip the calendar: an on-call tutor can start in minutes.</span>
          </span>
          <ArrowRight className="size-5 shrink-0" />
        </Link>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <h2 className="headline text-[24px] text-ink">
            {rows.length} {rows.length === 1 ? "tutor" : "tutors"} with open times
          </h2>
          <SegmentedLinks label="Sort" active={sort} items={(Object.keys(SORTS) as Sort[]).map((s) => ({ key: s, label: SORTS[s], href: `/tutors/book?${qs(s)}` }))} />
        </div>

        {rows.length ? (
          <ul className="mt-5 grid gap-4 md:grid-cols-2">
            {rows.map(({ t, m, next, onCall }) => {
              const names = t.courseIds.map((id) => catalog.course(id)?.shortTitle).filter(Boolean).slice(0, 4);
              const first = next?.times[0];
              return (
                <li key={t.id}>
                  <Link href={`/tutors/${t.id}${course ? `?course=${course.id}` : ""}#book`} className={cn(panelLink, "group flex h-full flex-col gap-4 p-5")}>
                    <div className="flex items-start gap-4">
                      <Initials name={t.name} size={60} />
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-1.5 font-brand text-[17px] font-extrabold text-ink">
                          <span className="truncate">{t.name}</span>
                          {m?.vetted ? <BadgeCheck className={cn("size-4 shrink-0", V.ink)} aria-label="Merit Verified" /> : null}
                        </p>
                        <p className="line-clamp-2 text-[13.5px] text-muted">{t.headline}</p>
                        <p className="mt-1 text-[13px]">
                          <RatingLine rating={t.rating} count={t.reviewCount} />
                        </p>
                      </div>
                      <p className="tabular shrink-0 text-right font-brand text-[17px] font-black text-ink">
                        {t.hourlyRate ? money(t.hourlyRate) : "Free"}
                        {t.hourlyRate ? <span className="block text-[12px] font-bold text-muted">per hour</span> : null}
                      </p>
                    </div>
                    {names.length ? (
                      <p className="flex flex-wrap gap-1.5">
                        {names.map((n) => (
                          <span key={n} className={cn("rounded-full px-2.5 py-0.5 font-brand text-[12px] font-extrabold", V.soft, V.ink)}>
                            {n}
                          </span>
                        ))}
                      </p>
                    ) : null}
                    <div className="mt-auto flex items-center justify-between gap-3 rounded-2xl bg-bg-subtle px-4 py-3">
                      <span className="flex min-w-0 items-center gap-2 text-[14px] font-bold text-ink">
                        {onCall ? (
                          <>
                            <span className="size-2.5 shrink-0 rounded-full bg-positive" /> On call now
                          </>
                        ) : first ? (
                          <>
                            <Clock className="size-4 shrink-0 text-muted" />
                            <span className="truncate">
                              Next open: {next!.label}, {new Date(first.iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                            </span>
                          </>
                        ) : null}
                      </span>
                      <span className={cn("inline-flex shrink-0 items-center gap-1 font-brand text-[13.5px] font-extrabold", V.ink)}>
                        Book <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className={cn(panel, "mt-5 p-6")}>
            <p className="font-brand text-[17px] font-extrabold text-ink">No tutors{course ? ` for ${course.shortTitle}` : ""} have open times in the next two weeks yet.</p>
            <p className="mt-1 text-[14.5px] text-muted">
              Merit tutors are just getting started. See{" "}
              <Link href={`/tutors${course ? `?course=${course.id}` : ""}`} className={cn("font-bold hover:underline", V.ink)}>
                tutoring services and free teachers
              </Link>{" "}
              meanwhile, or{" "}
              <Link href="/tutors/join" className={cn("font-bold hover:underline", V.ink)}>
                list yourself as a tutor
              </Link>
              .
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
