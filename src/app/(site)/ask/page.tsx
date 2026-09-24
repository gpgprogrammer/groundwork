import type { Metadata } from "next";
import { Chat } from "@/components/ask/chat";
import { getCatalog } from "@/lib/catalog";
import { nextTopicInCourse } from "@/lib/recommend";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = {
  title: "Merit AI",
  description: "Your AP and SAT study partner: clear explanations, practice questions, and the best lesson for any topic.",
};

export default async function AskPage() {
  const [viewer, catalog] = await Promise.all([getViewer(), getCatalog()]);
  const suggestions: string[] = [];
  for (const id of viewer?.state.profile.courseIds.slice(0, 2) ?? []) {
    const next = viewer && nextTopicInCourse(catalog, viewer.state, id);
    if (next) suggestions.push(`Teach me ${next.title} (${catalog.course(id)!.shortTitle})`);
  }
  if (viewer) suggestions.push("What should I study tonight?");
  suggestions.push("Quiz me on the causes of World War I", "Explain limits and continuity with an example", "What's on the AP Biology exam?", "Find a short video on supply and demand");

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col px-4 sm:px-6">
      <Chat suggestions={suggestions.slice(0, 6)} autoFocus />
    </div>
  );
}
