"use client";

import { Loader2, Search } from "lucide-react";
import { useActionState, useMemo, useState, useTransition } from "react";
import { previewVideo, publishGuide, publishVideo, saveEducatorProfile, type StudioState, type VideoPreview } from "@/app/actions/educator";
import { Markdown } from "./ask/markdown";
import { inputClass } from "./form";
import { cn, formatDuration, formatViews } from "./ui";

export type CourseTopics = { id: string; title: string; category: string; topics: { id: string; title: string; unit: string }[] };

function TopicPicker({ courses, courseId, setCourseId, topicId, setTopicId }: { courses: CourseTopics[]; courseId: string; setCourseId: (v: string) => void; topicId: string; setTopicId: (v: string) => void }) {
  const course = courses.find((c) => c.id === courseId);
  const units = useMemo(() => [...new Set(course?.topics.map((t) => t.unit) ?? [])], [course]);
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-medium text-ink-2">Course</span>
        <select
          value={courseId}
          onChange={(e) => {
            setCourseId(e.target.value);
            setTopicId("");
          }}
          className={inputClass}
        >
          <option value="">Choose a course</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-medium text-ink-2">Topic</span>
        <select name="topicId" value={topicId} onChange={(e) => setTopicId(e.target.value)} required disabled={!course} className={inputClass}>
          <option value="">Choose a topic</option>
          {units.map((u) => (
            <optgroup key={u} label={u}>
              {course!.topics
                .filter((t) => t.unit === u)
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
      </label>
    </div>
  );
}

export function EducatorForm({ courses, initial }: { courses: { id: string; title: string; category: string }[]; initial: { name: string; headline: string; school: string; bio: string; courseIds: string[] } }) {
  const [state, action, pending] = useActionState<StudioState, FormData>(saveEducatorProfile, {});
  const groups = [...new Set(courses.map((c) => c.category))];
  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-ink-2">Name students will see</span>
          <input name="name" defaultValue={initial.name} required maxLength={60} className={inputClass} placeholder="Ms. Rivera" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-ink-2">School or organization (optional)</span>
          <input name="school" defaultValue={initial.school} maxLength={100} className={inputClass} />
        </label>
      </div>
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-medium text-ink-2">Headline</span>
        <input name="headline" defaultValue={initial.headline} required maxLength={100} className={inputClass} placeholder="AP Chemistry teacher, 12 years" />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-medium text-ink-2">About you (optional)</span>
        <textarea name="bio" defaultValue={initial.bio} rows={3} maxLength={1200} className={cn(inputClass, "h-auto py-2.5")} />
      </label>
      <fieldset>
        <legend className="mb-2 text-[13px] font-medium text-ink-2">Courses you teach</legend>
        <div className="space-y-3">
          {groups.map((g) => (
            <div key={g}>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">{g}</p>
              <div className="flex flex-wrap gap-1.5">
                {courses
                  .filter((c) => c.category === g)
                  .map((c) => (
                    <label key={c.id} className="cursor-pointer">
                      <input type="checkbox" name="courseIds" value={c.id} defaultChecked={initial.courseIds.includes(c.id)} className="peer sr-only" />
                      <span className="block rounded-full px-3 py-1.5 text-[13px] text-ink-2 ring-1 ring-line-strong peer-checked:bg-accent peer-checked:text-white peer-checked:ring-accent">{c.title}</span>
                    </label>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </fieldset>
      <label className="flex items-start gap-3 rounded-xl bg-bg-subtle p-4 text-[13.5px] text-ink-2">
        <input type="checkbox" name="pledge" required className="mt-0.5 size-4 accent-[var(--accent)]" />
        I&apos;ll only add accurate, school-appropriate material, and I have the right to share anything I write here.
      </label>
      {state.error ? <p className="text-sm text-[#c2410c]">{state.error}</p> : null}
      <button disabled={pending} className="h-11 rounded-full bg-accent px-6 text-sm font-semibold text-white disabled:opacity-60">
        {pending ? "Saving…" : "Save and open my studio"}
      </button>
    </form>
  );
}

export function AddVideoForm({ courses }: { courses: CourseTopics[] }) {
  const [url, setUrl] = useState("");
  const [preview, setPreview] = useState<VideoPreview | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [looking, startLookup] = useTransition();
  const [courseId, setCourseId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [state, action, pending] = useActionState<StudioState, FormData>(publishVideo, {});

  const lookup = () =>
    startLookup(async () => {
      setLookupError(null);
      const r = await previewVideo(url);
      if (!r.ok) {
        setPreview(null);
        setLookupError(r.error);
        return;
      }
      setPreview(r);
      if (r.suggestedCourse) setCourseId(r.suggestedCourse);
      setTopicId(r.suggestedTopics[0]?.id ?? "");
    });

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-1.5 block text-[13px] font-medium text-ink-2" htmlFor="yt-url">
          YouTube link
        </label>
        <div className="flex gap-2">
          <input
            id="yt-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), lookup())}
            placeholder="https://www.youtube.com/watch?v=…"
            className={inputClass}
          />
          <button type="button" onClick={lookup} disabled={!url.trim() || looking} className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-ink px-4 text-sm font-semibold text-bg disabled:opacity-50">
            {looking ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />} Look up
          </button>
        </div>
        {lookupError ? <p className="mt-2 text-sm text-[#c2410c]">{lookupError}</p> : null}
      </div>

      {preview ? (
        <form action={action} className="space-y-5">
          <input type="hidden" name="videoId" value={preview.id} />
          <div className="flex gap-4 rounded-2xl p-3 ring-1 ring-line">
            <span className="relative w-44 shrink-0 overflow-hidden rounded-lg bg-bg-subtle">
              <img src={preview.thumbnail} alt="" className="aspect-video w-full object-cover" referrerPolicy="no-referrer" />
              {preview.durationSec ? <span className="tabular absolute bottom-1 right-1 rounded bg-black/80 px-1 text-[11px] text-white">{formatDuration(preview.durationSec)}</span> : null}
            </span>
            <div className="min-w-0">
              <p className="line-clamp-2 font-medium text-ink">{preview.title}</p>
              <p className="mt-1 text-[13px] text-muted">
                {preview.channelTitle}
                {preview.views ? ` · ${formatViews(preview.views)} views` : ""}
              </p>
              {preview.alreadyListed ? <p className="mt-1 text-[12.5px] text-positive">Already in Merit&apos;s library. Your pick adds your note and a teacher badge.</p> : null}
            </div>
          </div>
          {preview.suggestedTopics.length ? (
            <div>
              <p className="mb-1.5 text-[13px] font-medium text-ink-2">Suggested topics</p>
              <div className="flex flex-wrap gap-1.5">
                {preview.suggestedTopics.map((t) => (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => {
                      setCourseId(t.courseId);
                      setTopicId(t.id);
                    }}
                    className={cn("rounded-full px-3 py-1.5 text-[13px] ring-1", topicId === t.id ? "bg-accent text-white ring-accent" : "text-ink-2 ring-line-strong hover:bg-bg-subtle")}
                  >
                    {t.title}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          <TopicPicker courses={courses} courseId={courseId} setCourseId={setCourseId} topicId={topicId} setTopicId={setTopicId} />
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-ink-2">Your note for students (optional)</span>
            <textarea name="note" rows={3} maxLength={1000} className={cn(inputClass, "h-auto py-2.5")} placeholder="Why this one? What should they watch for? e.g. “Best explanation of the chain rule I’ve found. Skip to 4:10 for the worked example.”" />
          </label>
          {state.error ? <p className="text-sm text-[#c2410c]">{state.error}</p> : null}
          <button disabled={pending || !topicId} className="h-11 rounded-full bg-accent px-6 text-sm font-semibold text-white disabled:opacity-50">
            {pending ? "Adding…" : "Add to Merit"}
          </button>
        </form>
      ) : null}
    </div>
  );
}

export function GuideForm({ courses }: { courses: CourseTopics[] }) {
  const [courseId, setCourseId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [body, setBody] = useState("");
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [state, action, pending] = useActionState<StudioState, FormData>(publishGuide, {});
  return (
    <form action={action} className="space-y-5">
      <TopicPicker courses={courses} courseId={courseId} setCourseId={setCourseId} topicId={topicId} setTopicId={setTopicId} />
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-medium text-ink-2">Title</span>
        <input name="title" required maxLength={120} className={inputClass} placeholder="Chain rule: the 3-step method that never fails" />
      </label>
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[13px] font-medium text-ink-2">Guide</span>
          <div className="flex gap-1 text-[12px]">
            {(["write", "preview"] as const).map((t) => (
              <button type="button" key={t} onClick={() => setTab(t)} className={cn("rounded-md px-2 py-1 font-medium capitalize", tab === t ? "bg-bg-subtle text-ink" : "text-muted")}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <textarea
          name="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={16}
          maxLength={20000}
          className={cn(inputClass, "h-auto py-3 font-mono text-[13.5px] leading-relaxed", tab === "preview" && "hidden")}
          placeholder={"### The idea\nExplain it in plain words.\n\n### Worked example\n1. Step one…\n\n### Common mistakes\n- …"}
        />
        {tab === "preview" ? <div className="min-h-64 rounded-xl p-4 ring-1 ring-line">{body ? <Markdown text={body} /> : <p className="text-muted">Nothing to preview yet.</p>}</div> : null}
        <p className="mt-1.5 text-[12px] text-muted">Formatting: ### headings, **bold**, *italics*, - bullet lists, 1. numbered lists, [links](https://…).</p>
      </div>
      {state.error ? <p className="text-sm text-[#c2410c]">{state.error}</p> : null}
      <button disabled={pending || !topicId} className="h-11 rounded-full bg-accent px-6 text-sm font-semibold text-white disabled:opacity-50">
        {pending ? "Publishing…" : "Publish guide"}
      </button>
    </form>
  );
}
