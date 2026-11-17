import { ArrowRight, CalendarDays, Check, Sparkles, Video, X } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cancelOnCall } from "@/app/actions/on-call";
import { AutoRefresh, Elapsed } from "@/components/on-call-client";
import { V, violetButton } from "@/components/tutoring-ui";
import { buttonClass, cn, panel } from "@/components/ui";
import { allTutorMeta, getBooking } from "@/lib/bookings";
import { getCatalog } from "@/lib/catalog";
import { getStore } from "@/lib/data/store";
import { getOnCallRequest, onCallTutors, stateOf, URGENCY, WAIT_MINUTES } from "@/lib/on-call";
import { rankTutors } from "@/lib/tutoring";
import { requireViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Finding your tutor" };

/** The student's live view of an on-call request: waiting, matched (with the video link), or expired. */
export default async function OnCallRequestPage({ params }: PageProps<"/tutors/on-call/[id]">) {
  const { id } = await params;
  const viewer = await requireViewer(`/tutors/on-call/${id}`);
  const r = await getOnCallRequest(id);
  if (!r || (r.studentId !== viewer.user.id && !viewer.isAdmin)) notFound();
  const catalog = await getCatalog();
  const course = catalog.course(r.courseId);
  const state = stateOf(r);
  const booking = r.bookingId ? await getBooking(r.bookingId) : null;
  let reach = 0;
  if (state === "waiting") {
    const store = await getStore();
    const [tutors, reviews, meta] = await Promise.all([store.listTutors(), store.listReviews(), allTutorMeta()]);
    reach = onCallTutors(rankTutors(tutors, reviews), meta, r.courseId).length;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pb-16 pt-10 sm:px-6">
      {state === "waiting" ? <AutoRefresh seconds={4} /> : null}
      <div className={cn(panel, "rise overflow-hidden")}>
        <div className={cn("px-6 py-8 text-center sm:px-10", state === "claimed" ? "bg-positive-soft" : V.soft)}>
          {state === "waiting" ? (
            <>
              <span className="relative mx-auto flex size-20 items-center justify-center">
                <span className="absolute inset-0 animate-ping rounded-full bg-[#7c3aed]/25 motion-reduce:hidden" />
                <span className={cn("relative flex size-16 items-center justify-center rounded-full", V.solid)}>
                  <Video className="size-8" />
                </span>
              </span>
              <h1 className="headline mt-5 text-[28px] text-ink">Finding your tutor…</h1>
              <p className="mt-2 text-[15px] text-ink-2">
                Sent to {reach} on-call {reach === 1 ? "tutor" : "tutors"} for {course?.shortTitle ?? "your class"}. Waiting <Elapsed since={r.createdAt} />. Keep this page open; it updates on its own.
              </p>
            </>
          ) : state === "claimed" ? (
            <>
              <span className="check-pop mx-auto flex size-16 items-center justify-center rounded-full bg-positive text-white shadow-[0_4px_0_0_var(--positive-press)]">
                <Check className="size-8" strokeWidth={3} />
              </span>
              <h1 className="headline mt-5 text-[28px] text-ink">{r.tutorName ?? "Your tutor"} is ready for you</h1>
              <p className="mt-2 text-[15px] text-ink-2">Join the video session now. Have the problem in front of you.</p>
              {booking?.meetUrl ? (
                <a href={booking.meetUrl} target="_blank" rel="noopener noreferrer" className={buttonClass("positive", "lg", "mt-6 w-full sm:w-auto")}>
                  <Video className="size-5" /> Join the session
                </a>
              ) : null}
            </>
          ) : (
            <>
              <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-bg-subtle text-muted">
                <X className="size-8" />
              </span>
              <h1 className="headline mt-5 text-[26px] text-ink">{state === "canceled" ? "Request canceled" : `No tutor was free within ${WAIT_MINUTES} minutes`}</h1>
              <p className="mt-2 text-[15px] text-ink-2">You weren&apos;t charged anything. Here&apos;s the fastest help from here:</p>
            </>
          )}
        </div>

        <div className="space-y-4 p-6 sm:p-8">
          <dl className="grid gap-3 text-[14px] sm:grid-cols-3">
            <div>
              <dt className="font-brand font-extrabold text-muted">Class</dt>
              <dd className="mt-0.5 font-bold text-ink">{course?.title ?? "—"}</dd>
            </div>
            <div>
              <dt className="font-brand font-extrabold text-muted">Due</dt>
              <dd className="mt-0.5 font-bold text-ink">{URGENCY[r.urgency]}</dd>
            </div>
            <div>
              <dt className="font-brand font-extrabold text-muted">Length</dt>
              <dd className="mt-0.5 font-bold text-ink">{r.minutes} minutes</dd>
            </div>
          </dl>
          <p className="whitespace-pre-line rounded-2xl bg-bg-subtle p-4 text-[14.5px] leading-relaxed text-ink">{r.message}</p>

          {state === "waiting" ? (
            <form action={cancelOnCall.bind(null, r.id)}>
              <button className={buttonClass("outline", "md", "w-full")}>Cancel request</button>
            </form>
          ) : state === "claimed" && booking ? (
            <Link href={`/bookings/${booking.id}`} className={violetButton("md", "w-full")}>
              Session details <ArrowRight className="size-4" />
            </Link>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              <Link href={`/tutors/book?course=${r.courseId}`} className={violetButton("md", "w-full")}>
                <CalendarDays className="size-4" /> Book the next open time
              </Link>
              <Link href="/ask" className={buttonClass("secondary", "md", "w-full")}>
                <Sparkles className="size-4" /> Ask Merit AI
              </Link>
              <Link href={`/tutors/on-call?course=${r.courseId}`} className={buttonClass("outline", "md", "w-full sm:col-span-2")}>
                Try on-call again
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
