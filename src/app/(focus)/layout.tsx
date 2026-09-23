import Link from "next/link";
import { Logo } from "@/components/logo";

export default function FocusLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center justify-between px-5 sm:px-8">
        <Logo />
        <Link href="/courses" className="text-[13px] text-muted transition-colors hover:text-ink">
          Browse courses
        </Link>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
