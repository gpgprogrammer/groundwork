"use client";

import { useEffect } from "react";
import { reportClientError } from "@/components/tracker";

/** Last-resort error page, used when the whole layout fails. Inline styles: the app's CSS may not have loaded. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    reportClientError(error);
  }, [error]);
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          margin: 0,
          background: "#fbfcfd",
          color: "#0f1729",
        }}
      >
        <div style={{ textAlign: "center", padding: 24, maxWidth: 420 }}>
          <svg viewBox="0 0 64 64" width="52" height="52" aria-hidden style={{ display: "block", margin: "0 auto" }}>
            <rect width="64" height="64" rx="16" fill="#2563eb" />
            <path d="M19 31.5v8.2c0 4.1 5.8 7.3 13 7.3s13-3.2 13-7.3v-8.2L32 37.6Z" fill="#e6eeff" />
            <path d="M32 14.5 56 26 32 37.5 8 26Z" fill="#fff" />
          </svg>
          <h1 style={{ fontSize: 26, fontWeight: 650, letterSpacing: "-0.02em", margin: "24px 0 0" }}>Something went wrong</h1>
          <p style={{ color: "#5b6475", fontSize: 15, lineHeight: 1.6, margin: "8px 0 0" }}>We&apos;ve logged the problem. Try again, and if it keeps happening, reload the page.</p>
          <button
            onClick={reset}
            style={{ marginTop: 28, height: 44, padding: "0 22px", borderRadius: 999, border: 0, background: "#2563eb", color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
          >
            Try again
          </button>
          {error.digest ? <p style={{ marginTop: 24, fontFamily: "ui-monospace, Menlo, monospace", fontSize: 12, color: "#8a93a3" }}>Ref: {error.digest}</p> : null}
        </div>
      </body>
    </html>
  );
}
