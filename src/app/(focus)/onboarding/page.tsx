import type { Metadata } from "next";
import { getCatalog } from "@/lib/catalog";
import { focusCourses } from "@/lib/focus";
import { requireViewer } from "@/lib/viewer";
import { OnboardingFlow } from "./flow";

export const metadata: Metadata = { title: "Welcome" };

export default async function OnboardingPage() {
  const [viewer, catalog] = await Promise.all([requireViewer("/onboarding"), getCatalog()]);
  const p = viewer.state.profile;
  return (
    <OnboardingFlow
      firstName={p.name.split(" ")[0]}
      initial={{ courseIds: p.courseIds, examDate: p.examDate, focusTopicIds: p.focusTopicIds }}
      courses={catalog.courses.map((c) => ({
        id: c.id,
        title: c.title,
        exam: c.exam,
        category: c.category,
        hue: c.hue,
        topics: catalog.topicsForCourse(c.id).length,
        videos: catalog.videosForCourse(c.id).length,
      }))}
      focus={focusCourses(catalog, catalog.courses.map((c) => c.id))}
    />
  );
}
