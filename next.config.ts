import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The live courses' video library (built by `prebuild`), its audit, and editors' picks are read from disk at runtime; ship them with every function. The full library (youtube.json) stays out of the bundle.
  outputFileTracingIncludes: { "/**": ["./src/data/youtube-live.json", "./src/data/video-audit.json", "./src/data/picks.json", "./src/data/explainers.json"] },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "yt3.ggpht.com" },
    ],
  },
  async redirects() {
    return [
      { source: "/watch/:id", destination: "/go/:id", permanent: false },
      // The video catalog used to live at /home; Home is now the front page.
      { source: "/home", destination: "/lessons", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        // Reel Studio is shown inside /admin/studio, on this site only. Its voice recorder needs the microphone.
        source: "/admin/studio/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
