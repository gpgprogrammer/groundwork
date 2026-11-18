import type { Metadata, Viewport } from "next";
import { Figtree, Nunito } from "next/font/google";
import { env } from "@/lib/env";
import "./globals.css";

const figtree = Figtree({ variable: "--font-figtree", subsets: ["latin", "latin-ext"], display: "swap" });
// Rounded display face: the "merit" wordmark and every heading.
const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"], weight: ["700", "800", "900"], display: "swap" });

const description = "Your cheat code for math. Ranked math lessons from Algebra 1 to AP Calculus and SAT Math, adaptive practice, on-call tutors, and a plan for every test.";

export const metadata: Metadata = {
  metadataBase: new URL(env.appUrl),
  title: { default: "Merit Learning: your cheat code for math", template: "%s · Merit" },
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
