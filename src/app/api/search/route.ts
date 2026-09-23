import { NextResponse, type NextRequest } from "next/server";
import { getCatalog } from "@/lib/catalog";
import { search } from "@/lib/search";

export type SearchResult = {
  kind: "topic" | "video" | "educator" | "course";
  href: string;
  title: string;
  subtitle: string;
  glyph?: string;
  hue?: number;
};

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.slice(0, 120) ?? "";
  const limit = Math.min(20, Number(req.nextUrl.searchParams.get("limit")) || 10);
  const catalog = await getCatalog();
  const results: SearchResult[] = search(catalog, q, {}, limit).map((hit) => {
    switch (hit.kind) {
      case "topic":
        return {
          kind: "topic",
          href: `/courses/${hit.course.slug}/${hit.topic.slug}`,
          title: hit.topic.title,
          subtitle: `${hit.course.shortTitle} · ${hit.lessons} lessons`,
          glyph: hit.topic.glyph,
          hue: hit.course.hue,
        };
      case "video":
        return {
          kind: "video",
          href: `/watch/${hit.video.id}`,
          title: hit.video.title,
          subtitle: `${hit.educator.name} · ${Math.round(hit.video.durationSec / 60)} min`,
          glyph: hit.topic.glyph,
          hue: catalog.course(hit.topic.courseId)?.hue,
        };
      case "educator":
        return {
          kind: "educator",
          href: `/educators/${hit.educator.handle}`,
          title: hit.educator.name,
          subtitle: hit.educator.subjects.join(", "),
          hue: hit.educator.hue,
        };
      case "course":
        return {
          kind: "course",
          href: `/courses/${hit.course.slug}`,
          title: hit.course.title,
          subtitle: `${catalog.topicsForCourse(hit.course.id).length} topics`,
          hue: hit.course.hue,
        };
    }
  });
  return NextResponse.json({ results });
}
