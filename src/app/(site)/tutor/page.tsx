import { BadgeCheck, CalendarClock, Wallet } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AvailabilityEditor } from "@/components/booking-client";
import { BookingStatus, money } from "@/components/booking-ui";
import { RequestStatus } from "@/components/request-status";
import { Initials, RatingLine } from "@/components/tutoring-ui";
import { ago } from "@/components/ui";
import { getTutorMeta, ledger, listBookings } from "@/lib/bookings";
import { getCatalog } from "@/lib/catalog";
import { getStore } from "@/lib/data/store";
import { rankTutors } from "@/lib/tutoring";
import { requireViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Tutor dashboard" };

function upcomingOf<T extends { status: string; startsAt: string }>(bookings: T[], now = Date.now()) {
  return bookings.filter((b) => (b.status === "requested" || b.status === "confirmed") && new Date(b.startsAt).getTime() > now - 3 * 3600000).reverse();
}

export default async function TutorDashboard() {
  const [viewer, catalog, store] = await Promise.all([requireViewer("/tutor"), getCatalog(), getStore()]);
  const mine = (await store.listTutors()).find((t) => t.userId === viewer.user.id);
  if (!mine) redirect("/tutors/join");
  const [reviews, requests, referrals, bookings, meta] = await Promise.all([
    store.listReviews(mine.id),
    store.listTutoringRequests(mine.id),
    store.referralCounts([mine.id]),
    listBookings({ tutorId: mine.id }),
    getTutorMeta(mine.id),
  ]);
  const t = rankTutors([mine], reviews)[0];
  const money$ = ledger(bookings);
  const upcoming = upcomingOf(bookings);
  const past = bookings.filter((b) => !upcoming.includes(b)).slice(0, 12);
  const pendingCount = bookings.filter((b) => b.status === "requested").length;

  return (
    <div className="mx-auto max-w-[1100px] px-4 pb-20 pt-6 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Initials name={t.name} size={64} />
          <div>
            <h1 className="flex items-center gap-2 text-[28px] font-bold tracking-tight text-ink">
              Tutor dashboard {meta.vetted ? <BadgeCheck className="size-6 text-accent" aria-label="Merit Verified" /> : null}
            </h1>
            <p className="text-sm text-muted">
              <RatingLine rating={t.rating} count={t.reviewCount} />
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/tutors/${t.id}`} className="flex h-9 items-center rounded-full bg-bg-subtle px-4 text-sm font-medium text-ink hover:bg-line">
            Public profile
          </Link>
          <Link href="/tutors/join" className="flex h-9 items-center rounded-full bg-ink px-4 text-sm font-medium text-bg">
            Edit listing
          </Link>
        </div>
      </div>

      <dl className="tabular mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ["Waiting for you", pendingCount],
          ["Sessions completed", money$.sessions],
          ["Earned (after fees)", money(money$.net)],
          ["Students referred", referrals[t.id] ?? 0],
        ].map(([k, v]) => (
          <div key={k as string} className="rounded-2xl bg-bg-subtle p-5">
            <dd className="text-2xl font-bold text-ink">{v}</dd>
            <dt className="text-sm text-muted">{k}</dt>
          </div>
        ))}
      </dl>

      {!meta.availability.length ? (
        <p className="mt-6 flex items-center gap-3 rounded-2xl bg-warn-soft p-4 text-sm text-ink">
          <CalendarClock className="size-5 shrink-0 text-warn" /> Add your weekly hours below so students can book you directly.
        </p>
      ) : null}

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0">
          <h2 className="text-xl font-bold tracking-tight text-ink">Upcoming sessions</h2>
          <div className="mt-4 space-y-2">
            {upcoming.map((b) => (
              <Link key={b.id} href={`/bookings/${b.id}`} className="flex items-center gap-4 rounded-2xl p-4 ring-1 ring-line hover:bg-bg-subtle">
                <Initials name={b.studentName} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">{b.studentName}</p>
                  <p className="text-[13px] text-muted">
                    {new Date(b.startsAt).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })} · {b.minutes} min
                    {b.courseId ? ` · ${catalog.course(b.courseId)?.shortTitle}` : ""}
                  </p>
                </div>
                <BookingStatus b={b} />
              </Link>
            ))}
            {!upcoming.length ? <p className="rounded-2xl bg-bg-subtle px-5 py-6 text-sm text-muted">No upcoming sessions yet.</p> : null}
          </div>

          {past.length ? (
            <>
              <h2 className="mt-10 text-xl font-bold tracking-tight text-ink">Past sessions</h2>
              <div className="mt-4 divide-y divide-line rounded-2xl ring-1 ring-line">
                {past.map((b) => (
                  <Link key={b.id} href={`/bookings/${b.id}`} className="flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-bg-subtle">
                    <span className="truncate text-ink">
                      {b.studentName} · {new Date(b.startsAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                    <span className="flex shrink-0 items-center gap-3">
                      <span className="tabular text-muted">{b.amount ? money(b.amount) : "Free"}</span>
                      <BookingStatus b={b} />
                    </span>
                  </Link>
                ))}
              </div>
            </>
          ) : null}

          <h2 className="mt-10 text-xl font-bold tracking-tight text-ink">Messages</h2>
          <div className="mt-4 space-y-3">
            {requests.map((r) => (
              <div key={r.id} className="rounded-2xl p-5 ring-1 ring-line">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-ink">{r.name}</p>
                    <a href={`mailto:${r.email}`} className="text-sm text-accent hover:underline">
                      {r.email}
                    </a>
                  </div>
                  <span className="text-xs text-muted">{ago(r.createdAt)}</span>
                </div>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-2">{r.message}</p>
                <p className="mt-2 text-xs text-muted">{[r.courseId ? catalog.course(r.courseId)?.title : null, r.availability].filter(Boolean).join(" · ")}</p>
                <RequestStatus id={r.id} status={r.status} />
              </div>
            ))}
            {!requests.length ? <p className="rounded-2xl bg-bg-subtle px-5 py-6 text-sm text-muted">No messages yet.</p> : null}
          </div>
        </div>

        <aside className="space-y-5">
          <section className="rounded-2xl p-5 ring-1 ring-line">
            <h2 className="flex items-center gap-2 text-[15px] font-semibold text-ink">
              <CalendarClock className="size-4 text-accent" /> Weekly hours
            </h2>
            <p className="mt-1 text-[13px] text-muted">Students can book any open 30-minute start time in these windows, with at least 12 hours&apos; notice.</p>
            <div className="mt-4">
              <AvailabilityEditor initial={meta.availability} timezone={meta.timezone} />
            </div>
          </section>
          <Link href="/tutor/payouts" className="flex items-center gap-4 rounded-2xl p-5 ring-1 ring-line hover:bg-bg-subtle">
            <Wallet className="size-6 shrink-0 text-accent" />
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-semibold text-ink">Payouts and fees</span>
              <span className="block text-[13px] text-muted">
                {meta.payoutsEnabled ? "Students can pay you through Merit" : "Set up payouts to get paid through Merit"}
                {money$.owedTotal ? ` · ${money(money$.owedTotal)} in fees due` : ""}
              </span>
            </span>
          </Link>
        </aside>
      </div>
    </div>
  );
}
