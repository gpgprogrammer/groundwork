"use client";

import { useState, type ReactNode } from "react";
import { cn } from "./ui";

/** Monthly/annual switch that swaps between two server-rendered price blocks. */
export function BillingToggle({ monthly, annual, savings }: { monthly: ReactNode; annual: ReactNode; savings: number }) {
  const [period, setPeriod] = useState<"year" | "month">("month");
  return (
    <div>
      <div className="inline-flex rounded-full bg-white/15 p-1 text-[13px] font-semibold" role="tablist" aria-label="Billing period">
        {(["month", "year"] as const).map((p) => (
          <button
            key={p}
            role="tab"
            aria-selected={period === p}
            onClick={() => setPeriod(p)}
            className={cn("rounded-full px-3.5 py-1.5 transition-[background-color,color] duration-200", period === p ? "bg-white text-[#0f1729] shadow-soft" : "text-white/80 hover:text-white")}
          >
            {p === "year" ? (
              <>
                Yearly <span className={period === p ? "text-[#15803d]" : "text-white"}>save {savings}%</span>
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
