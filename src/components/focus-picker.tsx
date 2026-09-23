"use client";

import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setFocusTopics } from "@/app/actions/learning";
import { Button, cn } from "./ui";

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
      <div className="scrollbar-none flex gap-2 overflow-x-auto">
        {courses.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCourseId(c.id)}
            className={cn("h-8 shrink-0 rounded-lg px-3 text-sm font-medium", c.id === courseId ? "bg-ink text-bg" : "bg-bg-subtle text-ink hover:bg-line")}
          >
            {c.title}
          </button>
        ))}
      </div>
      <div className="mt-4 max-h-80 space-y-4 overflow-y-auto pr-1">
        {course?.units.map((u) => (
          <div key={u.id}>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
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
                      "flex h-8 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium transition-colors",
                      on ? "bg-accent text-white" : "bg-bg-subtle text-ink hover:bg-line",
                    )}
                  >
                    {on ? <Check className="size-3.5" strokeWidth={3} /> : null}
                    {t.title}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <Button
          type="button"
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
        </Button>
        {saved ? <span className="text-sm text-positive">Saved. Your feed now leads with these topics.</span> : null}
      </div>
    </div>
  );
}
