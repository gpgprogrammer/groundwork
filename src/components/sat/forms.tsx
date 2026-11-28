"use client";

import { ArrowRight, Check, ExternalLink, FileUp, Loader2 } from "lucide-react";
import { useActionState, useOptimistic, useRef, useState, useTransition } from "react";
import { logSatScore, readSatReport, saveSatPrep, toggleSatTask, type SatFormState } from "@/app/actions/sat";
import { SAT_DOMAINS, SECTION_QUESTIONS, type SatDomainId } from "@/lib/sat-prep";
import { inputClass, selectClass } from "../form";
import { StudyTimeInput } from "../study-time-input";
import { buttonClass, cn } from "../ui";

const chunky = (base: string, width = "w-full") => base.replace("w-full", width).replace("h-11", "h-12").replace("rounded-xl", "rounded-2xl").replace("ring-1 ring-inset", "ring-2 ring-inset").replace("text-[15px]", "text-[16px] font-semibold").replace("focus:ring-accent", "focus:ring-sprint");
const legend = "mb-2 font-brand text-[14px] font-extrabold text-ink";
const chip = (on: boolean) =>
  cn(
    "press-sm rounded-xl px-3.5 py-2 text-left font-brand text-[13.5px] font-extrabold",
    on ? "bg-sprint text-white [--ledge:var(--sprint-press)]" : "border-2 border-line bg-surface text-ink-2 [--ledge:var(--line)] hover:bg-bg-subtle",
  );

type Mode = "upload" | "scores" | "right" | "none";
const MODES: { key: Mode; label: string }[] = [
  { key: "upload", label: "Upload my score report" },
  { key: "scores", label: "Type my scores" },
  { key: "right", label: "Questions I got right" },
  { key: "none", label: "I haven't taken one yet" },
];

/** "Where are you now?": upload a report, type section scores, or questions right; plus an optional breakdown by domain. */
function StandingFields({ allowNone = true }: { allowNone?: boolean }) {
  const [mode, setMode] = useState<Mode>("upload");
  const [math, setMath] = useState("");
  const [rw, setRw] = useState("");
  const [right, setRight] = useState<Partial<Record<SatDomainId, string>>>({});
  const [of, setOf] = useState<Partial<Record<SatDomainId, string>>>({});
  const [band, setBand] = useState<Partial<Record<SatDomainId, string>>>({});
  const [breakdown, setBreakdown] = useState<"right" | "band">("right");
  const [open, setOpen] = useState(false);
  const [reading, startReading] = useTransition();
  const [read, setRead] = useState<{ found: string[]; error?: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const readReport = () =>
    startReading(async () => {
      const fd = new FormData();
      const f = fileRef.current?.files?.[0];
      if (f) fd.set("file", f);
      fd.set("text", textRef.current?.value ?? "");
      const r = await readSatReport(fd);
      setRead({ found: r.found, error: r.error });
      if (r.math != null) setMath(String(r.math));
      if (r.rw != null) setRw(String(r.rw));
      const dr: typeof right = {};
      const dof: typeof of = {};
      for (const [k, v] of Object.entries(r.domains) as [SatDomainId, { right: number; of: number }][]) {
        dr[k] = String(v.right);
        dof[k] = String(v.of);
      }
      if (Object.keys(dr).length) {
        setRight((x) => ({ ...x, ...dr }));
        setOf((x) => ({ ...x, ...dof }));
        setBreakdown("right");
        setOpen(true);
      }
    });

  const modes = MODES.filter((m) => allowNone || m.key !== "none");
  return (
    <fieldset>
      <legend className={legend}>Where are you now?</legend>
      <input type="hidden" name="mode" value={mode === "upload" ? "scores" : mode} />
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="How you'll tell us your scores">
        {modes.map((m) => (
          <button key={m.key} type="button" role="radio" aria-checked={mode === m.key} onClick={() => setMode(m.key)} className={chip(mode === m.key)}>
            {m.label}
          </button>
        ))}
      </div>

      {mode === "upload" ? (
        <div className="fade mt-4 space-y-3 rounded-2xl bg-bg-subtle p-4">
          <p className="text-[14px] leading-relaxed text-ink-2">
            Upload the PDF of your score report (from{" "}
            <a href="https://studentscores.collegeboard.org/" target="_blank" rel="noreferrer" className="font-semibold text-accent-ink underline underline-offset-2">
              studentscores.collegeboard.org
            </a>
            ) or paste the text of your results from My Practice or your score report. Merit fills in what it finds and you check it.
          </p>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-surface px-4 py-3 ring-2 ring-inset ring-line hover:ring-line-strong">
            <FileUp className="size-5 shrink-0 text-sprint-ink" />
            <span className="min-w-0 flex-1 text-[14px] font-semibold text-ink">Choose a PDF</span>
            <input ref={fileRef} type="file" accept="application/pdf,.pdf,text/plain" className="max-w-[55%] text-[13px] text-muted file:hidden" />
          </label>
          <textarea ref={textRef} rows={3} placeholder="…or paste your score report text here" className={cn(inputClass, "h-auto py-2.5")} />
          <button type="button" onClick={readReport} disabled={reading} className={buttonClass("secondary", "md")}>
            {reading ? <Loader2 className="size-4 animate-spin" /> : null} {reading ? "Reading…" : "Read my report"}
          </button>
          {read ? (
            read.error ? (
              <p className="text-[13.5px] font-semibold text-danger" role="alert">{read.error}</p>
            ) : (
              <p className="text-[13.5px] font-semibold text-positive" role="status">Found: {read.found.join(" · ")}. Check the numbers below.</p>
            )
          ) : null}
        </div>
      ) : null}

      {mode === "scores" || mode === "upload" ? (
        <div className="fade mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold text-ink-2">Math (200–800)</span>
            <input name="math" type="number" inputMode="numeric" min={200} max={800} step={10} value={math} onChange={(e) => setMath(e.target.value)} placeholder="e.g. 560" className={chunky(inputClass)} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold text-ink-2">Reading and Writing (200–800)</span>
            <input name="rw" type="number" inputMode="numeric" min={200} max={800} step={10} value={rw} onChange={(e) => setRw(e.target.value)} placeholder="e.g. 590" className={chunky(inputClass)} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold text-ink-2">From</span>
            <select name="source" defaultValue="practice" className={chunky(selectClass)}>
              <option value="practice">A practice test</option>
              <option value="official">A real SAT or PSAT</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold text-ink-2">Taken on (optional)</span>
            <input name="takenOn" type="date" className={chunky(inputClass)} />
          </label>
        </div>
      ) : null}

      {mode === "right" ? (
        <div className="fade mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold text-ink-2">Math: right out of {SECTION_QUESTIONS.math}</span>
            <input name="mathRight" type="number" inputMode="numeric" min={0} max={SECTION_QUESTIONS.math} placeholder="e.g. 30" className={chunky(inputClass)} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold text-ink-2">Reading and Writing: right out of {SECTION_QUESTIONS.rw}</span>
            <input name="rwRight" type="number" inputMode="numeric" min={0} max={SECTION_QUESTIONS.rw} placeholder="e.g. 38" className={chunky(inputClass)} />
          </label>
          <input type="hidden" name="source" value="practice" />
          <p className="text-[12.5px] text-muted sm:col-span-2">Merit converts these to an estimated 200–800 score. The real conversion depends on which questions you got right, so log your scores after each practice test.</p>
        </div>
      ) : null}

      {mode === "none" ? (
        <p className="fade mt-4 rounded-2xl bg-sprint-soft p-4 text-[14px] leading-relaxed text-ink">
          No problem. Day 1 of your plan is a free full-length practice test in Bluebook, the College Board&apos;s official app. Log your scores afterward and the plan rebuilds around them.
        </p>
      ) : null}

      {mode !== "none" ? (
        <details open={open} onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)} className="mt-4 rounded-2xl ring-2 ring-line">
          <summary className="cursor-pointer list-none px-4 py-3 font-brand text-[14px] font-extrabold text-ink">
            Add your breakdown by domain <span className="font-semibold text-muted">(optional, makes the plan sharper)</span>
          </summary>
          <div className="space-y-3 px-4 pb-4">
            <div className="flex flex-wrap gap-2">
              <button type="button" aria-pressed={breakdown === "right"} onClick={() => setBreakdown("right")} className={chip(breakdown === "right")}>
                Questions right
              </button>
              <button type="button" aria-pressed={breakdown === "band"} onClick={() => setBreakdown("band")} className={chip(breakdown === "band")}>
                Score report bars (1–7)
              </button>
            </div>
            <p className="text-[12.5px] text-muted">
              {breakdown === "right" ? "From My Practice: how many you got right in each domain." : "Your score report shows each domain as 1 to 7 filled boxes. Count the filled boxes."}
            </p>
            {(["math", "rw"] as const).map((s) => (
              <div key={s}>
                <p className="mb-1.5 text-[12px] font-bold uppercase tracking-wide text-muted">{s === "math" ? "Math" : "Reading and Writing"}</p>
                <div className="grid gap-2">
                  {SAT_DOMAINS.filter((d) => d.section === s).map((d) => (
                    <div key={d.id} className="flex flex-wrap items-center gap-2">
                      <span className="min-w-0 flex-1 text-[14px] font-semibold text-ink">{d.title}</span>
                      {breakdown === "right" ? (
                        <span className="flex items-center gap-1.5 text-[13px] text-muted">
                          <input name={`right_${d.id}`} type="number" min={0} max={30} value={right[d.id] ?? ""} onChange={(e) => setRight((x) => ({ ...x, [d.id]: e.target.value }))} aria-label={`${d.title}: questions right`} className={cn(inputClass.replace("w-full", "w-16").replace("h-11", "h-10"), "text-center")} />
                          of
                          <input name={`of_${d.id}`} type="number" min={1} max={30} value={of[d.id] ?? ""} onChange={(e) => setOf((x) => ({ ...x, [d.id]: e.target.value }))} aria-label={`${d.title}: questions total`} className={cn(inputClass.replace("w-full", "w-16").replace("h-11", "h-10"), "text-center")} />
                        </span>
                      ) : (
                        <select name={`band_${d.id}`} value={band[d.id] ?? ""} onChange={(e) => setBand((x) => ({ ...x, [d.id]: e.target.value }))} aria-label={`${d.title}: boxes filled`} className={selectClass.replace("w-full", "w-32").replace("h-11", "h-10")}>
                          <option value="">Boxes filled</option>
                          {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                            <option key={n} value={n}>
                              {n} of 7
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </details>
      ) : null}
    </fieldset>
  );
}

type DateOpt = { date: string; label: string; note: string; closed: boolean };

/** Set up (or change) the SAT plan. `editing` hides "where are you now" (scores are logged separately). */
export function SatSetupForm({ dates, initial, editing = false }: { dates: DateOpt[]; initial?: { testDate: string; target: number; minutesPerDay: number; daysPerWeek: number }; editing?: boolean }) {
  const [state, action, pending] = useActionState<SatFormState, FormData>(saveSatPrep, {});
  const known = initial ? dates.some((d) => d.date === initial.testDate) : true;
  const [date, setDate] = useState(initial?.testDate ?? dates.find((d) => !d.closed)?.date ?? "");
  const [other, setOther] = useState(!known);
  const [target, setTarget] = useState(String(initial?.target ?? 1300));
  return (
    <form action={action} className="space-y-7">
      <fieldset>
        <legend className={legend}>When is your SAT?</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {dates.map((d) => (
            <button
              key={d.date}
              type="button"
              role="radio"
              aria-checked={!other && date === d.date}
              onClick={() => {
                setOther(false);
                setDate(d.date);
              }}
              className={chip(!other && date === d.date)}
            >
              <span className="block">{d.label}</span>
              <span className={cn("block text-[12px] font-semibold", !other && date === d.date ? "text-white/85" : d.closed ? "text-sprint-ink" : "text-muted")}>{d.note}</span>
            </button>
          ))}
          <button type="button" role="radio" aria-checked={other} onClick={() => setOther(true)} className={chip(other)}>
            <span className="block">Another date</span>
            <span className={cn("block text-[12px] font-semibold", other ? "text-white/85" : "text-muted")}>School day SAT, or a later date</span>
          </button>
        </div>
        {other ? <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} aria-label="Your SAT date" className={cn(chunky(inputClass, "w-full max-w-xs"), "mt-3")} /> : null}
        <input type="hidden" name="testDate" value={date} />
      </fieldset>

      <fieldset>
        <legend className={legend}>What score do you want?</legend>
        <div className="flex flex-wrap items-center gap-2">
          <input name="target" type="number" inputMode="numeric" min={400} max={1600} step={10} required value={target} onChange={(e) => setTarget(e.target.value)} aria-label="Target total score" className={cn(chunky(inputClass, "w-28"), "text-center font-brand text-[20px] font-black")} />
          <span className="text-[13.5px] font-semibold text-muted">out of 1600</span>
          {[1200, 1300, 1400, 1500].map((n) => (
            <button key={n} type="button" aria-pressed={target === String(n)} onClick={() => setTarget(String(n))} className={cn(chip(target === String(n)), "py-1.5")}>
              {n}
            </button>
          ))}
        </div>
      </fieldset>

      {!editing ? <StandingFields /> : null}

      <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-start">
        <StudyTimeInput defaultMinutes={initial?.minutesPerDay ?? 45} tone="sprint" label="How much time can you study on a study day?" />
        <label className="block">
          <span className={cn(legend, "block")}>Study days a week</span>
          <select name="daysPerWeek" defaultValue={String(initial?.daysPerWeek ?? 6)} className={chunky(selectClass, "w-40")}>
            {[3, 4, 5, 6, 7].map((n) => (
              <option key={n} value={n}>
                {n} days
              </option>
            ))}
          </select>
        </label>
      </div>

      {state.error ? (
        <p className="text-sm font-medium text-danger" role="alert">
          {state.error}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className={buttonClass("sprint", "lg", "w-full sm:w-auto sm:px-8")}>
        {pending ? "Building your plan…" : editing ? "Save changes" : "Build my SAT plan"} <ArrowRight className="size-4" />
      </button>
    </form>
  );
}

/** Log a new score (practice test or real SAT). The plan rebuilds around it. */
export function SatScoreForm() {
  const [state, action, pending] = useActionState<SatFormState, FormData>(logSatScore, {});
  return (
    <form action={action} className="space-y-5">
      <StandingFields allowNone={false} />
      {state.error ? (
        <p className="text-sm font-medium text-danger" role="alert">
          {state.error}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className={buttonClass("sprint", "md")}>
        {pending ? "Saving…" : "Save and update my plan"}
      </button>
    </form>
  );
}

/** One task in the plan: tap the circle to check it off. External links open in a new tab. */
export function SatTaskRow({ task, done, compact = false }: { task: { id: string; title: string; detail: string; minutes: number; href?: string; source: string }; done: boolean; compact?: boolean }) {
  const [on, setOn] = useOptimistic(done);
  const [, start] = useTransition();
  const external = task.href?.startsWith("http");
  return (
    <li className={cn("flex gap-3.5", compact ? "py-2.5" : "py-3.5")}>
      <button
        type="button"
        data-sound="task"
        aria-pressed={on}
        aria-label={on ? `Mark "${task.title}" not done` : `Mark "${task.title}" done`}
        onClick={() =>
          start(async () => {
            setOn(!on);
            await toggleSatTask(task.id, !on);
          })
        }
        className={cn(
          "press-sm mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full",
          on ? "bg-positive text-bg [--ledge:var(--positive-press)]" : "bg-surface text-muted ring-2 ring-inset ring-line-strong [--ledge:var(--line-strong)] hover:text-positive hover:ring-positive",
        )}
      >
        <Check className={cn("size-5", on ? "check-pop" : "opacity-30")} strokeWidth={3.25} />
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          {task.href ? (
            <a
              href={task.href}
              {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
              className={cn("font-brand text-[15.5px] font-extrabold underline-offset-2 hover:underline", on ? "text-muted line-through" : "text-ink")}
            >
              {task.title}
              {external ? <ExternalLink className="ml-1 inline size-3.5 align-[-1px] text-muted" /> : null}
            </a>
          ) : (
            <span className={cn("font-brand text-[15.5px] font-extrabold", on ? "text-muted line-through" : "text-ink")}>{task.title}</span>
          )}
          {task.minutes ? <span className="tabular text-[12.5px] font-semibold text-muted">{task.minutes} min</span> : null}
          <span className={cn("rounded-full px-2 py-px text-[11.5px] font-bold", task.source === "Merit" ? "bg-accent-soft text-accent-ink" : "bg-bg-subtle text-ink-2")}>{task.source}</span>
        </div>
        {!compact ? <p className="mt-1 text-[14px] leading-relaxed text-ink-2">{task.detail}</p> : null}
      </div>
    </li>
  );
}
