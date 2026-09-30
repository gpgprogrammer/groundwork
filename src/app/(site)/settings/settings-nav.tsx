"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/components/ui";

const LINKS = [
  { href: "/settings", label: "Profile" },
  { href: "/settings/billing", label: "Plan and billing" },
];

export function SettingsNav() {
  const pathname = usePathname();
  return (
    <nav className="scrollbar-none -mx-1 flex gap-1 overflow-x-auto px-1 md:flex-col" aria-label="Settings">
      {LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          aria-current={pathname === l.href ? "page" : undefined}
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-[14px] font-semibold transition-colors md:rounded-xl",
            pathname === l.href ? "bg-accent-soft text-accent-ink" : "text-muted hover:bg-bg-subtle hover:text-ink",
          )}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
