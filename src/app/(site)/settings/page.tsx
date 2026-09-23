import type { Metadata } from "next";
import { getCatalog } from "@/lib/catalog";
import { requireViewer } from "@/lib/viewer";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const [viewer, catalog] = await Promise.all([requireViewer("/settings"), getCatalog()]);
  const p = viewer.state.profile;
  return (
    <ProfileForm
      email={p.email}
      initial={{ name: p.name, courseIds: p.courseIds, examDate: p.examDate ?? "", goal: p.goal ?? "" }}
      courses={catalog.courses.map((c) => ({ id: c.id, title: c.title, exam: c.exam }))}
    />
  );
}
