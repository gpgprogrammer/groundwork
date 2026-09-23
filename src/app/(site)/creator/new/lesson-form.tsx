"use client";

import { useActionState } from "react";
import { createLesson, type LessonFormState } from "@/app/actions/creator";
import { Field, FormMessage, inputClass } from "@/components/form";
import { Button, cn } from "@/components/ui";

type Group = { course: string; topics: { id: string; title: string; lessons: number }[] };

const STYLES = [
  { value: "Concept", note: "Explain the idea" },
  { value: "Practice", note: "Solve problems" },
  { value: "Common mistakes", note: "Fix the errors" },
  { value: "Exam strategy", note: "Score the points" },
];

export function LessonForm({ groups }: { groups: Group[] }) {
  const [state, action, pending] = useActionState<LessonFormState, FormData>(createLesson, {});
  return (
    <form action={action} className="mt-10 space-y-8">
      <section className="space-y-5 rounded-2xl border border-line bg-surface p-6">
        <Field label="Topic">
          <select name="topicId" required defaultValue="" className={cn(inputClass, "appearance-none")}>
            <option value="" disabled>
              Choose the topic this lesson teaches
            </option>
            {groups.map((g) => (
              <optgroup key={g.course} label={g.course}>
                {g.topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.lessons} lessons)
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </Field>
        <Field label="Title">
          <input name="title" required maxLength={90} className={inputClass} placeholder="e.g. The chain rule, drawn as nested machines" />
        </Field>
        <Field label="Description" hint="What will a student be able to do after watching?">
          <textarea name="description" required rows={3} maxLength={600} className={cn(inputClass, "h-auto py-2.5 leading-relaxed")} />
        </Field>
        <fieldset>
          <legend className="mb-1.5 text-[13px] font-medium text-ink-2">Lesson type</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {STYLES.map((s, i) => (
              <label
                key={s.value}
                className="cursor-pointer rounded-xl border border-line bg-bg p-3 transition-colors has-[:checked]:border-ink has-[:checked]:bg-surface"
              >
                <input type="radio" name="style" value={s.value} defaultChecked={i === 0} className="sr-only" />
                <span className="block text-sm font-medium text-ink">{s.value}</span>
                <span className="block text-xs text-muted">{s.note}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      <section className="space-y-5 rounded-2xl border border-line bg-surface p-6">
        <div className="grid gap-5 sm:grid-cols-[140px_1fr]">
          <Field label="Length (minutes)">
            <input name="minutes" type="number" min={1} max={30} step={0.5} required defaultValue={7} className={inputClass} />
          </Field>
          <Field label="Video file URL" hint="https:// link to an MP4 (optional)">
            <input name="mediaUrl" type="url" className={inputClass} placeholder="https://cdn.example.com/lessons/chain-rule.mp4" />
          </Field>
        </div>
        <Field label="Chapters" hint="One per line: 0:00 Title">
          <textarea
            name="chapters"
            rows={5}
            className={cn(inputClass, "h-auto py-2.5 font-mono text-[13px] leading-relaxed")}
            placeholder={"0:00 The big idea\n1:20 Spotting the inner function\n3:45 Worked example\n6:10 Recap"}
          />
        </Field>
      </section>

      <div className="flex flex-col-reverse items-stretch justify-between gap-4 sm:flex-row sm:items-center">
        <FormMessage error={state.error} />
        <div className="flex gap-2 sm:ml-auto">
          <Button type="submit" name="publish" value="draft" variant="secondary" disabled={pending}>
            Save draft
          </Button>
          <Button type="submit" name="publish" value="published" disabled={pending}>
            {pending ? "Publishing…" : "Publish"}
          </Button>
        </div>
      </div>
    </form>
  );
}
