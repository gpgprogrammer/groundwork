export default function SettingsLayout({ children }: LayoutProps<"/settings">) {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-6 sm:px-6">
      <h1 className="text-[28px] font-bold tracking-tight text-ink">Settings</h1>
      <div className="mt-8">{children}</div>
    </div>
  );
}
