"use client";

import { ClipboardPaste, ExternalLink, Loader2, Search } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { findBlackbaud, findMySchool } from "@/app/actions/schedule";
import type { SchoolPortal } from "@/lib/school-detect";
import { cn } from "./ui";

const LMS = /(myschoolapp|blackbaud|instructure|schoology|veracross|brightspace|d2l|moodle)\./i;
export const isSchoolLms = (url: string) => LMS.test(url);
export const looksLikeFeed = (t: string) => /^(webcal|https?):\/\/\S+$/i.test(t.trim()) && (/\.ics\b|ical|webcal|calendar|feed/i.test(t) || LMS.test(t));

const OTHER: { name: string; href: string; tip: string }[] = [
  { name: "Google Calendar / Classroom", href: "https://calendar.google.com/calendar/u/0/r/settings", tip: "Pick your calendar (Classroom makes one per class), scroll to “Integrate calendar,” and copy “Secret address in iCal format.”" },
  { name: "Outlook", href: "https://outlook.office.com/calendar/options/calendar/SharedCalendars", tip: "Under “Publish a calendar,” pick the calendar, choose “Can view all details,” publish, and copy the ICS link." },
  { name: "Schoology", href: "https://app.schoology.com/calendar", tip: "Click the iCal / Export icon above the calendar and copy the link." },
];

const TIPS: Record<SchoolPortal["system"], string> = {
  blackbaud: "In Calendar, click the feed icon (it looks like a Wi-Fi symbol) at the top right, choose your filter feed, and copy the link.",
  canvas: "Click “Calendar Feed” at the bottom right and copy the link.",
  schoology: "Click the iCal / Export icon above the calendar and copy the link.",
};
const SYSTEM: Record<SchoolPortal["system"], string> = { blackbaud: "Blackbaud", canvas: "Canvas", schoology: "Schoology" };

/**
 * Two taps: open the school calendar (found for you), copy its feed link, come back
 * and paste. Pasting anywhere on the page connects it.
 */
export function QuickConnect({ onLink, pending }: { onLink: (url: string, school: boolean) => void; pending: boolean }) {
  const [portal, setPortal] = useState<SchoolPortal | null | undefined>(undefined);
  const [prefix, setPrefix] = useState("");
  const [finding, startFind] = useTransition();
  const [opened, setOpened] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const onLinkRef = useRef(onLink);
  useEffect(() => {
    onLinkRef.current = onLink;
  });

  useEffect(() => {
    let live = true;
    findMySchool()
      .then((p) => live && setPortal(p))
      .catch(() => live && setPortal(null));
    return () => {
      live = false;
    };
  }, []);

  // Paste anywhere (outside a text box) connects.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, [contenteditable]")) return;
      const text = e.clipboardData?.getData("text")?.trim() ?? "";
      if (!looksLikeFeed(text)) return;
      e.preventDefault();
      onLinkRef.current(text, isSchoolLms(text));
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, []);

  const pasteFromClipboard = async () => {
    setNote(null);
    try {
      const text = (await navigator.clipboard.readText()).trim();
      if (!text) return setNote("Your clipboard is empty. Copy the calendar's feed link first.");
      if (!/^(webcal|https?):\/\//i.test(text)) return setNote("That isn't a link. Copy the calendar's feed (iCal) link, then tap Paste again.");
      onLink(text, isSchoolLms(text));
    } catch {
      setNote("Your browser blocked reading the clipboard. Press ⌘V / Ctrl+V anywhere on this page instead, or paste into the box below.");
    }
  };

  const open = (href: string) => {
    window.open(href, "_blank", "noopener");
    setOpened(true);
  };

  return (
    <div className="mt-4 rounded-2xl bg-accent-soft/60 p-4 ring-1 ring-accent/20 sm:p-5">
      <ol className="space-y-4">
        <li className="flex gap-3">
          <Step n={1} done={opened} />
          <div className="min-w-0 flex-1">
            {portal === undefined ? (
              <p className="flex items-center gap-2 text-sm text-muted">
                <Loader2 className="size-4 animate-spin" /> Finding your school&apos;s calendar…
              </p>
            ) : portal ? (
              <>
                <button type="button" onClick={() => open(portal.calendarUrl)} className="inline-flex h-11 items-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-white">
                  Open my {SYSTEM[portal.system]} calendar <ExternalLink className="size-4" />
                </button>
                <p className="mt-2 text-[13px] text-ink-2">{TIPS[portal.system]}</p>
                <button type="button" onClick={() => setPortal(null)} className="mt-1 text-[12px] text-muted underline">
                  Not my school
                </button>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-ink">Open your school&apos;s calendar</p>
                <form
                  className="mt-2 flex max-w-md items-center gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    startFind(async () => {
                      const p = await findBlackbaud(prefix);
                      if (p) {
                        setPortal(p);
                        open(p.calendarUrl);
                      } else setNote(`We couldn't find ${prefix}.myschoolapp.com. Check the address in your browser when you sign in to your school portal.`);
                    });
                  }}
                >
                  <label className="flex h-10 min-w-0 flex-1 items-center rounded-full bg-bg px-3 text-sm ring-1 ring-line-strong focus-within:ring-2 focus-within:ring-accent">
                    <span className="sr-only">Your school&apos;s Blackbaud address</span>
                    <input value={prefix} onChange={(e) => setPrefix(e.target.value)} placeholder="yourschool" className="min-w-0 flex-1 bg-transparent outline-none" />
                    <span className="text-muted">.myschoolapp.com</span>
                  </label>
                  <button disabled={!prefix.trim() || finding} className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-accent px-4 text-sm font-semibold text-white disabled:opacity-50">
                    {finding ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />} Open
                  </button>
                </form>
                <p className="mt-1 text-[12px] text-muted">For Blackbaud schools. Not Blackbaud? Open one of these:</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {OTHER.map((o) => (
                    <button key={o.name} type="button" title={o.tip} onClick={() => (open(o.href), setNote(o.tip))} className="inline-flex h-8 items-center gap-1.5 rounded-full bg-bg px-3 text-[13px] font-medium text-ink ring-1 ring-line hover:bg-bg-subtle">
                      {o.name} <ExternalLink className="size-3.5" />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </li>
        <li className="flex gap-3">
          <Step n={2} active={opened} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-ink">Copy the feed link there, then come back and paste</p>
            <button
              type="button"
              onClick={pasteFromClipboard}
              disabled={pending}
              className={cn("mt-2 inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold disabled:opacity-60", opened ? "bg-accent text-white" : "bg-bg text-ink ring-1 ring-line-strong")}
            >
              {pending ? <Loader2 className="size-4 animate-spin" /> : <ClipboardPaste className="size-4" />} {pending ? "Connecting…" : "Paste and connect"}
            </button>
            <p className="mt-1.5 text-[12px] text-muted">Or press ⌘V / Ctrl+V anywhere on this page. Merit refreshes it automatically from then on.</p>
          </div>
        </li>
      </ol>
      {note ? <p className="mt-3 text-[13px] text-ink-2">{note}</p> : null}
    </div>
  );
}

function Step({ n, done, active }: { n: number; done?: boolean; active?: boolean }) {
  return <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-full text-[13px] font-bold", done ? "bg-positive text-white" : active ? "bg-accent text-white" : "bg-bg text-ink ring-1 ring-line-strong")}>{done ? "✓" : n}</span>;
}
