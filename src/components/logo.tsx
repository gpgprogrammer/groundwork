import Link from "next/link";
import { cn } from "./ui";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-[22px]", className)} aria-hidden>
      <rect x="1" y="1" width="22" height="22" rx="6.5" className="fill-ink" />
      <rect x="6" y="13.5" width="12" height="2.2" rx="1.1" className="fill-bg" />
      <rect x="6" y="17.3" width="12" height="2.2" rx="1.1" className="fill-bg" opacity="0.55" />
      <circle cx="12" cy="8.6" r="2.6" className="fill-bg" />
    </svg>
  );
}

export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-2 text-ink", className)} aria-label="Groundwork home">
      <LogoMark />
      <span className="text-[15px] font-semibold tracking-[-0.02em]">Groundwork</span>
    </Link>
  );
}
