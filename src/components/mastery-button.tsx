"use client";

import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setMastered } from "@/app/actions/learning";
import { cn } from "./ui";

/** Khan-style "I understand this" toggle for a topic. */
export function MasteryButton({ topicId, mastered, signedIn, onColor = false }: { topicId: string; mastered: boolean; signedIn: boolean; onColor?: boolean }) {
  const router = useRouter();
  const [on, setOn] = useState(mastered);
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => {
        if (!signedIn) return router.push("/login");
        const next = !on;
        setOn(next);
        start(async () => {
          const r = await setMastered(topicId, next);
          if ("error" in r) setOn(!next);
        });
      }}
      aria-pressed={on}
      className={cn(
        "press flex min-h-14 shrink-0 items-center gap-2.5 rounded-2xl px-3.5 text-left font-brand text-[14.5px] font-extrabold leading-tight sm:gap-3 sm:px-4 sm:text-[15px]",
        onColor
          ? on
            ? "bg-positive text-white [--ledge:var(--positive-press)]"
            : "bg-white/15 text-white ring-2 ring-inset ring-white/30 [--ledge:rgb(0_0_0/0.18)] hover:bg-white/25"
          : on
            ? "bg-positive text-white [--ledge:var(--positive-press)]"
            : "bg-surface text-ink ring-2 ring-inset ring-line [--ledge:var(--line)] hover:bg-bg-subtle",
      )}
    >
      <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-full", on ? "bg-white/25" : onColor ? "bg-white/20" : "bg-bg-subtle")}>
        <Check key={String(on)} className={cn("size-4", on && "check-pop")} strokeWidth={3.5} />
      </span>
      {on ? "Understood" : "I understand this"}
    </button>
  );
}
