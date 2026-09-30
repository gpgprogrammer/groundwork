import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { GuideForm } from "@/components/studio-forms";
import { getCatalog } from "@/lib/catalog";
import { courseTopics, getEducator } from "@/lib/educators";
import { requireViewer } from "@/lib/viewer";
import { FileText } from "lucide-react";
import { PageHero } from "@/components/marketing";
import { cn, panel } from "@/components/ui";

export const metadata: Metadata = { title: "Write a study guide" };

export default async function GuidePage() {
  const viewer = await requireViewer("/studio/guide");
  const educator = await getEducator(viewer.user.id);
  if (!educator) redirect("/studio");
  const catalog = await getCatalog();
  return (
    <div className="pb-20">
      <PageHero world="accent" back={{ href: "/studio", label: "Teacher studio" }} icon={<FileText />} kicker="Teacher studio" title="Write a study guide" lede={"The method you'd write on the board: the idea, a worked example, and the mistakes you see every year."} />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
      <div className={cn(panel, "rise mt-8 p-5 sm:p-7")} style={{ ["--i" as string]: 1 }}>
        <GuideForm courses={courseTopics(catalog, educator.courseIds)} />
      </div>
      </div>
    </div>
  );
}
