"use client";

import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setMastered } from "@/app/actions/learning";
import { cn } from "./ui";

/** Khan-style "I understand this" toggle for a topic. */
export function MasteryButton({ topicId, mastered, signedIn }: { topicId: string; mastered: boolean; signedIn: boolean }) {
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
        "flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors",
        on ? "bg-accent text-white hover:bg-accent/90" : "bg-bg-subtle text-ink hover:bg-line",
      )}
    >
      <Check className="size-4" strokeWidth={3} />
      {on ? "Understood" : "I understand this"}
    </button>
  );
}
