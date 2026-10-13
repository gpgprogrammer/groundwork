import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The video library, its audit, and editors' picks are read from disk at runtime; ship them with every function.
  outputFileTracingIncludes: { "/**": ["./src/data/youtube.json", "./src/data/video-audit.json", "./src/data/picks.json", "./src/data/explainers.json"] },
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
    ];
  },
};

export default nextConfig;
