import type { IndexedCatalog } from "@/lib/catalog";
import type { Channel, Course, Location, Tutor, TutorReview, TutorWithStats } from "@/lib/types";

// ── Independent tutors ───────────────────────────────────────────────────────

const PRIOR_RATING = 4.2;
const PRIOR_REVIEWS = 3;

/** Bayesian-average rating: a 5.0 from one review doesn't beat a 4.9 from forty. */
export function rankTutors(tutors: Tutor[], reviews: TutorReview[]): TutorWithStats[] {
  const byTutor = new Map<string, TutorReview[]>();
  for (const r of reviews) byTutor.set(r.tutorId, [...(byTutor.get(r.tutorId) ?? []), r]);
  return tutors
    .map((t) => {
      const rs = byTutor.get(t.id) ?? [];
      const sum = rs.reduce((n, r) => n + r.rating, 0);
      const rating = rs.length ? sum / rs.length : null;
      const score = (sum + PRIOR_RATING * PRIOR_REVIEWS) / (rs.length + PRIOR_REVIEWS) + Math.min(0.15, t.yearsExperience * 0.01);
      return { ...t, rating, reviewCount: rs.length, score };
    })
    .sort((a, b) => b.score - a.score);
}

const norm = (s: string) => s.trim().toLowerCase();

/** How close a tutor is to a student: 3 same city, 2 same state/region, 1 same country, 0 otherwise. */
export function proximity(t: Pick<Tutor, "city" | "region" | "country">, loc: Location | null) {
  if (!loc) return 0;
  const sameCountry = !loc.country || !t.country || norm(t.country) === norm(loc.country);
  if (!sameCountry) return 0;
  if (loc.region && norm(t.region) === norm(loc.region)) return loc.city && norm(t.city) === norm(loc.city) ? 3 : 2;
  return 1;
}

export function tutorsNear(tutors: TutorWithStats[], loc: Location | null, courseId?: string) {
  return tutors
    .filter((t) => t.inPerson && (!courseId || t.courseIds.includes(courseId)) && proximity(t, loc) >= 2)
    .sort((a, b) => proximity(b, loc) - proximity(a, loc) || b.score - a.score);
}

export function tutorsOnline(tutors: TutorWithStats[], courseId?: string) {
  return tutors.filter((t) => t.online && (!courseId || t.courseIds.includes(courseId)));
}

export const formatPlace = (t: Pick<Tutor, "city" | "region" | "country">) => [t.city, t.region, t.country !== "United States" ? t.country : ""].filter(Boolean).join(", ");

// ── Top creators (from real video data) ──────────────────────────────────────

export type CreatorStat = { channel: Channel; lessons: number; views: number; score: number; topVideoId: string | null };

/**
 * A channel's standing in a course or topic: the quality of its best lessons,
 * with a small bonus for breadth. One great video doesn't make a top creator.
 */
export function topCreators(catalog: IndexedCatalog, scope: { courseId?: string; topicId?: string }, limit = 12): CreatorStat[] {
  const pool = scope.topicId ? catalog.videosForTopic(scope.topicId) : scope.courseId ? catalog.videosForCourse(scope.courseId) : catalog.videos;
  const byChannel = new Map<string, typeof pool>();
  for (const v of pool) if (!v.isShort) byChannel.set(v.channelId, [...(byChannel.get(v.channelId) ?? []), v]);
  const minLessons = scope.topicId ? 1 : 3;
  const out: CreatorStat[] = [];
  for (const [id, vids] of byChannel) {
    const channel = catalog.channel(id);
    if (!channel || vids.length < minLessons) continue;
    const best = [...vids].sort((a, b) => b.rank.score - a.rank.score).slice(0, 5);
    const quality = best.reduce((n, v) => n + v.rank.score, 0) / best.length;
    const breadth = Math.log10(vids.length + 1) * 6;
    out.push({ channel, lessons: vids.length, views: vids.reduce((n, v) => n + v.views, 0), score: quality + breadth, topVideoId: best[0]?.id ?? null });
  }
  return out.sort((a, b) => b.score - a.score).slice(0, limit);
}

// ── Tutoring services (partners) ─────────────────────────────────────────────

export const SERVICE_KINDS = ["Free", "Online", "Local and online", "Learning center", "Test prep", "Languages"] as const;
export type ServiceKind = (typeof SERVICE_KINDS)[number];

export type Service = {
  id: string;
  name: string;
  kind: ServiceKind;
  blurb: string;
  /** Where to send a student for this course; `zip` is used when the service supports local search. */
  url: (course: Course | null, zip: string | null) => string;
  covers: (course: Course | null) => boolean;
  /** Query parameter appended for referral tracking once a partnership is signed (set via env). */
  refParam?: string;
  /** A tutoring business that signed Merit's partner terms. */
  partner?: boolean;
};

// Course pages Varsity Tutors actually serves (checked 2026-09-23); others go to their AP hub.
const VARSITY_COURSES = new Set([
  "ap-calculus-ab", "ap-calculus-bc", "ap-statistics", "ap-computer-science-a", "ap-computer-science-principles", "ap-biology",
  "ap-chemistry", "ap-environmental-science", "ap-physics-2", "ap-physics-c-mechanics", "ap-physics-c-electricity-and-magnetism",
  "ap-us-history", "ap-world-history", "ap-european-history", "ap-us-government", "ap-human-geography", "ap-macroeconomics",
  "ap-microeconomics", "ap-psychology", "ap-spanish-language", "ap-latin", "ap-art-history", "ap-music-theory", "ap-seminar",
  "ap-research", "sat-math",
]);

/** The language an AP World Language course teaches, for language-tutor sites. */
function languageWord(c: Course | null) {
  if (!c) return null;
  if (c.id === "ap-latin") return "latin";
  const m = c.id.match(/^ap-(spanish|french|german|italian|chinese|japanese)-/);
  return m ? m[1] : null;
}

const STEM = (c: Course | null) => !c || c.exam === "SAT" || c.category === "Math & Computer Science" || c.category === "Sciences";

const subjectWord = (c: Course | null) => (c ? c.title.replace(/:.*$/, "").replace(/ and Composition| Language and Culture/g, "") : "AP");

export const SERVICES: Service[] = [
  {
    id: "wyzant",
    name: "Wyzant",
    kind: "Local and online",
    blurb: "A marketplace of independent tutors. Search by subject and ZIP code, compare rates and reviews, and meet in person or online.",
    url: (c, zip) => `https://www.wyzant.com/match/search?kw=${encodeURIComponent(subjectWord(c))}${zip ? `&z=${encodeURIComponent(zip)}` : ""}`,
    covers: () => true,
  },
  {
    id: "varsity-tutors",
    name: "Varsity Tutors",
    kind: "Online",
    blurb: "Matched one-on-one tutoring online, with course-specific pages for most AP subjects and the SAT.",
    url: (c) =>
      c && VARSITY_COURSES.has(c.slug)
        ? `https://www.varsitytutors.com/${c.slug}-tutoring`
        : c?.exam === "SAT"
          ? "https://www.varsitytutors.com/sat-prep-tutoring"
          : "https://www.varsitytutors.com/ap-tutoring",
    covers: () => true,
  },
  {
    id: "princeton-review",
    name: "The Princeton Review",
    kind: "Test prep",
    blurb: "AP and SAT test prep courses and private tutoring from a long-running test-prep company.",
    url: (c) => (c?.exam === "SAT" ? "https://www.princetonreview.com/college/sat-test-prep" : "https://www.princetonreview.com/college/ap-test-prep"),
    covers: () => true,
  },
  {
    id: "tutor-com",
    name: "Tutor.com",
    kind: "Online",
    blurb: "On-demand online tutoring for homework help in most school subjects. Many libraries and schools offer it free.",
    url: () => "https://www.tutor.com",
    covers: (c) => !c || c.category !== "Arts",
  },
  {
    id: "schoolhouse-world",
    name: "Schoolhouse.world",
    kind: "Free",
    blurb: "Free small-group tutoring by volunteer tutors, founded by Sal Khan. Strong for math and the SAT.",
    url: (c) => (c?.exam === "SAT" ? "https://schoolhouse.world/sat" : "https://schoolhouse.world"),
    covers: (c) => !c || c.exam === "SAT" || c.category === "Math & Computer Science",
  },
  {
    id: "prepscholar",
    name: "PrepScholar",
    kind: "Test prep",
    blurb: "Online SAT prep programs that adapt to your strengths and weaknesses.",
    url: () => "https://www.prepscholar.com/sat/",
    covers: (c) => !c || c.exam === "SAT",
  },
  {
    id: "upchieve",
    name: "UPchieve",
    kind: "Free",
    blurb: "Free, on-demand online tutoring from volunteer coaches for students from low-income families, including AP subjects and SAT prep.",
    url: () => "https://upchieve.org/",
    covers: (c) => !c || (c.category !== "Arts" && c.category !== "World Languages & Cultures"),
  },
  {
    id: "khan-academy-sat",
    name: "Khan Academy Digital SAT",
    kind: "Free",
    blurb: "Free official Digital SAT practice, built with the College Board: full-length tests, skill drills, and personalized practice.",
    url: () => "https://www.khanacademy.org/college-careers-more/digital-sat",
    covers: (c) => !c || c.exam === "SAT",
  },
  {
    id: "kaplan",
    name: "Kaplan",
    kind: "Test prep",
    blurb: "Long-running AP and SAT test prep with live classes, on-demand courses, and private tutoring.",
    url: (c) => (c?.exam === "SAT" ? "https://www.kaptest.com/sat" : "https://www.kaptest.com/ap"),
    covers: () => true,
  },
  {
    id: "magoosh",
    name: "Magoosh",
    kind: "Test prep",
    blurb: "Affordable self-paced SAT prep with video lessons, practice questions, and score predictions.",
    url: () => "https://magoosh.com/sat/",
    covers: (c) => !c || c.exam === "SAT",
  },
  {
    id: "revolution-prep",
    name: "Revolution Prep",
    kind: "Online",
    blurb: "One-on-one online tutoring and test prep for high school math, science, and the SAT.",
    url: () => "https://www.revolutionprep.com/",
    covers: STEM,
  },
  {
    id: "learner",
    name: "Learner",
    kind: "Online",
    blurb: "Online one-on-one tutors for math, English, and test prep, matched to your goals.",
    url: () => "https://www.learner.com/",
    covers: (c) => !c || c.exam === "SAT" || c.category === "Math & Computer Science" || c.category === "English",
  },
  {
    id: "club-z",
    name: "Club Z! Tutoring",
    kind: "Local and online",
    blurb: "In-home and online tutoring across most high school subjects and test prep, through local franchises.",
    url: () => "https://clubztutoring.com/",
    covers: (c) => !c || c.category !== "Arts",
  },
  {
    id: "tutor-doctor",
    name: "Tutor Doctor",
    kind: "Local and online",
    blurb: "Personalized one-on-one tutoring at home or online, matched by a local team.",
    url: () => "https://www.tutordoctor.com/",
    covers: (c) => !c || c.category !== "Arts",
  },
  {
    id: "sylvan",
    name: "Sylvan Learning",
    kind: "Learning center",
    blurb: "Neighborhood learning centers with tutoring and test prep. Find the nearest location.",
    url: () => "https://www.sylvanlearning.com/locations/",
    covers: (c) => STEM(c) || c?.category === "English",
  },
  {
    id: "c2-education",
    name: "C2 Education",
    kind: "Learning center",
    blurb: "Local centers for SAT prep, AP tutoring, and college admissions support.",
    url: () => "https://www.c2educate.com/locations/",
    covers: (c) => !c || c.category !== "Arts",
  },
  {
    id: "huntington",
    name: "Huntington Learning Center",
    kind: "Learning center",
    blurb: "Tutoring and SAT and AP prep at local centers and online.",
    url: () => "https://huntingtonhelps.com/",
    covers: (c) => STEM(c) || c?.category === "English",
  },
  {
    id: "mathnasium",
    name: "Mathnasium",
    kind: "Learning center",
    blurb: "Math-only learning centers, from foundations through AP Calculus and SAT math.",
    url: () => "https://www.mathnasium.com/",
    covers: (c) => !c || ["sat-math", "ap-calculus-ab", "ap-calculus-bc", "ap-precalculus", "ap-statistics"].includes(c.id),
  },
  {
    id: "preply",
    name: "Preply",
    kind: "Languages",
    blurb: "Thousands of online language tutors. Filter by price, availability, and native speakers, then book a trial lesson.",
    url: (c) => `https://preply.com/en/online/${languageWord(c) ?? "spanish"}-tutors`,
    covers: (c) => Boolean(languageWord(c)),
  },
  {
    id: "italki",
    name: "italki",
    kind: "Languages",
    blurb: "One-on-one lessons with language teachers and conversation partners, great for AP speaking practice.",
    url: (c) => `https://www.italki.com/en/teachers/${languageWord(c) ?? "spanish"}`,
    covers: (c) => Boolean(languageWord(c)),
  },
];

export const serviceById = (id: string) => SERVICES.find((s) => s.id === id);

/** Adds a partner's referral parameter when one is configured (e.g. PARTNER_REF_WYZANT=abc123). */
export function withReferral(service: Service, url: string) {
  const ref = process.env[`PARTNER_REF_${service.id.replace(/-/g, "_").toUpperCase()}`];
  if (!ref) return url;
  const u = new URL(url);
  u.searchParams.set(service.refParam ?? "ref", ref);
  return u.toString();
}
