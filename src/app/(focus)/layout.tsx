import { Logo } from "@/components/logo";

export default function FocusLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen flex-col bg-bg-subtle/60">
      <header className="flex h-16 items-center px-5 sm:px-8">
        <Logo />
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
