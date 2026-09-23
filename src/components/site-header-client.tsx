"use client";

import { CreditCard, LogOut, Menu, Search, Settings, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { signOut } from "@/app/actions/auth";
import { usePalette } from "./command-palette";
import { cn } from "./ui";

export function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
  return (
    <Link
      href={href}
      className={cn(
        "rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors",
        active ? "text-ink" : "text-muted hover:text-ink",
      )}
    >
      {children}
    </Link>
  );
}

function useDismiss(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);
  return ref;
}

export function UserMenu({ name, email, isCreator }: { name: string; email: string; isCreator: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useDismiss(open, () => setOpen(false));
  const pathname = usePathname();
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex size-8 items-center justify-center rounded-full bg-ink text-[11px] font-semibold tracking-tight text-bg ring-offset-2 ring-offset-bg transition hover:ring-2 hover:ring-line-strong"
        aria-label="Account menu"
        aria-expanded={open}
      >
        {initials}
      </button>
      {open ? (
        <div className="rise absolute right-0 top-10 w-64 overflow-hidden rounded-xl border border-line bg-surface p-1.5 shadow-lift">
          <div className="px-3 py-2.5">
            <p className="truncate text-sm font-medium text-ink">{name}</p>
            <p className="truncate text-xs text-muted">{email}</p>
          </div>
          <div className="my-1 h-px bg-line" />
          <MenuItem href="/settings" icon={<Settings className="size-4" />}>
            Settings
          </MenuItem>
          {!isCreator ? (
            <MenuItem href="/settings/billing" icon={<CreditCard className="size-4" />}>
              Plan and billing
            </MenuItem>
          ) : null}
          <MenuItem href={isCreator ? "/creator" : "/creator/join"} icon={<Sparkles className="size-4" />}>
            {isCreator ? "Creator studio" : "Teach on Groundwork"}
          </MenuItem>
          <div className="my-1 h-px bg-line" />
          <form action={signOut}>
            <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-ink-2 hover:bg-bg-subtle hover:text-ink">
              <LogOut className="size-4 text-muted" /> Sign out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function MenuItem({ href, icon, children }: { href: string; icon: ReactNode; children: ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink-2 hover:bg-bg-subtle hover:text-ink">
      <span className="text-muted">{icon}</span>
      {children}
    </Link>
  );
}

export function MobileMenu({ links, signedIn }: { links: { href: string; label: string }[]; signedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { open: openSearch } = usePalette();
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex size-8 items-center justify-center rounded-lg text-ink-2 hover:bg-bg-subtle"
        aria-label="Menu"
        aria-expanded={open}
      >
        {open ? <X className="size-[18px]" /> : <Menu className="size-[18px]" />}
      </button>
      {open ? (
        <div className="fade fixed inset-x-0 top-14 z-40 border-b border-line bg-bg px-5 pb-6 pt-3 shadow-lift">
          <button
            onClick={() => {
              setOpen(false);
              openSearch();
            }}
            className="mb-3 flex h-10 w-full items-center gap-2 rounded-lg border border-line bg-surface px-3 text-sm text-muted"
          >
            <Search className="size-4" /> Search topics and lessons
          </button>
          <nav className="flex flex-col" aria-label="Mobile">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="border-b border-line py-3 text-[15px] font-medium text-ink last:border-0">
                {l.label}
              </Link>
            ))}
            {!signedIn ? (
              <Link href="/login" className="py-3 text-[15px] font-medium text-ink">
                Sign in
              </Link>
            ) : null}
          </nav>
        </div>
      ) : null}
    </div>
  );
}
