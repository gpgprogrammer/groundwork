import { CalendarCheck, Clock, CreditCard, Mail, MessageSquare } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { updateBooking } from "@/app/actions/bookings";
import { BookingStatus, money, sessionWhen } from "@/components/booking-ui";
import { CheckoutNotice } from "@/components/checkout-notice";
import { WorldHero } from "@/components/marketing";
import { Initials, V, violetButton } from "@/components/tutoring-ui";
import { buttonClass, cn, Notice, panel } from "@/components/ui";
import { formatInZone, getBooking, getTutorMeta } from "@/lib/bookings";
import { getCatalog } from "@/lib/catalog";
import { getStore } from "@/lib/data/store";
import { requireViewer } from "@/lib/viewer";
import { greetingName } from "@/lib/names";

export const metadata: Metadata = { title: "Session" };

function Detail({ icon, label, children, className }: { icon: ReactNode; label: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn(panel, "flex items-start gap-3.5 p-4 sm:p-5", className)}>
      <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", V.soft, V.ink)}>{icon}</span>
      <div className="min-w-0 flex-1">
        <dt className="font-brand text-[13px] font-extrabold text-muted">{label}</dt>
        <dd className="mt-0.5 text-[15px] leading-snug text-ink">{children}</dd>
      </div>
    </div>
  );
}

export default async function BookingPage({ params, searchParams }: PageProps<"/bookings/[id]">) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const viewer = await requireViewer(`/bookings/${id}`);
  const b = await getBooking(id);
  if (!b) notFound();
  const isTutor = b.tutorUserId === viewer.user.id;
  const isStudent = b.studentId === viewer.user.id;
  if (!isTutor && !isStudent && !viewer.isAdmin) notFound();
  const [tutor, meta, catalog] = await Promise.all([(await getStore()).listTutors().then((ts) => ts.find((t) => t.id === b.tutorId)), getTutorMeta(b.tutorId), getCatalog()]);
  const course = b.courseId ? catalog.course(b.courseId) : null;
  const when = new Date(b.startsAt).toLocaleString("en-US", { weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" });
  const other = isTutor ? b.studentName : (tutor?.name ?? "Tutor");
  const tutorFirst = greetingName(tutor?.name ?? "");

  const actions = [
    isTutor && b.status === "requested" ? (
      <form key="confirm" action={updateBooking.bind(null, b.id, "confirm")}>
        <button className={violetButton("lg", "w-full")}>Confirm</button>
      </form>
    ) : null,
    isTutor && b.status === "requested" ? (
      <form key="decline" action={updateBooking.bind(null, b.id, "decline")}>
        <button className={buttonClass("outline", "lg", "w-full")}>Decline</button>
      </form>
    ) : null,
    isTutor && b.status === "confirmed" ? (
      <form key="complete" action={updateBooking.bind(null, b.id, "complete")}>
        <button className={violetButton("lg", "w-full")}>Mark completed</button>
      </form>
    ) : null,
    isStudent && b.status === "confirmed" && b.payment === "merit" && !b.paid ? (
      <form key="pay" action={`/api/bookings/${b.id}/pay`} method="post">
        <button className={violetButton("lg", "w-full")}>Pay {money(b.amount)}</button>
      </form>
    ) : null,
    (b.status === "requested" || b.status === "confirmed") && !(b.payment === "merit" && b.paid && b.amount > 0) ? (
      <form key="cancel" action={updateBooking.bind(null, b.id, "cancel")} className="sm:ml-auto">
        <button className="h-12 w-full rounded-2xl px-5 font-brand text-sm font-extrabold text-muted transition-[background-color,color,transform] duration-150 ease-out hover:bg-danger-soft hover:text-danger active:scale-[0.97]">
          Cancel session
        </button>
      </form>
    ) : null,
  ].filter(Boolean);

  const w = sessionWhen(b.startsAt);

  return (
    <div className="pb-20">
      <WorldHero world="violet" narrow inner="pb-10 pt-6">
        <Link
          href={isTutor ? "/tutor" : "/bookings"}
          className="-ml-1 inline-flex min-h-9 items-center gap-1 rounded-full px-1 font-brand text-[13.5px] font-extrabold text-white/80 transition-colors hover:text-white"
        >
          <span aria-hidden>←</span> {isTutor ? "Tutor dashboard" : "My sessions"}
        </Link>
        <div className="rise mt-5 flex items-center gap-4 sm:gap-6">
          <span aria-hidden className="flex w-[84px] shrink-0 flex-col overflow-hidden rounded-3xl bg-white text-center shadow-[0_5px_0_0_rgb(0_0_0/0.2)] sm:w-24">
            <span className="bg-[#1e1b2e] py-1 font-brand text-[12px] font-black uppercase tracking-wide text-white">{w.month}</span>
            <span className="tabular py-2.5 font-brand text-[38px] font-black leading-none text-[#6d28d9] sm:text-[44px]">{w.date}</span>
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-brand text-[14px] font-extrabold text-white/80">
              {isTutor ? "Session with your student" : "Session with your tutor"} · <span className="tabular">{w.time}</span>
            </p>
            <h1 className="display mt-1 truncate text-[32px] sm:text-[44px]">{isTutor ? b.studentName : tutor?.name}</h1>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <BookingStatus b={b} />
              <span className="tabular inline-flex h-7 items-center rounded-full bg-white/15 px-3 font-brand text-[12.5px] font-extrabold ring-1 ring-inset ring-white/25">
                {b.minutes} min
              </span>
            </div>
          </div>
          <span className="hidden shrink-0 rounded-full bg-white p-1 sm:block">
            <Initials name={other} size={64} />
          </span>
        </div>
      </WorldHero>

      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mt-6 space-y-3 empty:hidden">
          <CheckoutNotice sp={{ ...sp, product: undefined }} />
          {sp.new ? (
            <Notice tone="success">
              <span className="font-semibold">Request sent.</span> {tutorFirst ?? "Your tutor"} will confirm the time. Check back here; once it&apos;s confirmed you can pay and get the details.
            </Notice>
          ) : null}
        </div>

        <dl className="rise mt-6 grid gap-3 sm:grid-cols-2" style={{ ["--i" as string]: 1 }}>
          <Detail icon={<CalendarCheck className="size-5" aria-hidden />} label="When" className="sm:col-span-2">
            {when} <span className="text-muted">(your time)</span>
            {isStudent ? (
              <span className="mt-1 block text-[13px] text-muted">
                For {tutorFirst}: {formatInZone(b.startsAt, meta.timezone)}
              </span>
            ) : null}
          </Detail>
          <Detail icon={<Clock className="size-5" aria-hidden />} label="Session">
            <span className="tabular font-semibold">{b.minutes} minutes</span>
            {course ? ` · ${course.title}` : ""}
          </Detail>
          <Detail icon={<CreditCard className="size-5" aria-hidden />} label="Price">
            <span className="tabular font-brand text-[18px] font-black">{b.amount ? money(b.amount) : "Free"}</span>
            {b.amount ? (
              <span className="text-muted">
                {" "}
                · {b.paid ? "Paid" : b.payment === "merit" ? "Pay through Merit after it's confirmed" : `Pay ${tutorFirst ?? "your tutor"} directly`}
              </span>
            ) : null}
            {isTutor && b.amount ? (
              <span className="tabular mt-1 block text-[13px] text-muted">
                Merit referral fee (10%): {money(b.fee)}
                {b.payment === "merit" ? " · deducted automatically" : b.feeSettled ? " · paid" : " · billed after the session"}
              </span>
            ) : null}
          </Detail>
          {b.status === "confirmed" || isTutor ? (
            <Detail icon={<Mail className="size-5" aria-hidden />} label="Contact" className="sm:col-span-2">
              {isTutor ? (
                <a href={`mailto:${b.studentEmail}`} className={cn("break-all font-bold hover:underline", V.ink)}>
                  {b.studentEmail}
                </a>
              ) : (
                "Your tutor will email you the meeting link or address."
              )}
            </Detail>
          ) : null}
        </dl>

        <figure className={cn("rise relative mt-3 rounded-3xl p-5 sm:p-6", V.soft)} style={{ ["--i" as string]: 2 }}>
          <figcaption className={cn("flex items-center gap-2 font-brand text-[13px] font-extrabold", V.ink)}>
            <MessageSquare className="size-4" aria-hidden /> {isStudent ? "Your note" : "Their note"}
          </figcaption>
          <blockquote className="mt-2 whitespace-pre-line text-[15.5px] leading-relaxed text-ink">{b.message}</blockquote>
        </figure>

        {actions.length ? (
          <div className={cn(panel, "rise mt-3 grid gap-2.5 p-4 sm:flex sm:flex-wrap sm:items-center sm:p-5")} style={{ ["--i" as string]: 3 }}>
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  );
}
