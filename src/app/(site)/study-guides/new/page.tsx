import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { GuideForm } from "@/components/market-client";
import { cn, panel } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";
import { MAX_PRICE } from "@/lib/market";
import { requireViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Post a study guide" };

export default async function NewGuidePage({ searchParams }: PageProps<"/study-guides/new">) {
  const [viewer, catalog, sp] = await Promise.all([requireViewer("/study-guides/new"), getCatalog(), searchParams]);
  const mine = viewer.state.profile.courseIds.find((id) => catalog.course(id));
  const defaultCourse = (typeof sp.course === "string" && catalog.course(sp.course)?.id) || mine || catalog.courses[0].id;
  const topics = Object.fromEntries(catalog.courses.map((c) => [c.id, catalog.topicsForCourse(c.id).map((t) => ({ id: t.id, title: t.title }))]));
  return (
    <div className="mx-auto max-w-2xl px-4 pb-20 pt-6 sm:px-6">
      <Link href="/study-guides" className="inline-flex items-center gap-1.5 font-brand text-[14px] font-extrabold text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> Study guides
      </Link>
      <h1 className="display mt-4 text-[34px] text-ink sm:text-[42px]">Post a study guide</h1>
      <p className="mt-2 text-[15.5px] leading-relaxed text-muted">Share the notes that got you through a unit. Give it away to help other students, or set a price and earn from it.</p>
      <div className={cn(panel, "mt-6 p-5 sm:p-7")}>
        <GuideForm courses={catalog.courses.map((c) => ({ id: c.id, title: c.title }))} topics={topics} defaultCourse={defaultCourse} maxPrice={MAX_PRICE} />
      </div>
    </div>
  );
}
