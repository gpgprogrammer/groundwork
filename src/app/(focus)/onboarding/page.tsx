import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCatalog } from "@/lib/catalog";
import { requireViewer } from "@/lib/viewer";
import { OnboardingFlow } from "./flow";
import { greetingName } from "@/lib/names";
import { birthFromCookie, getBirth, oldEnough, saveBirth } from "@/lib/age";
import { AgeCheck } from "./age-check";

export const metadata: Metadata = { title: "Welcome" };

export default async function OnboardingPage({ searchParams }: PageProps<"/onboarding">) {
  const [viewer, catalog, sp] = await Promise.all([requireViewer("/onboarding"), getCatalog(), searchParams]);
  const next = typeof sp.next === "string" && sp.next.startsWith("/") && !sp.next.startsWith("//") ? sp.next : "/";
  // Choosing courses and an exam date is for students; teachers set up their studio instead.
  if (viewer.user.accountType === "teacher") redirect("/studio");
  const p = viewer.state.profile;
  // Every student account has a birth month and year (COPPA). Email signup asks first; Google and Apple
  // signups bring it from the signup page in a cookie, or answer here before anything else.
  if (!(await getBirth(viewer.user.id))) {
    const fromSignup = await birthFromCookie();
    if (fromSignup && oldEnough(fromSignup)) await saveBirth(viewer.user.id, fromSignup);
    else return <AgeCheck firstName={greetingName(p.name)} next={next} />;
  }
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
