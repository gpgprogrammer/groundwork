import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Newsreader, Roboto } from "next/font/google";
import { env } from "@/lib/env";
import "./globals.css";

const roboto = Roboto({ variable: "--font-roboto", subsets: ["latin"], weight: ["400", "500", "700"], display: "swap" });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const newsreader = Newsreader({ variable: "--font-newsreader", subsets: ["latin"], style: ["normal", "italic"], display: "swap" });
const mono = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], display: "swap" });

const description =
  "The best AP and SAT lessons on YouTube, organized by course and topic, ranked by how well they teach, and matched to your class calendar.";

export const metadata: Metadata = {
  metadataBase: new URL(env.appUrl),
  title: { default: "Groundwork: AP and SAT lessons, organized", template: "%s · Groundwork" },
  description,
  openGraph: { title: "Groundwork", description, type: "website", siteName: "Groundwork" },
  twitter: { card: "summary_large_image", title: "Groundwork", description },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0f0f" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${roboto.variable} ${inter.variable} ${newsreader.variable} ${mono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
