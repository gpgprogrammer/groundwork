import Link from "next/link";
import { Logo } from "@/components/logo";

/** Distraction-free layout for sign-in, sign-up, and onboarding. */
export default function FocusLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="relative flex min-h-[100dvh] flex-col bg-bg">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-[radial-gradient(50%_70%_at_50%_0%,color-mix(in_oklab,var(--accent)_10%,transparent),transparent_70%)]" />
      <header className="relative flex h-16 items-center justify-between px-5 pt-[env(safe-area-inset-top)] sm:px-8">
        <Logo />
        <Link href="/" className="rounded-full px-3 py-2 text-[13.5px] font-semibold text-muted transition-colors hover:text-ink">
          Back to Merit
        </Link>
      </header>
      <main className="relative flex flex-1 flex-col pb-[env(safe-area-inset-bottom)]">{children}</main>
    </div>
  );
}
