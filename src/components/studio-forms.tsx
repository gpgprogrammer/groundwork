"use client";

import { Check, Loader2, Search } from "lucide-react";
import { useActionState, useMemo, useState, useTransition } from "react";
import { previewVideo, publishGuide, publishVideo, saveEducatorProfile, type StudioState, type VideoPreview } from "@/app/actions/educator";
import { Markdown } from "./ask/markdown";
import { FormMessage, inputClass, keepValuesOnSubmit, selectClass } from "./form";
import { Button, cn, formatDuration, formatViews } from "./ui";

const labelText = "mb-1.5 block font-brand text-[13.5px] font-extrabold text-ink-2";
const optional = <span className="font-normal text-faint"> (optional)</span>;
const textareaClass = cn(inputClass, "h-auto py-3 leading-relaxed");
const chip = "press-sm flex min-h-10 items-center gap-1.5 rounded-2xl px-4 py-1.5 font-brand text-[13.5px] font-extrabold ring-2 ring-inset transition-[background-color,color,box-shadow,transform] duration-100 ease-out";
const pledgeClass = "flex cursor-pointer items-start gap-3 rounded-2xl bg-bg-subtle p-4 text-[14px] font-medium leading-relaxed text-ink ring-2 ring-inset ring-line transition-colors duration-150 hover:bg-line/50 has-[:checked]:bg-accent-soft has-[:checked]:ring-accent";

export type CourseTopics = { id: string; title: string; category: string; topics: { id: string; title: string; unit: string }[] };

export function TopicPicker({ courses, courseId, setCourseId, topicId, setTopicId }: { courses: CourseTopics[]; courseId: string; setCourseId: (v: string) => void; topicId: string; setTopicId: (v: string) => void }) {
  const course = courses.find((c) => c.id === courseId);
  const units = useMemo(() => [...new Set(course?.topics.map((t) => t.unit) ?? [])], [course]);
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="block">
        <span className={labelText}>Course</span>
        <select
          value={courseId}
          onChange={(e) => {
            setCourseId(e.target.value);
            setTopicId("");
          }}
          className={selectClass}
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
        <span className={labelText}>Topic</span>
        <select name="topicId" value={topicId} onChange={(e) => setTopicId(e.target.value)} required disabled={!course} className={selectClass}>
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
  const [missingCourse, setMissingCourse] = useState(false);
  const checkCourses = (form: HTMLFormElement) => {
    const ok = Boolean(form.querySelector('input[name="courseIds"]:checked'));
    setMissingCourse(!ok);
    if (!ok) form.querySelector("#courses-you-teach")?.scrollIntoView({ behavior: "smooth", block: "start" });
    return ok;
  };
  return (
    <form onSubmit={keepValuesOnSubmit(action, checkCourses)} onChange={() => missingCourse && setMissingCourse(false)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={labelText}>Name students will see</span>
          <input name="name" defaultValue={initial.name} required maxLength={60} className={inputClass} placeholder="Ms. Rivera" />
        </label>
        <label className="block">
          <span className={labelText}>School or organization{optional}</span>
          <input name="school" defaultValue={initial.school} maxLength={100} className={inputClass} />
        </label>
      </div>
      <label className="block">
        <span className={labelText}>Headline</span>
        <input name="headline" defaultValue={initial.headline} required maxLength={100} className={inputClass} placeholder="AP Calculus teacher, 12 years" />
      </label>
      <label className="block">
        <span className={labelText}>About you{optional}</span>
        <textarea name="bio" defaultValue={initial.bio} rows={3} maxLength={1200} className={textareaClass} />
      </label>
      <fieldset id="courses-you-teach" className="scroll-mt-28 border-t-2 border-line pt-6" aria-describedby={missingCourse ? "courses-error" : undefined}>
        <legend className="sr-only">Courses you teach</legend>
        <p aria-hidden className="font-brand text-[18px] font-extrabold text-ink">
          Courses you teach
        </p>
        <p className="mt-0.5 text-[13px] text-muted">Pick every course you want to add lessons and guides for.</p>
        {missingCourse ? (
          <p id="courses-error" role="alert" className="mt-3 rounded-2xl bg-danger-soft px-4 py-2.5 font-brand text-[14px] font-extrabold text-danger">
            Pick at least one course you teach.
          </p>
        ) : null}
        <div className="mt-4 space-y-4">
          {groups.map((g) => (
            <div key={g}>
              <p className="mb-2 font-brand text-[12.5px] font-extrabold text-muted">{g}</p>
              <div className="flex flex-wrap gap-2">
                {courses
                  .filter((c) => c.category === g)
                  .map((c) => (
                    <label key={c.id} className="cursor-pointer">
                      <input type="checkbox" name="courseIds" value={c.id} defaultChecked={initial.courseIds.includes(c.id)} className="peer sr-only" />
                      <span
                        className={cn(
                          chip,
                          "bg-surface text-ink ring-line [--ledge:var(--line)] hover:bg-bg-subtle peer-checked:bg-accent peer-checked:text-white peer-checked:ring-accent peer-checked:[--ledge:var(--accent-press)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent [&>svg]:hidden peer-checked:[&>svg]:block",
                        )}
                      >
                        <Check className="size-3.5" strokeWidth={3} aria-hidden />
                        {c.title}
                      </span>
                    </label>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </fieldset>
      <label className={pledgeClass}>
        <input type="checkbox" name="pledge" required className="mt-0.5 size-[18px] shrink-0 accent-[var(--accent)]" />
        I&apos;ll only add accurate, school-appropriate material, and I have the right to share anything I write here.
      </label>
      <FormMessage error={state.error} />
      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
        {pending ? "Saving…" : "Save and open my studio"}
      </Button>
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
        <label className={labelText} htmlFor="yt-url">
          YouTube link
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="yt-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), lookup())}
            placeholder="https://www.youtube.com/watch?v=…"
            inputMode="url"
            className={inputClass}
          />
          <Button type="button" onClick={lookup} disabled={!url.trim() || looking} className="h-11 shrink-0 px-5">
            {looking ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />} Look up
          </Button>
        </div>
        {lookupError ? (
          <div className="mt-2">
            <FormMessage error={lookupError} />
          </div>
        ) : null}
      </div>

      {looking && !preview ? (
        <div aria-hidden className="flex gap-4 rounded-2xl bg-surface p-3 ring-2 ring-line">
          <span className="skeleton aspect-video w-32 shrink-0 rounded-xl sm:w-44" />
          <span className="flex-1 space-y-2 py-1">
            <span className="skeleton block h-4 w-4/5 rounded-full" />
            <span className="skeleton block h-3 w-1/2 rounded-full" />
          </span>
        </div>
      ) : null}

      {preview ? (
        <form onSubmit={keepValuesOnSubmit(action)} className="fade space-y-6">
          <input type="hidden" name="videoId" value={preview.id} />
          <div className="flex gap-3 rounded-2xl bg-surface p-3 ring-2 ring-line sm:gap-4">
            <span className="relative w-32 shrink-0 overflow-hidden rounded-xl bg-bg-subtle sm:w-44">
              <img src={preview.thumbnail} alt="" className="aspect-video w-full object-cover" referrerPolicy="no-referrer" />
              {preview.durationSec ? <span className="tabular absolute bottom-1 right-1 rounded-md bg-black/80 px-1.5 py-px text-[11px] font-medium text-white">{formatDuration(preview.durationSec)}</span> : null}
            </span>
            <div className="min-w-0 py-0.5">
              <p className="line-clamp-2 font-brand text-[16px] font-extrabold leading-snug text-ink">{preview.title}</p>
              <p className="mt-1 text-[13px] text-muted">
                {preview.channelTitle}
                {preview.views ? <span className="tabular">{` · ${formatViews(preview.views)} views`}</span> : ""}
              </p>
              {preview.alreadyListed ? <p className="mt-1.5 text-[12.5px] font-medium text-positive">Already in Merit&apos;s library. Your pick adds your note and a teacher badge.</p> : null}
            </div>
          </div>
          {preview.suggestedTopics.length ? (
            <div>
              <p className={labelText}>Suggested topics</p>
              <div className="flex flex-wrap gap-2">
                {preview.suggestedTopics.map((t) => (
                  <button
                    type="button"
                    key={t.id}
                    aria-pressed={topicId === t.id}
                    onClick={() => {
                      setCourseId(t.courseId);
                      setTopicId(t.id);
                    }}
                    className={cn(chip, topicId === t.id ? "bg-accent text-white ring-accent [--ledge:var(--accent-press)]" : "bg-surface text-ink ring-line [--ledge:var(--line)] hover:bg-bg-subtle")}
                  >
                    {topicId === t.id ? <Check className="size-3.5" strokeWidth={3} aria-hidden /> : null}
                    {t.title}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          <TopicPicker courses={courses} courseId={courseId} setCourseId={setCourseId} topicId={topicId} setTopicId={setTopicId} />
          <label className="block">
            <span className={labelText}>Your note for students{optional}</span>
            <textarea name="note" rows={3} maxLength={1000} className={textareaClass} placeholder="Why this one? What should they watch for? e.g. “Best explanation of the chain rule I’ve found. Skip to 4:10 for the worked example.”" />
          </label>
          <FormMessage error={state.error} />
          <Button type="submit" size="lg" disabled={pending || !topicId} className="w-full sm:w-auto">
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            {pending ? "Adding…" : "Add to Merit"}
          </Button>
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
    <form onSubmit={keepValuesOnSubmit(action)} className="space-y-6">
      <TopicPicker courses={courses} courseId={courseId} setCourseId={setCourseId} topicId={topicId} setTopicId={setTopicId} />
      <label className="block">
        <span className={labelText}>Title</span>
        <input name="title" required maxLength={120} className={inputClass} placeholder="Chain rule: the 3-step method that never fails" />
      </label>
      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="font-brand text-[13.5px] font-extrabold text-ink-2">Guide</span>
          <div className="flex gap-1.5 pb-1">
            {(["write", "preview"] as const).map((t) => (
              <button
                type="button"
                key={t}
                aria-pressed={tab === t}
                onClick={() => setTab(t)}
                className={cn("press-sm h-9 rounded-full px-4 font-brand text-[13px] font-extrabold capitalize transition-[background-color,color,box-shadow,transform] duration-100", tab === t ? "bg-accent text-white [--ledge:var(--accent-press)]" : "bg-surface text-muted ring-2 ring-inset ring-line [--ledge:var(--line)] hover:text-ink")}
              >
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
        {tab === "preview" ? (
          <div className="fade min-h-64 rounded-2xl bg-surface px-5 py-5 ring-2 ring-inset ring-line sm:px-7">
            {body ? <Markdown text={body} variant="prose" /> : <p className="text-muted">Nothing to preview yet.</p>}
          </div>
        ) : null}
        <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
          Formatting: <code className="font-mono text-ink-2">###</code> headings, <code className="font-mono text-ink-2">**bold**</code>, <code className="font-mono text-ink-2">*italics*</code>, <code className="font-mono text-ink-2">-</code> bullet lists,{" "}
          <code className="font-mono text-ink-2">1.</code> numbered lists, <code className="font-mono text-ink-2">[links](https://…)</code>.
        </p>
      </div>
      <FormMessage error={state.error} />
      <Button type="submit" size="lg" disabled={pending || !topicId} className="w-full sm:w-auto">
        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
        {pending ? "Publishing…" : "Publish guide"}
      </Button>
    </form>
  );
}
