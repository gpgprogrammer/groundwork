import "server-only";
import { createHash } from "node:crypto";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText, Output, type LanguageModel } from "ai";
import { z } from "zod";
import { chatModel, contentModel } from "./model";
import { ruleTier, withFloor, type Tier } from "./router-rules";

/**
 * Merit AI's model router, part 2: picks the cheapest model that can answer a question well.
 *
 * With OPENROUTER_API_KEY set, every question is placed on a tier (light, standard, expert) by the
 * free rules in router-rules.ts or, when they can't tell, by a very cheap classifier model, and is
 * answered by that tier's model through OpenRouter. Each tier lists fallbacks that OpenRouter tries
 * if the first model errors, is rate-limited, or is down. Without the key, Merit AI keeps using its
 * single configured model (the Vercel AI Gateway or Anthropic), exactly as before.
 *
 * Models are chosen for reliable tool calling (Merit AI calls tools to find lessons, quiz, and read
 * the learning plan) and set with MERIT_AI_LIGHT / _STANDARD / _EXPERT / _ROUTER to swap them.
 */

type TierConfig = { models: string[]; maxOutputTokens: number; label: string };

const list = (env: string | undefined, fallback: string[]) => (env ? env.split(",").map((s) => s.trim()).filter(Boolean) : fallback);

export const TIER_CONFIG: Record<Tier, TierConfig> = {
  light: { label: "Light", maxOutputTokens: 700, models: list(process.env.MERIT_AI_LIGHT, ["anthropic/claude-haiku-5.5", "openai/gpt-5.6-luna", "google/gemini-3.1-flash-lite"]) },
  standard: { label: "Standard", maxOutputTokens: 1200, models: list(process.env.MERIT_AI_STANDARD, ["google/gemini-3.8-flash", "openai/gpt-5.4-mini", "anthropic/claude-haiku-5.5"]) },
  expert: { label: "Expert", maxOutputTokens: 1600, models: list(process.env.MERIT_AI_EXPERT, ["anthropic/claude-sonnet-5", "openai/gpt-5.6-sol", "google/gemini-3.1-pro-preview"]) },
};
const ROUTER_MODELS = list(process.env.MERIT_AI_ROUTER, ["anthropic/claude-haiku-5.5", "openai/gpt-5.6-luna"]);

/** List prices (USD per million tokens) for estimating savings; actual charges come back from OpenRouter. */
export const LIST_PRICE: Record<string, { in: number; out: number }> = {
  "anthropic/claude-haiku-5.5": { in: 0.1, out: 0.5 },
  "openai/gpt-5.6-luna": { in: 0.2, out: 1.2 },
  "google/gemini-3.1-flash-lite": { in: 0.25, out: 1.5 },
  "google/gemini-3.8-flash": { in: 0.75, out: 3.75 },
  "openai/gpt-5.4-mini": { in: 0.75, out: 4.5 },
  "anthropic/claude-sonnet-5": { in: 2, out: 10 },
  "openai/gpt-5.6-sol": { in: 2, out: 10 },
  "google/gemini-3.1-pro-preview": { in: 2, out: 12 },
};
/** What every answer would cost if it all went to the expert tier: the baseline for savings. */
export const BASELINE_MODEL = "anthropic/claude-sonnet-5";

export const routingEnabled = () => Boolean(process.env.OPENROUTER_API_KEY) && process.env.MERIT_AI_ROUTING !== "off";

let client: ReturnType<typeof createOpenRouter> | null = null;
const openrouter = () =>
  (client ??= createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
    // Shown on OpenRouter's app rankings and in its dashboard.
    headers: { "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://meritlearning.org", "X-Title": "Merit Learning" },
  }));

/** A stable, anonymous id for OpenRouter's abuse monitoring (never the student's email or name). */
export const anonUser = (id: string) => createHash("sha256").update(`merit:${id}`).digest("base64url").slice(0, 24);

/**
 * OpenRouter request options shared by every Merit call: fallbacks, only providers that support the
 * tools we send, and only providers that don't store or train on prompts (Merit's users are teens).
 */
function routingOptions(models: string[], user?: string) {
  return {
    openrouter: {
      models,
      provider: { require_parameters: true, data_collection: "deny" as const },
      ...(user ? { user } : {}),
    },
  };
}

/** The model and request options for a tier. */
export function tierModel(tier: Tier, user?: string): { model: LanguageModel; providerOptions?: ReturnType<typeof routingOptions>; maxOutputTokens: number; modelId: string } {
  const cfg = TIER_CONFIG[tier];
  if (!routingEnabled()) return { model: chatModel(), maxOutputTokens: TIER_CONFIG.expert.maxOutputTokens, modelId: "default" };
  return { model: openrouter()(cfg.models[0]), providerOptions: routingOptions(cfg.models, user), maxOutputTokens: cfg.maxOutputTokens, modelId: cfg.models[0] };
}

const classifierSchema = z.object({
  tier: z.enum(["light", "standard", "expert"]),
  reason: z.string().max(80),
});

/**
 * The classifier for questions the rules can't place. A small, fast model reads the question (and the
 * previous turn for context) and picks a tier; it costs a few hundredths of a cent. If it fails or
 * takes too long, the question goes to the standard tier.
 */
async function classify(question: string, context: string, user?: string): Promise<{ tier: Tier; reason: string }> {
  try {
    const { output } = await generateText({
      model: openrouter()(ROUTER_MODELS[0]),
      providerOptions: { openrouter: { ...routingOptions(ROUTER_MODELS, user).openrouter, reasoning: { effort: "none" as const } } },
      output: Output.object({ schema: classifierSchema }),
      maxOutputTokens: 60,
      temperature: 0,
      abortSignal: AbortSignal.timeout(2500),
      instructions:
        "You route a high school student's question to the cheapest AI tutor that will answer it well.\n" +
        "light: a definition, a fact, a quick yes/no, finding a video or lesson, or small talk. One or two sentences answer it.\n" +
        "standard: explain a concept with an example, compare two ideas, a typical homework or test question, make a short quiz.\n" +
        "expert: multi-step math or science problems, proofs, grading or rewriting writing, synthesizing several sources, or anything a weaker tutor would likely get wrong.\n" +
        "When unsure between two tiers, pick the higher one.",
      prompt: `${context ? `Previous turn (for context): ${context.slice(0, 600)}\n\n` : ""}Question: ${question.slice(0, 1500)}`,
    });
    return { tier: output.tier, reason: `classifier: ${output.reason}` };
  } catch (err) {
    console.warn("[ai-router] classifier failed, using standard:", err instanceof Error ? err.message.slice(0, 120) : err);
    return { tier: "standard", reason: "classifier unavailable" };
  }
}

export type Route = { tier: Tier; reason: string; via: "rule" | "classifier" | "off" };

/** Decides which tier answers this question. */
export async function routeQuestion(input: { question: string; previousTier: Tier | null; context: string; user?: string }): Promise<Route> {
  if (!routingEnabled()) return { tier: "expert", reason: "routing off", via: "off" };
  const rule = ruleTier(input.question, input.previousTier);
  if (rule) return { tier: withFloor(rule.tier, input.previousTier), reason: rule.reason, via: "rule" };
  const c = await classify(input.question, input.context, input.user);
  return { tier: withFloor(c.tier, input.previousTier), reason: c.reason, via: "classifier" };
}

/** Estimated cost in USD at list prices (used when the provider doesn't report one, and for the baseline). */
export function estimateCost(modelId: string, inputTokens: number, outputTokens: number) {
  const p = LIST_PRICE[modelId] ?? LIST_PRICE[BASELINE_MODEL];
  return (inputTokens * p.in + outputTokens * p.out) / 1e6;
}

/**
 * The model for Merit AI's other work, by how hard the task is: practice questions and free-response
 * grading need the expert (they're generated once and reused, or graded for a student); cram sheets,
 * free-response prompts, and reading calendars use the standard tier. Without OpenRouter, the single
 * configured content model does everything, as before.
 */
export function taskModel(tier: Tier): { model: LanguageModel; providerOptions?: ReturnType<typeof routingOptions> } {
  if (!routingEnabled()) return { model: contentModel() };
  const cfg = TIER_CONFIG[tier];
  return { model: openrouter()(cfg.models[0]), providerOptions: routingOptions(cfg.models) };
}
