"use client";

import { useOptimistic, useTransition } from "react";
import { setRequestStatus } from "@/app/actions/creator";
import { cn } from "@/components/ui";
import type { TutoringRequest } from "@/lib/types";

const LABELS: Record<TutoringRequest["status"], string> = {
  new: "New",
  replied: "Replied",
  scheduled: "Scheduled",
  archived: "Archived",
};

export function RequestActions({
  id,
  status,
  email,
  name,
  educatorFirstName,
}: {
  id: string;
  status: TutoringRequest["status"];
  email: string;
  name: string;
  educatorFirstName: string;
}) {
  const [optimistic, setOptimistic] = useOptimistic(status);
  const [, start] = useTransition();
  const set = (s: TutoringRequest["status"]) =>
    start(async () => {
      setOptimistic(s);
      await setRequestStatus(id, s);
    });

  const subject = encodeURIComponent("Tutoring on Groundwork");
  const body = encodeURIComponent(`Hi ${name.split(" ")[0]},\n\nThanks for reaching out! \n\n— ${educatorFirstName}`);

  return (
    <div className="mt-4 flex items-center justify-between gap-2 border-t border-line pt-3">
      <a
        href={`mailto:${email}?subject=${subject}&body=${body}`}
        onClick={() => optimistic === "new" && set("replied")}
        className="text-[13px] font-medium text-ink hover:underline"
      >
        Reply by email
      </a>
      <div className="flex gap-1" role="group" aria-label="Request status">
        {(["replied", "scheduled", "archived"] as const).map((s) => (
          <button
            key={s}
            onClick={() => set(optimistic === s ? "new" : s)}
            aria-pressed={optimistic === s}
            className={cn(
              "rounded-md px-2 py-1 text-xs transition-colors",
              optimistic === s ? "bg-ink text-bg" : "text-muted hover:bg-bg-subtle hover:text-ink",
            )}
          >
            {LABELS[s]}
          </button>
        ))}
      </div>
    </div>
  );
}
