import type { Question } from "@/lib/types";
import { GENERATORS, type Draft, type Generator, type Rng } from "./generators";

/**
 * Built-in math practice: unlimited, instant problems with worked solutions, no AI or database needed.
 * A generated question's id encodes its generator and seed ("g~<gen>~<seed>~<topicId>"), so the
 * server can rebuild the exact question to check an answer.
 */

export type GeneratedQuestion = Question & { steps: string[]; skill: string };

/** Topic slug patterns → generators, checked in order. A topic can match several. */
const MAP: [RegExp, string[]][] = [
  [/order-of-operations|variables-and-expressions|properties-of-real/, ["order-of-ops", "distribute"]],
  [/distributive|combining-like/, ["distribute"]],
  [/one-step|two-step|multi-step|linear-equations-in-one/, ["two-step", "both-sides"]],
  [/variables-on-both|literal-equations/, ["both-sides", "two-step"]],
  [/absolute-value-equations/, ["abs-eq"]],
  [/ratios|proportion|similar-polygons|proving-triangles-similar|similar-triangles|similar-solids|dilations/, ["proportion", "similar"]],
  [/inequalit/, ["inequality"]],
  [/rate-of-change-and-slope|slope-intercept|point-slope|^slope|average-rate-of-change|rates-of-change$/, ["slope-points", "line-equation"]],
  [/standard-form/, ["standard-form", "line-equation"]],
  [/parallel-and-perpendicular|slopes-of-parallel|perpendicular-lines/, ["perp-slope"]],
  [/systems|linear-quadratic|elimination|substitution/, ["systems"]],
  [/function-notation|relations-and-functions|functions-and-their-properties|graphing-functions/, ["function-eval"]],
  [/composition|composing|function-operations/, ["composition", "inverse"]],
  [/inverse-functions|inverse-function(?!-deriv)/, ["inverse"]],
  [/exponents|rational-exponents|nth-roots/, ["exponents", "radicals"]],
  [/radical/, ["radicals"]],
  [/multiplying-polynomials|special-products|adding-and-subtracting-polynomials|adding-subtracting-and-multiplying/, ["foil"]],
  [/factoring|factor-theorem/, ["factor", "quad-roots"]],
  [/solving-quadratics|solving-quadratic|zeros|quadratic-equations|quadratic-forms/, ["quad-roots", "quad-formula"]],
  [/quadratic-formula|discriminant|complex-solutions/, ["discriminant", "quad-formula"]],
  [/vertex|graphing-quadratic|forms-of-quadratic|quadratic-functions/, ["vertex", "complete-square"]],
  [/completing-the-square|long-division-completing/, ["complete-square"]],
  [/complex-numbers/, ["complex"]],
  [/percent/, ["percent-change"]],
  [/exponential/, ["exp-growth", "log-equation"]],
  [/natural-base|logarithm|semi-log/, ["logs", "log-equation"]],
  [/arithmetic-sequence|arithmetic-and-geometric|sequences|summation/, ["arith-seq", "geo-seq"]],
  [/geometric-sequence|geometric-series(?!-)|infinite-geometric|^geometric-series$/, ["geo-seq", "infinite-geo"]],
  [/pythagorean-theorem|right-triangle(?!-trig)|similar-right/, ["pythagorean"]],
  [/special-right/, ["special-right"]],
  [/trigonometric-ratios|solving-right-triangles|right-triangle-trig|angles-of-elevation/, ["trig-ratio", "special-right"]],
  [/midpoint|distance|coordinate-proofs|measuring-segments/, ["distance-midpoint"]],
  [/triangle-angle|exterior-angles|isosceles/, ["triangle-angles"]],
  [/angles-of-polygons/, ["polygon-angles"]],
  [/circumference|parts-of-a-circle|areas-of-polygons|area-and-volume/, ["circle", "volume"]],
  [/arc-length-and-radian|area-of-sectors|^arc-length$/, ["arc-sector"]],
  [/volume|surface-area/, ["volume"]],
  [/unit-circle|trig-functions-on|trigonometric-functions-of-any|periodic-phenomena/, ["unit-circle"]],
  [/radian/, ["radians", "unit-circle"]],
  [/measures-of-center|measures-of-spread|center-and-spread|describing-distributions|summary-statistics|box-plots/, ["center"]],
  [/z-score|percentiles|normal-distribution|empirical-rule/, ["z-score"]],
  [/conditional-probability|two-way-tables/, ["conditional"]],
  [/probability|sample-spaces|independent-and-dependent|addition-rule|simulation/, ["probability", "conditional"]],
  [/permutations|combinations|counting/, ["counting"]],
  [/binomial-distribution|^binomial-distributions$|the-binomial-distribution/, ["binomial"]],
  [/random-variables/, ["expected-value", "binomial"]],
  [/limit(?!ed)|continuity|discontinuity|squeeze|introducing-calculus/, ["limits"]],
  [/power-rule|derivative-definition|estimating-derivatives|higher-order|choosing-derivative/, ["power-rule", "derivative-value"]],
  [/derivative-in-context|tangent-lines|linearization|straight-line-motion|increasing-and-decreasing|first-derivative|candidates|extreme-value|optimization/, ["derivative-value", "power-rule"]],
  [/chain-rule|implicit-differentiation/, ["chain-rule"]],
  [/product-and-quotient/, ["product-rule"]],
  [/antiderivative|accumulation|riemann/, ["antiderivative", "definite-integral"]],
  [/fundamental-theorem|definite-integral|area-between|average-value/, ["definite-integral"]],
  [/u-substitution/, ["u-sub", "antiderivative"]],
  [/determinant|matri/, ["determinant"]],
  [/dot-product|vectors/, ["dot-product"]],
  [/unit-conversion/, ["unit-conversion"]],
];

const byId = new Map(GENERATORS.map((x) => [x.id, x]));

/** Generators for a topic, by its slug (the part after the course id). */
export function generatorsFor(topicIdOrSlug: string): Generator[] {
  const slug = topicIdOrSlug.includes("/") ? topicIdOrSlug.slice(topicIdOrSlug.lastIndexOf("/") + 1) : topicIdOrSlug;
  const out = new Set<string>();
  for (const [re, ids] of MAP) if (re.test(slug)) ids.forEach((id) => out.add(id));
  return [...out].map((id) => byId.get(id)!).filter(Boolean);
}

export const hasPractice = (topicIdOrSlug: string) => generatorsFor(topicIdOrSlug).length > 0;

/** mulberry32: small, fast, seeded. */
function rng(seed: number): Rng & { next: () => number } {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (lo: number, hi: number) => lo + Math.floor(next() * (hi - lo + 1));
  return {
    next,
    int,
    pick: (xs) => xs[Math.floor(next() * xs.length)],
    nz: (lo, hi) => {
      for (let i = 0; i < 20; i++) {
        const v = int(lo, hi);
        if (v !== 0) return v;
      }
      return hi || 1;
    },
  };
}

/** The answer with its last whole number nudged by `delta`, keeping the minus sign style. */
function nearMiss(answer: string, delta: number): string | null {
  const m = [...answer.matchAll(/−?\d+/g)].pop();
  if (!m || m.index === undefined) return null;
  const v = Number(m[0].replace("−", "-")) + delta;
  const s = v < 0 ? `−${Math.abs(v)}` : `${v}`;
  return answer.slice(0, m.index) + s + answer.slice(m.index + m[0].length);
}

const bad = (s: string) => !s || /NaN|undefined|Infinity|null/.test(s);

/** Builds a question from a draft: three distinct wrong answers, shuffled in with the right one. */
function toQuestion(d: Draft, gen: Generator, seed: number, topicId: string): GeneratedQuestion | null {
  if (bad(d.answer) || bad(d.stem)) return null;
  const seen = new Set([d.answer]);
  const wrong: [string, string][] = [];
  for (const [w, why] of d.wrong) {
    if (bad(w) || seen.has(w)) continue;
    seen.add(w);
    wrong.push([w, why]);
    if (wrong.length === 3) break;
  }
  // Pad with near misses (an arithmetic slip in the last number) when mistakes collide.
  for (const delta of [1, -1, 2, -2, 10]) {
    if (wrong.length >= 3) break;
    const w = nearMiss(d.answer, delta);
    if (w && !seen.has(w)) {
      seen.add(w);
      wrong.push([w, "Close, but there's an arithmetic slip. Recheck each step."]);
    }
  }
  if (wrong.length < 3) return null; // the caller tries another seed
  const r = rng(seed ^ 0x9e3779b9);
  const slot = r.int(0, 3);
  const choices: string[] = [];
  const explanations: string[] = [];
  let wi = 0;
  for (let i = 0; i < 4; i++) {
    if (i === slot) {
      choices.push(d.answer);
      explanations.push(`Correct. ${d.steps.join(" ")}`);
    } else {
      const [w, why] = wrong[wi++];
      choices.push(w);
      explanations.push(why);
    }
  }
  return { id: `g~${gen.id}~${seed}~${topicId}`, topicId, stem: d.stem, choices, answer: slot, explanations, difficulty: d.difficulty, steps: d.steps, skill: gen.label };
}

function build(gen: Generator, seed: number, topicId: string): GeneratedQuestion | null {
  try {
    return toQuestion(gen.make(rng(seed)), gen, seed, topicId);
  } catch {
    return null;
  }
}

/** Rebuilds a generated question from its id (to check an answer server-side). */
export function questionFromId(id: string): GeneratedQuestion | null {
  const [tag, genId, seedStr, ...rest] = id.split("~");
  const gen = byId.get(genId);
  const seed = Number(seedStr);
  if (tag !== "g" || !gen || !Number.isInteger(seed)) return null;
  return build(gen, seed, rest.join("~"));
}

export const isGeneratedId = (id: string) => id.startsWith("g~");

/** `count` fresh problems for a topic. Pass a seed for a repeatable set. */
export function generateForTopic(topicId: string, count: number, seed = Math.floor(Math.random() * 2 ** 31)): GeneratedQuestion[] {
  const gens = generatorsFor(topicId);
  if (!gens.length) return [];
  const out: GeneratedQuestion[] = [];
  const stems = new Set<string>();
  for (let i = 0, tries = 0; out.length < count && tries < count * 8; tries++, i++) {
    const s = (seed + i * 7919) >>> 0;
    const q = build(gens[i % gens.length], s, topicId);
    if (!q || stems.has(q.stem)) continue;
    stems.add(q.stem);
    out.push(q);
  }
  return out;
}

export { GENERATORS };
