"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

function beacon(data: string) {
  if (!navigator.sendBeacon?.("/api/track", new Blob([data], { type: "application/json" }))) {
    void fetch("/api/track", { method: "POST", body: data, keepalive: true }).catch(() => {});
  }
}

/**
 * The first event in a tab waits for its response before anything else is sent. On a first visit there's
 * no visitor cookie yet; without this, two events sent at once would each get a different new visitor id
 * and the first one (which carries where the visit came from) would end up orphaned.
 */
let gate: Promise<unknown> | null = null;
function send(body: object) {
  const data = JSON.stringify(body);
  let ready = false;
  try {
    ready = sessionStorage.getItem("mv_ready") === "1";
  } catch {}
  if (ready) return beacon(data);
  if (!gate) {
    gate = fetch("/api/track", { method: "POST", body: data, keepalive: true })
      .then(() => {
        try {
          sessionStorage.setItem("mv_ready", "1");
        } catch {}
      })
      .catch(() => {});
    return;
  }
  void gate.then(() => beacon(data));
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
 * - "time": seconds the page was visible and in use, sent every minute while in use and when the visitor
 *   leaves or hides the tab (each report covers only the time since the last one).
 * - "act": what the visitor clicked (the button or link label), so admins can see what each person did.
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
      if (engaged && active >= 1000) {
        send({ type: "time", path: pathname, s: active / 1000, u: uidRef.current });
        active = 0;
      }
    };
    // Report every minute too, so a closed laptop or a crashed tab loses at most a minute.
    const every = window.setInterval(() => document.visibilityState === "visible" && flush(), 60_000);
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
      else {
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
      window.clearInterval(every);
      flush();
      for (const ev of inputs) window.removeEventListener(ev, onInput, opts);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
    };
  }, [pathname]);

  // What people click: the label of each button or link (never anything typed into a field).
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.("a[href],button,summary,[role=button],[role=tab],[role=switch],[role=radio],[role=checkbox],[role=option]") as HTMLElement | null;
      if (!el || el.closest("[data-track=off]")) return;
      let label = (el.getAttribute("aria-label") || el.innerText || el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80);
      if (el instanceof HTMLAnchorElement) {
        try {
          const url = new URL(el.href);
          const where = url.origin === location.origin ? url.pathname : url.host;
          label = label ? `${label} → ${where}` : where;
        } catch {}
      }
      if (!label) return;
      const role = el.getAttribute("role");
      const state = el.getAttribute("aria-pressed") ?? (role === "switch" || role === "checkbox" ? el.getAttribute("aria-checked") : null);
      send({ type: "act", x: "click", d: state ? `${label} (${state === "true" ? "turned off" : "turned on"})` : label, path: location.pathname, u: uidRef.current });
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  return null;
}

export function trackPlay(id: string) {
  send({ type: "upload_play", ref_id: id, path: location.pathname });
}

/** Reports a crash the visitor saw (from an error page) so admins can fix it. */
export function reportClientError(error: Error & { digest?: string }) {
  send({ type: "error", message: error.message, digest: error.digest, stack: error.stack?.slice(0, 2000), path: location.pathname });
}
