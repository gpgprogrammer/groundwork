import { Clock, ShieldCheck, Upload } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { UploadForm } from "@/components/upload-form";
import { getCatalog } from "@/lib/catalog";
import { courseTopics, getEducator } from "@/lib/educators";
import { getStore } from "@/lib/data/store";
import { listPendingUploads, MAX_VIDEO_BYTES, uploaderIdentity, uploadsEnabled } from "@/lib/uploads";
import { requireViewer } from "@/lib/viewer";
import { PageHero } from "@/components/marketing";
import { cn, Notice, LinkButton, panel } from "@/components/ui";

export const metadata: Metadata = { title: "Upload a video" };

export default async function UploadPage() {
  const viewer = await requireViewer("/studio/upload");
  const who = await uploaderIdentity(viewer.user.id);
  if (!who) {
    return (
      <div className="pb-20">
        <PageHero world="accent" icon={<Upload />} title="Upload a video" />
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className={cn(panel, "rise mt-8 p-6 sm:p-8")} style={{ ["--i" as string]: 1 }}>
          <p className="font-brand text-[18px] font-extrabold text-ink">First, a profile</p>
          <p className="mt-2 text-[15.5px] leading-relaxed text-ink-2">Videos on Merit are published under your name, so set up a profile first. Tutors use their tutor listing; teachers use their teacher profile.</p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <LinkButton href="/tutors/join" size="lg">
              Create a tutor listing
            </LinkButton>
            <LinkButton href="/studio" size="lg" variant="outline">
              Set up a teacher profile
            </LinkButton>
          </div>
        </div>
        </div>
      </div>
    );
  }
  const [catalog, educator, tutor] = await Promise.all([getCatalog(), getEducator(viewer.user.id), (await getStore()).listTutors().then((ts) => ts.find((t) => t.id === who.tutorId))]);
  const mine = educator?.courseIds ?? tutor?.courseIds ?? viewer.state.profile.courseIds;
  const waiting = await listPendingUploads(viewer.user.id);
  return (
    <div className="pb-20">
      <PageHero
        world={who.tutorId ? "violet" : "accent"}
        back={who.tutorId ? { href: "/tutor", label: "Tutor dashboard" } : { href: "/studio", label: "Teacher studio" }}
        icon={<Upload />}
        title="Upload a video"
        lede={
          <>
            Published on Merit as a Merit exclusive, under <span className="font-bold text-white">{who.name}</span>. It shows on the topic page, in Merit Tutors&apos; Videos, and on your profile.
          </>
        }
      />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
      {waiting.length ? (
        <div className={cn(panel, "rise mt-6 p-4 sm:p-5")} style={{ ["--i" as string]: 1 }}>
          <p className="flex items-center gap-2 font-brand text-[15px] font-extrabold text-ink">
            <span className="flex size-8 items-center justify-center rounded-xl bg-warn-soft text-warn">
              <Clock className="size-4" />
            </span>
            Waiting for review <span className="tabular rounded-full bg-warn-soft px-2.5 py-0.5 text-[12.5px] text-warn">{waiting.length}</span>
          </p>
          <ul className="mt-3 space-y-2">
            {waiting.map((w) => (
              <li key={w.id}>
                <Link href={`/videos/${w.id}`} className="flex min-h-11 items-center justify-between gap-3 rounded-2xl bg-bg-subtle px-4 font-brand text-[14.5px] font-bold text-ink-2 transition-colors hover:bg-line/60 hover:text-ink">
                  <span className="truncate">{w.title}</span>
                  <span aria-hidden className="text-faint">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className={cn(panel, "rise mt-6 p-5 sm:p-7")} style={{ ["--i" as string]: 2 }}>
        <p className="mb-6 flex items-center gap-2.5 rounded-2xl bg-positive-soft px-4 py-3 text-[13.5px] font-semibold leading-relaxed text-ink">
          <ShieldCheck className="size-5 shrink-0 text-positive" /> Merit reviews every video before students see it, usually within a day.
        </p>
        {uploadsEnabled ? <UploadForm courses={courseTopics(catalog, mine)} maxMb={MAX_VIDEO_BYTES / 1024 / 1024} /> : <Notice tone="warn">Uploads need the database connected.</Notice>}
      </div>
      <p className="mt-8 max-w-[68ch] text-[12.5px] leading-relaxed text-muted">
        By uploading you confirm you own the video or have permission to publish it, and you give Merit a license to host and show it to students. Don&apos;t upload other people&apos;s videos, copyrighted TV or textbook material, or anything with students&apos; faces or names without consent. See the{" "}
        <Link href="/terms" className="font-medium text-ink-2 underline underline-offset-2 hover:text-ink">
          terms
        </Link>
        .
      </p>
      </div>
    </div>
  );
}
