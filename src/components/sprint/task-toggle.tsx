"use client";

import { Check } from "lucide-react";
import { useOptimistic, useTransition } from "react";
import { toggleSprintTask } from "@/app/actions/sprint";
import { cn } from "../ui";

/** A path node that doubles as the task's checkbox: tap to complete, the check pops in. */
export function SprintTaskToggle({ sprintId, taskId, done, step }: { sprintId: string; taskId: string; done: boolean; step?: number }) {
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
      className={cn(
        "press-sm group/t flex size-12 shrink-0 items-center justify-center rounded-full font-brand text-[17px] font-black",
        on ? "bg-positive text-bg [--ledge:var(--positive-press)]" : "bg-surface text-muted ring-2 ring-inset ring-line-strong [--ledge:var(--line-strong)] hover:text-positive hover:ring-positive",
      )}
    >
      {on ? (
        <Check className="check-pop size-6" strokeWidth={3.5} />
      ) : step !== undefined ? (
        <>
          <span className="tabular group-hover/t:hidden">{step}</span>
          <Check className="hidden size-5 group-hover/t:block" strokeWidth={3} />
        </>
      ) : (
        <Check className="size-5 opacity-30" strokeWidth={3} />
      )}
    </button>
  );
}
