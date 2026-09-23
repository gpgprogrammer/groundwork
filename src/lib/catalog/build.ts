import type { Catalog, Chapter, Concept, Course, Educator, Topic, Unit, Video, VideoStyle } from "@/lib/types";
import { bio, chem } from "./content/bio-chem";
import { calcBC } from "./content/calc-bc";
import { educatorSpecs } from "./content/educators";
import { satMath } from "./content/sat-math";
import { satRW } from "./content/sat-rw";
import type { CourseSpec, TopicSpec } from "./content/spec";
import { world } from "./content/world";

export const courseSpecs: CourseSpec[] = [calcBC, world, satMath, bio, chem, satRW];

/** Small, stable string hash (FNV-1a) so seeded data is identical across runs. */
export function hash(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function rng(seed: string) {
  let s = hash(seed) || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}

/** Topics used in demos and marketing always get a full set of lessons. */
const SHOWCASE = new Set(["chain-rule", "champa-rice", "quadratic-forms", "related-rates", "separation-of-variables"]);

const STYLE_ORDER: VideoStyle[] = ["Concept", "Practice", "Common mistakes", "Exam strategy"];

function titleFor(style: VideoStyle, topic: TopicSpec, examLabel: string, variant: number, minutes: number, quant: boolean) {
  const t = topic.title;
  const options: Record<VideoStyle, string[]> = {
    Concept: [`${t}, clearly explained`, `${t} in ${minutes} minutes`, `Understanding ${t}`, `${t}: the idea behind it`],
    Practice: quant
      ? [`${t}: three worked examples`, `${t}, step by step`, `${t} practice, solved out loud`]
      : [`${t}: practice questions, walked through`, `Applying ${t} to real exam questions`, `${t} in practice`],
    "Common mistakes": [`${t}: mistakes that cost points`, `Where students go wrong with ${t}`, `${t} traps to avoid`],
    "Exam strategy": [`${t} on the ${examLabel}`, `How the ${examLabel} tests ${t}`, `${t}: what graders look for`],
  };
  const list = options[style];
  return list[variant % list.length];
}

function descriptionFor(style: VideoStyle, topic: TopicSpec, quant: boolean) {
  const lower = topic.points.map((p) => p.charAt(0).toLowerCase() + p.slice(1));
  switch (style) {
    case "Concept":
      return `A focused explanation of ${topic.title.toLowerCase()}. Covers ${lower[0]}, ${lower[1]}, and ${lower[2]}.`;
    case "Practice":
      return quant
        ? `Exam-style problems solved from a blank page, with every decision explained. We focus on ${lower[1]} and ${lower[2]}.`
        : `Real exam-style questions answered out loud, including how to eliminate choices. We focus on ${lower[1]} and ${lower[2]}.`;
    case "Common mistakes":
      return `The errors that show up most on real student work for this topic, and a quick check to catch each one.`;
    case "Exam strategy":
      return `How this topic appears on the exam, what earns credit, and how to write it up efficiently under time pressure.`;
  }
}

function chaptersFor(style: VideoStyle, topic: TopicSpec, duration: number, quant: boolean): Chapter[] {
  const intro: Record<VideoStyle, string> = {
    Concept: "The big idea",
    Practice: quant ? "Setting up the first problem" : "Reading the first question",
    "Common mistakes": "Why these errors happen",
    "Exam strategy": "How it shows up on the exam",
  };
  const outro: Record<VideoStyle, string> = {
    Concept: "Recap",
    Practice: "Try one yourself",
    "Common mistakes": "A 20-second checklist",
    "Exam strategy": "What to write",
  };
  const titles = [intro[style], ...topic.points, outro[style]];
  const span = duration / titles.length;
  return titles.map((title, i) => ({ t: Math.round(i * span), title }));
}

export function buildCatalog(): Catalog {
  const courses: Course[] = [];
  const units: Unit[] = [];
  const concepts: Concept[] = [];
  const topics: Topic[] = [];
  const videos: Video[] = [];

  const educators: Educator[] = educatorSpecs.map(({ courses: cs, ...e }) => ({
    ...e,
    id: `edu_${e.handle}`,
    firstName: e.name.split(" ")[0],
    courseIds: cs,
  }));

  for (const spec of courseSpecs) {
    const course: Course = { ...spec.course, id: spec.course.slug };
    courses.push(course);
    const examLabel = course.exam === "AP" ? "AP exam" : "SAT";
    const quant = course.subject === "Math" || course.subject === "Science";
    const pool = educators.filter((e) => e.courseIds.includes(course.id));
    let topicOrder = 0;

    spec.units.forEach((u, ui) => {
      const unit: Unit = {
        id: `${course.id}/${u.slug}`,
        courseId: course.id,
        slug: u.slug,
        title: u.title,
        order: ui + 1,
        summary: u.summary,
      };
      units.push(unit);

      u.concepts.forEach((c, ci) => {
        const concept: Concept = {
          id: `${unit.id}/${ci + 1}`,
          unitId: unit.id,
          courseId: course.id,
          slug: c.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          title: c.title,
          order: ci + 1,
        };
        concepts.push(concept);

        for (const t of c.topics) {
          const topic: Topic = {
            id: t.slug,
            conceptId: concept.id,
            unitId: unit.id,
            courseId: course.id,
            slug: t.slug,
            title: t.title,
            summary: t.summary,
            glyph: t.glyph,
            keyPoints: [...t.points],
            aliases: t.aliases ?? [],
            order: ++topicOrder,
          };
          topics.push(topic);

          const r = rng(t.slug);
          const count = SHOWCASE.has(t.slug) ? 4 : Math.min(pool.length + 1, 2 + Math.floor(r() * 3));
          const ranked = [...pool].sort((a, b) => hash(t.slug + a.id) - hash(t.slug + b.id));

          for (let i = 0; i < count; i++) {
            const educator = ranked[i % ranked.length];
            const style = STYLE_ORDER[i % STYLE_ORDER.length];
            const vr = rng(`${t.slug}:${educator.id}:${style}`);
            const base = { Concept: [300, 420], Practice: [480, 480], "Common mistakes": [240, 240], "Exam strategy": [300, 240] }[style];
            const durationSec = Math.round((base[0] + vr() * base[1]) / 5) * 5;

            // Latent quality drives engagement; popularity drives reach. They are
            // deliberately independent, so raw views are a weak proxy for quality.
            const quality = Math.min(1, 0.3 + vr() * 0.55 + (educator.rating - 4.8) * 1.2);
            const popularity = vr();
            const views = Math.round(600 + popularity ** 2 * 48000 + vr() * 900);
            const avgWatchFraction = Math.min(0.97, 0.34 + quality * 0.56 + (vr() - 0.5) * 0.06);
            const completionRate = Math.min(0.95, avgWatchFraction ** 1.7);
            const votes = Math.round(views * (0.035 + vr() * 0.04));
            const helpfulShare = 0.62 + quality * 0.36;
            const helpful = Math.round(votes * helpfulShare);
            const saves = Math.round(views * (0.015 + quality * 0.09 + vr() * 0.01));
            const published = new Date(Date.UTC(2025, 0, 1) + Math.floor(vr() * 620) * 86400000);

            videos.push({
              id: `v${hash(`${t.slug}|${educator.id}|${style}`).toString(36)}`,
              topicId: topic.id,
              educatorId: educator.id,
              title: titleFor(style, t, examLabel, hash(t.slug + style), Math.round(durationSec / 60), quant),
              description: descriptionFor(style, t, quant),
              style,
              durationSec,
              publishedAt: published.toISOString(),
              chapters: chaptersFor(style, t, durationSec, quant),
              mediaUrl: null,
              status: "published",
              stats: {
                views,
                completions: Math.round(views * completionRate),
                avgWatchFraction: Number(avgWatchFraction.toFixed(3)),
                helpful,
                notHelpful: votes - helpful,
                saves,
                rewatchRate: Number((0.04 + quality * 0.28 + vr() * 0.04).toFixed(3)),
                earlyDropRate: Number(Math.max(0.03, 0.42 - quality * 0.36 + (vr() - 0.5) * 0.06).toFixed(3)),
              },
            });
          }
        }
      });
    });
  }

  return { courses, units, concepts, topics, educators, videos };
}
