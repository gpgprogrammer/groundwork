import { BadgeCheck, CalendarClock, Radio, CalendarDays, ChevronRight, Hourglass, Inbox, CircleCheckBig, Upload, UserPlus, Wallet } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AvailabilityEditor } from "@/components/booking-client";
import { AcceptButton, AutoRefresh, Elapsed, OnCallToggle } from "@/components/on-call-client";
import { isOnCall, listOnCallRequests, MAX_ON_CALL_RATE, MIN_ON_CALL_RATE, ON_CALL_HOURS, openRequestsFor, URGENCY } from "@/lib/on-call";
import { BookingStatus, DateTile, money, sessionWhen } from "@/components/booking-ui";
import { RequestStatus } from "@/components/request-status";
import { heroBtn, heroBtnGhost, WORLD_ON_WHITE, WorldHero } from "@/components/marketing";
import { Initials, RatingLine, StatTile, V } from "@/components/tutoring-ui";
import { ago, cn, EmptyState, Notice, panel, panelLink } from "@/components/ui";
import { getTutorMeta, ledger, listBookings } from "@/lib/bookings";
import { listLeads } from "@/lib/leads";
import { getCatalog } from "@/lib/catalog";
import { canUploadVideos } from "@/lib/auth/permissions";
import { getStore } from "@/lib/data/store";
import { rankTutors } from "@/lib/tutoring";
import { requireViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Tutor dashboard" };

function upcomingOf<T extends { status: string; startsAt: string }>(bookings: T[], now = Date.now()) {
  return bookings.filter((b) => (b.status === "requested" || b.status === "confirmed") && new Date(b.startsAt).getTime() > now - 3 * 3600000).reverse();
}

function Section({ title, sub, count, children, i }: { title: string; sub?: string; count?: number; children: ReactNode; i: number }) {
  return (
    <section className="rise" style={{ ["--i" as string]: i }}>
      <div className="mb-4">
        <h2 className="headline flex items-center gap-2 text-[22px] text-ink">
          {title}
          {count ? <span className="tabular inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-[#7c3aed] px-2 font-brand text-[13px] font-black text-white">{count}</span> : null}
        </h2>
        {sub ? <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-muted">{sub}</p> : null}
      </div>
      {children}
    </section>
  );
}

export default async function TutorDashboard() {
  const [viewer, catalog, store] = await Promise.all([requireViewer("/tutor"), getCatalog(), getStore()]);
  const mine = (await store.listTutors()).find((t) => t.userId === viewer.user.id);
  if (!mine) redirect("/tutors/join");
  const [reviews, requests, referrals, bookings, meta, leads] = await Promise.all([
    store.listReviews(mine.id),
    store.listTutoringRequests(mine.id),
    store.referralCounts([mine.id]),
    listBookings({ tutorId: mine.id }),
    getTutorMeta(mine.id),
    listLeads({ tutorId: mine.id }),
  ]);
  const onCall = isOnCall(meta) ? meta.onCall! : null;
  const lastUrl = meta.onCall?.meetUrl ?? bookings.find((b) => b.meetUrl)?.meetUrl ?? "";
  const incoming = onCall ? openRequestsFor(await listOnCallRequests(), mine.courseIds).filter((r) => r.studentId !== viewer.user.id) : [];
  const openLeads = leads.filter((l) => l.status === "open" || l.status === "reported");
  const t = rankTutors([mine], reviews)[0];
  const money$ = ledger(bookings);
  const upcoming = upcomingOf(bookings);
  const past = bookings.filter((b) => !upcoming.includes(b)).slice(0, 12);
  const pendingCount = bookings.filter((b) => b.status === "requested").length;
  const canUpload = canUploadVideos(viewer);

  const stats: { label: string; value: string | number; icon: ReactNode; hot?: boolean }[] = [
    { label: "Waiting for you", value: pendingCount, icon: <Hourglass className="size-[18px]" aria-hidden />, hot: pendingCount > 0 },
    { label: "Sessions completed", value: money$.sessions, icon: <CircleCheckBig className="size-[18px]" aria-hidden /> },
    { label: "Earned (after fees)", value: money(money$.net), icon: <Wallet className="size-[18px]" aria-hidden /> },
    { label: "Students referred", value: referrals[t.id] ?? 0, icon: <UserPlus className="size-[18px]" aria-hidden /> },
  ];

  return (
    <div className="pb-20">
      <WorldHero world="violet" inner="pb-10 pt-8">
        <div className="rise flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex min-w-0 items-center gap-4 sm:gap-5">
            <span className="shrink-0 rounded-full bg-white p-1 shadow-[0_4px_0_0_rgb(0_0_0/0.2)]">
              <Initials name={t.name} size={76} />
            </span>
            <div className="min-w-0">
              <p className="font-brand text-[14px] font-extrabold text-white/80">Tutor dashboard</p>
              <h1 className="display mt-0.5 flex items-center gap-2 text-[32px] sm:text-[44px]">
                <span className="truncate">{t.name}</span>
                {meta.vetted ? <BadgeCheck className="size-7 shrink-0" aria-label="Merit Verified" /> : null}
              </h1>
              <p className="mt-1.5 inline-flex h-8 items-center rounded-full bg-white px-3 text-[13.5px]">
                <RatingLine rating={t.rating} count={t.reviewCount} />
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap">
            <Link href="/tutors/join" className={cn(heroBtn, WORLD_ON_WHITE.violet, "col-span-2 sm:col-span-1")}>
              Edit listing
            </Link>
            <Link href={`/tutors/${t.id}`} className={heroBtnGhost}>
              Public profile
            </Link>
            {canUpload ? (
              <Link href="/studio/upload" className={heroBtnGhost}>
                <Upload className="size-4" aria-hidden /> Upload
              </Link>
            ) : null}
          </div>
        </div>
      </WorldHero>

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-3 pt-6 lg:grid-cols-4">
        {stats.map((s, i) => (
          <div key={s.label} className="rise" style={{ ["--i" as string]: i + 1 }}>
            <StatTile
              label={s.label}
              value={s.value}
              icon={s.icon}
              tone={s.hot ? "violet" : i === 2 ? "soft" : "surface"}
              className="h-full"
            />
          </div>
        ))}
      </div>

      {!meta.availability.length ? (
        <Notice tone="warn" className="mt-5">
          Add your weekly hours below so students can book you directly.
        </Notice>
      ) : null}

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8 grid-cols-[minmax(0,1fr)]">
        <div className="min-w-0 space-y-10">
          {onCall ? (
            <Section title="Students who need help now" count={incoming.length} sub="Requests for your classes from students on a deadline. The first tutor to accept gets the session, and it starts right away at your video link." i={1}>
              <AutoRefresh seconds={8} />
              {incoming.length ? (
                <ul className="space-y-3">
                  {incoming.map((r) => (
                    <li key={r.id} className={cn(panel, "p-4 sm:p-5")}>
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="font-brand text-[16px] font-extrabold text-ink">
                          {r.studentName} · {catalog.course(r.courseId)?.shortTitle}
                          {r.topicId ? ` · ${catalog.topic(r.topicId)?.title ?? ""}` : ""}
                        </p>
                        <span className="text-[12.5px] font-bold text-muted">
                          {URGENCY[r.urgency]} · {r.minutes} min · waiting <Elapsed since={r.createdAt} />
                        </span>
                      </div>
                      <p className={cn("mt-3 whitespace-pre-line rounded-2xl p-4 text-[15px] leading-relaxed text-ink", V.soft)}>{r.message}</p>
                      <div className="mt-3">
                        <AcceptButton id={r.id} />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState icon={<Radio className="size-5" />} title="You’re on call. No requests yet." body="Keep this page open. New requests for your classes appear here on their own." />
              )}
            </Section>
          ) : null}
          <Section title="Upcoming sessions" count={upcoming.length} i={2}>
            {upcoming.length ? (
              <ul className="space-y-3">
                {upcoming.map((b) => {
                  const w = sessionWhen(b.startsAt);
                  return (
                    <li key={b.id}>
                      <Link href={`/bookings/${b.id}`} className={cn(panelLink, "group flex items-center gap-4 p-4 sm:gap-5")}>
                        <DateTile iso={b.startsAt} size="lg" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-brand text-[18px] font-extrabold text-ink">{b.studentName}</p>
                          <BookingStatus b={b} className="mt-1.5" />
                          <p className="tabular mt-2 truncate text-[13.5px] font-semibold text-muted">
                            {w.day} · {w.time} · {b.minutes} min
                            {b.courseId ? ` · ${catalog.course(b.courseId)?.shortTitle}` : ""}
                          </p>
                        </div>
                        <ChevronRight className="hidden size-4 shrink-0 text-faint transition-transform duration-200 ease-out group-hover:translate-x-0.5 sm:block" aria-hidden />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState icon={<CalendarDays className="size-5" />} title="No upcoming sessions yet." body="When a student books one of your open hours, it shows up here for you to confirm." />
            )}
          </Section>

          <Section title="Messages" count={requests.length} i={3}>
            {requests.length ? (
              <ul className="space-y-3">
                {requests.map((r) => (
                  <li key={r.id} className={cn(panel, "p-4 sm:p-5")}>
                    <div className="flex items-start gap-3">
                      <Initials name={r.name} size={40} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="truncate font-brand text-[16px] font-extrabold text-ink">{r.name}</p>
                          <span className="shrink-0 text-xs text-muted">{ago(r.createdAt)}</span>
                        </div>
                        <a href={`mailto:${r.email}`} className={cn("break-all text-sm font-bold hover:underline", V.ink)}>
                          {r.email}
                        </a>
                      </div>
                    </div>
                    <p className={cn("mt-3 whitespace-pre-line rounded-2xl p-4 text-[15px] leading-relaxed text-ink", V.soft)}>{r.message}</p>
                    {r.courseId || r.availability ? (
                      <p className="mt-2 text-[12.5px] text-muted">{[r.courseId ? catalog.course(r.courseId)?.title : null, r.availability].filter(Boolean).join(" · ")}</p>
                    ) : null}
                    <RequestStatus id={r.id} status={r.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState icon={<Inbox className="size-5" />} title="No messages yet." body="Students who message you from your profile show up here." />
            )}
          </Section>

          {past.length ? (
            <Section title="Past sessions" i={5}>
              <ul className={cn(panel, "divide-y divide-line overflow-hidden")}>
                {past.map((b) => (
                  <li key={b.id}>
                    <Link href={`/bookings/${b.id}`} className="flex min-h-16 items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-bg-subtle sm:px-5">
                      <DateTile iso={b.startsAt} muted />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-brand font-extrabold text-ink">{b.studentName}</span>
                        <span className="tabular block text-[12.5px] text-muted">{new Date(b.startsAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      </span>
                      <span className="flex shrink-0 items-center gap-3">
                        <span className="tabular font-brand font-extrabold text-ink-2">{b.amount ? money(b.amount) : "Free"}</span>
                        <BookingStatus b={b} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}
        </div>

        <aside className={cn("min-w-0", !meta.availability.length && "order-first lg:order-none")}>
          <div className="space-y-4">
            <section className={cn(panel, "rise p-5", onCall && "ring-positive")} style={{ ["--i" as string]: 2 }}>
              <div className="flex items-start gap-3">
                <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-2xl", onCall ? "bg-positive text-white" : V.solid)}>
                  <Radio className="size-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <h2 className="font-brand text-[18px] font-extrabold text-ink">On call</h2>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-muted">Take last-minute sessions from students on a deadline, at your own on-call rate. You get every request for your classes and accept the ones you want.</p>
                </div>
              </div>
              <div className="mt-4">
                <OnCallToggle onCall={onCall} defaultUrl={lastUrl} defaultRate={meta.onCall?.rate ?? mine.hourlyRate} hours={ON_CALL_HOURS} minRate={MIN_ON_CALL_RATE} maxRate={MAX_ON_CALL_RATE} />
              </div>
            </section>
            <section className={cn(panel, "rise p-5")} style={{ ["--i" as string]: 3 }}>
              <div className="flex items-start gap-3">
                <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-2xl", V.solid)}>
                  <CalendarClock className="size-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <h2 className="font-brand text-[18px] font-extrabold text-ink">Weekly hours</h2>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-muted">Students can book any open 30-minute start time in these windows, with at least 12 hours&apos; notice.</p>
                </div>
              </div>
              <div className="mt-4">
                <AvailabilityEditor initial={meta.availability} timezone={meta.timezone} />
              </div>
            </section>
            <Link href="/tutor/payouts" className={cn(panelLink, "group flex items-center gap-3.5 p-5")}>
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-positive text-white">
                <Wallet className="size-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-brand text-[16px] font-extrabold text-ink">Payouts and fees</span>
                <span className="block text-[13px] leading-snug text-muted">
                  {meta.payoutsEnabled ? "Students can pay you through Merit" : "Set up payouts to get paid through Merit"}
                  {money$.owedTotal ? ` · ${money(money$.owedTotal)} in fees due` : ""}
                </span>
              </span>
              <ChevronRight className="size-4 shrink-0 text-faint transition-transform duration-200 ease-out group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </div>
        </aside>
      </div>
      </div>
    </div>
  );
}
