"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { resyncCalendars } from "@/app/actions/schedule";
import { cn } from "./ui";

export function ResyncButton() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="text-right">
      <button
        onClick={() =>
          start(async () => {
            const r = await resyncCalendars();
            setError(r.ok ? null : r.error);
            router.refresh();
          })
        }
        disabled={pending}
        className="press-sm flex h-9 items-center gap-1.5 rounded-xl border-2 border-line bg-surface px-3 font-brand text-[13px] font-extrabold text-ink [--ledge:var(--line)] hover:bg-bg-subtle disabled:opacity-70"
      >
        <RefreshCw className={cn("size-4", pending && "animate-spin")} /> {pending ? "Syncing" : "Sync all"}
      </button>
      {error ? <p className="mt-1 max-w-48 text-xs font-semibold text-danger" role="alert">{error}</p> : null}
    </div>
  );
}
