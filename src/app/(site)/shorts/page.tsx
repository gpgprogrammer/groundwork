import type { Metadata } from "next";
import { Chips, FeedGrid } from "@/components/feed";
import { EmptyState } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";
import { pageOf, queryFeed } from "@/lib/feed";

export const metadata: Metadata = { title: "Shorts" };

export default async function ShortsPage({ searchParams }: PageProps<"/shorts">) {
  const [catalog, sp] = await Promise.all([getCatalog(), searchParams]);
  const course = typeof sp.course === "string" && catalog.course(sp.course) ? sp.course : undefined;
  const result = queryFeed(catalog, null, { chip: "shorts", courseId: course, sort: "views" });
  const page = pageOf(catalog, result, 0, 36);
  const query = new URLSearchParams({ chip: "shorts", sort: "views", ...(course ? { course } : {}) }).toString();
  return (
    <div className="px-4 pb-10 sm:px-6">
      <div className="sticky top-14 z-20 -mx-4 bg-bg/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <Chips chips={[{ key: "all", label: "All" }, ...catalog.courses.map((c) => ({ key: c.id, label: c.title }))]} active={course ?? "all"} param="course" />
      </div>
      <h1 className="sr-only">Shorts</h1>
      <div className="pt-4">
        <FeedGrid
          key={query}
          layout="shorts"
          initial={page.items}
          nextOffset={page.nextOffset}
          query={query}
          empty={<EmptyState title="No Shorts here yet" body="Quick explainers under a minute show up here as they're added." />}
        />
      </div>
    </div>
  );
}
