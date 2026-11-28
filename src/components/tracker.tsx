"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

function send(body: object) {
  const data = JSON.stringify(body);
  if (!navigator.sendBeacon?.("/api/track", new Blob([data], { type: "application/json" }))) {
    void fetch("/api/track", { method: "POST", body: data, keepalive: true }).catch(() => {});
  }
}

/** Campaign tag on the landing URL: ?utm_source=instagram or ?ref=tiktok. */
function campaign() {
  const q = new URLSearchParams(location.search);
  return q.get("utm_source") || q.get("ref") || undefined;
}

/**
 * Merit's own analytics, one page view per navigation, plus two signals that make the numbers honest:
 * - "engage": sent once per page after a real interaction (mouse, tap, wheel, key). Bots that load
 *   pages and run JavaScript almost never do this, so the dashboard counts only engaged visitors.
 * - "time": seconds the page was visible and in use, sent when the visitor leaves or hides the tab.
 */
export function Tracker({ uid }: { uid: string | null }) {
  const pathname = usePathname();
  const first = useRef(true);
  const uidRef = useRef(uid);
  useEffect(() => {
    uidRef.current = uid;
  }, [uid]);

  useEffect(() => {
    const u = uidRef.current;
    send({ type: "view", path: pathname, ref: first.current ? document.referrer : "", src: first.current ? campaign() : undefined, w: window.innerWidth, u });
    first.current = false;

    let engaged = false;
    let active = 0; // ms of visible time, counted only after the first interaction
    let since = document.visibilityState === "visible" ? Date.now() : 0;
    let lastInput = Date.now();
    let flushed = false;

    const tick = () => {
      if (since) {
        // Stop counting after 2 idle minutes (tab left open while doing something else).
        const end = Math.min(Date.now(), lastInput + 120_000);
        if (end > since) active += end - since;
      }
      since = document.visibilityState === "visible" ? Date.now() : 0;
    };
    const onInput = () => {
      lastInput = Date.now();
      if (!since && document.visibilityState === "visible") since = Date.now();
      if (!engaged) {
        engaged = true;
        send({ type: "engage", path: pathname, u: uidRef.current });
      }
    };
    const flush = () => {
      tick();
      if (engaged && !flushed && active >= 1000) {
        flushed = true;
        send({ type: "time", path: pathname, s: active / 1000, u: uidRef.current });
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
      else {
        flushed = false;
        active = 0;
        since = Date.now();
        lastInput = Date.now();
      }
    };
    const opts = { passive: true, capture: true } as const;
    const inputs = ["pointerdown", "pointermove", "keydown", "touchstart", "wheel"] as const;
    for (const ev of inputs) window.addEventListener(ev, onInput, opts);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);
    return () => {
      flush();
      for (const ev of inputs) window.removeEventListener(ev, onInput, opts);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
    };
  }, [pathname]);
  return null;
}

export function trackPlay(id: string) {
  send({ type: "upload_play", ref_id: id, path: location.pathname });
}

/** Reports a crash the visitor saw (from an error page) so admins can fix it. */
export function reportClientError(error: Error & { digest?: string }) {
  send({ type: "error", message: error.message, digest: error.digest, stack: error.stack?.slice(0, 2000), path: location.pathname });
}
