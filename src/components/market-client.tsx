"use client";

import { FileText, Loader2, Star, Upload, X } from "lucide-react";
import { useActionState, useState, useTransition } from "react";
import { getStudyGuide, publishGuide, rateStudyGuide, startGuideUpload, type GuideFormState } from "@/app/actions/market";
import { Field, FormMessage, inputClass, selectClass } from "./form";
import { buttonClass, cn } from "./ui";

function put(url: string, body: File, onProgress: (p: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", body.type || "application/octet-stream");
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error(`Upload failed (${xhr.status})`)));
    xhr.onerror = () => reject(new Error("Upload failed. Check your connection."));
    xhr.send(body);
  });
}

type Opt = { id: string; title: string };

export function GuideForm({ courses, topics, defaultCourse, maxPrice }: { courses: Opt[]; topics: Record<string, Opt[]>; defaultCourse: string; maxPrice: number }) {
  const [state, action, pending] = useActionState<GuideFormState, FormData>(publishGuide, {});
  const [course, setCourse] = useState(defaultCourse);
  const [free, setFree] = useState(true);
  const [file, setFile] = useState<{ path: string; name: string; type: string } | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const attach = async (f: File) => {
    setFileError(null);
    setFile(null);
    const t = await startGuideUpload({ type: f.type, size: f.size, name: f.name });
    if (!t.ok) return setFileError(t.error);
    setProgress(0);
    try {
      await put(t.uploadUrl, f, setProgress);
      setFile({ path: t.path, name: f.name, type: f.type });
    } catch (err) {
      setFileError((err as Error).message);
    } finally {
      setProgress(null);
    }
  };

  return (
    <form action={action} className="space-y-5">
      <Field label="Title">
        <input name="title" required minLength={6} maxLength={120} placeholder="Algebra 2 Unit 3: Quadratics cheat sheet with worked examples" className={inputClass} />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Class">
          <select name="courseId" value={course} onChange={(e) => setCourse(e.target.value)} className={selectClass}>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Topic" hint="Optional">
          <select name="topicId" key={course} defaultValue="" className={selectClass}>
            <option value="">The whole class / several topics</option>
            {(topics[course] ?? []).map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="What's in it?">
        <textarea name="description" required minLength={20} rows={3} className={cn(inputClass, "h-auto py-2.5 leading-relaxed")} placeholder="Every formula for the unit, 12 worked examples, and the mistakes my teacher always takes points off for." />
      </Field>

      <fieldset>
        <legend className="mb-1.5 font-brand text-[13.5px] font-extrabold text-ink">Price</legend>
        <div className="flex flex-wrap items-center gap-2">
          {[true, false].map((isFree) => (
            <button
              key={String(isFree)}
              type="button"
              aria-pressed={free === isFree}
              onClick={() => setFree(isFree)}
              className={cn("press-sm h-11 rounded-2xl px-4 font-brand text-[14px] font-extrabold ring-2 ring-inset", free === isFree ? "bg-accent text-white ring-accent [--ledge:var(--accent-press)]" : "bg-surface text-ink ring-line [--ledge:var(--line)]")}
            >
              {isFree ? "Free" : "Set a price"}
            </button>
          ))}
          {free ? (
            <input type="hidden" name="price" value="0" />
          ) : (
            <label className="flex h-11 items-center gap-1 rounded-2xl bg-surface px-3 ring-2 ring-line focus-within:ring-accent">
              <span className="font-bold text-muted">$</span>
              <input name="price" type="number" min={1} max={maxPrice} step="0.5" defaultValue={3} required className="w-20 bg-transparent font-bold text-ink outline-none" aria-label="Price in dollars" />
            </label>
          )}
        </div>
        <p className="mt-1.5 text-[12.5px] text-muted">{free ? "Free guides help the most students and build your reputation." : `Up to $${maxPrice}. Merit keeps 10% of each sale.`}</p>
      </fieldset>

      <Field label="Attach your guide" hint="PDF, PNG, or JPG · up to 20 MB">
        {file ? (
          <div className="flex items-center gap-3 rounded-2xl bg-positive-soft px-4 py-3">
            <FileText className="size-5 shrink-0 text-positive" />
            <span className="min-w-0 flex-1 truncate text-[14px] font-bold text-ink">{file.name}</span>
            <button type="button" onClick={() => setFile(null)} aria-label="Remove file" className="rounded-lg p-1 text-muted hover:bg-surface hover:text-ink">
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <label className={cn("flex h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-line bg-bg-subtle/60 text-[14px] font-bold text-ink-2 hover:border-accent hover:text-ink", progress !== null && "pointer-events-none")}>
            {progress !== null ? (
              <>
                <Loader2 className="size-5 animate-spin" /> Uploading… {Math.round(progress * 100)}%
              </>
            ) : (
              <>
                <Upload className="size-5" /> Choose a file
              </>
            )}
            <input type="file" accept="application/pdf,image/png,image/jpeg" className="sr-only" onChange={(e) => e.target.files?.[0] && attach(e.target.files[0])} />
          </label>
        )}
        {fileError ? <p className="mt-1.5 text-[13px] font-semibold text-danger">{fileError}</p> : null}
        {file ? (
          <>
            <input type="hidden" name="filePath" value={file.path} />
            <input type="hidden" name="fileName" value={file.name} />
            <input type="hidden" name="fileType" value={file.type} />
          </>
        ) : null}
      </Field>

      <Field label="Or write it here" hint={file ? "Optional" : "If you don't attach a file"}>
        <textarea name="body" rows={10} maxLength={60000} className={cn(inputClass, "h-auto py-3 font-mono text-[14px] leading-relaxed")} placeholder={"Key formulas\n- Vertex: x = −b / 2a\n- Discriminant: b² − 4ac\n\nWorked example 1\n…"} />
      </Field>

      <label className="flex items-start gap-3 rounded-2xl bg-bg-subtle px-4 py-3 text-[14px] leading-relaxed text-ink-2">
        <input type="checkbox" name="rights" required className="mt-1 size-4 accent-[var(--accent)]" />
        <span>I made this guide myself. It isn&apos;t copied from a textbook, a teacher&apos;s answer key, or an actual test, and it doesn&apos;t include anyone&apos;s personal information.</span>
      </label>

      <FormMessage error={state.error} />
      <button disabled={pending || progress !== null} className={buttonClass("primary", "lg", "w-full")}>
        {pending ? "Publishing…" : "Publish guide"}
      </button>
    </form>
  );
}

export function GetGuideButton({ id, label, className }: { id: string; label: string; className?: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <div className={className}>
      <button
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await getStudyGuide(id);
            if (r?.error) setError(r.error);
          })
        }
        className={buttonClass("primary", "lg", "w-full")}
      >
        {pending ? "One moment…" : label}
      </button>
      {error ? <p className="mt-2 text-center text-[13px] font-semibold text-danger">{error}</p> : null}
    </div>
  );
}

export function RateGuide({ id, initial }: { id: string; initial: number }) {
  const [stars, setStars] = useState(initial);
  const [pending, start] = useTransition();
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Rate this guide">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={stars === n}
          aria-label={`${n} stars`}
          disabled={pending}
          onClick={() => {
            setStars(n);
            start(() => rateStudyGuide(id, n));
          }}
          className="rounded-lg p-1 transition-transform hover:scale-110"
        >
          <Star className={cn("size-6", n <= stars ? "fill-[#f59e0b] text-[#f59e0b]" : "text-line-strong")} />
        </button>
      ))}
    </div>
  );
}
