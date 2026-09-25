"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

function send(body: object) {
  const data = JSON.stringify(body);
  if (!navigator.sendBeacon?.("/api/track", new Blob([data], { type: "application/json" }))) {
    void fetch("/api/track", { method: "POST", body: data, keepalive: true }).catch(() => {});
  }
}

/** Sends one page view per navigation to Merit's own analytics. */
export function Tracker({ uid }: { uid: string | null }) {
  const pathname = usePathname();
  const first = useRef(true);
  useEffect(() => {
    send({ type: "view", path: pathname, ref: first.current ? document.referrer : "", w: window.innerWidth, u: uid });
    first.current = false;
  }, [pathname, uid]);
  return null;
}

export function trackPlay(id: string) {
  send({ type: "upload_play", ref_id: id, path: location.pathname });
}

/** Reports a crash the visitor saw (from an error page) so admins can fix it. */
export function reportClientError(error: Error & { digest?: string }) {
  send({ type: "error", message: error.message, digest: error.digest, stack: error.stack?.slice(0, 2000), path: location.pathname });
}
