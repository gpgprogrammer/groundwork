"use client";

import { Maximize2, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "../ui";
import { Chat } from "./chat";

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
          "fixed bottom-5 right-5 z-40 flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-[#4287f5] to-[#2346c7] pl-4 pr-5 text-sm font-semibold text-white shadow-lift transition-transform hover:scale-[1.03]",
          open && "max-sm:hidden",
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
          className="fade fixed inset-x-0 bottom-0 top-14 z-50 flex flex-col bg-surface sm:inset-auto sm:bottom-20 sm:right-5 sm:h-[min(640px,calc(100vh-7rem))] sm:w-[420px] sm:rounded-2xl sm:shadow-lift sm:ring-1 sm:ring-line"
        >
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-line px-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Sparkles className="size-4 text-accent" /> Merit AI
            </p>
            <div className="flex items-center gap-1">
              <Link href="/ask" onClick={() => setOpen(false)} className="flex size-8 items-center justify-center rounded-full hover:bg-bg-subtle" aria-label="Open full page" title="Open full page">
                <Maximize2 className="size-4" />
              </Link>
              <button onClick={() => setOpen(false)} className="flex size-8 items-center justify-center rounded-full hover:bg-bg-subtle" aria-label="Close">
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
