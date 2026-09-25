"use client";

import Link from "next/link";
import type { ReactNode } from "react";

/** A landing-page button that records which funnel the visitor chose (Admin → Analytics). */
export function FunnelLink({ href, funnel, className, children }: { href: string; funnel: string; className?: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => {
        const body = JSON.stringify({ type: "cta", ref_id: funnel, path: location.pathname });
        if (!navigator.sendBeacon?.("/api/track", new Blob([body], { type: "application/json" }))) void fetch("/api/track", { method: "POST", body, keepalive: true }).catch(() => {});
      }}
    >
      {children}
    </Link>
  );
}
