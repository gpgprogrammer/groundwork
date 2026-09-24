"use client";

import { useState, type ReactNode } from "react";
import { cn } from "./ui";

/** Monthly/annual switch that swaps between two server-rendered price blocks. */
export function BillingToggle({ monthly, annual, savings }: { monthly: ReactNode; annual: ReactNode; savings: number }) {
  const [period, setPeriod] = useState<"year" | "month">("month");
  return (
    <div>
      <div className="inline-flex rounded-full bg-bg-subtle p-1 text-[13px] font-medium" role="tablist" aria-label="Billing period">
        {(["month", "year"] as const).map((p) => (
          <button
            key={p}
            role="tab"
            aria-selected={period === p}
            onClick={() => setPeriod(p)}
            className={cn("rounded-full px-3 py-1.5 transition-colors", period === p ? "bg-bg text-ink shadow-soft" : "text-muted hover:text-ink")}
          >
            {p === "year" ? (
              <>
                Yearly <span className="text-positive">save {savings}%</span>
              </>
            ) : (
              "Monthly"
            )}
          </button>
        ))}
      </div>
      <div className="mt-4">{period === "year" ? annual : monthly}</div>
    </div>
  );
}
