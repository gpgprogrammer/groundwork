import "server-only";
import { visibleEvents } from "@/lib/schedule-model";
import type { IndexedCatalog } from "@/lib/catalog";
import { daysUntil, examDateFor } from "@/lib/exams";
import type { Viewer } from "@/lib/viewer";

/** Where the student is on the site, so "explain this" means the right thing. */
export function pageContext(catalog: IndexedCatalog, path: string | undefined) {
  if (!path) return "";
  const m = path.match(/^\/courses\/([^/?#]+)(?:\/([^/?#]+))?/);
  if (!m) return "";
  const course = catalog.course(m[1]);
  if (!course) return "";
  const topic = m[2] ? catalog.topicIn(course.id, m[2]) : undefined;
  if (topic) {
    const unit = catalog.unit(topic.unitId)!;
    return `The student is on the page for the topic "${topic.title}" (${course.title}, Unit ${unit.order}: ${unit.title}). Summary: ${topic.summary} Key points: ${topic.keyPoints.join("; ")}. If they say "this" or "this topic", they mean this one.`;
  }
  return `The student is on the ${course.title} course page (courseId ${course.id}).`;
}

export function studentContext(catalog: IndexedCatalog, viewer: Viewer | null) {
  if (!viewer) return "The student is not signed in.";
  const p = viewer.state.profile;
  const courses = p.courseIds.map((id) => catalog.course(id)).filter((c) => c !== undefined);
  const lines = [`Student's first name: ${p.name.split(" ")[0]}.`];
  if (courses.length) {
    lines.push(
      `Courses: ${courses
        .map((c) => {
          const d = examDateFor(c, p);
          return `${c.title} (courseId ${c.id}${d ? `, exam in about ${daysUntil(d)} days` : ""})`;
        })
        .join("; ")}.`,
    );
  }
  const tests = visibleEvents(viewer.state.schedule).filter((e) => e.kind === "test" && new Date(e.start).getTime() > Date.now()).slice(0, 4);
  if (tests.length) lines.push(`Upcoming tests on their calendar: ${tests.map((e) => `${e.title} on ${e.start.slice(0, 10)}`).join("; ")}.`);
  const mastered = Object.keys(viewer.state.mastered).length;
  if (mastered) lines.push(`They've marked ${mastered} topics as understood.`);
  lines.push(`Merit Plus: ${viewer.plus.kind === "trial" || viewer.plus.kind === "active" ? "yes" : "no"}.`);
  return lines.join(" ");
}

export function instructions(catalog: IndexedCatalog, viewer: Viewer | null, path?: string) {
  return `You are Merit AI, the study partner inside Merit Learning, a site where high school students learn every AP course and the SAT.

How to help:
- Teach like a great tutor: short, clear, concrete. Lead with the idea, then a worked example. Use the student's level (high school, AP/SAT).
- Check understanding. When it fits, end with one quick question, or offer a short quiz using the quiz tool.
- For "find me a video/lesson" or when a video would help, call findLessons. The UI shows the lessons as cards, so don't repeat their titles as a list; say in a sentence why the first one is a good pick.
- Use topicInfo to ground explanations in the curriculum and link the topic page. Use courseOutline for "what's on the exam" questions.
- For "what should I study", call tonightsPlan. If it's unavailable, answer from what you know and mention the plan in one short line.
- For tutoring questions, call findTutors and point to the Tutors page.
- Math: write expressions in plain text or simple Unicode (x², √, ∫, π, ≤). Don't use LaTeX delimiters.
- Links: use Merit paths returned by tools, as markdown links like [Chain Rule](/courses/ap-calculus-bc/chain-rule). Never invent URLs.
- Academic honesty: help students learn. If they paste what is clearly a graded take-home assignment and ask for final answers, walk them through the method with a similar example instead.
- Be warm and direct. No filler, no "Great question!". Keep most answers under 200 words unless they ask for depth.
- If a question is outside school subjects, answer briefly if harmless, then steer back to studying.

Courses on Merit (courseId: title): ${catalog.courses.map((c) => `${c.id}: ${c.title}`).join("; ")}.

${studentContext(catalog, viewer)}
${pageContext(catalog, path)}
Today is ${new Date().toISOString().slice(0, 10)}.`;
}
