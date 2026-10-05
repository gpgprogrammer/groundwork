import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCatalog } from "@/lib/catalog";
import { requireViewer } from "@/lib/viewer";
import { OnboardingFlow } from "./flow";
import { greetingName } from "@/lib/names";

export const metadata: Metadata = { title: "Welcome" };

export default async function OnboardingPage({ searchParams }: PageProps<"/onboarding">) {
  const [viewer, catalog, sp] = await Promise.all([requireViewer("/onboarding"), getCatalog(), searchParams]);
  const next = typeof sp.next === "string" && sp.next.startsWith("/") && !sp.next.startsWith("//") ? sp.next : "/";
  // Choosing courses and an exam date is for students; teachers set up their studio instead.
  if (viewer.user.accountType === "teacher") redirect("/studio");
  const p = viewer.state.profile;
  return (
    <OnboardingFlow
      firstName={greetingName(p.name)}
      next={next}
      initial={{ courseIds: p.courseIds, examDate: p.examDate }}
      courses={catalog.courses.map((c) => ({
        id: c.id,
        title: c.title,
        exam: c.exam,
        category: c.category,
        hue: c.hue,
        topics: catalog.topicsForCourse(c.id).length,
        videos: catalog.videosForCourse(c.id).length,
      }))}
    />
  );
}
