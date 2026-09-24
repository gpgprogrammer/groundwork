"use client";

import { ArrowRight } from "lucide-react";
import { useActionState, useState } from "react";
import { createTestSprint, type CreateState } from "@/app/actions/sprint";
import { inputClass } from "../form";

type CourseUnits = { id: string; title: string; units: { id: string; label: string }[] };

export function TestSprintForm({
  courses,
  initial,
}: {
  courses: CourseUnits[];
  initial: { courseId: string; title: string; date: string; unitIds: string[]; eventUid: string | null };
}) {
  const [state, action, pending] = useActionState<CreateState, FormData>(createTestSprint, {});
  const [courseId, setCourseId] = useState(initial.courseId);
  const course = courses.find((c) => c.id === courseId);
  return (
    <form action={action} className="space-y-5">
      {initial.eventUid ? <input type="hidden" name="eventUid" value={initial.eventUid} /> : null}
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-medium text-ink-2">Test</span>
        <input name="title" required defaultValue={initial.title} maxLength={120} className={inputClass} placeholder="Unit 3 Test" />
      </label>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-[13px] font-medium text-ink-2">Class</span>
          <select name="courseId" required value={courseId} onChange={(e) => setCourseId(e.target.value)} className={inputClass}>
            <option value="">Choose the class</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-ink-2">Test date</span>
          <input type="date" name="examDate" required defaultValue={initial.date} className={inputClass} />
        </label>
      </div>
      {course ? (
        <fieldset key={course.id}>
          <legend className="mb-2 text-[13px] font-medium text-ink-2">Which units are on the test?</legend>
          <div className="grid gap-1.5 sm:grid-cols-2">
            {course.units.map((u) => (
              <label key={u.id} className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] text-ink ring-1 ring-line has-[:checked]:bg-accent-soft has-[:checked]:ring-accent">
                <input type="checkbox" name="unitIds" value={u.id} defaultChecked={initial.unitIds.includes(u.id)} className="size-4 accent-[var(--accent)]" />
                {u.label}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}
      <label className="block max-w-48">
        <span className="mb-1.5 block text-[13px] font-medium text-ink-2">Time per day</span>
        <select name="minutesPerDay" defaultValue="30" className={inputClass}>
          {[15, 20, 30, 45, 60, 90].map((m) => (
            <option key={m} value={m}>
              {m} min
            </option>
          ))}
        </select>
      </label>
      {state.error ? <p className="text-sm text-[#c2410c]">{state.error}</p> : null}
      <button disabled={pending} className="inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-[#ff8a3d] to-[#e0531c] px-6 text-[15px] font-semibold text-white disabled:opacity-60">
        {pending ? "Setting up…" : "Start the free diagnostic"} <ArrowRight className="size-4" />
      </button>
    </form>
  );
}
