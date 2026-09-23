import Link from "next/link";
import { getViewer } from "@/lib/viewer";
import { SearchTrigger } from "./command-palette";
import { Logo } from "./logo";
import { MobileMenu, NavLink, UserMenu } from "./site-header-client";
import { LinkButton } from "./ui";

export async function SiteHeader() {
  const viewer = await getViewer();
  const isCreator = viewer?.state.profile.role === "creator";
  const access = viewer?.access;

  const links = viewer
    ? [
        { href: "/dashboard", label: "Home" },
        { href: "/courses", label: "Courses" },
        { href: "/library", label: "Library" },
        ...(isCreator ? [{ href: "/creator", label: "Studio" }] : []),
      ]
    : [
        { href: "/courses", label: "Courses" },
        { href: "/educators", label: "Educators" },
        { href: "/pricing", label: "Pricing" },
      ];

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-bg/80 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-6 px-5 sm:px-8">
        <Logo href={viewer ? "/dashboard" : "/"} />
        <nav className="hidden items-center gap-0.5 md:flex" aria-label="Main">
          {links.map((l) => (
            <NavLink key={l.href} href={l.href}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2.5">
          <SearchTrigger className="hidden sm:flex" />
          {viewer ? (
            <>
              {access?.kind === "trial" && !isCreator ? (
                <Link
                  href="/settings/billing"
                  className="tabular hidden h-8 items-center rounded-lg px-2.5 text-[13px] text-muted transition-colors hover:bg-bg-subtle hover:text-ink lg:flex"
                >
                  {access.daysLeft} {access.daysLeft === 1 ? "day" : "days"} left in trial
                </Link>
              ) : null}
              {access?.kind === "expired" ? (
                <LinkButton href="/settings/billing" variant="accent" size="sm">
                  Continue learning
                </LinkButton>
              ) : null}
              <UserMenu name={viewer.user.name} email={viewer.user.email} isCreator={isCreator} />
            </>
          ) : (
            <>
              <Link href="/login" className="hidden h-8 items-center rounded-lg px-3 text-[13px] font-medium text-ink-2 hover:text-ink sm:flex">
                Sign in
              </Link>
              <LinkButton href="/signup" size="sm">
                Start free
              </LinkButton>
            </>
          )}
          <MobileMenu links={links} signedIn={Boolean(viewer)} />
        </div>
      </div>
    </header>
  );
}
