import { AppShell } from "@/components/shell/app-shell";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return <AppShell>{children}</AppShell>;
}
