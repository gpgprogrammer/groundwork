"use client";

import { Check, ClipboardPaste, ExternalLink, Loader2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { connectCalendarUrl, findBlackbaud, findMySchool, importIcsFile, previewImport, saveImport, type PreviewResult, type ScheduleResult } from "@/app/actions/schedule";
import type { Candidate } from "@/lib/extract-events";
import type { SchoolPortal } from "@/lib/school-detect";
import { cn } from "./ui";

const LMS = /(myschoolapp|blackbaud|instructure|schoology|veracross|brightspace|d2l|moodle)\./i;
const isLink = (t: string) => /^(webcal|https?):\/\/\S+$/i.test(t.trim());
const SYSTEM: Record<SchoolPortal["system"], string> = { blackbaud: "Blackbaud", canvas: "Canvas", schoology: "Schoology" };
const OTHERS = [
  { name: "Canvas", href: "https://canvas.instructure.com/calendar" },
  { name: "Schoology", href: "https://app.schoology.com/calendar" },
  { name: "Google Classroom", href: "https://classroom.google.com/a/not-turned-in/all" },
];
/** Where each system keeps its "subscribe" link, for students who want automatic updates. */
const SYNC_HELP: Record<string, string> = {
  blackbaud: "In your Blackbaud calendar, click the feed icon (it looks like a Wi-Fi symbol), choose your feed, and copy the link.",
  canvas: "In Canvas Calendar, click “Calendar Feed” at the bottom right and copy the link.",
  schoology: "In your Schoology calendar, click the iCal / Export icon and copy the link.",
  other: "In your calendar's settings, look for “Subscribe”, “iCal”, or “Secret address in iCal format” and copy the link.",
};

type Preview = Extract<PreviewResult, { ok: true }>;

/**
 * Connecting a schedule, as simply as we could make it:
 * 1. Google Calendar in one click (when enabled), or
 * 2. open your school calendar, select all, copy, and paste here.
 * The same box takes a calendar link (which stays in sync), a PDF, a screenshot, or an .ics file.
 */
export function ScheduleSetup({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const [portal, setPortal] = useState<SchoolPortal | null | undefined>(undefined);
  const [prefix, setPrefix] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [result, setResult] = useState<Extract<ScheduleResult, { ok: true }> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [showSync, setShowSync] = useState(false);
  const [pending, start] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);
  const handle = useRef<(data: { text?: string; files?: File[] }) => void>(() => {});

  useEffect(() => {
    let live = true;
    findMySchool()
      .then((p) => live && setPortal(p))
      .catch(() => live && setPortal(null));
    return () => {
      live = false;
    };
  }, []);

  const done = (r: ScheduleResult) => {
    if (!r.ok) return setError(r.error);
    setError(null);
    setPreview(null);
    setResult(r);
    // The page switches to the connected view; carry the confirmation along.
    router.replace(`/schedule?${new URLSearchParams({ added: String(r.added), from: r.label })}`, { scroll: false });
    router.refresh();
  };

  /** Anything pasted or dropped: a link, copied calendar text, or files. */
  const take = ({ text, files }: { text?: string; files?: File[] }) => {
    setError(null);
    setResult(null);
    start(async () => {
      if (files?.length) {
        const ics = files.find((f) => /\.ics$/i.test(f.name) || f.type === "text/calendar");
        const fd = new FormData();
        if (ics) {
          fd.append("file", ics);
          return done(await importIcsFile(fd));
        }
        for (const f of files) fd.append("file", f);
        return show(await previewImport(fd));
      }
      const t = (text ?? "").trim();
      if (!t) return;
      if (isLink(t)) return done(await connectCalendarUrl(t, LMS.test(t)));
      const fd = new FormData();
      fd.append("text", t);
      show(await previewImport(fd));
    });
  };

  const show = (r: PreviewResult) => {
    if (!r.ok) return setError(r.error);
    setPreview(r);
    setPicked(new Set(r.candidates.map((c, i) => (c.suggested ? i : -1)).filter((i) => i >= 0)));
  };

  useEffect(() => {
    handle.current = take;
  });

  // Paste anywhere on the page (outside other text boxes).
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      // Let other text boxes keep their own paste.
      if (e.target instanceof Element && e.target.closest("input, textarea, [contenteditable]")) return;
      const files = [...(e.clipboardData?.files ?? [])];
      const text = e.clipboardData?.getData("text") ?? "";
      if (!files.length && !text.trim()) return;
      e.preventDefault();
      handle.current({ text, files });
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, []);

  const pasteButton = async () => {
    try {
      const items = await navigator.clipboard.read();
      const files: File[] = [];
      for (const item of items) {
        const img = item.types.find((t) => t.startsWith("image/"));
        if (img) files.push(new File([await item.getType(img)], "screenshot.png", { type: img }));
      }
      if (files.length) return handle.current({ files });
      handle.current({ text: await navigator.clipboard.readText() });
    } catch {
      setError("Your browser didn't let Merit read the clipboard. Press ⌘V (or Ctrl+V) on this page instead.");
    }
  };

  const open = (href: string) => window.open(href, "_blank", "noopener");
  const system = portal?.system ?? "other";

  return (
    <div className="@container space-y-5">
      {googleEnabled ? (
        <>
          <a href="/api/calendar/google/start" className="press flex items-center gap-4 rounded-3xl border-2 border-line bg-surface p-4 [--ledge:var(--line)] hover:bg-bg-subtle">
            <GoogleMark />
            <span className="min-w-0 flex-1">
              <span className="block font-brand text-[16px] font-extrabold text-ink">Connect Google Calendar</span>
              <span className="block text-[13px] text-muted">One click. Includes Google Classroom, and stays in sync on its own.</span>
            </span>
            <span className="press-sm hidden h-10 items-center rounded-xl bg-[#15803d] px-4 font-brand text-sm font-extrabold text-white [--ledge:#0f5c2b] sm:inline-flex">Connect</span>
          </a>
          <p className="flex items-center gap-3 text-center font-brand text-[12.5px] font-extrabold uppercase tracking-wide text-muted">
            <span className="h-0.5 flex-1 rounded-full bg-line" /> or copy and paste your school calendar <span className="h-0.5 flex-1 rounded-full bg-line" />
          </p>
        </>
      ) : null}

      <ol className="grid gap-3 @xl:grid-cols-[1.5fr_1fr_1fr]">
        <Step n={1} title="Open your calendar">
          {portal === undefined ? (
            <Loader2 className="size-4 animate-spin text-muted" />
          ) : portal ? (
            <button type="button" onClick={() => open(portal.calendarUrl)} className="press-sm inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#15803d] px-3.5 font-brand text-[13.5px] font-extrabold text-white [--ledge:#0f5c2b] hover:brightness-110">
              Open my {SYSTEM[portal.system]} calendar <ExternalLink className="size-3.5" />
            </button>
          ) : (
            <div className="space-y-1.5">
              <form
                className="flex h-11 items-center gap-1 rounded-xl bg-surface pl-3 pr-1 text-[13px] ring-2 ring-inset ring-line-strong focus-within:ring-positive"
                onSubmit={(e) => {
                  e.preventDefault();
                  start(async () => {
                    const p = await findBlackbaud(prefix);
                    if (p) {
                      setPortal(p);
                      open(p.calendarUrl);
                    } else setError(`We couldn't find ${prefix}.myschoolapp.com. Check the address you use to sign in to your school portal.`);
                  });
                }}
              >
                <input value={prefix} onChange={(e) => setPrefix(e.target.value)} placeholder="yourschool" aria-label="Your school's Blackbaud address" className="h-8 w-24 min-w-0 flex-1 bg-transparent outline-none" />
                <span className="shrink-0 text-[12px] text-muted">.myschoolapp.com</span>
                <button className="ml-1 h-8 rounded-lg bg-[#15803d] px-3 font-brand text-[13px] font-extrabold text-white disabled:opacity-50" disabled={!prefix.trim()}>
                  Open
                </button>
              </form>
              <p className="text-[12.5px] text-muted">
                Not Blackbaud?{" "}
                {OTHERS.map((o, i) => (
                  <span key={o.name}>
                    <button type="button" onClick={() => open(o.href)} className="font-semibold text-positive hover:underline">
                      {o.name}
                    </button>
                    {i < OTHERS.length - 1 ? " · " : ""}
                  </span>
                ))}
              </p>
            </div>
          )}
        </Step>
        <Step n={2} title="Select all and copy">
          <p className="flex flex-wrap items-center gap-1.5 text-sm text-ink-2">
            Press <Kbd>⌘A</Kbd> then <Kbd>⌘C</Kbd>
          </p>
          <p className="mt-2 text-[12.5px] text-muted">On Windows: Ctrl+A, Ctrl+C</p>
        </Step>
        <Step n={3} title="Paste it here">
          <p className="flex flex-wrap items-center gap-1.5 text-sm text-ink-2">
            Come back and press <Kbd>⌘V</Kbd>
          </p>
          <p className="mt-2 text-[12.5px] text-muted">Anywhere on this page</p>
        </Step>
      </ol>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handle.current({ files: [...e.dataTransfer.files] });
        }}
        className={cn(
          "flex min-h-56 flex-col items-center justify-center rounded-3xl border-[3px] border-dashed px-5 py-9 text-center transition-[background-color,border-color,transform] duration-200",
          dragging ? "scale-[1.01] border-positive bg-positive-soft" : "border-line-strong bg-bg-subtle/50",
        )}
      >
        {pending ? (
          <p className="flex items-center gap-3 font-brand text-[17px] font-extrabold text-ink" role="status">
            <Loader2 className="size-6 animate-spin text-positive" /> Reading your calendar…
          </p>
        ) : (
          <>
            <span aria-hidden className="mb-4 flex size-16 items-center justify-center rounded-3xl bg-positive-soft text-positive">
              <ClipboardPaste className="size-8" strokeWidth={2.2} />
            </span>
            <button type="button" onClick={pasteButton} className="press inline-flex h-14 items-center gap-2.5 rounded-2xl bg-[#15803d] px-7 font-brand text-[17px] font-extrabold text-white [--ledge:#0f5c2b] hover:brightness-110">
              <ClipboardPaste className="size-5" /> Paste my calendar
            </button>
            <p className="mt-4 max-w-md text-[13.5px] leading-relaxed text-muted">
              Also works with a calendar link, a screenshot, a PDF, or an .ics file.{" "}
              <button type="button" onClick={() => fileInput.current?.click()} className="inline-flex items-center gap-1 font-bold text-positive hover:underline">
                <Upload className="size-3.5" /> Choose a file
              </button>
            </p>
            <input
              ref={fileInput}
              type="file"
              multiple
              accept=".pdf,.csv,.txt,.ics,image/*,application/pdf,text/csv,text/calendar"
              className="sr-only"
              aria-label="Choose a calendar file"
              onChange={(e) => {
                const files = [...(e.target.files ?? [])];
                e.target.value = "";
                if (files.length) handle.current({ files });
              }}
            />
          </>
        )}
      </div>

      {error ? (
        <p className="fade rounded-2xl bg-danger-soft px-4 py-3 text-sm font-semibold text-danger" role="alert">
          {error}
        </p>
      ) : null}
      {result ? (
        <p className="fade flex items-start gap-2 rounded-2xl bg-positive-soft px-4 py-3 text-sm font-semibold text-positive" role="status">
          <Check className="check-pop mt-0.5 size-4 shrink-0" strokeWidth={3} />
          Added {result.added} {result.added === 1 ? "test or assignment" : "tests and assignments"} from {result.label}.
        </p>
      ) : null}

      {preview ? (
        <div className="pop overflow-hidden rounded-3xl bg-surface ring-2 ring-line">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-line bg-positive-soft px-4 py-3.5">
            <p className="font-brand text-[15px] font-extrabold text-ink">
              We found {preview.candidates.length} dated {preview.candidates.length === 1 ? "item" : "items"}. Check the ones to add.
            </p>
            <div className="flex gap-1.5 font-brand text-[13px] font-extrabold">
              <button type="button" className="h-8 rounded-lg bg-surface px-3 text-positive ring-2 ring-inset ring-line" onClick={() => setPicked(new Set(preview.candidates.map((_, i) => i)))}>
                All
              </button>
              <button type="button" className="h-8 rounded-lg bg-surface px-3 text-muted ring-2 ring-inset ring-line" onClick={() => setPicked(new Set())}>
                None
              </button>
            </div>
          </div>
          <ul className="max-h-80 divide-y-2 divide-line overflow-y-auto">
            {preview.candidates.map((c: Candidate, i) => (
              <li key={i}>
                <label className="flex min-h-12 cursor-pointer items-center gap-3 px-4 py-2.5 text-sm hover:bg-bg-subtle">
                  <input
                    type="checkbox"
                    checked={picked.has(i)}
                    onChange={() =>
                      setPicked((p) => {
                        const n = new Set(p);
                        if (n.has(i)) n.delete(i);
                        else n.add(i);
                        return n;
                      })
                    }
                    className="size-5 shrink-0 accent-[#15803d]"
                  />
                  <span className="tabular w-24 shrink-0 text-[12.5px] text-muted">{new Date(`${c.date}T12:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
                  <span className="min-w-0 flex-1 truncate font-semibold text-ink">{c.title}</span>
                  {c.kind === "test" || c.kind === "assignment" ? (
                    <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 font-brand text-[11.5px] font-extrabold", c.kind === "test" ? "bg-sprint-soft text-sprint-ink" : "bg-accent-soft text-accent-ink")}>{c.kind === "test" ? "Test" : "Due"}</span>
                  ) : null}
                </label>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-end border-t-2 border-line px-4 py-3.5">
            <button
              type="button"
              className="press inline-flex h-12 items-center rounded-2xl bg-[#15803d] px-6 font-brand text-[15.5px] font-extrabold text-white [--ledge:#0f5c2b] hover:brightness-110 disabled:pointer-events-none disabled:opacity-50"
              disabled={pending || !picked.size}
              onClick={() =>
                start(async () => {
                  let tz = "America/New_York";
                  try {
                    tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                  } catch {}
                  done(await saveImport({ label: preview.label, kind: preview.kind, timezone: tz, items: preview.candidates.filter((_, i) => picked.has(i)) }));
                })
              }
            >
              Add {picked.size} to my schedule
            </button>
          </div>
        </div>
      ) : null}

      <div className="text-[13px]">
        <button type="button" onClick={() => setShowSync((v) => !v)} className="font-bold text-positive hover:underline" aria-expanded={showSync}>
          Want it to update on its own?
        </button>
        {showSync ? (
          <p className="mt-1.5 leading-relaxed text-muted">
            {SYNC_HELP[system]} Then paste the link here. Merit refreshes it every few hours, so new assignments show up by themselves.
          </p>
        ) : (
          <span className="text-muted"> A pasted calendar is a snapshot: paste again anytime to update it.</span>
        )}
      </div>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="rounded-3xl bg-surface p-4 ring-2 ring-line">
      <p className="flex items-center gap-3 font-brand text-[16px] font-extrabold leading-tight text-ink">
        <span className="press-sm tabular flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#15803d] text-[18px] font-black text-white [--ledge:#0f5c2b]">{n}</span> {title}
      </p>
      <div className="mt-3.5">{children}</div>
    </li>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className="inline-flex h-7 min-w-7 items-center justify-center rounded-lg border-2 border-b-4 border-line-strong bg-surface px-1.5 font-brand text-[13px] font-extrabold text-ink">{children}</kbd>;
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="size-9 shrink-0" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
    </svg>
  );
}
