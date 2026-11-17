import type { Metadata } from "next";
import { Chat } from "@/components/ask/chat";
import { getCatalog } from "@/lib/catalog";
import { nextTopicInCourse } from "@/lib/recommend";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = {
  title: "Merit AI",
  description: "Your math study partner: step-by-step explanations, practice problems, and the best lesson for any topic, from Algebra 1 to AP Calculus.",
};

export default async function AskPage() {
  const [viewer, catalog] = await Promise.all([getViewer(), getCatalog()]);
  const suggestions: string[] = [];
  for (const id of viewer?.state.profile.courseIds.slice(0, 2) ?? []) {
    const next = viewer && nextTopicInCourse(catalog, viewer.state, id);
    if (next) suggestions.push(`Teach me ${next.title} (${catalog.course(id)!.shortTitle})`);
  }
  if (viewer) suggestions.push("What should I study tonight?");
  suggestions.push("Walk me through factoring x² + 5x + 6", "Explain limits and continuity with an example", "What's on the AP Statistics exam?", "Find a short video on the unit circle");

  return (
    <div className="flex h-[calc(100dvh-4rem-4rem-env(safe-area-inset-bottom))] flex-col px-4 sm:px-6 md:h-[calc(100dvh-4rem)]">
      <Chat suggestions={suggestions.slice(0, 6)} autoFocus />
    </div>
  );
}
