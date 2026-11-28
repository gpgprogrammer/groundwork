import { Clapperboard } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge, PageHeader } from "@/components/ui";
import { getBridge, isOnline, studioToken } from "@/lib/studio-bridge";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Reel Studio", robots: { index: false } };
export const dynamic = "force-dynamic";

const ago = (iso: string) => {
  const m = Math.round((Date.now() - Date.parse(iso)) / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  return h < 48 ? `${h} hr ago` : `${Math.round(h / 24)} days ago`;
};

/** Reel Studio, for admins: tell the producer what to make, approve reels, and schedule them. */
export default async function StudioPage() {
  const viewer = await getViewer();
  if (!viewer?.isAdmin) notFound();
  const bridge = await getBridge();
  const online = Boolean(studioToken()) && isOnline(bridge);

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col px-3 pb-6 pt-6 sm:px-6 sm:pt-8">
      <PageHeader
        back={{ href: "/admin", label: "Admin" }}
        title="Reel Studio"
        actions={
          <Badge tone={online ? "positive" : "warn"}>
            {online ? "Connected to the studio Mac" : bridge ? `Offline · last seen ${ago(bridge.at)}` : "Not set up yet"}
          </Badge>
        }
      />
      {online ? (
        <iframe
          src="/admin/studio/app/"
          title="Reel Studio"
          allow="microphone; autoplay"
          className="mt-4 h-[calc(100dvh-170px)] min-h-[560px] w-full rounded-2xl bg-surface ring-2 ring-line"
        />
      ) : (
        <section className="mt-6 max-w-2xl rounded-2xl bg-surface p-6 ring-2 ring-line">
          <Clapperboard className="size-8 text-accent-ink" />
          <h2 className="headline mt-3 text-[20px] text-ink">The studio Mac isn&apos;t reachable right now</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">
            Reel Studio makes reels on the team Mac, so that Mac has to be awake and running it. It starts by itself when the Mac logs in. If it&apos;s been off, wake the Mac and this page connects within a
            minute.
          </p>
          <p className="mt-3 text-[13px] leading-relaxed text-faint">
            On the Mac: <code className="rounded bg-bg-subtle px-1.5 py-0.5">launchctl kickstart -k gui/$(id -u)/org.meritlearning.reelstudio</code> restarts it. Reels that are already scheduled still post on TikTok and
            Instagram while the Mac is off.
          </p>
        </section>
      )}
    </div>
  );
}
