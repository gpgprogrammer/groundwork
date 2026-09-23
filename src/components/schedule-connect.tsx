"use client";

import { Check, ChevronDown, Link2, Upload } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { syncCalendarFile, syncCalendarUrl, type ScheduleResult } from "@/app/actions/learning";
import { inputClass } from "./form";
import { Button, cn } from "./ui";

const PROVIDERS = [
  {
    name: "Google Calendar",
    steps: [
      "Open Google Calendar on a computer and click the gear icon, then Settings.",
      "Under “Settings for my calendars,” choose your school or class calendar.",
      "Scroll to “Integrate calendar” and copy the “Secret address in iCal format.”",
    ],
  },
  {
    name: "Canvas",
    steps: ["Open Calendar in Canvas.", "Click “Calendar Feed” at the bottom right of the page.", "Copy the link it shows."],
  },
  {
    name: "Schoology",
    steps: ["Open your Schoology Calendar.", "Click the iCal / Export icon above the calendar.", "Copy the feed URL."],
  },
  {
    name: "Apple Calendar",
    steps: ["In the Calendar app, right-click the calendar and choose Share Calendar.", "Check “Public Calendar” and copy the webcal:// link."],
  },
  {
    name: "Outlook",
    steps: ["Open Outlook on the web → Settings → Calendar → Shared calendars.", "Under “Publish a calendar,” choose your calendar and copy the ICS link."],
  },
];

export function ScheduleConnect({ onDone, compact }: { onDone?: (r: Extract<ScheduleResult, { ok: true }>) => void; compact?: boolean }) {
  const [mode, setMode] = useState<"link" | "file">("link");
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<ScheduleResult | null>(null);
  const [help, setHelp] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const finish = (r: ScheduleResult) => {
    setResult(r);
    if (r.ok) onDone?.(r);
  };

  return (
    <div>
      <div className="inline-flex rounded-full bg-bg-subtle p-1 text-sm font-medium">
        {(
          [
            ["link", "Calendar link", <Link2 key="l" className="size-4" />],
            ["file", "Upload .ics file", <Upload key="u" className="size-4" />],
          ] as const
        ).map(([k, label, icon]) => (
          <button
            key={k}
            type="button"
            onClick={() => (setMode(k), setResult(null))}
            className={cn("flex h-8 items-center gap-1.5 rounded-full px-3.5 transition-colors", mode === k ? "bg-bg text-ink shadow-soft" : "text-muted hover:text-ink")}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {mode === "link" ? (
        <form
          className="mt-4 flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            start(async () => finish(await syncCalendarUrl(url)));
          }}
        >
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            inputMode="url"
            placeholder="https://calendar.google.com/calendar/ical/…/basic.ics"
            className={cn(inputClass, "h-11 rounded-full px-4")}
            aria-label="Calendar link"
          />
          <Button type="submit" size="lg" disabled={pending || !url.trim()} className="shrink-0">
            {pending ? "Syncing…" : "Sync calendar"}
          </Button>
        </form>
      ) : (
        <form
          className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            start(async () => finish(await syncCalendarFile(fd)));
          }}
        >
          <label className="flex h-11 flex-1 cursor-pointer items-center gap-3 rounded-full border border-dashed border-line-strong px-4 text-sm text-muted hover:border-ink">
            <Upload className="size-4 shrink-0" />
            <span className="truncate" id="file-label">
              Choose a .ics file exported from any calendar
            </span>
            <input
              ref={fileRef}
              type="file"
              name="file"
              accept=".ics,text/calendar"
              required
              className="sr-only"
              onChange={(e) => {
                const label = document.getElementById("file-label");
                if (label) label.textContent = e.target.files?.[0]?.name ?? "Choose a .ics file";
              }}
            />
          </label>
          <Button type="submit" size="lg" disabled={pending} className="shrink-0">
            {pending ? "Importing…" : "Import"}
          </Button>
        </form>
      )}

      {result ? (
        result.ok ? (
          <p className="mt-3 flex items-start gap-2 text-sm text-positive" role="status">
            <Check className="mt-0.5 size-4 shrink-0" />
            Synced. Found {result.total} school events ({result.upcoming} upcoming), {result.matched} matched to specific topics.
          </p>
        ) : (
          <p className="mt-3 text-sm text-[#c2410c]" role="alert">
            {result.error}
          </p>
        )
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
                  <ChevronDown className={cn("size-4 text-muted transition-transform", help === p.name && "rotate-180")} />
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
            Your link is private to your account. We only read event titles and dates to find what you&apos;re studying.
          </p>
        </div>
      ) : null}
    </div>
  );
}
