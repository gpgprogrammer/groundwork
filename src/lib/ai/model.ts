import "server-only";
import { anthropic } from "@ai-sdk/anthropic";
import { env } from "@/lib/env";

/**
 * Which model serves Merit AI. With ANTHROPIC_API_KEY set, requests go straight
 * to Anthropic; otherwise through the Vercel AI Gateway (OIDC on Vercel, or
 * AI_GATEWAY_API_KEY).
 */
const direct = () => Boolean(process.env.ANTHROPIC_API_KEY);

/** "anthropic/claude-sonnet-5" (gateway id) → "claude-sonnet-5" (Anthropic id). */
const anthropicId = (gatewayId: string) => gatewayId.replace(/^anthropic\//, "").replace(/(\d)\.(\d)/g, "$1-$2");

export const chatModel = () => (direct() ? anthropic(anthropicId(env.aiModel)) : env.aiModel);
export const contentModel = () => (direct() ? anthropic(anthropicId(env.aiContentModel)) : env.aiContentModel);
export const probeModel = () => (direct() ? anthropic("claude-haiku-4-5") : "anthropic/claude-haiku-4.5");
export const aiProvider = () => (direct() ? "Anthropic API" : "Vercel AI Gateway");
