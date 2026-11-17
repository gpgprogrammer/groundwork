import { CalendarDays, ChevronRight, MessageCircleQuestion, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { BookingStatus, DateTile, money, sessionWhen } from "@/components/booking-ui";
import { heroBtn, HeroKicker, WORLD_ON_WHITE, WorldHero } from "@/components/marketing";
import { V, violetButton } from "@/components/tutoring-ui";
import { buttonClass, cn, EmptyState, panelLink } from "@/components/ui";
import { listBookings } from "@/lib/bookings";
import { dueForCheckIn, listLeads } from "@/lib/leads";
import { answerCheckIn } from "@/app/actions/bookings";
import { getStore } from "@/lib/data/store";
import { requireViewer } from "@/lib/viewer";
import type { Booking } from "@/lib/types";

export const metadata: Metadata = { title: "My sessions" };

function upcomingOf<T extends { status: string; startsAt: string }>(bookings: T[], now = Date.now()) {
  return bookings.filter((b) => (b.status === "requested" || b.status === "confirmed") && new Date(b.startsAt).getTime() > now - 3 * 3600000);
}

function Row({ b, tutorName, i }: { b: Booking; tutorName: string; i: number }) {
  const w = sessionWhen(b.startsAt);
  const quiet = b.status !== "requested" && b.status !== "confirmed";
  return (
    <li className="rise" style={{ ["--i" as string]: i }}>
      <Link href={`/bookings/${b.id}`} className={cn(panelLink, "group flex items-center gap-4 p-4 sm:gap-5 sm:p-5", quiet && "opacity-90")}>
        <DateTile iso={b.startsAt} muted={quiet} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-brand text-[18px] font-extrabold text-ink">{tutorName}</p>
          <BookingStatus b={b} className="mt-1.5" />
          <p className="tabular mt-2 truncate text-[13.5px] font-semibold text-muted">
            {w.day} · {w.time} · {b.minutes} min
            {b.amount ? ` · ${money(b.amount)}` : ""}
          </p>
        </div>
        <ChevronRight className="hidden size-5 shrink-0 text-faint transition-transform duration-200 ease-out group-hover:translate-x-0.5 sm:block" aria-hidden />
      </Link>
    </li>
  );
}

export default async function BookingsPage() {
  const viewer = await requireViewer("/bookings");
  const [bookings, tutors, leads] = await Promise.all([listBookings({ studentId: viewer.user.id }), (await getStore()).listTutors(), listLeads({ studentId: viewer.user.id })]);
  const checkIns = dueForCheckIn(leads);
  const name = (id: string) => tutors.find((t) => t.id === id)?.name ?? "Tutor";
  const upcoming = upcomingOf(bookings);
  const past = bookings.filter((b) => !upcoming.includes(b));

  const confirmed = upcoming.filter((b) => b.status === "confirmed").length;
  const waiting = upcoming.length - confirmed;

  return (
    <div className="pb-20">
      <WorldHero world="violet" narrow inner="pb-10 pt-8 lg:pt-10">
        <HeroKicker>
          <CalendarDays className="size-4" /> Tutoring
        </HeroKicker>
        <h1 className="display rise mt-4 text-[36px] sm:text-5xl">My tutoring sessions</h1>
        <p className="rise mt-3 max-w-xl text-[16px] leading-relaxed text-white/90" style={{ ["--i" as string]: 1 }}>
          Sessions you&apos;ve requested or booked with Merit tutors.
        </p>
        <div className="rise mt-6 flex flex-wrap items-center gap-2.5" style={{ ["--i" as string]: 2 }}>
          <Link href="/tutors" className={cn(heroBtn, WORLD_ON_WHITE.violet)}>
            <Search className="size-4" aria-hidden /> Find a tutor
          </Link>
          {bookings.length ? (
            <span className="tabular inline-flex h-12 items-center gap-3 rounded-2xl bg-white/15 px-4 font-brand text-[14.5px] font-extrabold ring-2 ring-inset ring-white/25">
              <span>
                <span className="font-black">{upcoming.length}</span> <span className="text-white/80">upcoming</span>
              </span>
              {waiting ? (
                <span>
                  <span className="font-black">{waiting}</span> <span className="text-white/80">pending</span>
                </span>
              ) : null}
            </span>
          ) : null}
        </div>
      </WorldHero>

      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
        {checkIns.map((l) => (
          <section key={l.id} className={cn("rise mt-6 flex flex-col gap-4 rounded-3xl p-5 sm:flex-row sm:items-center", V.soft)}>
            <div className="flex min-w-0 flex-1 items-start gap-3.5">
              <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-2xl", V.solid)}>
                <MessageCircleQuestion className="size-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="font-brand text-[16.5px] font-extrabold text-ink">Did you end up working with {name(l.tutorId)}?</p>
                <p className="mt-0.5 text-[13.5px] text-ink-2">It helps us keep tutor rankings honest.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
              <form action={answerCheckIn.bind(null, l.id, true)}>
                <button className={violetButton("md", "w-full")}>Yes, we had a session</button>
              </form>
              <form action={answerCheckIn.bind(null, l.id, false)}>
                <button className={buttonClass("outline", "md", "w-full")}>Not yet</button>
              </form>
            </div>
          </section>
        ))}

        {bookings.length ? (
          <div className="mt-8 space-y-10">
            {upcoming.length ? (
              <section>
                <h2 className="headline mb-4 text-[22px] text-ink">Upcoming</h2>
                <ul className="space-y-3">
                  {upcoming.map((b, i) => (
                    <Row key={b.id} b={b} tutorName={name(b.tutorId)} i={i} />
                  ))}
                </ul>
              </section>
            ) : null}
            {past.length ? (
              <section>
                <h2 className="headline mb-4 text-[22px] text-ink">Past</h2>
                <ul className="space-y-3">
                  {past.map((b, i) => (
                    <Row key={b.id} b={b} tutorName={name(b.tutorId)} i={upcoming.length + i} />
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        ) : (
          <div className="mt-8">
            <EmptyState
              icon={<CalendarDays className="size-5" />}
              title="No sessions yet."
              body="Book a Merit math tutor, or get an on-call tutor right now. Your requests and sessions will show up here."
              action={
                <Link href="/tutors" className={violetButton("md")}>
                  <Search className="size-4" aria-hidden /> Find a tutor
                </Link>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
