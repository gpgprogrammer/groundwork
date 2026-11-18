import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Landing } from "@/components/home/landing";
import { SignedInHome } from "@/components/home/signed-in";
import { TeacherHome } from "@/components/home/teacher";
import { getCatalog } from "@/lib/catalog";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = {
  title: { absolute: "Merit Learning: your cheat code for math" },
  description: "Ranked lessons for every math topic from Algebra 1 to AP Calculus and SAT Math, adaptive practice, on-call tutors when you're stuck, and a plan for every test.",
};

/** Home: the front page for visitors, a personal starting point for students. */
export default async function HomePage() {
  const viewer = await getViewer();
  if (viewer && !viewer.state.profile.onboarded && viewer.user.accountType !== "teacher") redirect("/onboarding");
  const catalog = await getCatalog();
  if (viewer?.user.accountType === "teacher") return <TeacherHome viewer={viewer} />;
  return viewer ? <SignedInHome viewer={viewer} catalog={catalog} /> : <Landing catalog={catalog} />;
}
