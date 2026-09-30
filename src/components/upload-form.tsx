"use client";

import { Film, Loader2, RefreshCw, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { publishUpload, startUpload } from "@/app/actions/uploads";
import { FormMessage, inputClass } from "./form";
import { TopicPicker, type CourseTopics } from "./studio-forms";
import { Button, cn, formatDuration, ProgressBar } from "./ui";

const labelText = "mb-1.5 block text-[13px] font-semibold text-ink-2";

/** PUT a file to a signed storage URL, reporting progress. */
function put(url: string, body: Blob, onProgress?: (p: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", body.type || "application/octet-stream");
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(e.loaded / e.total);
    xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error(`Upload failed (${xhr.status})`)));
    xhr.onerror = () => reject(new Error("Upload failed. Check your connection."));
    xhr.send(body);
  });
}

/** Reads the video's length and grabs a frame for the thumbnail. */
function inspect(file: File): Promise<{ duration: number; poster: Blob | null }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    let duration = 0;
    let stage: "probe" | "frame" = "frame";
    const done = (poster: Blob | null) => {
      URL.revokeObjectURL(url);
      resolve({ duration: Number.isFinite(duration) ? duration : 0, poster });
    };
    v.preload = "metadata";
    v.muted = true;
    v.src = url;
    v.onloadedmetadata = () => {
      duration = v.duration;
      // Some recorders (screen and webcam WebM) don't write a length: seeking to the end reveals it.
      if (!Number.isFinite(duration)) {
        stage = "probe";
        v.currentTime = 1e7;
      } else v.currentTime = Math.min(2, duration / 3);
    };
    v.onseeked = () => {
      if (stage === "probe") {
        duration = v.duration;
        stage = "frame";
        v.currentTime = Math.min(2, (Number.isFinite(duration) ? duration : 3) / 3);
        return;
      }
      const c = document.createElement("canvas");
      const scale = Math.min(1, 1280 / (v.videoWidth || 1280));
      c.width = Math.round((v.videoWidth || 1280) * scale);
      c.height = Math.round((v.videoHeight || 720) * scale);
      c.getContext("2d")?.drawImage(v, 0, 0, c.width, c.height);
      c.toBlob(done, "image/jpeg", 0.85);
    };
    v.onerror = () => done(null);
  });
}

export function UploadForm({ courses, maxMb }: { courses: CourseTopics[]; maxMb: number }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [meta, setMeta] = useState<{ duration: number; poster: Blob | null; posterUrl: string | null } | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [courseId, setCourseId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const busy = progress !== null;
  const input = useRef<HTMLInputElement>(null);

  const choose = async (f: File | undefined) => {
    setError(null);
    if (!f) return;
    if (f.size > maxMb * 1024 * 1024) {
      setError(`That file is ${(f.size / 1024 / 1024).toFixed(0)} MB. Videos can be up to ${maxMb} MB; try exporting at 720p.`);
      return;
    }
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " "));
    const m = await inspect(f);
    setMeta({ ...m, posterUrl: m.poster ? URL.createObjectURL(m.poster) : null });
  };

  const submit = async () => {
    if (!file || !meta) return;
    setError(null);
    setProgress(0);
    try {
      const t = await startUpload({ type: file.type, size: file.size });
      if (!t.ok) throw new Error(t.error);
      await put(t.video.uploadUrl, file, (p) => setProgress(p * 0.95));
      let posterPath: string | null = null;
      if (meta.poster) {
        await put(t.poster.uploadUrl, meta.poster).then(() => (posterPath = t.poster.path)).catch(() => {});
      }
      setProgress(0.98);
      const r = await publishUpload({ path: t.video.path, posterPath, title, description, topicId, durationSec: Math.max(1, meta.duration) });
      if (!r.ok) throw new Error(r.error);
      router.push(`/videos/${r.id}?submitted=1`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
      setProgress(null);
    }
  };

  return (
    <div className="space-y-6">
      <div
        role="button"
        tabIndex={busy ? -1 : 0}
        aria-disabled={busy}
        onClick={() => !busy && input.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !busy) {
            e.preventDefault();
            input.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!dragging) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void choose(e.dataTransfer.files[0]);
        }}
        className={cn(
          "group relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-5 py-9 text-center outline-none transition-[background-color,border-color,transform] duration-200 ease-out focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
          dragging ? "scale-[1.01] border-accent bg-accent-soft" : file ? "border-line bg-bg-subtle/50" : "border-line-strong bg-bg-subtle/40 hover:border-accent hover:bg-accent-soft/50",
          busy && "pointer-events-none opacity-80",
        )}
      >
        {meta?.posterUrl ? (
          <img src={meta.posterUrl} alt="" className="fade aspect-video w-full max-w-md rounded-xl object-cover ring-1 ring-line" />
        ) : file && !meta ? (
          <span className="flex aspect-video w-full max-w-md items-center justify-center rounded-xl bg-bg-subtle ring-1 ring-line">
            <Loader2 className="size-6 animate-spin text-muted" />
          </span>
        ) : (
          <span className={cn("flex size-14 items-center justify-center rounded-2xl bg-surface text-accent-ink shadow-soft ring-2 ring-line transition-transform duration-200 ease-out", dragging ? "-translate-y-1 scale-105" : "group-hover:-translate-y-0.5")}>
            <Film className="size-6" />
          </span>
        )}
        <p className="max-w-full truncate px-2 text-[15px] font-semibold text-ink">{file ? file.name : dragging ? "Drop to add your video" : "Drop a video here, or click to choose"}</p>
        <p className="tabular text-[13px] text-muted">
          {file && meta ? `${formatDuration(Math.round(meta.duration))} · ${(file.size / 1024 / 1024).toFixed(1)} MB` : `MP4, MOV, or WebM, up to ${maxMb} MB`}
        </p>
        {file && !busy ? (
          <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-accent-ink">
            <RefreshCw className="size-3.5" /> Choose a different file
          </span>
        ) : null}
        <input ref={input} type="file" accept="video/mp4,video/quicktime,video/webm" className="sr-only" tabIndex={-1} onChange={(e) => void choose(e.target.files?.[0])} />
      </div>

      <label className="block">
        <span className={labelText}>Title</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} className={inputClass} placeholder="The chain rule in 6 minutes" />
      </label>
      <TopicPicker courses={courses} courseId={courseId} setCourseId={setCourseId} topicId={topicId} setTopicId={setTopicId} />
      <label className="block">
        <span className={labelText}>
          Description<span className="font-normal text-faint"> (optional)</span>
        </span>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} maxLength={4000} className={cn(inputClass, "h-auto py-3 leading-relaxed")} placeholder="What students will learn, and timestamps for each part." />
      </label>
      <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-bg-subtle p-4 text-[13.5px] leading-relaxed text-ink-2 ring-1 ring-inset ring-line">
        <input type="checkbox" required id="rights" className="mt-0.5 size-4 shrink-0 accent-[var(--accent)]" />
        This is my own video (or I have the rights to it), and it&apos;s accurate and school-appropriate.
      </label>
      {busy ? (
        <div className="fade rounded-xl bg-accent-soft/60 p-4 ring-1 ring-inset ring-accent/15" aria-live="polite">
          <div className="mb-2.5 flex items-center justify-between text-[13.5px] font-semibold text-ink">
            <span className="flex items-center gap-2">
              <Loader2 className="size-4 animate-spin text-accent-ink" /> Uploading…
            </span>
            <span className="tabular text-accent-ink">{Math.round((progress ?? 0) * 100)}%</span>
          </div>
          <ProgressBar value={progress ?? 0} className="h-2 bg-surface" />
        </div>
      ) : null}
      <FormMessage error={error ?? undefined} />
      <Button
        type="button"
        size="lg"
        disabled={busy || !file || !meta || !title.trim() || !topicId}
        onClick={() => {
          const box = document.getElementById("rights") as HTMLInputElement | null;
          if (box && !box.checked) return setError("Please confirm you have the rights to this video.");
          void submit();
        }}
        className="w-full sm:w-auto"
      >
        <Upload className="size-4" /> {busy ? "Uploading…" : "Publish video"}
      </Button>
    </div>
  );
}
