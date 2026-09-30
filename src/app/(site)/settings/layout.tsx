import { WorldBand } from "@/components/learn-band";
import { SettingsNav } from "./settings-nav";

export default function SettingsLayout({ children }: LayoutProps<"/settings">) {
  return (
    <>
      <WorldBand title="Settings" lede="Your profile, your courses, and your plan." />
      <div className="mx-auto max-w-4xl px-4 pb-16 pt-8 sm:px-6">
        <div className="grid gap-6 md:grid-cols-[200px_1fr] md:gap-10 grid-cols-[minmax(0,1fr)]">
          <SettingsNav />
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </>
  );
}
