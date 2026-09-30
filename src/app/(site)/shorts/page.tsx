import type { Metadata } from "next";
import { LearnBand } from "@/components/learn-band";
import { Chips, FeedGrid } from "@/components/feed";
import { EmptyState } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";
import { pageOf, queryFeed } from "@/lib/feed";

export const metadata: Metadata = { title: "Quick lessons" };

export default async function ShortsPage({ searchParams }: PageProps<"/shorts">) {
  const [catalog, sp] = await Promise.all([getCatalog(), searchParams]);
  const course = typeof sp.course === "string" && catalog.course(sp.course) ? sp.course : undefined;
  const result = queryFeed(catalog, null, { chip: "shorts", courseId: course, sort: "views" });
  const page = pageOf(catalog, result, 0, 36);
  const query = new URLSearchParams({ chip: "shorts", sort: "views", ...(course ? { course } : {}) }).toString();
  return (
    <>
    <LearnBand title="Quick lessons" lede="Quick explainers under a minute, one idea at a time." />
    <div className="px-4 pb-10 sm:px-6 lg:px-8">
      <div className="sticky top-[var(--nav-h)] z-20 -mx-4 border-b-2 border-line bg-bg/90 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <Chips chips={[{ key: "all", label: "All" }, ...catalog.courses.map((c) => ({ key: c.id, label: c.title }))]} active={course ?? "all"} param="course" />
      </div>
      <div className="pt-6">
        <FeedGrid
          key={query}
          layout="shorts"
          initial={page.items}
          nextOffset={page.nextOffset}
          query={query}
          empty={<EmptyState title="No quick lessons here yet" body="Quick explainers under a minute show up here as they're added." />}
        />
      </div>
    </div>
    </>
  );
}
