import { NextResponse, type NextRequest } from "next/server";
import { getCatalog } from "@/lib/catalog";
import { search } from "@/lib/search";

export type Suggestion = { kind: "topic" | "video" | "channel" | "course"; href: string; title: string; subtitle: string; image?: string | null };

/** Autocomplete for the top search bar. */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.slice(0, 120) ?? "";
  const catalog = await getCatalog();
  const hits = search(catalog, q, { kinds: ["topic", "course", "channel", "video"] }, 40);
  const pick = (kind: Suggestion["kind"], n: number) => hits.filter((h) => h.kind === kind).slice(0, n);
  const suggestions: Suggestion[] = [...pick("course", 1), ...pick("topic", 4), ...pick("channel", 2), ...pick("video", 3)].map((h) => {
    switch (h.kind) {
      case "topic":
        return { kind: "topic", href: `/courses/${h.course.slug}/${h.topic.slug}`, title: h.topic.title, subtitle: `${h.course.shortTitle} · ${h.lessons} videos` };
      case "course":
        return { kind: "course", href: `/courses/${h.course.slug}`, title: h.course.title, subtitle: "Course" };
      case "channel":
        return { kind: "channel", href: `/channel/${h.channel.id}`, title: h.channel.title, subtitle: `${h.lessons} videos`, image: h.channel.thumbnail };
      case "video":
        return { kind: "video", href: `/go/${h.video.id}`, title: h.video.title, subtitle: h.video.channelTitle, image: h.video.thumbnail };
    }
  });
  return NextResponse.json({ suggestions });
}
