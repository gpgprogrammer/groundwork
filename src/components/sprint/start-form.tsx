"use client";

import { ArrowRight } from "lucide-react";
import { useActionState, useState } from "react";
import { createSprint, type CreateState } from "@/app/actions/sprint";
import { StudyTimeInput } from "../study-time-input";

type Opt = { id: string; title: string; category: string; defaultDate: string | null };

export function SprintStartForm({ courses, initialCourse, signedIn }: { courses: Opt[]; initialCourse: string | null; signedIn: boolean }) {
  const [state, action, pending] = useActionState<CreateState, FormData>(createSprint, {});
  const [courseId, setCourseId] = useState(initialCourse ?? "");
  const course = courses.find((c) => c.id === courseId);
  const groups = [...new Set(courses.map((c) => c.category))];
  if (!signedIn) {
    return (
      <div className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-white/80">Exam</span>
          <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="h-12 w-full rounded-xl bg-white px-3 text-[15px] text-[#0f172a]">
            <option value="">Choose your exam</option>
            {groups.map((g) => (
              <optgroup key={g} label={g}>
                {courses.filter((c) => c.category === g).map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <a href={`/signup?next=${encodeURIComponent(`/sprint${courseId ? `?course=${courseId}` : ""}`)}`} className="flex h-12 items-center justify-center gap-2 rounded-full bg-white text-[15px] font-semibold text-[#0f172a] hover:bg-white/90">
          Start the free diagnostic <ArrowRight className="size-4" />
        </a>
        <p className="text-center text-[12px] text-white/70">Free account, no card. Takes 20 seconds.</p>
      </div>
    );
  }
  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-medium text-white/80">Exam</span>
        <select name="courseId" required value={courseId} onChange={(e) => setCourseId(e.target.value)} className="h-12 w-full rounded-xl bg-white px-3 text-[15px] text-[#0f172a]">
          <option value="" disabled>
            Choose your exam
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
          <span className="mb-1.5 block text-[13px] font-medium text-white/80">Exam date</span>
          <input key={courseId} type="date" name="examDate" required defaultValue={course?.defaultDate ?? ""} className="h-12 w-full rounded-xl bg-white px-3 text-[15px] text-[#0f172a]" />
        </label>
      </div>
      <StudyTimeInput defaultMinutes={45} label="How much time do you have each day?" onDark />
      {course?.defaultDate ? <p className="text-[12px] text-white/70">AP exams run the first two weeks of May. Check your exact date with your AP coordinator.</p> : null}
      {state.error ? <p className="text-sm font-medium text-[#ffd2b8]">{state.error}</p> : null}
      <button type="submit" disabled={pending} className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white text-[15px] font-semibold text-[#0f172a] hover:bg-white/90 disabled:opacity-60">
        {pending ? "Setting up…" : "Start the free diagnostic"} <ArrowRight className="size-4" />
      </button>
    </form>
  );
}
