import { convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse, isStepCount, streamText, toUIMessageStream, type UIMessage } from "ai";
import { getCatalog } from "@/lib/catalog";
import { instructions } from "@/lib/ai/context";
import { aiAvailable, spendMessage } from "@/lib/ai/runtime";
import { buildTools, lessonCard } from "@/lib/ai/tools";
import { env } from "@/lib/env";
import { search } from "@/lib/search";
import { getViewer } from "@/lib/viewer";

export const maxDuration = 60;

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
      { error: viewer ? "You've reached today's AI limit. It resets tomorrow, or get more with Merit Plus." : "Sign up free to keep asking. It takes 20 seconds." },
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
            ? `Merit AI's tutor mode is getting switched on. In the meantime, here are the best-ranked lessons for that${topic?.kind === "topic" ? ` ([${topic.topic.title}](/courses/${topic.course.slug}/${topic.topic.slug}))` : ""}:`
            : "Merit AI's tutor mode is getting switched on. Try searching for a topic at the top of the page, or browse your course outline.",
        });
        writer.write({ type: "text-end", id });
        if (lessons.length) {
          writer.write({ type: "tool-input-available", toolCallId: "fallback-lessons", toolName: "findLessons", input: { query: question } });
          writer.write({ type: "tool-output-available", toolCallId: "fallback-lessons", output: { topic: null, lessons } });
        }
        writer.write({ type: "finish" });
        return;
      }
      const result = streamText({
        model: env.aiModel,
        instructions: instructions(catalog, viewer, body.path),
        messages: await convertToModelMessages(messages),
        tools: buildTools(catalog, viewer),
        stopWhen: isStepCount(5),
        maxOutputTokens: 1600,
      });
      writer.merge(
        toUIMessageStream({
          stream: result.stream,
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
