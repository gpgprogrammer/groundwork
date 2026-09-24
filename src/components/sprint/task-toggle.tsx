"use client";

import { Check } from "lucide-react";
import { useOptimistic, useTransition } from "react";
import { toggleSprintTask } from "@/app/actions/sprint";
import { cn } from "../ui";

export function SprintTaskToggle({ sprintId, taskId, done }: { sprintId: string; taskId: string; done: boolean }) {
  const [on, setOn] = useOptimistic(done);
  const [, start] = useTransition();
  return (
    <button
      type="button"
      onClick={() =>
        start(async () => {
          setOn(!on);
          await toggleSprintTask(sprintId, taskId, !on);
        })
      }
      aria-pressed={on}
      aria-label={on ? "Mark not done" : "Mark done"}
      className={cn("flex size-7 shrink-0 items-center justify-center rounded-full transition-colors", on ? "bg-positive text-white" : "ring-2 ring-line-strong hover:ring-positive")}
    >
      {on ? <Check className="size-4" strokeWidth={3} /> : null}
    </button>
  );
}
