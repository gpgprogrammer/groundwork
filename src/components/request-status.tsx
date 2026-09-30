"use client";

import { useOptimistic, useTransition } from "react";
import { setRequestStatus } from "@/app/actions/tutoring";
import type { TutoringRequest } from "@/lib/types";
import { cn } from "./ui";

export function RequestStatus({ id, status }: { id: string; status: TutoringRequest["status"] }) {
  const [value, setValue] = useOptimistic(status);
  const [, start] = useTransition();
  return (
    <div className="scrollbar-none -mx-1 mt-4 overflow-x-auto px-1">
      <div className="inline-flex gap-1.5 pb-1" role="group" aria-label="Request status">
        {(["new", "replied", "scheduled", "archived"] as const).map((s) => (
          <button
            key={s}
            onClick={() =>
              start(async () => {
                setValue(s);
                await setRequestStatus(id, s);
              })
            }
            aria-pressed={value === s}
            className={cn(
              "press-sm h-9 shrink-0 rounded-full px-3.5 font-brand text-[13px] font-extrabold capitalize transition-[background-color,color,transform,box-shadow] duration-100 ease-out",
              value === s ? "bg-[#7c3aed] text-white [--ledge:#5b21b6]" : "bg-surface text-muted ring-2 ring-inset ring-line [--ledge:var(--line)] hover:text-ink",
            )}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
