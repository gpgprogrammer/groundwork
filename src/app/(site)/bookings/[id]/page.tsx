import { CalendarCheck, CircleCheck, Clock, CreditCard, Mail } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updateBooking } from "@/app/actions/bookings";
import { BookingStatus, money } from "@/components/booking-ui";
import { CheckoutNotice } from "@/components/checkout-notice";
import { Initials } from "@/components/tutoring-ui";
import { formatInZone, getBooking, getTutorMeta } from "@/lib/bookings";
import { getCatalog } from "@/lib/catalog";
import { getStore } from "@/lib/data/store";
import { requireViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Session" };

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

  return (
    <div className="mx-auto max-w-2xl px-4 pb-20 pt-8 sm:px-6">
      <CheckoutNotice sp={{ ...sp, product: undefined }} />
      {sp.new ? (
        <div className="mb-6 flex items-start gap-3 rounded-2xl bg-positive-soft p-4 text-sm text-ink">
          <CircleCheck className="mt-0.5 size-5 shrink-0 text-positive" />
          <p>
            <span className="font-semibold">Request sent.</span> {tutor?.name.split(" ")[0] ?? "Your tutor"} will confirm the time. Check back here; once it&apos;s confirmed you can pay and get the details.
          </p>
        </div>
      ) : null}
      <Link href={isTutor ? "/tutor" : "/bookings"} className="text-sm text-muted hover:text-ink">
        ← {isTutor ? "Tutor dashboard" : "My sessions"}
      </Link>
      <div className="mt-4 rounded-3xl p-6 ring-1 ring-line sm:p-8">
        <div className="flex items-center gap-4">
          <Initials name={isTutor ? b.studentName : (tutor?.name ?? "Tutor")} size={56} />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] text-muted">{isTutor ? "Student" : "Tutor"}</p>
            <p className="text-xl font-bold text-ink">{isTutor ? b.studentName : tutor?.name}</p>
          </div>
          <BookingStatus b={b} />
        </div>
        <dl className="mt-6 space-y-3 text-[15px]">
          <div className="flex items-center gap-3">
            <CalendarCheck className="size-5 text-muted" />
            <dd className="text-ink">{when} <span className="text-muted">(your time)</span></dd>
          </div>
          {isStudent ? (
            <p className="pl-8 text-[13px] text-muted">For {tutor?.name.split(" ")[0]}: {formatInZone(b.startsAt, meta.timezone)}</p>
          ) : null}
          <div className="flex items-center gap-3">
            <Clock className="size-5 text-muted" />
            <dd className="text-ink">
              {b.minutes} minutes{course ? ` · ${course.title}` : ""}
            </dd>
          </div>
          <div className="flex items-center gap-3">
            <CreditCard className="size-5 text-muted" />
            <dd className="text-ink">
              {b.amount ? money(b.amount) : "Free"}
              {b.amount ? <span className="text-muted"> · {b.paid ? "Paid" : b.payment === "merit" ? "Pay through Merit after it's confirmed" : `Pay ${tutor?.name.split(" ")[0] ?? "your tutor"} directly`}</span> : null}
            </dd>
          </div>
          {b.status === "confirmed" || isTutor ? (
            <div className="flex items-center gap-3">
              <Mail className="size-5 text-muted" />
              <dd className="text-ink">{isTutor ? b.studentEmail : "Your tutor will email you the meeting link or address."}</dd>
            </div>
          ) : null}
        </dl>
        <div className="mt-6 rounded-xl bg-bg-subtle p-4 text-[14px] leading-relaxed text-ink-2">{b.message}</div>
        {isTutor && b.amount ? (
          <p className="mt-4 text-[12.5px] text-muted">
            Merit referral fee (10%): {money(b.fee)}
            {b.payment === "merit" ? " · deducted automatically" : b.feeSettled ? " · paid" : " · billed after the session"}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-2">
          {isTutor && b.status === "requested" ? (
            <>
              <form action={updateBooking.bind(null, b.id, "confirm")}>
                <button className="h-11 rounded-full bg-accent px-5 text-sm font-semibold text-white">Confirm</button>
              </form>
              <form action={updateBooking.bind(null, b.id, "decline")}>
                <button className="h-11 rounded-full px-5 text-sm font-semibold text-ink ring-1 ring-line-strong hover:bg-bg-subtle">Decline</button>
              </form>
            </>
          ) : null}
          {isTutor && b.status === "confirmed" ? (
            <form action={updateBooking.bind(null, b.id, "complete")}>
              <button className="h-11 rounded-full bg-ink px-5 text-sm font-semibold text-bg">Mark completed</button>
            </form>
          ) : null}
          {isStudent && b.status === "confirmed" && b.payment === "merit" && !b.paid ? (
            <form action={`/api/bookings/${b.id}/pay`} method="post">
              <button className="h-11 rounded-full bg-accent px-5 text-sm font-semibold text-white">Pay {money(b.amount)}</button>
            </form>
          ) : null}
          {(b.status === "requested" || b.status === "confirmed") && !(b.payment === "merit" && b.paid && b.amount > 0) ? (
            <form action={updateBooking.bind(null, b.id, "cancel")}>
              <button className="h-11 rounded-full px-5 text-sm font-medium text-muted hover:text-ink">Cancel session</button>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  );
}
