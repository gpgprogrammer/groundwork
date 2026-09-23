import { CalendarDays, Check, ListTree, Sigma } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Faq } from "@/components/marketing";
import { LinkButton, formatViews } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";

export const metadata: Metadata = { title: "About" };

export default async function AboutPage() {
  const catalog = await getCatalog();
  const views = catalog.videos.reduce((n, v) => n + v.views, 0);
  const covered = catalog.topics.filter((t) => catalog.videosForTopic(t.id).length).length;
  const mosaic = catalog.videos.filter((v) => !v.isShort).slice(0, 12);

  return (
    <div className="pb-20">
      <section className="relative overflow-hidden bg-[#0f0f0f] text-white">
        <div className="absolute inset-0 grid grid-cols-4 gap-1 opacity-25 sm:grid-cols-6">
          {mosaic.map((v) => (
            <img key={v.id} src={v.thumbnail} alt="" referrerPolicy="no-referrer" className="aspect-video w-full object-cover" />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/85 to-[#0f0f0f]/60" />
        <div className="relative mx-auto max-w-4xl px-6 py-24 text-center sm:py-32">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">YouTube has the best teachers. Groundwork makes them a course.</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/70">
            Every AP and SAT topic, the best lessons for it, ranked by how well they teach, and lined up with your class calendar.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <LinkButton href="/signup" size="lg" className="bg-white text-[#0f0f0f] hover:bg-white/90">
              Get started free
            </LinkButton>
            <LinkButton href="/" size="lg" className="bg-white/10 text-white hover:bg-white/20">
              Browse the feed
            </LinkButton>
          </div>
          <dl className="tabular mx-auto mt-14 grid max-w-2xl grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              [catalog.videos.length.toLocaleString(), "lessons"],
              [catalog.channels.length.toLocaleString(), "educators"],
              [`${covered}`, "topics covered"],
              [formatViews(views), "combined views"],
            ].map(([n, l]) => (
              <div key={l}>
                <dd className="text-3xl font-bold">{n}</dd>
                <dt className="mt-1 text-sm text-white/60">{l}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-20 md:grid-cols-3">
        {[
          [ListTree, "Organized like the exam", "Course, unit, concept, topic. Go from “AP Calc” to “Chain Rule” in two clicks, then see every good lesson on it in one place."],
          [Sigma, "Ranked by teaching", "Helpfulness from students, YouTube likes per view, topic fit, and reach, not just view counts. Sort by any of them yourself."],
          [CalendarDays, "Synced to your class", "Connect Google, Canvas, Schoology, Apple, or Outlook. Quiz Friday? Those videos are on your home page Wednesday."],
        ].map(([Icon, t, d]) => {
          const I = Icon as typeof Check;
          return (
            <div key={t as string} className="rounded-2xl bg-bg-subtle p-7">
              <I className="size-6 text-accent" />
              <h2 className="mt-5 text-lg font-bold tracking-tight text-ink">{t as string}</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{d as string}</p>
            </div>
          );
        })}
      </section>

      <section className="mx-auto max-w-3xl px-6">
        <h2 className="text-2xl font-bold tracking-tight text-ink">Questions</h2>
        <div className="mt-4">
          <Faq />
        </div>
        <p className="mt-10 text-sm text-muted">
          Curious how videos are ordered? Read <Link href="/how-ranking-works" className="text-accent hover:underline">how ranking works</Link>.
        </p>
      </section>
    </div>
  );
}
