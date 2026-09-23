import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";
import { requireViewer } from "@/lib/viewer";
import { EducatorProfileForm } from "./profile-form";

export const metadata: Metadata = { title: "Educator profile" };

export default async function CreatorProfilePage() {
  const [viewer, catalog] = await Promise.all([requireViewer("/creator/profile"), getCatalog()]);
  const e = viewer.state.profile.educatorId ? catalog.educator(viewer.state.profile.educatorId) : undefined;
  if (!e) redirect("/creator/join");
  return (
    <Container size="md" className="py-12">
      <Link href="/creator" className="text-[13px] text-muted hover:text-ink">
        ← Studio
      </Link>
      <h1 className="headline mt-4 text-3xl text-ink">Educator profile</h1>
      <p className="mt-2 text-[15px] text-muted">
        This appears under every lesson you publish and on your{" "}
        <Link href={`/educators/${e.handle}`} className="text-ink underline underline-offset-4">
          public page
        </Link>
        .
      </p>
      <EducatorProfileForm
        initial={{
          headline: e.headline,
          bio: e.bio,
          hourlyRate: e.hourlyRate,
          acceptingStudents: e.acceptingStudents,
          bookingUrl: e.bookingUrl ?? "",
          subjects: e.subjects.join(", "),
        }}
      />
    </Container>
  );
}
