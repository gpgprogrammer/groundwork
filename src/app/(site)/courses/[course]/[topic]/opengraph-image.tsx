import { ImageResponse } from "next/og";
import { courseColors } from "@/components/course-icon";
import { getCatalog } from "@/lib/catalog";

export const alt = "A topic on Merit Learning and its ranked lessons";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The share card for a topic page: "Chain Rule · AP Calc BC · 66 ranked lessons", in the course's colors. */
export default async function TopicImage({ params }: { params: Promise<{ course: string; topic: string }> }) {
  const { course: courseSlug, topic: topicSlug } = await params;
  const catalog = await getCatalog();
  const course = catalog.course(courseSlug);
  const topic = course ? catalog.topicIn(course.id, topicSlug) : undefined;
  const count = topic ? catalog.videosForTopic(topic.id).filter((v) => !v.isShort).length : 0;
  const { from, to } = courseColors(course?.id ?? "");
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, color: "white", background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` }}>
        <div style={{ display: "flex", fontSize: 34, fontWeight: 700, opacity: 0.9 }}>{course?.title ?? "Merit Learning"}</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 84, fontWeight: 800, letterSpacing: -3, lineHeight: 1.02 }}>{topic?.title ?? "Lessons, ranked"}</div>
          <div style={{ marginTop: 24, fontSize: 36, opacity: 0.9 }}>
            {count >= 5 ? `${count.toLocaleString("en-US")} lessons ranked by how well they teach` : "Lessons, explained and ranked"}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 30, opacity: 0.85 }}>
          <span style={{ fontWeight: 800 }}>merit</span>
          <span>meritlearning.org</span>
        </div>
      </div>
    ),
    size,
  );
}
