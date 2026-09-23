"use client";

import {
  CalendarDays,
  Clapperboard,
  CreditCard,
  GraduationCap,
  History,
  House,
  Info,
  LogOut,
  Menu,
  Search,
  Settings,
  Sigma,
  ThumbsUp,
  UserRound,
  X,
  Clock,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { signOut } from "@/app/actions/auth";
import type { Suggestion } from "@/app/api/search/route";
import { Logo } from "../logo";
import { cn } from "../ui";
import { ChannelAvatar } from "../video-card";

export type ShellData = {
  user: { name: string; email: string } | null;
  trialDaysLeft: number | null;
  expired: boolean;
  hasSchedule: boolean;
  courses: { slug: string; title: string; hue: number }[];
  myCourses: string[];
  channels: { id: string; title: string; thumbnail: string | null }[];
};

const SIDEBAR_KEY = "gw:sidebar";
const sidebarListeners = new Set<() => void>();
function subscribeSidebar(cb: () => void) {
  sidebarListeners.add(cb);
  return () => sidebarListeners.delete(cb);
}
function readSidebar() {
  try {
    return localStorage.getItem(SIDEBAR_KEY) !== "mini";
  } catch {
    return true;
  }
}
function writeSidebar(expanded: boolean) {
  try {
    localStorage.setItem(SIDEBAR_KEY, expanded ? "full" : "mini");
  } catch {}
  sidebarListeners.forEach((l) => l());
}

export function ShellFrame({ data, children }: { data: ShellData; children: ReactNode }) {
  const pathname = usePathname();
  // Desktop: expanded vs. mini rail (remembered). Mobile: drawer open vs. closed.
  const expanded = useSyncExternalStore(subscribeSidebar, readSidebar, () => true);
  const [drawer, setDrawer] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setDrawer(false);
  }

  const toggle = () => {
    if (window.matchMedia("(min-width: 1280px)").matches) writeSidebar(!expanded);
    else setDrawer((d) => !d);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar data={data} onMenu={toggle} />
      <div className="flex flex-1 pt-14">
        <aside
          className={cn(
            "fixed bottom-0 left-0 top-14 z-30 hidden overflow-y-auto pb-6 md:block",
            expanded ? "w-[72px] xl:w-60" : "w-[72px]",
          )}
          aria-label="Sidebar"
        >
          <div className={cn("hidden", expanded && "xl:block")}>
            <FullNav data={data} pathname={pathname} />
          </div>
          <div className={cn(expanded && "xl:hidden")}>
            <MiniNav pathname={pathname} />
          </div>
        </aside>
        {drawer ? (
          <div className="fixed inset-0 z-50 md:block xl:block">
            <div className="fade absolute inset-0 bg-black/50" onClick={() => setDrawer(false)} />
            <div className="slide-in absolute inset-y-0 left-0 w-64 overflow-y-auto bg-bg pb-6">
              <div className="flex h-14 items-center gap-4 px-4">
                <button onClick={() => setDrawer(false)} className="flex size-10 items-center justify-center rounded-full hover:bg-bg-subtle" aria-label="Close menu">
                  <X className="size-5" />
                </button>
                <Logo />
              </div>
              <FullNav data={data} pathname={pathname} />
            </div>
          </div>
        ) : null}
        <main className={cn("min-w-0 flex-1", expanded ? "md:pl-[72px] xl:pl-60" : "md:pl-[72px]")}>{children}</main>
      </div>
    </div>
  );
}

function TopBar({ data, onMenu }: { data: ShellData; onMenu: () => void }) {
  const [mobileSearch, setMobileSearch] = useState(false);
  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between gap-4 bg-bg/95 px-2 backdrop-blur sm:px-4">
      {mobileSearch ? (
        <div className="flex flex-1 items-center gap-2 sm:hidden">
          <button onClick={() => setMobileSearch(false)} className="flex size-10 items-center justify-center rounded-full hover:bg-bg-subtle" aria-label="Close search">
            <X className="size-5" />
          </button>
          <SearchBox autoFocus />
        </div>
      ) : (
        <>
          <div className="flex shrink-0 items-center gap-1 sm:gap-3">
            <button onClick={onMenu} className="flex size-10 items-center justify-center rounded-full hover:bg-bg-subtle" aria-label="Menu">
              <Menu className="size-5" />
            </button>
            <Logo />
          </div>
          <div className="hidden max-w-[640px] flex-1 sm:flex">
            <SearchBox />
          </div>
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <button onClick={() => setMobileSearch(true)} className="flex size-10 items-center justify-center rounded-full hover:bg-bg-subtle sm:hidden" aria-label="Search">
              <Search className="size-5" />
            </button>
            {data.user ? (
              <>
                {data.expired ? (
                  <Link href="/settings/billing" className="hidden h-9 items-center rounded-full bg-accent px-4 text-sm font-medium text-white hover:bg-accent/90 md:flex">
                    Continue with Plus
                  </Link>
                ) : data.trialDaysLeft !== null ? (
                  <Link href="/settings/billing" className="tabular hidden h-9 items-center rounded-full px-3 text-[13px] text-muted hover:bg-bg-subtle lg:flex">
                    {data.trialDaysLeft} days of Plus left
                  </Link>
                ) : null}
                <Link
                  href="/schedule"
                  className="relative flex size-10 items-center justify-center rounded-full hover:bg-bg-subtle"
                  aria-label="My schedule"
                  title="My schedule"
                >
                  <CalendarDays className="size-5" />
                  {!data.hasSchedule ? <span className="absolute right-2 top-2 size-2 rounded-full bg-accent ring-2 ring-bg" /> : null}
                </Link>
                <UserMenu user={data.user} />
              </>
            ) : (
              <Link
                href="/login"
                className="flex h-9 items-center gap-1.5 rounded-full border border-line-strong px-3 text-sm font-medium text-accent hover:border-transparent hover:bg-accent-soft"
              >
                <UserRound className="size-5" /> Sign in
              </Link>
            )}
          </div>
        </>
      )}
    </header>
  );
}

function SearchBox({ autoFocus }: { autoFocus?: boolean }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Suggestion[]>([]);
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if ((e.key === "/" && !typing) || (e.key === "k" && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    const onDown = (e: MouseEvent) => boxRef.current && !boxRef.current.contains(e.target as Node) && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, []);

  useEffect(() => {
    const query = q.trim();
    if (!query) return;
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: ctrl.signal });
        setItems(((await res.json()) as { suggestions: Suggestion[] }).suggestions);
        setActive(-1);
      } catch {}
    }, 120);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  const go = useCallback(
    (href: string, external = false) => {
      setOpen(false);
      inputRef.current?.blur();
      if (external) window.open(href, "_blank", "noopener");
      else router.push(href);
    },
    [router],
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const item = items[active];
    if (item) return go(item.href, item.kind === "video");
    if (q.trim()) go(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  const shown = q.trim() ? items : [];

  return (
    <form ref={boxRef} onSubmit={submit} role="search" className="relative flex w-full items-center">
      <div className="flex h-10 flex-1 items-center rounded-l-full border border-line-strong bg-bg pl-4 shadow-[inset_0_1px_2px_rgb(0_0_0/0.06)] focus-within:border-accent">
        <Search className="mr-3 hidden size-4 text-muted sm:hidden" />
        <input
          ref={inputRef}
          value={q}
          autoFocus={autoFocus}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
            if (!e.target.value.trim()) setItems([]);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(shown.length - 1, a + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(-1, a - 1));
            } else if (e.key === "Escape") setOpen(false);
          }}
          placeholder="Search a topic, like “chain rule” or “Mansa Musa”"
          className="h-full w-full bg-transparent text-[16px] text-ink outline-none placeholder:text-muted"
          aria-label="Search"
          role="combobox"
          aria-autocomplete="list"
          aria-controls="search-suggestions"
          aria-expanded={open && shown.length > 0}
        />
        {q ? (
          <button type="button" onClick={() => (setQ(""), setItems([]), inputRef.current?.focus())} className="mr-1 flex size-8 items-center justify-center rounded-full hover:bg-bg-subtle" aria-label="Clear search">
            <X className="size-4" />
          </button>
        ) : null}
      </div>
      <button type="submit" className="flex h-10 w-16 items-center justify-center rounded-r-full border border-l-0 border-line-strong bg-bg-subtle hover:bg-line" aria-label="Search">
        <Search className="size-5" />
      </button>
      {open && shown.length ? (
        <ul id="search-suggestions" className="absolute left-0 right-16 top-12 z-50 overflow-hidden rounded-xl bg-surface py-3 shadow-lift ring-1 ring-line" role="listbox">
          {shown.map((s, i) => (
            <li key={s.href + i} role="option" aria-selected={i === active}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => go(s.href, s.kind === "video")}
                onMouseEnter={() => setActive(i)}
                className={cn("flex w-full items-center gap-3 px-4 py-1.5 text-left", i === active && "bg-bg-subtle")}
              >
                {s.kind === "video" && s.image ? (
                  <img src={s.image} alt="" className="aspect-video w-14 shrink-0 rounded object-cover" referrerPolicy="no-referrer" />
                ) : s.kind === "channel" ? (
                  <ChannelAvatar title={s.title} src={s.image ?? null} size={24} />
                ) : (
                  <Search className="size-4 shrink-0 text-muted" />
                )}
                <span className="min-w-0 flex-1 truncate text-[15px] font-medium text-ink">{s.title}</span>
                <span className="hidden shrink-0 text-xs text-muted sm:block">{s.subtitle}</span>
              </button>
            </li>
          ))}
          <li>
            <button type="submit" onMouseDown={(e) => e.preventDefault()} className="mt-1 flex w-full items-center gap-3 border-t border-line px-4 pt-2.5 text-left text-sm text-muted hover:text-ink">
              <Search className="size-4" /> See all results for “{q.trim()}”
            </button>
          </li>
        </ul>
      ) : null}
    </form>
  );
}

function UserMenu({ user }: { user: { name: string; email: string } }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);
  const initial = user.name.trim()[0]?.toUpperCase() ?? "?";
  return (
    <div ref={ref} className="relative ml-1">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex size-8 items-center justify-center rounded-full bg-accent text-sm font-medium text-white"
        aria-label="Account menu"
        aria-expanded={open}
      >
        {initial}
      </button>
      {open ? (
        <div className="fade absolute right-0 top-11 w-72 overflow-hidden rounded-xl bg-surface py-2 shadow-lift ring-1 ring-line">
          <div className="flex gap-3 px-4 py-2">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent font-medium text-white">{initial}</span>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-medium text-ink">{user.name}</p>
              <p className="truncate text-sm text-muted">{user.email}</p>
            </div>
          </div>
          <div className="my-2 h-px bg-line" />
          <MenuRow href="/library" icon={<Clock className="size-5" />}>Your library</MenuRow>
          <MenuRow href="/schedule" icon={<CalendarDays className="size-5" />}>My schedule</MenuRow>
          <MenuRow href="/settings/billing" icon={<CreditCard className="size-5" />}>Plan and billing</MenuRow>
          <MenuRow href="/settings" icon={<Settings className="size-5" />}>Settings</MenuRow>
          <div className="my-2 h-px bg-line" />
          <form action={signOut}>
            <button className="flex w-full items-center gap-4 px-4 py-2 text-left text-sm text-ink hover:bg-bg-subtle">
              <LogOut className="size-5" /> Sign out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function MenuRow({ href, icon, children }: { href: string; icon: ReactNode; children: ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-4 px-4 py-2 text-sm text-ink hover:bg-bg-subtle">
      {icon}
      {children}
    </Link>
  );
}

const isActive = (pathname: string, href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));

function NavRow({ href, icon, label, pathname, trailing }: { href: string; icon: ReactNode; label: string; pathname: string; trailing?: ReactNode }) {
  const active = isActive(pathname, href.split("?")[0]);
  return (
    <Link
      href={href}
      className={cn(
        "flex h-10 items-center gap-5 rounded-lg px-3 text-sm",
        active ? "bg-bg-subtle font-medium text-ink" : "text-ink hover:bg-bg-subtle",
      )}
    >
      <span className="flex w-6 shrink-0 justify-center">{icon}</span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {trailing}
    </Link>
  );
}

function Section({ title, href, children }: { title?: string; href?: string; children: ReactNode }) {
  return (
    <div className="border-b border-line px-3 py-3 last:border-0">
      {title ? (
        href ? (
          <Link href={href} className="flex h-10 items-center gap-2 rounded-lg px-3 text-base font-medium text-ink hover:bg-bg-subtle">
            {title} <ChevronRight className="size-4" />
          </Link>
        ) : (
          <p className="px-3 pb-1 pt-1.5 text-base font-medium text-ink">{title}</p>
        )
      ) : null}
      {children}
    </div>
  );
}

function FullNav({ data, pathname }: { data: ShellData; pathname: string }) {
  const mine = data.courses.filter((c) => data.myCourses.includes(c.slug));
  const others = data.courses.filter((c) => !data.myCourses.includes(c.slug));
  return (
    <nav aria-label="Main">
      <Section>
        <NavRow href="/" icon={<House className="size-5" />} label="Home" pathname={pathname} />
        <NavRow href="/shorts" icon={<Clapperboard className="size-5" />} label="Shorts" pathname={pathname} />
        <NavRow href="/courses" icon={<GraduationCap className="size-5" />} label="Courses" pathname={pathname} />
        <NavRow href="/schedule" icon={<CalendarDays className="size-5" />} label="My schedule" pathname={pathname} />
      </Section>
      {data.user ? (
        <Section title="You" href="/library">
          <NavRow href="/library?tab=history" icon={<History className="size-5" />} label="History" pathname={pathname} />
          <NavRow href="/library?tab=saved" icon={<Clock className="size-5" />} label="Watch later" pathname={pathname} />
          <NavRow href="/library?tab=liked" icon={<ThumbsUp className="size-5" />} label="Helpful videos" pathname={pathname} />
        </Section>
      ) : (
        <Section>
          <p className="px-3 py-2 text-sm leading-snug text-ink">Sign in to save videos, track topics, and sync your class calendar.</p>
          <Link
            href="/login"
            className="mx-3 mb-1 mt-1 inline-flex h-9 items-center gap-1.5 rounded-full border border-line-strong px-3 text-sm font-medium text-accent hover:border-transparent hover:bg-accent-soft"
          >
            <UserRound className="size-5" /> Sign in
          </Link>
        </Section>
      )}
      <Section title="Courses">
        {[...mine, ...others].map((c) => (
          <NavRow
            key={c.slug}
            href={`/courses/${c.slug}`}
            icon={<span className="size-2.5 rounded-full" style={{ background: `oklch(0.6 0.14 ${c.hue})` }} />}
            label={c.title}
            pathname={pathname}
          />
        ))}
      </Section>
      {data.channels.length ? (
        <Section title="Top channels">
          {data.channels.map((c) => (
            <NavRow key={c.id} href={`/channel/${c.id}`} icon={<ChannelAvatar title={c.title} src={c.thumbnail} size={24} />} label={c.title} pathname={pathname} />
          ))}
        </Section>
      ) : null}
      <Section>
        <NavRow href="/how-ranking-works" icon={<Sigma className="size-5" />} label="How ranking works" pathname={pathname} />
        <NavRow href="/about" icon={<Info className="size-5" />} label="About Groundwork" pathname={pathname} />
        <NavRow href="/pricing" icon={<CreditCard className="size-5" />} label="Groundwork Plus" pathname={pathname} />
      </Section>
      <div className="px-6 pt-3 text-xs leading-5 text-muted">
        <p className="flex flex-wrap gap-x-2">
          <Link href="/about" className="hover:text-ink">About</Link>
          <Link href="/privacy" className="hover:text-ink">Privacy</Link>
          <Link href="/terms" className="hover:text-ink">Terms</Link>
        </p>
        <p className="mt-2 text-faint">Videos play on YouTube. AP® and SAT® are trademarks of the College Board, which is not affiliated with Groundwork.</p>
        <p className="mt-2 text-faint">© {new Date().getFullYear()} Groundwork</p>
      </div>
    </nav>
  );
}

function MiniNav({ pathname }: { pathname: string }) {
  const items = [
    { href: "/", label: "Home", icon: <House className="size-5" /> },
    { href: "/shorts", label: "Shorts", icon: <Clapperboard className="size-5" /> },
    { href: "/courses", label: "Courses", icon: <GraduationCap className="size-5" /> },
    { href: "/schedule", label: "Schedule", icon: <CalendarDays className="size-5" /> },
    { href: "/library", label: "You", icon: <UserRound className="size-5" /> },
  ];
  return (
    <nav className="flex flex-col gap-1 px-1 pt-1" aria-label="Main">
      {items.map((i) => (
        <Link
          key={i.href}
          href={i.href}
          className={cn(
            "flex flex-col items-center gap-1.5 rounded-lg py-4 text-[10px] text-ink hover:bg-bg-subtle",
            isActive(pathname, i.href) && "font-medium",
          )}
        >
          {i.icon}
          {i.label}
        </Link>
      ))}
    </nav>
  );
}
