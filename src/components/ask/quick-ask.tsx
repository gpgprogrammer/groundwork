"use client";

import { Maximize2, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { cn } from "../ui";

// The chat client (AI SDK, markdown) only loads the first time someone opens the panel.
const Chat = dynamic(() => import("./chat").then((m) => m.Chat), {
  ssr: false,
  loading: () => (
    <div className="space-y-3 p-4" aria-label="Loading Merit AI">
      <div className="skeleton size-9 rounded-xl" />
      <div className="skeleton h-5 w-2/3 rounded-full" />
      <div className="skeleton h-11 w-full rounded-2xl" />
      <div className="skeleton h-11 w-full rounded-2xl" />
    </div>
  ),
});

/** On a topic or course page, suggestions are about what's on screen. */
function pageTitle() {
  return /^\/courses\/[^/]+(\/[^/]+)?$/.test(window.location.pathname) ? (document.querySelector("main h1")?.textContent?.trim() ?? null) : null;
}

const GENERIC = ["Explain the chain rule like I'm new to it", "Quiz me on cellular respiration", "What's on the AP Psychology exam?", "Find a 10-minute video on the Cold War"];

/** Floating "Ask Merit" button and panel, available on every page. */
export function QuickAsk() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key.toLowerCase() === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setTitle(pageTitle());
        setOpen((o) => !o);
      }
    };
    const onOpen = () => {
      setTitle(pageTitle());
      setOpen(true);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("merit:ask", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("merit:ask", onOpen);
    };
  }, []);


  if (pathname === "/ask") return null;
  const suggestions = title
    ? [`Explain ${title} simply`, `Quiz me on ${title}`, `What are the most common mistakes on ${title}?`, `Find the best short video on ${title}`]
    : GENERIC;

  return (
    <>
      <button
        onClick={() => {
          setTitle(pageTitle());
          setOpen((o) => !o);
        }}
        className={cn(
          "press fixed bottom-6 right-6 z-40 hidden h-12 items-center gap-2 rounded-2xl bg-[#db2777] pl-4 pr-5 font-brand text-[15px] font-extrabold text-white [--ledge:#9d174d] hover:brightness-110 md:flex",
        )}
        aria-expanded={open}
        aria-controls="quick-ask"
      >
        {open ? <X className="size-5" /> : <Sparkles className="size-5" />}
        {open ? "Close" : "Ask Merit"}
      </button>
      {open ? (
        <div
          id="quick-ask"
          role="dialog"
          aria-label="Ask Merit AI"
          className="dialog-in fixed inset-x-0 bottom-0 top-16 z-50 flex origin-bottom-right flex-col overflow-hidden overscroll-contain rounded-t-3xl bg-surface shadow-lift ring-1 ring-line sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[min(640px,calc(100dvh-8rem))] sm:w-[420px] sm:rounded-[28px]"
        >
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-line px-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-ink">
              <span className="flex size-7 items-center justify-center rounded-full bg-accent-soft"><Sparkles className="size-4 text-accent-ink" /></span> Merit AI
            </p>
            <div className="flex items-center gap-1">
              <Link href="/ask" onClick={() => setOpen(false)} className="flex size-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-bg-subtle hover:text-ink" aria-label="Open full page" title="Open full page">
                <Maximize2 className="size-4" />
              </Link>
              <button onClick={() => setOpen(false)} className="flex size-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-bg-subtle hover:text-ink" aria-label="Close">
                <X className="size-4" />
              </button>
            </div>
          </div>
          <div className="min-h-0 flex-1">
            <Chat compact suggestions={suggestions} autoFocus placeholder={title ? `Ask about ${title}…` : undefined} />
          </div>
        </div>
      ) : null}
    </>
  );
}

/** A button anywhere on the page that opens the quick panel. */
export function OpenAskButton({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event("merit:ask"))} className={className}>
      {children}
    </button>
  );
}
