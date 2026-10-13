import { convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse, isStepCount, streamText, toUIMessageStream, type UIMessage } from "ai";
import { recordAnswer } from "@/lib/ai/costs";
import { anonUser, BASELINE_MODEL, estimateCost, routeQuestion, tierModel } from "@/lib/ai/router";
import { TIERS, type Tier } from "@/lib/ai/router-rules";
import { getCatalog } from "@/lib/catalog";
import { instructions } from "@/lib/ai/context";
import { aiAvailable, spendMessage } from "@/lib/ai/runtime";
import { buildTools, lessonCard } from "@/lib/ai/tools";
import { search } from "@/lib/search";
import { getViewer } from "@/lib/viewer";
import { PAID_PLANS } from "@/lib/billing/plans";
import { hasPlus } from "@/lib/billing/trial";

export const maxDuration = 60;

/** Each answer carries the tier that wrote it, so the next question knows the conversation's level. */
type AnswerMeta = { tier?: Tier };

function previousTier(messages: UIMessage[]): Tier | null {
  const last = [...messages].reverse().find((m) => m.role === "assistant");
  const tier = (last?.metadata as AnswerMeta | undefined)?.tier;
  return tier && TIERS.includes(tier) ? tier : null;
}

function lastAssistantText(messages: UIMessage[]) {
  const m = [...messages].reverse().find((x) => x.role === "assistant");
  return (m?.parts ?? []).map((p) => (p.type === "text" ? p.text : "")).join(" ").trim();
}

function lastUserText(messages: UIMessage[]) {
  const m = [...messages].reverse().find((x) => x.role === "user");
  return (m?.parts ?? []).map((p) => (p.type === "text" ? p.text : "")).join(" ").trim();
}

export async function POST(req: Request) {
  let body: { messages?: UIMessage[]; path?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }
  const messages = (body.messages ?? []).slice(-24);
  const question = lastUserText(messages);
  if (!question) return Response.json({ error: "Ask a question first." }, { status: 400 });
  if (question.length > 4000) return Response.json({ error: "That message is too long. Try a shorter question." }, { status: 400 });

  const [viewer, catalog] = await Promise.all([getViewer(), getCatalog()]);
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const remaining = await spendMessage(viewer, ip);
  if (remaining < 0) {
    return Response.json(
      { error: viewer ? PAID_PLANS && !hasPlus(viewer.plus) ? "You've reached today's AI limit. It resets tomorrow, or get more with Merit Plus." : "You've reached today's AI limit. It resets tomorrow." : "Sign up free to keep asking. It takes 20 seconds." },
      { status: 429 },
    );
  }

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      if (!(await aiAvailable())) {
        // The tutor model isn't reachable (no gateway access yet): still return the best lessons.
        const hits = search(catalog, question, {}, 30);
        const topic = hits.find((h) => h.kind === "topic");
        const pool = topic?.kind === "topic" ? catalog.videosForTopic(topic.topic.id) : hits.flatMap((h) => (h.kind === "video" ? [h.video] : []));
        const lessons = pool.filter((v) => !v.isShort).slice(0, 4).map((v) => lessonCard(catalog, v));
        const id = "fallback";
        writer.write({ type: "start" });
        writer.write({ type: "text-start", id });
        writer.write({
          type: "text-delta",
          id,
          delta: lessons.length
            ? `Merit AI can't write explanations right now, so here are the best-ranked lessons for that${topic?.kind === "topic" ? ` ([${topic.topic.title}](/courses/${topic.course.slug}/${topic.topic.slug}))` : ""}:`
            : "Merit AI can't write explanations right now. Try searching for the topic at the top of the page, or browse your course outline.",
        });
        writer.write({ type: "text-end", id });
        if (lessons.length) {
          writer.write({ type: "tool-input-available", toolCallId: "fallback-lessons", toolName: "findLessons", input: { query: question } });
          writer.write({ type: "tool-output-available", toolCallId: "fallback-lessons", output: { topic: null, lessons } });
        }
        writer.write({ type: "finish" });
        return;
      }
      // Route to the cheapest tier that will answer well (lib/ai/router.ts).
      const user = anonUser(viewer?.user.id ?? `ip:${ip}`);
      const route = await routeQuestion({ question, previousTier: previousTier(messages), context: lastAssistantText(messages), user });
      const tier = tierModel(route.tier, user);
      const result = streamText({
        model: tier.model,
        instructions: instructions(catalog, viewer, body.path),
        messages: await convertToModelMessages(messages),
        tools: buildTools(catalog, viewer),
        stopWhen: isStepCount(5),
        maxOutputTokens: tier.maxOutputTokens,
        ...(tier.providerOptions ? { providerOptions: tier.providerOptions } : {}),
        onFinish: async ({ totalUsage, providerMetadata, response }) => {
          if (route.via === "off") return;
          const inputTokens = totalUsage.inputTokens ?? 0;
          const outputTokens = totalUsage.outputTokens ?? 0;
          const model = response.modelId || tier.modelId;
          // OpenRouter reports what it actually charged, including fallbacks and cache discounts.
          const reported = (providerMetadata?.openrouter as { usage?: { cost?: number } } | undefined)?.usage?.cost;
          await recordAnswer({
            tier: route.tier,
            via: route.via,
            model,
            inputTokens,
            outputTokens,
            cachedTokens: totalUsage.inputTokenDetails?.cacheReadTokens ?? 0,
            cost: typeof reported === "number" ? reported : estimateCost(model, inputTokens, outputTokens),
            baseline: estimateCost(BASELINE_MODEL, inputTokens, outputTokens),
          });
        },
      });
      writer.merge(
        toUIMessageStream({
          stream: result.stream,
          messageMetadata: ({ part }): AnswerMeta | undefined => (part.type === "start" ? { tier: route.tier } : undefined),
          onError: (err) => {
            console.error("[ai] chat failed", err);
            return "Sorry, something went wrong on our side. Try again in a moment.";
          },
        }),
      );
    },
  });
  return createUIMessageStreamResponse({ stream, headers: { "X-Merit-Remaining": String(remaining) } });
}
