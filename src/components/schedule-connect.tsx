"use client";

import { Check, ClipboardPaste, FileText, Link2, Loader2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { connectCalendarUrl, importIcsFile, previewImport, saveImport, type PreviewResult, type ScheduleResult } from "@/app/actions/schedule";
import type { Candidate } from "@/lib/extract-events";
import { inputClass } from "./form";
import { Button, cn } from "./ui";

/** Where to find the subscribe link in each system schools use. */
const PROVIDERS: { name: string; steps: string[] }[] = [
  {
    name: "Blackbaud (myschoolapp)",
    steps: [
      "Sign in to your school's Blackbaud site and open Calendar.",
      "In the calendar's filters, make sure your classes and Assignments are turned on.",
      "Click the feed icon (it looks like a Wi-Fi symbol) at the top right, then “Individual Filter Feeds” or “My Calendars”.",
      "Copy the iCal / webcal link and paste it here.",
    ],
  },
  { name: "Canvas", steps: ["Open Calendar in Canvas.", "Click “Calendar Feed” at the bottom right.", "Copy the link it shows."] },
  { name: "Schoology", steps: ["Open your Schoology Calendar.", "Click the iCal / Export icon above the calendar.", "Copy the feed URL."] },
  { name: "Veracross", steps: ["Open your student or parent portal and go to Calendar.", "Choose “Subscribe” (or the calendar feed icon).", "Copy the iCal link."] },
  {
    name: "Google Classroom",
    steps: [
      "Classroom puts due dates on a calendar named after each class in Google Calendar.",
      "In Google Calendar on a computer, open Settings, pick that class calendar, and scroll to “Integrate calendar”.",
      "Copy the “Secret address in iCal format”. Repeat for each class.",
    ],
  },
  {
    name: "Google Calendar",
    steps: ["Open Google Calendar on a computer → gear icon → Settings.", "Under “Settings for my calendars,” choose the calendar.", "Copy the “Secret address in iCal format.”"],
  },
  { name: "Microsoft Outlook / Teams", steps: ["Open Outlook on the web → Settings → Calendar → Shared calendars.", "Under “Publish a calendar,” pick the calendar and “Can view all details.”", "Copy the ICS link."] },
  { name: "Apple Calendar (iCloud)", steps: ["In Calendar, right-click the calendar and choose Share Calendar.", "Check “Public Calendar” and copy the webcal:// link."] },
  { name: "PowerSchool", steps: ["Many PowerSchool schools use Schoology or Canvas for assignments; connect that instead.", "If your school's portal offers “Export” or “Subscribe” on its calendar, copy that link here, or save the calendar as a PDF and use Upload a PDF."] },
  { name: "Brightspace (D2L)", steps: ["Open Calendar in Brightspace.", "Choose “Subscribe” and copy the calendar feed URL."] },
  { name: "Moodle", steps: ["Open Calendar → “Export calendar”.", "Choose events and a time period, then “Get calendar URL” and copy it."] },
];

type Mode = "link" | "ics" | "doc" | "paste";

export function ScheduleConnect({ onDone, compact }: { onDone?: (r: Extract<ScheduleResult, { ok: true }>) => void; compact?: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("link");
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<ScheduleResult | null>(null);
  const [preview, setPreview] = useState<Extract<PreviewResult, { ok: true }> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [help, setHelp] = useState<string | null>("Blackbaud (myschoolapp)");
  const [pending, start] = useTransition();

  const finish = (r: ScheduleResult) => {
    setResult(r);
    setError(r.ok ? null : r.error);
    if (r.ok) {
      setPreview(null);
      onDone?.(r);
      router.refresh();
    }
  };

  const runPreview = (fd: FormData) =>
    start(async () => {
      setResult(null);
      const r = await previewImport(fd);
      if (!r.ok) {
        setError(r.error);
        setPreview(null);
        return;
      }
      setError(null);
      setPreview(r);
      setPicked(new Set(r.candidates.map((c, i) => (c.suggested ? i : -1)).filter((i) => i >= 0)));
    });

  const tabs: [Mode, string, typeof Link2][] = [
    ["link", "Calendar link", Link2],
    ["ics", "Upload .ics", Upload],
    ["doc", "Upload a PDF or CSV", FileText],
    ["paste", "Paste text", ClipboardPaste],
  ];

  return (
    <div>
      <div className="flex flex-wrap gap-1 rounded-2xl bg-bg-subtle p-1 text-sm font-medium">
        {tabs.map(([k, label, Icon]) => (
          <button
            key={k}
            type="button"
            onClick={() => (setMode(k), setResult(null), setError(null), setPreview(null))}
            className={cn("flex h-8 items-center gap-1.5 rounded-xl px-3 transition-colors", mode === k ? "bg-bg text-ink shadow-soft" : "text-muted hover:text-ink")}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>

      {mode === "link" ? (
        <form
          className="mt-4 flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            start(async () => finish(await connectCalendarUrl(url)));
          }}
        >
          <input value={url} onChange={(e) => setUrl(e.target.value)} required inputMode="url" placeholder="webcal://yourschool.myschoolapp.com/… or https://…ics" className={cn(inputClass, "h-11 rounded-full px-4")} aria-label="Calendar link" />
          <Button type="submit" size="lg" disabled={pending || !url.trim()} className="shrink-0">
            {pending ? "Connecting…" : "Connect"}
          </Button>
        </form>
      ) : mode === "ics" ? (
        <form
          className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            start(async () => finish(await importIcsFile(fd)));
          }}
        >
          <FilePick name="file" accept=".ics,text/calendar" label="Choose a .ics file exported from any calendar" />
          <Button type="submit" size="lg" disabled={pending} className="shrink-0">
            {pending ? "Importing…" : "Import"}
          </Button>
        </form>
      ) : mode === "doc" ? (
        <form
          className="mt-4 space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            runPreview(new FormData(e.currentTarget));
          }}
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <FilePick name="file" accept=".pdf,.csv,.txt,application/pdf,text/csv,text/plain" label="Choose a PDF or CSV (for example Blackbaud's calendar or Assignment Center, printed to PDF)" />
            <Button type="submit" size="lg" disabled={pending} className="shrink-0">
              {pending ? "Reading…" : "Read it"}
            </Button>
          </div>
          <p className="text-xs text-muted">You&apos;ll review every item before anything is added.</p>
        </form>
      ) : (
        <form
          className="mt-4 space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            runPreview(new FormData(e.currentTarget));
          }}
        >
          <textarea
            name="text"
            required
            rows={7}
            className={cn(inputClass, "h-auto py-3 text-[13.5px] leading-relaxed")}
            placeholder={"Copy your assignments or calendar list from your school portal and paste it here, e.g.\n\nThu, Sep 24   AP Bio: Unit 3 Test\n9/26   Calc BC Problem Set 4 due"}
          />
          <Button type="submit" size="lg" disabled={pending}>
            {pending ? "Reading…" : "Find the dates"}
          </Button>
        </form>
      )}

      {pending && (mode === "doc" || mode === "paste") ? (
        <p className="mt-3 flex items-center gap-2 text-sm text-muted">
          <Loader2 className="size-4 animate-spin" /> Reading your calendar…
        </p>
      ) : null}

      {preview ? (
        <div className="mt-5 rounded-2xl ring-1 ring-line">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
            <p className="text-sm font-semibold text-ink">
              We found {preview.candidates.length} dated {preview.candidates.length === 1 ? "item" : "items"}. Check the ones to add.
            </p>
            <div className="flex gap-2 text-[12.5px]">
              <button type="button" className="font-medium text-accent" onClick={() => setPicked(new Set(preview.candidates.map((_, i) => i)))}>
                All
              </button>
              <button type="button" className="font-medium text-muted" onClick={() => setPicked(new Set())}>
                None
              </button>
            </div>
          </div>
          <ul className="max-h-80 divide-y divide-line overflow-y-auto">
            {preview.candidates.map((c: Candidate, i) => (
              <li key={i}>
                <label className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm hover:bg-bg-subtle">
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
                    className="size-4 accent-[var(--accent)]"
                  />
                  <span className="tabular w-24 shrink-0 text-[12.5px] text-muted">
                    {new Date(`${c.date}T12:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    {c.time ? ` ${c.time}` : ""}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-ink">{c.title}</span>
                  {c.kind === "test" || c.kind === "assignment" ? (
                    <span className={cn("shrink-0 rounded px-1.5 py-0.5 text-[10.5px] font-bold uppercase", c.kind === "test" ? "bg-[#fde8e8] text-[#b42318]" : "bg-bg-subtle text-ink-2")}>{c.kind === "test" ? "Test" : "Due"}</span>
                  ) : null}
                </label>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3">
            <p className="text-[12px] text-muted">{preview.usedAi ? "Read with Merit AI." : "Tests and assignments are pre-checked."}</p>
            <Button
              disabled={pending || !picked.size}
              onClick={() =>
                start(async () => {
                  let tz = "America/New_York";
                  try {
                    tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                  } catch {}
                  finish(await saveImport({ label: preview.label, kind: preview.kind, timezone: tz, items: preview.candidates.filter((_, i) => picked.has(i)) }));
                })
              }
            >
              Add {picked.size} to my schedule
            </Button>
          </div>
        </div>
      ) : null}

      {result?.ok ? (
        <p className="mt-3 flex items-start gap-2 text-sm text-positive" role="status">
          <Check className="mt-0.5 size-4 shrink-0" />
          Connected {result.label}. Added {result.added} {result.added === 1 ? "test or assignment" : "tests and assignments"}
          {result.tests ? ` (${result.tests} tests)` : ""}.
        </p>
      ) : null}
      {error ? (
        <p className="mt-3 text-sm text-[#c2410c]" role="alert">
          {error}
        </p>
      ) : null}

      {mode === "link" ? (
        <div className={cn("mt-5", compact && "mt-4")}>
          <p className="text-[13px] font-medium text-ink-2">Where to find your calendar link</p>
          <div className="mt-2 divide-y divide-line overflow-hidden rounded-xl ring-1 ring-line">
            {PROVIDERS.map((p) => (
              <div key={p.name}>
                <button
                  type="button"
                  onClick={() => setHelp((h) => (h === p.name ? null : p.name))}
                  className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-ink hover:bg-bg-subtle"
                  aria-expanded={help === p.name}
                >
                  {p.name}
                  <span className="text-muted">{help === p.name ? "−" : "+"}</span>
                </button>
                {help === p.name ? (
                  <ol className="list-decimal space-y-1 bg-bg-subtle/50 px-4 py-3 pl-9 text-[13px] leading-relaxed text-ink-2">
                    {p.steps.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ol>
                ) : null}
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            You can connect several calendars (for example Blackbaud for assignments and Google for your schedule). Links stay private to your account. Merit only keeps tests, quizzes, and assignments.
          </p>
        </div>
      ) : null}
    </div>
  );
}

function FilePick({ name, accept, label }: { name: string; accept: string; label: string }) {
  const [file, setFile] = useState<string | null>(null);
  return (
    <label className="flex h-11 min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-full border border-dashed border-line-strong px-4 text-sm text-muted hover:border-ink">
      <Upload className="size-4 shrink-0" />
      <span className="truncate">{file ?? label}</span>
      <input type="file" name={name} accept={accept} required className="sr-only" onChange={(e) => setFile(e.target.files?.[0]?.name ?? null)} />
    </label>
  );
}
