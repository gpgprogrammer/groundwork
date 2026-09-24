"use client";

import { useOptimistic, useTransition } from "react";
import { setRequestStatus } from "@/app/actions/tutoring";
import type { TutoringRequest } from "@/lib/types";
import { cn } from "./ui";

export function RequestStatus({ id, status }: { id: string; status: TutoringRequest["status"] }) {
  const [value, setValue] = useOptimistic(status);
  const [, start] = useTransition();
  return (
    <div className="mt-4 flex flex-wrap gap-1.5 border-t border-line pt-3" role="group" aria-label="Request status">
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
          className={cn("rounded-full px-3 py-1 text-xs font-medium capitalize", value === s ? "bg-ink text-bg" : "bg-bg-subtle text-ink hover:bg-line")}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
