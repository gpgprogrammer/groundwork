"use client";

import { ArrowRight } from "lucide-react";
import { useActionState, useState } from "react";
import { createTestSprint, type CreateState } from "@/app/actions/sprint";
import { inputClass, selectClass } from "../form";
import { buttonClass } from "../ui";

const chunky = (base: string) => base.replace("h-11", "h-12").replace("rounded-xl", "rounded-2xl").replace("ring-1 ring-inset", "ring-2 ring-inset").replace("text-[15px]", "text-[16px] font-semibold").replace("focus:ring-accent", "focus:ring-sprint");
const label = "mb-1.5 block font-brand text-[14px] font-extrabold text-ink";
import { StudyTimeInput } from "../study-time-input";

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
        <span className={label}>Test</span>
        <input name="title" required defaultValue={initial.title} maxLength={120} className={chunky(inputClass)} placeholder="Unit 3 Test" />
      </label>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block sm:col-span-2">
          <span className={label}>Class</span>
          <select name="courseId" required value={courseId} onChange={(e) => setCourseId(e.target.value)} className={chunky(selectClass)}>
            <option value="">Choose the class</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={label}>Test date</span>
          <input type="date" name="examDate" required defaultValue={initial.date} className={chunky(inputClass)} />
        </label>
      </div>
      {course ? (
        <fieldset key={course.id}>
          <legend className="mb-2 font-brand text-[14px] font-extrabold text-ink">Which units are on the test?</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {course.units.map((u) => (
              <label key={u.id} className="press-sm flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl bg-surface px-3.5 py-2.5 text-[14.5px] font-semibold text-ink ring-2 ring-inset ring-line [--ledge:var(--line)] has-[:checked]:bg-sprint-soft has-[:checked]:ring-sprint has-[:checked]:[--ledge:var(--sprint-press)]">
                <input type="checkbox" name="unitIds" value={u.id} defaultChecked={initial.unitIds.includes(u.id)} className="size-5 shrink-0 accent-[var(--sprint)]" />
                {u.label}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}
      <StudyTimeInput defaultMinutes={30} label="How much time do you have each day?" />
      {state.error ? <p className="text-sm font-semibold text-danger" role="alert">{state.error}</p> : null}
      <button disabled={pending} className={buttonClass("sprint", "lg", "w-full sm:w-auto")}>
        {pending ? "Setting up…" : "Start the free diagnostic"} <ArrowRight className="size-4" />
      </button>
    </form>
  );
}
