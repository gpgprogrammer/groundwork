import type { Metadata } from "next";
import { getCatalog } from "@/lib/catalog";
import { getStore } from "@/lib/data/store";
import { requireViewer } from "@/lib/viewer";
import { getTutorMeta } from "@/lib/bookings";
import { TutorForm } from "./tutor-form";

export const metadata: Metadata = { title: "Become a tutor" };

export default async function JoinPage() {
  const [viewer, catalog, store] = await Promise.all([requireViewer("/tutors/join"), getCatalog(), getStore()]);
  const existing = (await store.listTutors()).find((t) => t.userId === viewer.user.id) ?? null;
  const agreed = existing ? Boolean((await getTutorMeta(existing.id)).agreedAt) : false;
  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-8 sm:px-6">
      <h1 className="text-[32px] font-bold tracking-tight text-ink">{existing ? "Edit your tutor listing" : "Become a tutor on Merit"}</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">
        Listing is free. Students studying your subjects find you on the Tutors page and book sessions right on Merit. You set your rate and
        hours; Merit keeps 10% of sessions booked here, and nothing else.
      </p>
      <TutorForm
        existing={existing}
        defaultName={viewer.user.name}
        courses={catalog.courses.map((c) => ({ id: c.id, title: c.title, category: c.category }))}
        agreed={agreed}
      />
    </div>
  );
}
