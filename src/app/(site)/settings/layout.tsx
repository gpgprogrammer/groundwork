import { Container } from "@/components/ui";
import { SettingsNav } from "./settings-nav";

export default function SettingsLayout({ children }: LayoutProps<"/settings">) {
  return (
    <Container size="lg" className="py-12">
      <h1 className="headline text-3xl text-ink">Settings</h1>
      <div className="mt-8 grid gap-10 md:grid-cols-[180px_1fr]">
        <SettingsNav />
        <div className="min-w-0">{children}</div>
      </div>
    </Container>
  );
}
