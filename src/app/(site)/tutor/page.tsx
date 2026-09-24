import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { RequestStatus } from "@/components/request-status";
import { Initials, RatingLine } from "@/components/tutoring-ui";
import { ago } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";
import { getStore } from "@/lib/data/store";
import { rankTutors } from "@/lib/tutoring";
import { requireViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Tutor dashboard" };

export default async function TutorDashboard() {
  const [viewer, catalog, store] = await Promise.all([requireViewer("/tutor"), getCatalog(), getStore()]);
  const mine = (await store.listTutors()).find((t) => t.userId === viewer.user.id);
  if (!mine) redirect("/tutors/join");
  const [reviews, requests, referrals] = await Promise.all([store.listReviews(mine.id), store.listTutoringRequests(mine.id), store.referralCounts([mine.id])]);
  const t = rankTutors([mine], reviews)[0];
  const open = requests.filter((r) => r.status === "new").length;

  return (
    <div className="mx-auto max-w-[1100px] px-4 pb-20 pt-6 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Initials name={t.name} size={64} />
          <div>
            <h1 className="text-[28px] font-bold tracking-tight text-ink">Tutor dashboard</h1>
            <p className="text-sm text-muted">
              <RatingLine rating={t.rating} count={t.reviewCount} />
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/tutors/${t.id}`} className="flex h-9 items-center rounded-full bg-bg-subtle px-4 text-sm font-medium text-ink hover:bg-line">
            View public profile
          </Link>
          <Link href="/tutors/join" className="flex h-9 items-center rounded-full bg-ink px-4 text-sm font-medium text-bg">
            Edit listing
          </Link>
        </div>
      </div>
      <dl className="tabular mt-8 grid grid-cols-3 gap-3">
        {[
          ["Open requests", open],
          ["All requests", requests.length],
          ["Students referred", referrals[t.id] ?? 0],
        ].map(([k, v]) => (
          <div key={k} className="rounded-2xl bg-bg-subtle p-5">
            <dd className="text-2xl font-bold text-ink">{v}</dd>
            <dt className="text-sm text-muted">{k}</dt>
          </div>
        ))}
      </dl>
      <h2 className="mt-10 text-xl font-bold tracking-tight text-ink">Session requests</h2>
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
            <p className="mt-2 text-xs text-muted">
              {[r.courseId ? catalog.course(r.courseId)?.title : null, r.availability].filter(Boolean).join(" · ")}
            </p>
            <RequestStatus id={r.id} status={r.status} />
          </div>
        ))}
        {!requests.length ? <p className="rounded-2xl bg-bg-subtle px-5 py-8 text-center text-sm text-muted">No requests yet. Students will find you on the Tutors page for your subjects.</p> : null}
      </div>
    </div>
  );
}
