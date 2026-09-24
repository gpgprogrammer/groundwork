import type { Metadata } from "next";
import Link from "next/link";
import { BookingStatus, money } from "@/components/booking-ui";
import { Initials } from "@/components/tutoring-ui";
import { listBookings } from "@/lib/bookings";
import { getStore } from "@/lib/data/store";
import { requireViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "My sessions" };

export default async function BookingsPage() {
  const viewer = await requireViewer("/bookings");
  const [bookings, tutors] = await Promise.all([listBookings({ studentId: viewer.user.id }), (await getStore()).listTutors()]);
  const name = (id: string) => tutors.find((t) => t.id === id)?.name ?? "Tutor";
  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-8 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-ink">My tutoring sessions</h1>
      {bookings.length ? (
        <ul className="mt-6 space-y-3">
          {bookings.map((b) => (
            <li key={b.id}>
              <Link href={`/bookings/${b.id}`} className="flex items-center gap-4 rounded-2xl p-4 ring-1 ring-line hover:bg-bg-subtle">
                <Initials name={name(b.tutorId)} size={44} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">{name(b.tutorId)}</p>
                  <p className="text-[13px] text-muted">
                    {new Date(b.startsAt).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })} · {b.minutes} min
                    {b.amount ? ` · ${money(b.amount)}` : ""}
                  </p>
                </div>
                <BookingStatus b={b} />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 rounded-2xl bg-bg-subtle p-8 text-center">
          <p className="font-medium text-ink">No sessions yet.</p>
          <Link href="/tutors" className="mt-3 inline-flex h-10 items-center rounded-full bg-ink px-4 text-sm font-semibold text-bg">
            Find a tutor
          </Link>
        </div>
      )}
    </div>
  );
}
