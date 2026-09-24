import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AddVideoForm } from "@/components/studio-forms";
import { getCatalog } from "@/lib/catalog";
import { courseTopics, getEducator } from "@/lib/educators";
import { requireViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Add a video" };

export default async function AddVideoPage() {
  const viewer = await requireViewer("/studio/video");
  const educator = await getEducator(viewer.user.id);
  if (!educator) redirect("/studio");
  const catalog = await getCatalog();
  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-8 sm:px-6">
      <Link href="/studio" className="text-sm text-muted hover:text-ink">
        ← Teacher studio
      </Link>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink">Add a video</h1>
      <p className="mt-2 text-[15px] text-muted">Any public YouTube lesson. It appears on the topic page with your name and note.</p>
      <div className="mt-8">
        <AddVideoForm courses={courseTopics(catalog, educator.courseIds)} />
      </div>
    </div>
  );
}
