import Link from "next/link";
import { cn } from "./ui";

/** The Merit app icon: a graduation cap on a blue tile. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn("size-8", className)} aria-hidden>
      <defs>
        <linearGradient id="merit-tile" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4287f5" />
          <stop offset="1" stopColor="#2346c7" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#merit-tile)" />
      <path d="M19 31.5v8.2c0 4.1 5.8 7.3 13 7.3s13-3.2 13-7.3v-8.2L32 37.6Z" fill="#e6eeff" />
      <path d="M32 14.5 56 26 32 37.5 8 26Z" fill="#fff" />
      <path d="M50.5 28.6v10.6" stroke="#bcd3ff" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="50.5" cy="41.4" r="2.9" fill="#bcd3ff" />
    </svg>
  );
}

/** "merit" wordmark: rounded lowercase with a blue dot over the i. */
export function Wordmark({ className, tagline = false, onDark = false }: { className?: string; tagline?: boolean; onDark?: boolean }) {
  return (
    <span className={cn("inline-flex flex-col leading-none", className)}>
      <span className={cn("font-brand text-[1.45em] font-extrabold tracking-[-0.02em]", onDark ? "text-white" : "text-brand-ink")}>
        mer
        <span className="relative inline-block">
          ı
          <span className="absolute left-1/2 top-[0.06em] size-[0.26em] -translate-x-1/2 rounded-full bg-[#3b82f6]" />
        </span>
        t
      </span>
      {tagline ? <span className="mt-[0.25em] pl-[0.1em] text-[0.46em] font-semibold tracking-[0.2em] text-[#3b82f6]">academic tutoring</span> : null}
    </span>
  );
}

export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2 text-[17px]", className)} aria-label="Merit Learning home">
      <LogoMark className="size-8" />
      <Wordmark />
    </Link>
  );
}
