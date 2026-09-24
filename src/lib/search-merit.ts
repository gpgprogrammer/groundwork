import "server-only";
import { getStore } from "@/lib/data/store";
import { guidesForCourse } from "@/lib/educators";
import { rankTutors } from "@/lib/tutoring";
import { matchScore } from "@/lib/search";
import { listUploads, toUploadCards } from "@/lib/uploads";

/** Search over Merit's own content: tutors, tutor/teacher uploads, and study guides. */
export async function searchMerit(q: string, courseId?: string) {
  const store = await getStore();
  const [tutors, reviews, uploads, guides] = await Promise.all([store.listTutors(), store.listReviews(), listUploads({ courseId }), guidesForCourse(courseId)]);
  const tutorHits = rankTutors(tutors.filter((t) => !courseId || t.courseIds.includes(courseId)), reviews)
    .map((t) => ({ t, s: matchScore(q, [[t.name, 8], [t.headline, 6], [t.bio, 2], [t.credentials ?? "", 2]]) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 12)
    .map((x) => x.t);
  const uploadHits = uploads
    .map((u) => ({ u, s: matchScore(q, [[u.title ?? "", 10], [u.body ?? "", 3]]) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 12)
    .map((x) => x.u);
  const guideHits = guides
    .map((g) => ({ g, s: matchScore(q, [[g.title ?? "", 10], [g.body ?? "", 2]]) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 8)
    .map((x) => x.g);
  return { tutors: tutorHits, uploads: await toUploadCards(uploadHits), guides: guideHits };
}
