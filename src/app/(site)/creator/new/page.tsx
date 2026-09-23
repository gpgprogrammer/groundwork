import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";
import { requireViewer } from "@/lib/viewer";
import { LessonForm } from "./lesson-form";

export const metadata: Metadata = { title: "New lesson" };

export default async function NewLessonPage() {
  const [viewer, catalog] = await Promise.all([requireViewer("/creator/new"), getCatalog()]);
  const educator = viewer.state.profile.educatorId ? catalog.educator(viewer.state.profile.educatorId) : undefined;
  if (!educator) redirect("/creator/join");

  const groups = educator.courseIds
    .map((id) => catalog.course(id))
    .filter((c) => c !== undefined)
    .map((c) => ({
      course: c.title,
      topics: catalog.topicsForCourse(c.id).map((t) => ({ id: t.id, title: t.title, lessons: catalog.videosForTopic(t.id).length })),
    }));

  return (
    <Container size="md" className="py-12">
      <Link href="/creator" className="text-[13px] text-muted hover:text-ink">
        ← Studio
      </Link>
      <h1 className="headline mt-4 text-3xl text-ink">New lesson</h1>
      <p className="mt-2 text-[15px] text-muted">
        One lesson, one idea. The best lessons on Groundwork are 4 to 12 minutes and get to the point in the first 30 seconds.
      </p>
      <LessonForm groups={groups} />
    </Container>
  );
}
