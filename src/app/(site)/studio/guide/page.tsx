import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { GuideForm } from "@/components/studio-forms";
import { getCatalog } from "@/lib/catalog";
import { courseTopics, getEducator } from "@/lib/educators";
import { requireViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Write a study guide" };

export default async function GuidePage() {
  const viewer = await requireViewer("/studio/guide");
  const educator = await getEducator(viewer.user.id);
  if (!educator) redirect("/studio");
  const catalog = await getCatalog();
  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-8 sm:px-6">
      <Link href="/studio" className="text-sm text-muted hover:text-ink">
        ← Teacher studio
      </Link>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink">Write a study guide</h1>
      <p className="mt-2 text-[15px] text-muted">The method you&apos;d write on the board: the idea, a worked example, and the mistakes you see every year.</p>
      <div className="mt-8">
        <GuideForm courses={courseTopics(catalog, educator.courseIds)} />
      </div>
    </div>
  );
}
