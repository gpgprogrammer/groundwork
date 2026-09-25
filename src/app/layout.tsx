import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Newsreader, Nunito, Roboto } from "next/font/google";
import { env } from "@/lib/env";
import "./globals.css";

const roboto = Roboto({ variable: "--font-roboto", subsets: ["latin"], weight: ["400", "500", "700"], display: "swap" });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin", "latin-ext"], weight: ["700", "800", "900"], display: "swap" });
const newsreader = Newsreader({ variable: "--font-newsreader", subsets: ["latin"], style: ["normal", "italic"], display: "swap" });
const mono = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], display: "swap" });

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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0f0f" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${roboto.variable} ${inter.variable} ${nunito.variable} ${newsreader.variable} ${mono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
