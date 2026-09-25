"use client";

import { useEffect } from "react";
import { reportClientError } from "@/components/tracker";

/** Last-resort error page, used when the whole layout fails. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    reportClientError(error);
  }, [error]);
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", margin: 0 }}>
        <div style={{ textAlign: "center", padding: 24 }}>
          <h1 style={{ fontSize: 24 }}>Something went wrong</h1>
          <p style={{ color: "#666" }}>We&apos;ve logged the problem. Try again, and if it keeps happening, reload the page.</p>
          <button onClick={reset} style={{ marginTop: 16, padding: "10px 20px", borderRadius: 999, border: 0, background: "#2563eb", color: "white", fontWeight: 600, cursor: "pointer" }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
