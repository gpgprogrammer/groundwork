import type { MetadataRoute } from "next";
import { getCatalog } from "@/lib/catalog";
import { getStore } from "@/lib/data/store";
import { env } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.appUrl.replace(/\/$/, "");
  const catalog = await getCatalog();
  const now = new Date();
  const page = (path: string, priority: number, changeFrequency: "daily" | "weekly" | "monthly" = "weekly") => ({ url: `${base}${path}`, lastModified: now, changeFrequency, priority });
  return [
    page("", 1, "daily"),
    page("/courses", 0.9),
    page("/shorts", 0.6),
    page("/about", 0.6, "monthly"),
    page("/tutors", 0.9),
    page("/pricing", 0.8),
    page("/pricing/parents", 0.6),
    page("/sprint", 0.9),
    page("/plan", 0.6),
    page("/ask", 0.8),
    page("/studio", 0.6),
    page("/tutors/partners", 0.5, "monthly"),
    page("/how-ranking-works", 0.5, "monthly"),
    page("/privacy", 0.3, "monthly"),
    page("/terms", 0.3, "monthly"),
    ...catalog.courses.flatMap((c) => [page(`/courses/${c.slug}`, 0.8), ...catalog.topicsForCourse(c.id).map((t) => page(`/courses/${c.slug}/${t.slug}`, 0.75))]),
    ...catalog.channels.map((c) => page(`/channel/${c.id}`, 0.5)),
    ...(await (await getStore()).listTutors().catch(() => [])).map((t) => page(`/tutors/${t.id}`, 0.6)),
  ];
}
