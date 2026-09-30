import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Landing } from "@/components/home/landing";
import { SignedInHome } from "@/components/home/signed-in";
import { getCatalog } from "@/lib/catalog";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = {
  title: { absolute: "Merit Learning: understand what you're studying tonight" },
  description: "The best videos and tutors in the world for every AP course and the SAT, in one place, with Merit AI and a plan for every test. Free to start.",
};

/** Home: the front page for visitors, a personal starting point for students. */
export default async function HomePage() {
  const viewer = await getViewer();
  if (viewer && !viewer.state.profile.onboarded && viewer.user.accountType !== "teacher") redirect("/onboarding");
  const catalog = await getCatalog();
  return viewer ? <SignedInHome viewer={viewer} catalog={catalog} /> : <Landing catalog={catalog} />;
}
