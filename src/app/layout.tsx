import type { Metadata, Viewport } from "next";
import { Figtree, Nunito } from "next/font/google";
import { env } from "@/lib/env";
import "./globals.css";

const figtree = Figtree({ variable: "--font-figtree", subsets: ["latin", "latin-ext"], display: "swap" });
// Rounded display face: the "merit" wordmark and every heading.
const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"], weight: ["700", "800", "900"], display: "swap" });

const description = "Understand what you're studying tonight. The best videos and tutors in the world for every AP course and the SAT, plus Merit AI and a plan for every test.";

export const metadata: Metadata = {
  metadataBase: new URL(env.appUrl),
  title: { default: "Merit Learning: AP and SAT, mastered", template: "%s · Merit" },
  description,
  applicationName: "Merit Learning",
  openGraph: { title: "Merit Learning", description, type: "website", siteName: "Merit Learning" },
  twitter: { card: "summary_large_image", title: "Merit Learning", description },
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfcfd" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0e14" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${figtree.variable} ${nunito.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
