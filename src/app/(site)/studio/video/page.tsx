import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AddVideoForm } from "@/components/studio-forms";
import { getCatalog } from "@/lib/catalog";
import { courseTopics, getEducator } from "@/lib/educators";
import { requireViewer } from "@/lib/viewer";
import { Plus } from "lucide-react";
import { PageHero } from "@/components/marketing";
import { cn, panel } from "@/components/ui";

export const metadata: Metadata = { title: "Add a video" };

export default async function AddVideoPage() {
  const viewer = await requireViewer("/studio/video");
  const educator = await getEducator(viewer.user.id);
  if (!educator) redirect("/studio");
  const catalog = await getCatalog();
  return (
    <div className="pb-20">
      <PageHero world="accent" back={{ href: "/studio", label: "Teacher studio" }} icon={<Plus />} kicker="Teacher studio" title="Add a video" lede="Any public YouTube lesson. It appears on the topic page with your name and note." />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
      <div className={cn(panel, "rise mt-8 p-5 sm:p-7")} style={{ ["--i" as string]: 1 }}>
        <AddVideoForm courses={courseTopics(catalog, educator.courseIds)} />
      </div>
      </div>
    </div>
  );
}
