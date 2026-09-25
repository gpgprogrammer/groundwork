import { ImageResponse } from "next/og";

export const alt = "Merit Learning: AP and SAT lessons, study plans, and tutors";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const LOGO = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#ffffff"/><path d="M19 31.5v8.2c0 4.1 5.8 7.3 13 7.3s13-3.2 13-7.3v-8.2L32 37.6Z" fill="#bcd3ff"/><path d="M32 14.5 56 26 32 37.5 8 26Z" fill="#2346c7"/><path d="M50.5 28.6v10.6" stroke="#4287f5" stroke-width="2.6" stroke-linecap="round"/><circle cx="50.5" cy="41.4" r="2.9" fill="#4287f5"/></svg>`,
)}`;

/** The picture shown when a Merit link is shared in a text, on social media, or in Slack. */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, color: "white", background: "linear-gradient(135deg, #2d5ff0 0%, #2346c7 55%, #172a7a 100%)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <img src={LOGO} width={88} height={88} alt="" />
          <div style={{ fontSize: 64, fontWeight: 800, letterSpacing: -2 }}>merit</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 800, letterSpacing: -2.5, lineHeight: 1.05 }}>Know what to study tonight.</div>
          <div style={{ marginTop: 22, fontSize: 34, opacity: 0.85 }}>Every AP course and the SAT: lessons, study plans, Exam Sprints, and tutors.</div>
        </div>
        <div style={{ display: "flex", fontSize: 28, opacity: 0.8 }}>meritlearning.org</div>
      </div>
    ),
    size,
  );
}
