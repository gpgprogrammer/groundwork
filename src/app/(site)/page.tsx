import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Landing } from "@/components/home/landing";
import { SignedInHome } from "@/components/home/signed-in";
import { TeacherHome } from "@/components/home/teacher";
import { getCatalog } from "@/lib/catalog";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = {
  title: { absolute: "Merit Learning: connect your class calendar, prep for every quiz" },
  description: "Connect your Canvas, Schoology, or Blackbaud calendar and Merit lines up lessons for every quiz and test, days ahead. Ranked lessons for high school classes, every AP course, and the SAT. Free for students.",
};

/** Home: the front page for visitors, a personal starting point for students. */
export default async function HomePage() {
  const viewer = await getViewer();
  if (viewer && !viewer.state.profile.onboarded && viewer.user.accountType !== "teacher") redirect("/onboarding");
  const catalog = await getCatalog();
  if (viewer?.user.accountType === "teacher") return <TeacherHome viewer={viewer} />;
  return viewer ? <SignedInHome viewer={viewer} catalog={catalog} /> : <Landing catalog={catalog} />;
}
