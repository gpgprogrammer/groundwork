"use client";

import {
  CalendarCheck,
  CalendarDays,
  ChartColumn,
  ChevronDown,
  Clock,
  CreditCard,
  GraduationCap,
  History,
  House,
  Info,
  LibraryBig,
  LogOut,
  Menu,
  NotebookPen,
  Search,
  Settings,
  Shield,
  Sigma,
  Sparkles,
  SquarePlay,
  Target,
  ThumbsUp,
  Users,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { signOut } from "@/app/actions/auth";
import type { Suggestion } from "@/app/api/search/route";
import { PAID_PLANS } from "@/lib/billing/plans";
import { CourseIcon } from "../course-icon";
import { QuickAsk } from "../ask/quick-ask";
import { Logo } from "../logo";
import { cn } from "../ui";
import { ChannelAvatar } from "../video-card";

export type ShellData = {
  user: { name: string; email: string } | null;
  isTutor: boolean;
  isEducator: boolean;
  isAdmin: boolean;
  plus: "anonymous" | "free" | "trial" | "active" | "expired" | "included";
  hasSchedule: boolean;
  isTeacher: boolean;
  courses: { slug: string; title: string; hue: number }[];
  myCourses: string[];
  channels: { id: string; title: string; thumbnail: string | null }[];
};

const isActive = (pathname: string, href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));

/** Pages that manage their own full-height layout (no footer, no bottom padding). */
const FULL_HEIGHT = /^\/ask$/;

/**
 * The five places in Merit. Each has its own color, used for its icon and active state,
 * and a set of paths it "owns" so the right tab lights up anywhere inside it.
 */
const SECTIONS = [
  { key: "learn", label: "Learn", href: "/courses", icon: GraduationCap, tint: "text-accent-ink", on: "bg-accent-soft text-accent-ink", owns: ["/courses", "/lessons", "/shorts", "/videos", "/search", "/channel", "/guides", "/educators", "/library"] },
  { key: "practice", label: "Practice", href: "/sprint", icon: Target, tint: "text-sprint", on: "bg-sprint-soft text-sprint-ink", owns: ["/sprint", "/master"] },
  { key: "plan", label: "Plan", href: "/plan", icon: CalendarCheck, tint: "text-positive", on: "bg-positive-soft text-positive", owns: ["/plan", "/schedule", "/progress"] },
  { key: "tutors", label: "Tutors", href: "/tutors", icon: Users, tint: "text-[#7c3aed] dark:text-[#b69cff]", on: "bg-[#f3edff] text-[#6d28d9] dark:bg-[#2a1f45] dark:text-[#c9b5ff]", owns: ["/tutors", "/tutor", "/bookings"] },
  { key: "ask", label: "Ask AI", href: "/ask", icon: Sparkles, tint: "text-[#db2777] dark:text-[#ff8cc6]", on: "bg-[#fdeef6] text-[#be185d] dark:bg-[#3d1830] dark:text-[#ffb3d9]", owns: ["/ask"] },
] as const;

const sectionFor = (pathname: string) => SECTIONS.find((s) => s.owns.some((o) => isActive(pathname, o)));

/** Second-level tabs inside a section. */
const SUBNAV: Record<string, { href: string; label: string }[]> = {
  learn: [
    { href: "/courses", label: "Courses" },
    { href: "/lessons", label: "Lessons" },
    { href: "/library", label: "Your library" },
  ],
  practice: [
    { href: "/sprint", label: "Exam Sprint" },
    { href: "/master", label: "Quick session" },
  ],
  plan: [
    { href: "/plan", label: "Learning plan" },
    { href: "/schedule", label: "My schedule" },
    { href: "/progress", label: "Progress" },
  ],
  tutors: [
    { href: "/tutors", label: "Find a tutor" },
    { href: "/bookings", label: "My sessions" },
    { href: "/tutors/join", label: "Tutor on Merit" },
  ],
};

/**
 * Merit 2.0 chrome: a bold top bar with the five places in Merit, a sub-bar for the section you're in,
 * a bottom tab bar on phones, and a drawer with everything else.
 */
export function ShellFrame({ data, children }: { data: ShellData; children: ReactNode }) {
  const pathname = usePathname();
  const signedIn = Boolean(data.user);
  const [drawer, setDrawer] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setDrawer(false);
  }
  const fullHeight = FULL_HEIGHT.test(pathname);
  const section = sectionFor(pathname);
  const sub = section ? SUBNAV[section.key]?.filter((l) => signedIn || !["/library", "/bookings"].includes(l.href)) : undefined;

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[80] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-bg">
        Skip to content
      </a>
      <TopBar data={data} section={section?.key} onMenu={() => setDrawer(true)} />
      <div
        className={cn(
          "flex flex-1 pt-[var(--nav-h)]",
          sub ? "[--nav-h:calc(4rem+44px)] lg:[--nav-h:calc(4rem+48px)]" : "[--nav-h:4rem]",
        )}
      >
        {sub ? <SubNav items={sub} pathname={pathname} /> : null}
        {drawer ? <Drawer data={data} pathname={pathname} onClose={() => setDrawer(false)} /> : null}
        <main id="main" className={cn("flex min-w-0 flex-1 flex-col", !fullHeight && "pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0")}>
          <div className="flex-1">{children}</div>
          {!fullHeight ? <SiteFooter signedIn={signedIn} /> : null}
        </main>
      </div>
      <TabBar pathname={pathname} onMore={() => setDrawer(true)} />
      <QuickAsk />
    </div>
  );
}

/* ---------------------------------------------------------------- Top bar */

function TopBar({ data, section, onMenu }: { data: ShellData; section?: string; onMenu: () => void }) {
  const [mobileSearch, setMobileSearch] = useState(false);
  const signedIn = Boolean(data.user);
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b-2 border-line bg-bg/90 pt-[env(safe-area-inset-top)] backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-2 px-3 sm:px-5 lg:gap-4">
        {mobileSearch ? (
          <div className="fade flex flex-1 items-center gap-2 md:hidden">
            <IconButton onClick={() => setMobileSearch(false)} label="Close search">
              <X className="size-5" />
            </IconButton>
            <SearchBox autoFocus />
          </div>
        ) : (
          <>
            <IconButton onClick={onMenu} label="Menu" className="md:hidden">
              <Menu className="size-5" />
            </IconButton>
            <Logo href="/" className="shrink-0 px-1 text-[18px]" />

            <nav aria-label="Primary" className="ml-2 hidden items-center gap-1 md:flex lg:ml-4">
              {SECTIONS.map((s) => {
                const on = section === s.key;
                return (
                  <Link
                    key={s.key}
                    href={s.href}
                    aria-current={on ? "page" : undefined}
                    className={cn(
                      "flex h-10 items-center gap-2 rounded-2xl px-3 font-brand text-[15px] font-extrabold transition-[background-color,color,transform] duration-150 active:scale-[0.96] xl:px-3.5",
                      on ? s.on : "text-ink-2 hover:bg-bg-subtle hover:text-ink",
                    )}
                  >
                    <s.icon className={cn("size-[19px]", on ? "" : s.tint)} strokeWidth={2.4} />
                    <span className={cn(s.key === "ask" && "hidden lg:inline")}>{s.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="ml-auto hidden min-w-0 flex-1 justify-end md:flex">
              <div className="w-full max-w-[340px]">
                <SearchBox />
              </div>
            </div>

            <div className="ml-auto flex shrink-0 items-center gap-1.5 md:ml-0 sm:gap-2">
              <IconButton onClick={() => setMobileSearch(true)} label="Search" className="md:hidden">
                <Search className="size-5" />
              </IconButton>
              {signedIn && !data.hasSchedule && !data.isTeacher ? (
                <Link
                  href="/schedule"
                  className="press hidden h-10 items-center gap-2 rounded-2xl bg-positive-soft px-3.5 font-brand text-[14px] font-extrabold text-positive ring-2 ring-inset ring-positive/25 [--ledge:color-mix(in_oklab,var(--positive)_30%,transparent)] hover:bg-positive hover:text-white lg:flex"
                >
                  <CalendarDays className="size-[18px]" /> Connect calendar
                </Link>
              ) : null}
              {signedIn ? (
                <>
                  <Link
                    href="/schedule"
                    className={cn("relative hidden size-10 items-center justify-center rounded-2xl text-ink transition-colors hover:bg-bg-subtle sm:flex", !data.hasSchedule && !data.isTeacher && "lg:hidden")}
                    aria-label="My schedule"
                    title="My schedule"
                  >
                    <CalendarDays className="size-5" />
                    {!data.hasSchedule ? <span className="absolute right-2 top-2 size-2 rounded-full bg-accent ring-2 ring-bg" aria-hidden /> : null}
                  </Link>
                  <UserMenu data={data} />
                </>
              ) : (
                <>
                  <Link href="/login" className="hidden h-10 items-center rounded-2xl px-3.5 font-brand text-[15px] font-extrabold text-ink transition-colors hover:bg-bg-subtle sm:flex">
                    Sign in
                  </Link>
                  <Link href="/signup" className="press flex h-10 items-center rounded-2xl bg-accent px-4 font-brand text-[15px] font-extrabold text-white [--ledge:var(--accent-press)] hover:brightness-110">
                    <span className="sm:hidden">Join free</span>
                    <span className="hidden sm:inline">Get started</span>
                  </Link>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}

/** Tabs for the section you're in: Courses / Lessons / Quick lessons, or Learning plan / Schedule / Progress. */
function SubNav({ items, pathname }: { items: { href: string; label: string }[]; pathname: string }) {
  const active = [...items].sort((a, b) => b.href.length - a.href.length).find((l) => isActive(pathname, l.href))?.href;
  return (
    <nav aria-label="Section" className="fixed inset-x-0 top-[calc(4rem+env(safe-area-inset-top))] z-30 border-b-2 border-line bg-bg/90 backdrop-blur-xl">
      <div className="scrollbar-none mx-auto flex h-11 max-w-[1400px] items-center gap-1 overflow-x-auto px-3 sm:px-5 lg:h-12">
        {items.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active === l.href ? "page" : undefined}
            className={cn(
              "relative flex h-full shrink-0 items-center px-3 font-brand text-[14.5px] font-extrabold transition-colors",
              active === l.href ? "text-ink" : "text-muted hover:text-ink",
            )}
          >
            {l.label}
            {active === l.href ? <span className="absolute inset-x-3 -bottom-[2px] h-[3px] rounded-full bg-accent" aria-hidden /> : null}
          </Link>
        ))}
      </div>
    </nav>
  );
}

function IconButton({ onClick, label, children, className }: { onClick: () => void; label: string; children: ReactNode; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn("flex size-10 shrink-0 items-center justify-center rounded-2xl text-ink transition-[background-color,transform] duration-150 hover:bg-bg-subtle active:scale-95", className)}
    >
      {children}
    </button>
  );
}

/* ---------------------------------------------------------------- Search */

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
        // Only the visible search box claims the shortcut.
        if (!inputRef.current?.offsetParent) return;
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
    <form ref={boxRef} onSubmit={submit} role="search" className="relative w-full">
      <div className="group flex h-10 w-full items-center rounded-full bg-bg-subtle pl-3.5 pr-1 ring-1 ring-inset ring-transparent transition-[background-color,box-shadow] duration-150 focus-within:bg-surface focus-within:ring-2 focus-within:ring-accent hover:ring-line-strong">
        <button type="submit" className="flex shrink-0 items-center text-muted" aria-label="Search" tabIndex={-1}>
          <Search className="size-[18px]" />
        </button>
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
            } else if (e.key === "Escape") {
              setOpen(false);
              inputRef.current?.blur();
            }
          }}
          placeholder="Search topics, like “chain rule”"
          className="h-full min-w-0 flex-1 bg-transparent px-2.5 text-[16px] text-ink outline-none placeholder:text-muted focus-visible:outline-none sm:text-[15px]"
          aria-label="Search"
          autoComplete="off"
          spellCheck={false}
          role="combobox"
          aria-autocomplete="list"
          aria-controls="search-suggestions"
          aria-expanded={open && shown.length > 0}
        />
        {q ? (
          <button
            type="button"
            onClick={() => (setQ(""), setItems([]), inputRef.current?.focus())}
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted hover:bg-bg-subtle hover:text-ink"
            aria-label="Clear search"
          >
            <X className="size-4" />
          </button>
        ) : (
          <kbd className="mr-2 hidden shrink-0 rounded-md bg-surface px-1.5 py-0.5 font-sans text-[11px] font-semibold text-muted ring-1 ring-line lg:inline">⌘K</kbd>
        )}
      </div>
      {open && shown.length ? (
        <ul
          id="search-suggestions"
          className="pop absolute inset-x-0 top-12 z-50 max-h-[70vh] origin-top overflow-y-auto rounded-2xl bg-surface p-1.5 shadow-lift ring-2 ring-line"
          role="listbox"
        >
          {shown.map((s, i) => (
            <li key={s.href + i} role="option" aria-selected={i === active}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => go(s.href, s.kind === "video")}
                onMouseEnter={() => setActive(i)}
                className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors", i === active && "bg-bg-subtle")}
              >
                {s.kind === "video" && s.image ? (
                  <img src={s.image} alt="" className="aspect-video w-14 shrink-0 rounded-md object-cover" referrerPolicy="no-referrer" />
                ) : s.kind === "channel" ? (
                  <ChannelAvatar title={s.title} src={s.image ?? null} size={24} />
                ) : (
                  <Search className="size-4 shrink-0 text-muted" />
                )}
                <span className="min-w-0 flex-1 truncate text-[14.5px] font-medium text-ink">{s.title}</span>
                <span className="hidden shrink-0 text-xs text-muted sm:block">{s.subtitle}</span>
              </button>
            </li>
          ))}
          <li className="mt-1 border-t border-line pt-1">
            <button type="submit" onMouseDown={(e) => e.preventDefault()} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-muted hover:bg-bg-subtle hover:text-ink">
              <Search className="size-4" /> See all results for “{q.trim()}”
            </button>
          </li>
        </ul>
      ) : null}
    </form>
  );
}

/* ---------------------------------------------------------------- Account menu */

function UserMenu({ data }: { data: ShellData }) {
  const user = data.user!;
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
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);
  const initial = user.name.trim()[0]?.toUpperCase() ?? "?";
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex size-10 items-center justify-center rounded-full transition-transform duration-150 active:scale-95"
        aria-label="Account menu"
        aria-expanded={open}
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white ring-2 ring-bg">{initial}</span>
      </button>
      {open ? (
        <div className="pop absolute right-0 top-12 w-72 origin-top-right overflow-hidden rounded-2xl bg-surface p-1.5 shadow-lift ring-2 ring-line">
          <div className="flex items-center gap-3 px-3 py-2.5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent font-semibold text-white">{initial}</span>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold text-ink">{user.name}</p>
              <p className="truncate text-[13px] text-muted">{user.email}</p>
            </div>
          </div>
          <MenuDivider />
          <MenuRow href="/plan" icon={<CalendarCheck className="size-[18px]" />}>Learning plan</MenuRow>
          <MenuRow href="/progress" icon={<ChartColumn className="size-[18px]" />}>Progress</MenuRow>
          <MenuRow href="/library" icon={<LibraryBig className="size-[18px]" />}>Your library</MenuRow>
          <MenuRow href="/bookings" icon={<Users className="size-[18px]" />}>My tutoring sessions</MenuRow>
          <MenuRow href="/schedule" icon={<CalendarDays className="size-[18px]" />}>My schedule</MenuRow>
          <MenuDivider />
          <MenuRow href="/studio" icon={<NotebookPen className="size-[18px]" />}>{data.isEducator ? "Teacher studio" : "Add lessons (teachers)"}</MenuRow>
          <MenuRow href={data.isTutor ? "/tutor" : "/tutors/join"} icon={<GraduationCap className="size-[18px]" />}>
            {data.isTutor ? "Tutor dashboard" : "Become a tutor"}
          </MenuRow>
          <MenuDivider />
          <MenuRow href="/settings/billing" icon={<CreditCard className="size-[18px]" />}>Plan and billing</MenuRow>
          <MenuRow href="/settings" icon={<Settings className="size-[18px]" />}>Settings</MenuRow>
          {data.isAdmin ? <MenuRow href="/admin" icon={<Shield className="size-[18px]" />}>Admin</MenuRow> : null}
          <MenuDivider />
          <form action={signOut}>
            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-[14px] font-medium text-ink transition-colors hover:bg-bg-subtle">
              <LogOut className="size-[18px] text-muted" /> Sign out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function MenuDivider() {
  return <div className="mx-2 my-1.5 h-px bg-line" />;
}

function MenuRow({ href, icon, children }: { href: string; icon: ReactNode; children: ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-xl px-3 py-2 text-[14px] font-medium text-ink transition-colors hover:bg-bg-subtle">
      <span className="text-muted">{icon}</span>
      {children}
    </Link>
  );
}

/* ---------------------------------------------------------------- Sidebar */

function NavRow({ href, icon, label, pathname, trailing }: { href: string; icon: ReactNode; label: string; pathname: string; trailing?: ReactNode }) {
  // Rows that point at a tab (?tab=…) never claim "current page": the parent page does.
  const active = !href.includes("?") && isActive(pathname, href);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex h-10 items-center gap-3 rounded-xl px-3 text-[14px] transition-colors",
        active ? "bg-accent-soft font-semibold text-accent-ink" : "font-medium text-ink-2 hover:bg-bg-subtle hover:text-ink",
      )}
    >
      <span className={cn("flex w-5 shrink-0 justify-center", active ? "text-accent-ink" : "text-muted group-hover:text-ink")}>{icon}</span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {trailing}
    </Link>
  );
}

function Group({ title, href, children }: { title?: string; href?: string; children: ReactNode }) {
  return (
    <div className="px-3 py-2">
      {title ? (
        href ? (
          <Link href={href} className="mb-0.5 flex items-center justify-between px-3 pb-1 pt-2 text-[12px] font-semibold text-muted transition-colors hover:text-ink">
            {title} <span aria-hidden>→</span>
          </Link>
        ) : (
          <p className="mb-0.5 px-3 pb-1 pt-2 text-[12px] font-semibold text-muted">{title}</p>
        )
      ) : null}
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function PlusTag() {
  return <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10.5px] font-bold text-accent-ink">Plus</span>;
}

function FullNav({ data, pathname }: { data: ShellData; pathname: string }) {
  const mine = data.courses.filter((c) => data.myCourses.includes(c.slug));
  const shown = (mine.length ? mine : data.courses).slice(0, 6);
  return (
    <nav aria-label="Main" className="pb-6 pt-2">
      {!data.hasSchedule && !data.isTeacher ? (
        <Link
          href={data.user ? "/schedule" : "/signup?as=student&next=%2Fschedule"}
          className="mx-3 mb-3 flex items-center gap-3 rounded-2xl bg-positive p-3 text-white transition-transform active:scale-[0.98]"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/20">
            <CalendarDays className="size-5" />
          </span>
          <span className="min-w-0">
            <span className="block font-brand text-[14.5px] font-extrabold leading-tight">Connect your calendar</span>
            <span className="block text-[12px] leading-snug text-white/85">Lessons for every quiz and test</span>
          </span>
        </Link>
      ) : null}
      <Group>
        <NavRow href="/" icon={<House className="size-[18px]" />} label="Home" pathname={pathname} />
        <NavRow href="/courses" icon={<GraduationCap className="size-[18px]" />} label="Courses" pathname={pathname} />
        <NavRow href="/lessons" icon={<SquarePlay className="size-[18px]" />} label="Lessons" pathname={pathname} />
        <NavRow href="/ask" icon={<Sparkles className="size-[18px]" />} label="Ask Merit AI" pathname={pathname} />
        <NavRow href="/tutors" icon={<Users className="size-[18px]" />} label="Tutors" pathname={pathname} />
      </Group>
      <Group title="Study tools">
        <NavRow href="/plan" icon={<CalendarCheck className="size-[18px]" />} label="Learning plan" pathname={pathname} trailing={<PlusTag />} />
        <NavRow href="/sprint" icon={<Target className="size-[18px]" />} label="Exam Sprint" pathname={pathname} />
        <NavRow href="/master" icon={<Zap className="size-[18px]" />} label="Quick session" pathname={pathname} />
        <NavRow href="/schedule" icon={<CalendarDays className="size-[18px]" />} label="My schedule" pathname={pathname} trailing={<PlusTag />} />
        <NavRow href="/progress" icon={<ChartColumn className="size-[18px]" />} label="Progress" pathname={pathname} trailing={<PlusTag />} />
      </Group>
      <SidebarPromo plus={data.plus} />
      {data.user ? (
        <Group title="You" href="/library">
          <NavRow href="/library?tab=history" icon={<History className="size-[18px]" />} label="History" pathname={pathname} />
          <NavRow href="/library?tab=saved" icon={<Clock className="size-[18px]" />} label="Watch later" pathname={pathname} />
          <NavRow href="/library?tab=liked" icon={<ThumbsUp className="size-[18px]" />} label="Helpful videos" pathname={pathname} />
          <NavRow href="/bookings" icon={<Users className="size-[18px]" />} label="Tutoring sessions" pathname={pathname} />
        </Group>
      ) : (
        <div className="mx-3 my-2 rounded-2xl bg-bg-subtle p-4">
          <p className="text-[13.5px] leading-snug text-ink-2">Sign in to save lessons, track topics, and get a learning plan.</p>
          <Link href="/login" className="press font-brand mt-3 inline-flex h-9 items-center rounded-2xl bg-surface px-4 text-[13px] font-extrabold text-ink ring-2 ring-inset ring-line hover:bg-bg [--ledge:var(--line)]">
            Sign in
          </Link>
        </div>
      )}
      <Group title={mine.length ? "Your courses" : "Popular courses"} href="/courses">
        {shown.map((c) => (
          <NavRow key={c.slug} href={`/courses/${c.slug}`} icon={<CourseIcon id={c.slug} size={22} />} label={c.title} pathname={pathname} />
        ))}
      </Group>
      <ExploreGroup data={data} pathname={pathname} />
    </nav>
  );
}

/** Less-used destinations, tucked into one disclosure so the sidebar stays calm. */
function ExploreGroup({ data, pathname }: { data: ShellData; pathname: string }) {
  return (
    <details className="group/more px-3 py-2" open={["/shorts", "/videos", "/channel", "/studio", "/pricing", "/how-ranking-works", "/about"].some((p) => pathname.startsWith(p))}>
      <summary className="flex h-10 cursor-pointer list-none items-center gap-3 rounded-xl px-3 text-[14px] font-medium text-ink-2 hover:bg-bg-subtle hover:text-ink [&::-webkit-details-marker]:hidden">
        <span className="flex w-5 justify-center text-muted">
          <ChevronDown className="size-[18px] transition-transform duration-200 group-open/more:rotate-180" />
        </span>
        More from Merit
      </summary>
      <div className="mt-0.5 space-y-0.5">
        {data.channels.map((c) => (
          <NavRow key={c.id} href={`/channel/${c.id}`} icon={<ChannelAvatar title={c.title} src={c.thumbnail} size={20} />} label={c.title} pathname={pathname} />
        ))}
        <NavRow href="/studio" icon={<NotebookPen className="size-[18px]" />} label="For teachers" pathname={pathname} />
        {PAID_PLANS ? <NavRow href="/pricing" icon={<CreditCard className="size-[18px]" />} label="Pricing" pathname={pathname} /> : null}
        <NavRow href="/how-ranking-works" icon={<Sigma className="size-[18px]" />} label="How ranking works" pathname={pathname} />
        <NavRow href="/about" icon={<Info className="size-[18px]" />} label="About Merit" pathname={pathname} />
      </div>
    </details>
  );
}

function SidebarPromo({ plus }: { plus: ShellData["plus"] }) {
  return (
    <div className="space-y-2 px-3 py-2">
      <Link href="/sprint" className="group block rounded-2xl bg-sprint-soft p-4 transition-transform duration-200 active:scale-[0.98]">
        <p className="flex items-center gap-1.5 text-[12px] font-bold text-sprint-ink">
          <Target className="size-3.5" /> Exam Sprint
        </p>
        <p className="mt-1 text-[14px] font-semibold leading-snug text-ink">Your exam, planned day by day.</p>
        <p className="mt-0.5 text-[12.5px] text-ink-2">
          Free diagnostic in 10 minutes <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">→</span>
        </p>
      </Link>
      {plus === "anonymous" || plus === "free" || plus === "expired" ? (
        <Link href={plus === "anonymous" ? "/signup?next=/plan" : plus === "free" ? "/plan" : "/pricing"} className="block rounded-2xl bg-accent-soft p-4 text-[13px] leading-snug text-ink-2 transition-transform duration-200 active:scale-[0.98]">
          <span className="block text-[14px] font-semibold text-ink">Lessons for what you&apos;re learning in class.</span>
          <span className="mt-0.5 block">
            {!PAID_PLANS
              ? "Create a free account and Merit suggests videos for what you're learning in class."
              : plus === "expired"
                ? "Get your learning plan and class-based suggestions back with Plus."
                : "Merit Plus suggests videos for what you're learning in class. Try it free for 14 days."}
          </span>
        </Link>
      ) : null}
    </div>
  );
}

/* ---------------------------------------------------------------- Drawer (phones, and signed-out tablets) */

function Drawer({ data, pathname, onClose }: { data: ShellData; pathname: string; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", esc);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    return () => {
      document.removeEventListener("keydown", esc);
      document.body.style.overflow = prev;
    };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[55]">
      <div className="fade absolute inset-0 bg-ink/40 backdrop-blur-[2px]" onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className="slide-in absolute inset-y-0 left-0 flex w-[min(20rem,86vw)] flex-col overflow-y-auto overscroll-contain bg-bg pb-[env(safe-area-inset-bottom)] shadow-lift"
      >
        <div className="flex h-16 shrink-0 items-center gap-2 px-3 pt-[env(safe-area-inset-top)]">
          <IconButton onClick={onClose} label="Close menu">
            <X className="size-5" />
          </IconButton>
          <Logo href="/" />
        </div>
        {!data.user ? (
          <div className="grid grid-cols-2 gap-2 px-6 pb-2">
            <Link href="/login" className="flex h-11 items-center justify-center rounded-full text-[14px] font-semibold text-ink ring-1 ring-line-strong">
              Sign in
            </Link>
            <Link href="/signup" className="flex h-11 items-center justify-center rounded-full bg-accent text-[14px] font-semibold text-white">
              Get started
            </Link>
          </div>
        ) : null}
        <FullNav data={data} pathname={pathname} />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Bottom tab bar (phones) */

function TabBar({ pathname, onMore }: { pathname: string; onMore: () => void }) {
  const current = sectionFor(pathname)?.key;
  const tabs = SECTIONS.filter((s) => s.key !== "tutors");
  return (
    <nav
      aria-label="Tabs"
      className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-line bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl backdrop-saturate-150 md:hidden"
    >
      <div className="grid h-16 grid-cols-5">
        {tabs.map((t) => {
          const on = current === t.key;
          return (
            <Link
              key={t.key}
              href={t.href}
              aria-current={on ? "page" : undefined}
              className="flex flex-col items-center justify-center gap-1 font-brand text-[11.5px] font-extrabold transition-transform active:scale-90"
            >
              <span className={cn("flex h-8 w-12 items-center justify-center rounded-xl transition-colors", on ? t.on : t.tint)}>
                <t.icon className="size-[21px]" strokeWidth={on ? 2.6 : 2.2} />
              </span>
              <span className={on ? "text-ink" : "text-muted"}>{t.label}</span>
            </Link>
          );
        })}
        <button type="button" onClick={onMore} className="flex flex-col items-center justify-center gap-1 font-brand text-[11.5px] font-extrabold text-muted transition-transform active:scale-90" aria-label="More">
          <span className="flex h-8 w-12 items-center justify-center rounded-xl">
            <Menu className="size-[21px]" strokeWidth={2.2} />
          </span>
          More
        </button>
      </div>
    </nav>
  );
}

/* ---------------------------------------------------------------- Footer */

function SiteFooter({ signedIn }: { signedIn: boolean }) {
  const cols: { title: string; links: [string, string][] }[] = [
    { title: "Learn", links: [["/courses", "Courses"], ["/lessons", "Lessons"], ["/ask", "Merit AI"]] },
    { title: "Practice", links: [["/sprint", "Exam Sprint"], ["/master", "Quick session"]] },
    { title: "Plan", links: [["/plan", "Learning plan"], ["/schedule", "My schedule"], ["/progress", "Progress"]] },
    { title: "Tutors", links: [["/tutors", "Find a tutor"], ["/tutors/join", "Become a tutor"], ["/tutors/partners", "Partner with Merit"], ["/studio", "For teachers"]] },
    { title: "Merit", links: [["/about", "About"], ...(PAID_PLANS ? [["/pricing", "Pricing"] as [string, string]] : []), ["/pricing/parents", "For parents"], ["/how-ranking-works", "How ranking works"], ["/privacy", "Privacy"], ["/terms", "Terms"]] },
  ];
  return (
    <footer className="mt-16 border-t-2 border-line bg-surface" data-noprint>
      <div className={cn("mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:px-8", !signedIn && "lg:grid-cols-[1.2fr_2fr]")}>
        {!signedIn ? (
          <div>
            <Logo href="/" />
            <p className="mt-3 max-w-xs text-[14px] leading-relaxed text-muted">High school classes, every AP course, and the SAT, with the best lessons, Merit AI, and a plan for every test.</p>
          </div>
        ) : null}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          {cols.map((c) => (
            <div key={c.title}>
              <p className="font-brand text-[15px] font-extrabold text-ink">{c.title}</p>
              <ul className="mt-3 space-y-2">
                {c.links.map(([href, label]) => (
                  <li key={href}>
                    <Link href={href} className="text-[13.5px] text-muted transition-colors hover:text-ink">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto max-w-6xl border-t border-line px-4 py-6 text-[12px] leading-relaxed text-muted sm:px-6 lg:px-8">
        <p>Videos play on YouTube. AP® and SAT® are trademarks of the College Board, which is not affiliated with Merit.</p>
        <p className="mt-1">© {new Date().getFullYear()} Merit</p>
      </div>
    </footer>
  );
}
