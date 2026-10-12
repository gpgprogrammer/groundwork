import { Check, GraduationCap } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { getCatalog } from "@/lib/catalog";
import { getStore } from "@/lib/data/store";
import { requireViewer } from "@/lib/viewer";
import { getTutorMeta } from "@/lib/bookings";
import { HeroKicker, WorldHero } from "@/components/marketing";
import { TutorForm } from "./tutor-form";

export const metadata: Metadata = { title: "Become a tutor" };

export default async function JoinPage() {
  const [viewer, catalog, store] = await Promise.all([requireViewer("/tutors/join"), getCatalog(), getStore()]);
  const existing = (await store.listTutors()).find((t) => t.userId === viewer.user.id) ?? null;
  const agreed = existing ? Boolean((await getTutorMeta(existing.id)).agreedAt) : false;
  const back = existing ? { href: `/tutors/${existing.id}`, label: "Your listing" } : { href: "/tutors", label: "Tutors" };
  const perks = ["Free to list", "You set your rate and hours", "Merit keeps 10%, nothing else"];
  return (
    <div className="pb-20">
      <WorldHero world="violet" narrow inner="pb-10 pt-6">
        <Link href={back.href} className="-ml-1 inline-flex min-h-9 items-center gap-1 rounded-full px-1 font-brand text-[13.5px] font-extrabold text-white/80 transition-colors hover:text-white">
          <span aria-hidden>←</span> {back.label}
        </Link>
        <div className="mt-4">
          <HeroKicker>
            <GraduationCap className="size-4" aria-hidden /> For tutors
          </HeroKicker>
        </div>
        <h1 className="display rise mt-4 text-[36px] sm:text-5xl">{existing ? "Edit your tutor listing" : "Become a tutor on Merit"}</h1>
        <p className="rise mt-3 max-w-2xl text-[16px] leading-relaxed text-white/90" style={{ ["--i" as string]: 1 }}>
          Listing is free. Students studying your subjects find you on the Tutors page and book sessions right on Merit. You set your rate and hours. Merit keeps 10% of sessions booked on Merit, and nothing else.
        </p>
        <ul className="rise mt-5 flex flex-wrap gap-2" style={{ ["--i" as string]: 2 }}>
          {perks.map((p) => (
            <li key={p} className="inline-flex h-8 items-center gap-1.5 rounded-full bg-white/15 px-3 font-brand text-[13px] font-extrabold ring-1 ring-inset ring-white/25">
              <Check className="size-3.5" strokeWidth={3} aria-hidden /> {p}
            </li>
          ))}
        </ul>
      </WorldHero>
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
        <TutorForm
          existing={existing}
          defaultName={viewer.user.name}
          courses={catalog.courses.map((c) => ({ id: c.id, title: c.title, category: c.category }))}
          agreed={agreed}
        />
      </div>
    </div>
  );
}
