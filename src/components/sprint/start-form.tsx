"use client";

import { ArrowRight } from "lucide-react";
import { useActionState, useState } from "react";
import { createSprint, type CreateState } from "@/app/actions/sprint";
import { StudyTimeInput } from "../study-time-input";
import { selectClass, inputClass } from "../form";
import { buttonClass } from "../ui";

/** The shared field style, made chunkier for the Sprint start tile. */
const chunky = (base: string) => base.replace("h-11", "h-12").replace("rounded-xl", "rounded-2xl").replace("ring-1 ring-inset", "ring-2 ring-inset").replace("text-[15px]", "text-[16px] font-semibold").replace("focus:ring-accent", "focus:ring-sprint");

type Opt = { id: string; title: string; category: string; defaultDate: string | null; isClass?: boolean };

export function SprintStartForm({ courses, initialCourse, signedIn }: { courses: Opt[]; initialCourse: string | null; signedIn: boolean }) {
  const [state, action, pending] = useActionState<CreateState, FormData>(createSprint, {});
  const [courseId, setCourseId] = useState(initialCourse ?? "");
  const course = courses.find((c) => c.id === courseId);
  const groups = [...new Set(courses.map((c) => c.category))];
  if (!signedIn) {
    return (
      <div className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block font-brand text-[14px] font-extrabold text-ink">Course or exam</span>
          <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className={chunky(selectClass)}>
            <option value="">Choose a course</option>
            {groups.map((g) => (
              <optgroup key={g} label={g}>
                {courses.filter((c) => c.category === g).map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <a href={`/signup?next=${encodeURIComponent(`/sprint${courseId ? `?course=${courseId}` : ""}`)}`} className={buttonClass("sprint", "lg", "w-full")}>
          Start the free diagnostic <ArrowRight className="size-4" />
        </a>
        <p className="text-center text-[12.5px] text-muted">Free account, no card. Takes 20 seconds.</p>
      </div>
    );
  }
  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block font-brand text-[14px] font-extrabold text-ink">Course or exam</span>
        <select name="courseId" required value={courseId} onChange={(e) => setCourseId(e.target.value)} className={chunky(selectClass)}>
          <option value="" disabled>
            Choose a course
          </option>
          {groups.map((g) => (
            <optgroup key={g} label={g}>
              {courses
                .filter((c) => c.category === g)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
      </label>
      <div>
        <label className="block">
          <span className="mb-1.5 block font-brand text-[14px] font-extrabold text-ink">{course?.isClass ? "Test date" : "Exam date"}</span>
          <input key={courseId} type="date" name="examDate" required defaultValue={course?.defaultDate ?? ""} className={chunky(inputClass)} />
        </label>
      </div>
      <StudyTimeInput defaultMinutes={45} label="How much time do you have each day?" />
      {course?.defaultDate ? <p className="text-[12.5px] text-muted">AP exams run the first two weeks of May. Check your exact date with your AP coordinator.</p> : null}
      {state.error ? <p className="text-sm font-medium text-danger" role="alert">{state.error}</p> : null}
      <button type="submit" disabled={pending} className={buttonClass("sprint", "lg", "w-full")}>
        {pending ? "Setting up…" : "Start the free diagnostic"} <ArrowRight className="size-4" />
      </button>
    </form>
  );
}
