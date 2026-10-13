/**
 * Merit AI's model router, part 1: the free rules. Most questions can be placed on a tier from the
 * text alone, without paying a classifier; only the ambiguous middle goes to one (lib/ai/router.ts).
 *
 * Tiers, cheapest first:
 * - light:    lookups, definitions, "find me a video", short factual questions, small talk.
 * - standard: explaining a concept with an example, quizzing, typical homework-style questions.
 * - expert:   multi-step problems and proofs, grading or rewriting writing, long pasted material,
 *             and a student who is still stuck after an answer.
 */

export type Tier = "light" | "standard" | "expert";
export const TIERS: Tier[] = ["light", "standard", "expert"];
export const tierRank = (t: Tier) => TIERS.indexOf(t);
export const maxTier = (a: Tier, b: Tier): Tier => (tierRank(a) >= tierRank(b) ? a : b);

export type RuleDecision = { tier: Tier; reason: string } | null;

const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

/** Greetings, thanks, and one-word acknowledgements. */
const SMALL_TALK = /^(hi|hey|hello|yo|thanks|thank you|thx|ty|ok|okay|cool|got it|nice|great|bye|good (morning|night))\b[\s!.?]*$/i;

/** Requests that are mostly a tool call: finding lessons, the plan, tutors, what's on the exam. */
const LOOKUP =
  /^(find|show|give|get|recommend|suggest|search)( me)? (a |an |some |the )?(short |quick |good |best )?(video|videos|lesson|lessons|tutor|tutors)\b|^(what should i (study|watch|do)|what'?s (on|in) (the|my) (ap |sat )?(exam|test|unit|plan)|what units|which units|is there a (video|lesson))\b/i;

/** "What is / define / who was …": short factual questions. */
const FACTUAL = /^(what is|what's|what are|who (is|was|were)|when (is|was|did)|where (is|was)|define|definition of|meaning of|what does .{1,40} (mean|stand for))\b/i;

/** Proofs, derivations, and multi-step quantitative work. */
const HARD_REASONING =
  /\b(prove|proof|derive|derivation|show that|justify (each|every|why)|step[- ]by[- ]step|why does this work|integrat(e|ion) by parts|related rates|optimization problem|differential equation|limit comparison|taylor|maclaurin|series converges?|equilibrium constant|ice table|titration curve|free[- ]body|torque|kinematics problem|hardy[- ]weinberg)\b/i;

/** Grading, feedback on writing, and essays: long, careful answers. */
const WRITING_REVIEW =
  /\b(grade|score|rubric|feedback on|review my|check my|edit my|improve my|rewrite|revise)\b.{0,60}\b(essay|frq|dbq|leq|saq|thesis|paragraph|response|answer|argument|writing)\b|\b(dbq|leq|frq|synthesis essay|rhetorical analysis|argument essay)\b/i;

/** The student is still stuck or says the last answer was wrong: step up, don't repeat. */
const STILL_STUCK = /\b(still (don'?t|do not) (get|understand)|that'?s (wrong|not right|incorrect)|you('re| are) wrong|doesn'?t make sense|i'?m (still )?confused|explain (it )?(again|differently)|that didn'?t help)\b/i;

/** Short follow-ups that lean on the previous answer ("why?", "what about the second one?"). */
const FOLLOW_UP = /^(why|how|and|so|but|what about|what if|then|wait|can you|could you|also)\b/i;

/** Math-heavy text: several operators, numbers, or symbols usually means a worked problem. */
const looksLikeMathProblem = (s: string) => {
  const ops = (s.match(/[=+\-*/^√∫∑≤≥<>]|\bd[xy]\b|\bdy\/dx\b/g) ?? []).length;
  const nums = (s.match(/\d+(\.\d+)?/g) ?? []).length;
  return ops >= 4 && nums >= 3;
};

/**
 * Places a question on a tier from its text and the conversation so far, or returns null when the
 * classifier should decide. `previous` is the tier the last answer in this conversation used.
 */
export function ruleTier(question: string, previous: Tier | null): RuleDecision {
  const q = question.trim();
  const words = wordCount(q);

  if (STILL_STUCK.test(q)) return { tier: previous === "light" ? "standard" : "expert", reason: "still stuck" };
  if (q.length > 1500) return { tier: "expert", reason: "long pasted material" };
  if (WRITING_REVIEW.test(q)) return { tier: "expert", reason: "writing feedback" };
  if (HARD_REASONING.test(q) || looksLikeMathProblem(q)) return { tier: words <= 8 && !looksLikeMathProblem(q) ? "standard" : "expert", reason: "multi-step reasoning" };

  // A short follow-up keeps the level of the conversation it continues.
  if (previous && words <= 12 && FOLLOW_UP.test(q)) return { tier: previous, reason: "follow-up" };

  if (SMALL_TALK.test(q)) return { tier: "light", reason: "small talk" };
  if (LOOKUP.test(q)) return { tier: "light", reason: "lookup" };
  if (FACTUAL.test(q) && words <= 14) return { tier: "light", reason: "short factual question" };
  return null;
}

/**
 * Applies the conversation's floor: once a conversation needed the expert, its next answer stays at
 * least standard, so a follow-up isn't handed to a model that can't see what made it hard.
 */
export function withFloor(tier: Tier, previous: Tier | null): Tier {
  if (previous === "expert") return maxTier(tier, "standard");
  return tier;
}
