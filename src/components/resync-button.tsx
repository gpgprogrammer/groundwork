"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { resyncCalendar } from "@/app/actions/learning";
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
            const r = await resyncCalendar();
            setError(r.ok ? null : r.error);
            router.refresh();
          })
        }
        disabled={pending}
        className="flex h-8 items-center gap-1.5 rounded-full bg-bg-subtle px-3 text-sm font-medium text-ink hover:bg-line"
      >
        <RefreshCw className={cn("size-4", pending && "animate-spin")} /> {pending ? "Syncing" : "Sync now"}
      </button>
      {error ? <p className="mt-1 max-w-48 text-xs text-[#c2410c]">{error}</p> : null}
    </div>
  );
}
