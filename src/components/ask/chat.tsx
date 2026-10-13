"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { ArrowUp, Sparkles, BookOpen, CalendarCheck, Check, ListTree, Loader2, RotateCcw, Square, Users, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { LessonCard, QuizCard } from "@/lib/ai/tools";
import { PAID_PLANS } from "@/lib/billing/plans";
import { LogoMark } from "../logo";
import { useViewerMarks } from "../viewer-marks";
import { cn, formatViews } from "../ui";
import { Markdown } from "./markdown";
import { LessonLink } from "../lesson-player";

const STORE_KEY = "merit:ask";

function errorText(err: Error | undefined) {
  if (!err) return "";
  try {
    const j = JSON.parse(err.message);
    if (j?.error) return String(j.error);
  } catch {}
  return err.message && err.message.length < 200 ? err.message : "Something went wrong. Try again.";
}

export function Chat({ compact = false, suggestions, placeholder = "Ask anything about your classes…", autoFocus }: { compact?: boolean; suggestions: string[]; placeholder?: string; autoFocus?: boolean }) {
  const { signedIn } = useViewerMarks();
  const { messages, sendMessage, status, stop, error, setMessages, regenerate } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/ask",
      prepareSendMessagesRequest: ({ messages }) => ({ body: { messages: messages.slice(-24), path: window.location.pathname } }),
    }),
  });

  // Keep the conversation across page loads within this tab.
  const restored = useRef(false);
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    try {
      const saved = sessionStorage.getItem(STORE_KEY);
      if (saved) setMessages(JSON.parse(saved) as UIMessage[]);
    } catch {}
  }, [setMessages]);
  useEffect(() => {
    if (!restored.current || status === "streaming") return;
    try {
      sessionStorage.setItem(STORE_KEY, JSON.stringify(messages.slice(-30)));
    } catch {}
  }, [messages, status]);

  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const busy = status === "submitted" || status === "streaming";
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages, status]);

  const send = (text: string) => {
    const t = text.trim();
    if (!t || busy) return;
    sendMessage({ text: t });
    setInput("");
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className={cn("min-h-0 flex-1 overflow-y-auto", compact ? "px-4 py-4" : "px-1 py-6")}>
        {!messages.length ? (
          <div className={cn("rise flex flex-col", compact ? "pt-2" : "items-center pt-6 text-center sm:pt-14")}>
            <span className={cn("flex items-center justify-center rounded-[22px] bg-[linear-gradient(135deg,#ec4899,#be185d)] text-white shadow-[0_5px_0_0_#9d174d]", compact ? "size-12" : "size-20")}>
              <Sparkles className={compact ? "size-6" : "size-10"} />
            </span>
            {compact ? <p className="headline mt-4 text-[22px] text-ink">What are we studying?</p> : <h1 className="display mt-6 text-[36px] text-ink sm:text-5xl">What are we studying?</h1>}
            <p className={cn("mt-1 text-muted", compact ? "text-[13px]" : "text-[15px]")}>Explanations, practice questions, and the right lesson for any topic in your classes, AP courses, or the SAT.{signedIn ? null : " Try it now, no account needed."}</p>
            <div className={cn("mt-6 grid gap-2", compact ? "" : "w-full max-w-2xl sm:grid-cols-2")}>
              {suggestions.map((s) => (
                <button key={s} onClick={() => send(s)} className="press rounded-2xl bg-surface px-4 py-3.5 text-left text-[14.5px] font-bold text-ink ring-2 ring-inset ring-line [--ledge:var(--line)] hover:bg-[#fdeef6] hover:ring-[#f9a8d4] dark:hover:bg-[#3d1830]">
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className={cn("space-y-6", !compact && "mx-auto max-w-3xl")}>
            {messages.map((m) => (
              <Message key={m.id} m={m} compact={compact} onAsk={send} />
            ))}
            {status === "submitted" ? (
              <div className="flex items-center gap-3 text-sm text-muted">
                <LogoMark className="size-7" />
                <span className="flex gap-1" aria-label="Merit AI is thinking">
                  <span className="size-1.5 animate-pulse rounded-full bg-muted [animation-delay:-0.4s]" />
                  <span className="size-1.5 animate-pulse rounded-full bg-muted [animation-delay:-0.2s]" />
                  <span className="size-1.5 animate-pulse rounded-full bg-muted" />
                </span>
              </div>
            ) : null}
            {error ? (
              <div className="fade rounded-2xl bg-warn-soft px-4 py-3 text-sm text-ink" role="alert">
                {errorText(error)}
                {/Sign up/.test(errorText(error)) || (PAID_PLANS && /limit/.test(errorText(error))) ? (
                  <Link href={/Sign up/.test(errorText(error)) ? "/signup?next=/ask" : "/pricing"} className="ml-2 font-semibold text-accent-ink hover:underline">
                    {/Sign up/.test(errorText(error)) ? "Sign up free" : "See Plus"}
                  </Link>
                ) : (
                  <button onClick={() => regenerate()} className="ml-2 inline-flex items-center gap-1 font-semibold text-accent-ink hover:underline">
                    <RotateCcw className="size-3.5" /> Retry
                  </button>
                )}
              </div>
            ) : null}
            <div ref={endRef} />
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className={cn("shrink-0", compact ? "border-t border-line p-3" : "mx-auto w-full max-w-3xl pb-4 pt-2")}
      >
        <div className="flex items-end gap-2 rounded-3xl bg-surface p-2 pl-4 ring-2 ring-line shadow-[0_4px_0_0_var(--line)] transition-[box-shadow] duration-200 focus-within:ring-[#db2777]">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={1}
            autoFocus={autoFocus}
            placeholder={placeholder}
            aria-label="Ask Merit AI"
            className="max-h-40 min-h-[40px] flex-1 resize-none bg-transparent py-2 text-[16px] text-ink outline-none placeholder:text-muted focus-visible:outline-none sm:text-[15px] [field-sizing:content]"
          />
          {busy ? (
            <button type="button" onClick={() => stop()} className="flex size-10 shrink-0 items-center justify-center rounded-full bg-ink text-bg transition-transform active:scale-95" aria-label="Stop">
              <Square className="size-3.5 fill-current" />
            </button>
          ) : (
            <button type="submit" disabled={!input.trim()} className="press-sm flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#db2777] text-white [--ledge:#9d174d] hover:brightness-110 disabled:opacity-35" aria-label="Send">
              <ArrowUp className="size-5" />
            </button>
          )}
        </div>
        {messages.length && !busy ? (
          <button
            type="button"
            onClick={() => {
              setMessages([]);
              try {
                sessionStorage.removeItem(STORE_KEY);
              } catch {}
            }}
            className="mt-2 text-[12px] text-muted hover:text-ink"
          >
            New conversation
          </button>
        ) : (
          <p className="mt-2 text-[11.5px] text-faint">Merit AI can make mistakes. Check important answers against your class notes.</p>
        )}
      </form>
    </div>
  );
}

type ToolPart = { type: string; state?: string; output?: unknown; errorText?: string };

function Message({ m, compact, onAsk }: { m: UIMessage; compact: boolean; onAsk: (t: string) => void }) {
  if (m.role === "user") {
    const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
    return (
      <div className="flex justify-end">
        <p className="fade max-w-[85%] whitespace-pre-wrap rounded-3xl rounded-br-lg bg-[#db2777] px-4 py-3 text-[15px] font-medium text-white">{text}</p>
      </div>
    );
  }
  return (
    <div className="flex gap-3">
      <LogoMark className="mt-0.5 size-7 shrink-0" />
      <div className="min-w-0 flex-1 space-y-3">
        {m.parts.map((p, i) => {
          if (p.type === "text") return p.text ? <Markdown key={i} text={p.text} /> : null;
          if (p.type.startsWith("tool-")) return <ToolView key={i} part={p as ToolPart} compact={compact} onAsk={onAsk} />;
          return null;
        })}
      </div>
    </div>
  );
}

const TOOL_LABEL: Record<string, string> = {
  "tool-findLessons": "Finding the best lessons",
  "tool-topicInfo": "Looking up the topic",
  "tool-courseOutline": "Opening the course outline",
  "tool-findTutors": "Finding tutors",
  "tool-learningPlan": "Checking your learning plan",
  "tool-quiz": "Writing your quiz",
};

function ToolView({ part, compact, onAsk }: { part: ToolPart; compact: boolean; onAsk: (t: string) => void }) {
  if (part.state === "output-error") return null;
  if (part.state !== "output-available") {
    return (
      <p className="flex items-center gap-2 text-[13px] text-muted">
        <Loader2 className="size-3.5 animate-spin" /> {TOOL_LABEL[part.type] ?? "Working"}…
      </p>
    );
  }
  const out = part.output as Record<string, unknown>;
  switch (part.type) {
    case "tool-findLessons":
      return <Lessons lessons={(out.lessons as LessonCard[]) ?? []} compact={compact} />;
    case "tool-topicInfo":
      return out.found ? (
        <Link href={String(out.href)} className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1.5 text-[13px] font-medium text-accent-ink hover:underline">
          <BookOpen className="size-3.5" /> {String(out.title)} · {String(out.unit)}
        </Link>
      ) : null;
    case "tool-courseOutline":
      return (
        <details className="rounded-xl bg-surface ring-1 ring-line">
          <summary className="flex cursor-pointer items-center gap-2 px-4 py-2.5 text-[13px] font-medium text-ink">
            <ListTree className="size-4 text-accent-ink" /> {String(out.course)} outline
          </summary>
          <ul className="space-y-2 px-4 pb-3 text-[13px] text-ink-2">
            {(out.units as { unit: string; topics: string[] }[]).map((u) => (
              <li key={u.unit}>
                <span className="font-medium text-ink">{u.unit}</span>
                <span className="text-muted"> · {u.topics.join(", ")}</span>
              </li>
            ))}
          </ul>
        </details>
      );
    case "tool-findTutors":
      return (
        <Link href={String(out.tutorsPage)} className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1.5 text-[13px] font-medium text-accent-ink hover:underline">
          <Users className="size-3.5" /> Open Tutors
        </Link>
      );
    case "tool-learningPlan":
      return out.available ? (
        <Link href="/plan" className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1.5 text-[13px] font-medium text-accent-ink hover:underline">
          <CalendarCheck className="size-3.5" /> Open my learning plan
        </Link>
      ) : null;
    case "tool-quiz":
      return <Quiz quiz={out as unknown as QuizCard} onAsk={onAsk} />;
    default:
      return null;
  }
}

function Lessons({ lessons, compact }: { lessons: LessonCard[]; compact: boolean }) {
  if (!lessons.length) return null;
  return (
    <div className={cn("grid gap-2", !compact && "sm:grid-cols-2")}>
      {lessons.map((l) => (
        <LessonLink v={{ id: l.id, title: l.title, channelTitle: l.channel, topicTitle: l.topic, topicHref: l.topicHref }} key={l.id} className="group flex gap-3 rounded-2xl bg-surface p-2 ring-2 ring-line transition-[box-shadow] hover:shadow-soft">
          <span className="relative w-28 shrink-0 overflow-hidden rounded-lg bg-bg-subtle">
            <img src={l.thumbnail} alt="" className="aspect-video w-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
            <span className="tabular absolute bottom-1 right-1 rounded bg-black/80 px-1 text-[10.5px] font-medium text-white">{l.minutes} min</span>
          </span>
          <span className="min-w-0">
            <span className="line-clamp-2 text-[13px] font-medium leading-snug text-ink group-hover:underline">{l.title}</span>
            <span className="mt-0.5 block truncate text-[12px] text-muted">
              {l.channel} · {formatViews(l.views)} views{l.helpfulPct != null ? ` · ${l.helpfulPct}% of Merit students found it helpful` : ""}
            </span>
          </span>
        </LessonLink>
      ))}
    </div>
  );
}

function Quiz({ quiz, onAsk }: { quiz: QuizCard; onAsk: (t: string) => void }) {
  const [picked, setPicked] = useState<Record<number, number>>({});
  const answered = Object.keys(picked).length;
  const correct = quiz.questions.filter((q, i) => picked[i] === q.answer).length;
  return (
    <div className="overflow-hidden rounded-2xl bg-surface ring-2 ring-line">
      <p className="border-b border-line px-4 py-3 text-[14px] font-semibold text-ink">{quiz.title}</p>
      <ol className="divide-y divide-line">
        {quiz.questions.map((q, i) => {
          const choice = picked[i];
          const done = choice !== undefined;
          return (
            <li key={i} className="px-4 py-4">
              <p className="text-[14.5px] font-medium text-ink">
                {i + 1}. {q.stem}
              </p>
              <div className="mt-3 grid gap-1.5">
                {q.choices.map((c, j) => (
                  <button
                    key={j}
                    disabled={done}
                    onClick={() => setPicked((p) => ({ ...p, [i]: j }))}
                    className={cn(
                      "flex items-start gap-2.5 rounded-lg px-3 py-2 text-left text-[14px] ring-1 transition-colors",
                      !done && "ring-line hover:bg-bg-subtle",
                      done && j === q.answer && "bg-positive-soft ring-positive",
                      done && j === choice && j !== q.answer && "bg-danger-soft ring-danger",
                      done && j !== choice && j !== q.answer && "opacity-60 ring-line",
                    )}
                  >
                    <span className="tabular mt-px font-semibold text-muted">{String.fromCharCode(65 + j)}</span>
                    <span className="flex-1 text-ink">{c}</span>
                    {done && j === q.answer ? <Check className="size-4 text-positive" /> : done && j === choice ? <X className="size-4 text-danger" /> : null}
                  </button>
                ))}
              </div>
              {done ? <p className="mt-2 text-[13px] leading-relaxed text-ink-2">{q.explanation}</p> : null}
            </li>
          );
        })}
      </ol>
      {answered === quiz.questions.length ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-3">
          <p className="text-[14px] font-semibold text-ink">
            {correct}/{quiz.questions.length} correct
          </p>
          <div className="flex gap-2">
            {correct < quiz.questions.length ? (
              <button onClick={() => onAsk(`I missed ${quiz.questions.length - correct} on "${quiz.title}". Explain what I got wrong and give me a couple more like those.`)} className="h-8 rounded-full bg-accent px-3 text-[13px] font-medium text-white">
                Explain my mistakes
              </button>
            ) : null}
            <button onClick={() => onAsk(`Give me a harder quiz on the same topic as "${quiz.title}".`)} className="h-8 rounded-full bg-bg-subtle px-3 text-[13px] font-medium text-ink hover:bg-line">
              Harder quiz
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
