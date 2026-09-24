import { BadgeCheck, CircleCheck, Handshake, LineChart, Users } from "lucide-react";
import type { Metadata } from "next";
import { PartnerForm } from "./partner-form";

export const metadata: Metadata = { title: "Partner with Merit", description: "Tutoring businesses: reach students studying your subjects. Pay only for the students we send you." };

export default async function PartnersPage({ searchParams }: PageProps<"/tutors/partners">) {
  const sp = await searchParams;
  return (
    <div className="mx-auto max-w-[1100px] px-4 pb-20 pt-10 sm:px-6">
      <div className="grid gap-12 lg:grid-cols-[1fr_440px]">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-accent">
            <Handshake className="size-4" /> For tutoring businesses
          </p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">Meet students at the moment they need help.</h1>
          <p className="mt-4 text-[17px] leading-relaxed text-ink-2">
            Merit students see tutoring options right where they study: on the topic they&apos;re stuck on, in their study plan, and in their Exam Sprint. Partners are listed on the Tutors page for the subjects they cover.
          </p>
          <ul className="mt-8 space-y-4">
            {[
              [Users, "Pay only for results", "No listing fees. Merit earns 10% of the first-term revenue from students we refer, as a revenue share or a flat lead fee we agree on."],
              [LineChart, "Tracked referrals", "Every click from Merit to your site is logged with the subject, so both of us can see exactly what Merit sends you."],
              [BadgeCheck, "Clearly labeled", "Partners carry a Merit Partner label. Rankings of tutors and lessons are never for sale."],
            ].map(([Icon, t, b]) => {
              const I = Icon as typeof Users;
              return (
                <li key={t as string} className="flex gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                    <I className="size-5" />
                  </span>
                  <span>
                    <span className="block font-semibold text-ink">{t as string}</span>
                    <span className="block text-[14px] leading-relaxed text-muted">{b as string}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="rounded-3xl p-6 ring-1 ring-line lg:self-start">
          {sp.sent ? (
            <div className="py-10 text-center">
              <CircleCheck className="mx-auto size-12 text-positive" />
              <p className="mt-4 text-xl font-bold text-ink">Application received.</p>
              <p className="mt-2 text-[15px] text-ink-2">We&apos;ll review it and reach out by email to set up tracking and terms.</p>
            </div>
          ) : (
            <PartnerForm />
          )}
        </div>
      </div>
    </div>
  );
}
