import type { Metadata } from "next";
import Link from "next/link";
import { UploadForm } from "@/components/upload-form";
import { getCatalog } from "@/lib/catalog";
import { courseTopics, getEducator } from "@/lib/educators";
import { getStore } from "@/lib/data/store";
import { MAX_VIDEO_BYTES, uploaderIdentity, uploadsEnabled } from "@/lib/uploads";
import { requireViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Upload a video" };

export default async function UploadPage() {
  const viewer = await requireViewer("/studio/upload");
  const who = await uploaderIdentity(viewer.user.id);
  if (!who) {
    return (
      <div className="mx-auto max-w-2xl px-4 pb-20 pt-10 sm:px-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">Upload a video</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-2">Videos on Merit are published under your name, so set up a profile first. Tutors use their tutor listing; teachers use their teacher profile.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/tutors/join" className="inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-semibold text-white">
            Create a tutor listing
          </Link>
          <Link href="/studio" className="inline-flex h-11 items-center rounded-full px-5 text-sm font-semibold text-ink ring-1 ring-line-strong hover:bg-bg-subtle">
            Set up a teacher profile
          </Link>
        </div>
      </div>
    );
  }
  const [catalog, educator, tutor] = await Promise.all([getCatalog(), getEducator(viewer.user.id), (await getStore()).listTutors().then((ts) => ts.find((t) => t.id === who.tutorId))]);
  const mine = educator?.courseIds ?? tutor?.courseIds ?? viewer.state.profile.courseIds;
  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-8 sm:px-6">
      <Link href={who.tutorId ? "/tutor" : "/studio"} className="text-sm text-muted hover:text-ink">
        ← {who.tutorId ? "Tutor dashboard" : "Teacher studio"}
      </Link>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink">Upload a video</h1>
      <p className="mt-2 text-[15px] text-muted">
        Published on Merit as a Merit exclusive, under <span className="font-medium text-ink">{who.name}</span>. It shows on the topic page, in Merit Tutors&apos; Videos, and on your profile.
      </p>
      <div className="mt-8">
        {uploadsEnabled ? <UploadForm courses={courseTopics(catalog, mine)} maxMb={MAX_VIDEO_BYTES / 1024 / 1024} /> : <p className="rounded-2xl bg-bg-subtle p-5 text-sm text-ink-2">Uploads need the database connected.</p>}
      </div>
      <p className="mt-10 text-[12.5px] leading-relaxed text-muted">
        By uploading you confirm you own the video or have permission to publish it, and you give Merit a license to host and show it to students. Don&apos;t upload other people&apos;s videos, copyrighted TV or textbook material, or anything with students&apos; faces or names without consent. See the{" "}
        <Link href="/terms" className="underline">
          terms
        </Link>
        .
      </p>
    </div>
  );
}
