"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Keeps the live numbers fresh while the dashboard is open. */
export function LiveRefresh({ seconds = 30 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const t = setInterval(() => document.visibilityState === "visible" && router.refresh(), seconds * 1000);
    return () => clearInterval(t);
  }, [router, seconds]);
  return null;
}
