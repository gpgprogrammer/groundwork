import Link from "next/link";
import { cn } from "./ui";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" className={cn("size-7", className)} aria-hidden>
      <rect width="28" height="28" rx="7" fill="#1865f2" />
      <path d="M11 8.6v10.8c0 .7.8 1.1 1.4.7l8.2-5.4a.8.8 0 0 0 0-1.4l-8.2-5.4c-.6-.4-1.4 0-1.4.7Z" fill="#fff" />
      <rect x="6" y="21.5" width="16" height="1.8" rx=".9" fill="#fff" opacity=".55" />
    </svg>
  );
}

export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-1.5 text-ink", className)} aria-label="Groundwork home">
      <LogoMark />
      <span className="text-[19px] font-bold tracking-[-0.04em]">Groundwork</span>
    </Link>
  );
}
