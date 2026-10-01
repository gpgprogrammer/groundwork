"use client";

import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setFocusTopics } from "@/app/actions/learning";
import { cn } from "./ui";

export type FocusCourse = { id: string; title: string; units: { id: string; title: string; order: number; topics: { id: string; title: string }[] }[] };

/** "What are you covering in class right now?" Pick a unit, then topics. */
export function FocusPicker({ courses, initial, onSaved }: { courses: FocusCourse[]; initial: string[]; onSaved?: () => void }) {
  const router = useRouter();
  const [picked, setPicked] = useState<string[]>(initial);
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "");
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const course = courses.find((c) => c.id === courseId);

  const toggle = (id: string) => {
    setSaved(false);
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= 12 ? p : [...p, id]));
  };

  if (!courses.length) return <p className="text-sm text-muted">Choose your courses first.</p>;

  return (
    <div>
      <div className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 pb-1.5 pt-0.5">
        {courses.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCourseId(c.id)}
            aria-pressed={c.id === courseId}
            className={cn(
              "press-sm h-10 shrink-0 rounded-xl px-4 font-brand text-[13.5px] font-extrabold",
              c.id === courseId ? "bg-ink text-bg [--ledge:color-mix(in_oklab,var(--ink)_55%,black)]" : "border-2 border-line bg-surface text-ink-2 [--ledge:var(--line)] hover:bg-bg-subtle",
            )}
          >
            {c.title}
          </button>
        ))}
      </div>
      <div className="mt-4 max-h-80 space-y-4 overflow-y-auto px-0.5 pb-1 pr-1">
        {course?.units.map((u) => (
          <div key={u.id}>
            <p className="font-brand text-[13.5px] font-extrabold text-ink-2">
              Unit {u.order}: {u.title}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {u.topics.map((t) => {
                const on = picked.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggle(t.id)}
                    aria-pressed={on}
                    className={cn(
                      "press-sm flex min-h-10 items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-left text-[13.5px] font-semibold",
                      on ? "bg-[#15803d] text-white [--ledge:#0f5c2b]" : "border-2 border-line bg-surface text-ink [--ledge:var(--line)] hover:bg-bg-subtle",
                    )}
                  >
                    {on ? <Check className="check-pop size-3.5" strokeWidth={3} /> : null}
                    {t.title}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          className="press inline-flex h-11 items-center rounded-2xl bg-[#15803d] px-5 font-brand text-[15px] font-extrabold text-white [--ledge:#0f5c2b] hover:brightness-110 disabled:opacity-60"
          disabled={pending}
          onClick={() =>
            start(async () => {
              await setFocusTopics(picked);
              setSaved(true);
              onSaved?.();
              router.refresh();
            })
          }
        >
          {pending ? "Saving…" : `Save ${picked.length ? `(${picked.length})` : ""}`}
        </button>
        {saved ? <span className="fade text-sm font-semibold text-positive" role="status">Saved. Your learning plan and feed now lead with these topics.</span> : null}
      </div>
    </div>
  );
}
