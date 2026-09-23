import { CommandPaletteProvider } from "@/components/command-palette";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCatalog } from "@/lib/catalog";

const POPULAR = ["chain-rule", "champa-rice", "quadratic-forms", "related-rates", "semicolons-colons", "hardy-weinberg"];

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const catalog = await getCatalog();
  const suggestions = POPULAR.map((slug) => catalog.topic(slug))
    .filter((t) => t !== undefined)
    .map((t) => ({
      href: `/courses/${catalog.course(t.courseId)!.slug}/${t.slug}`,
      title: t.title,
      subtitle: catalog.course(t.courseId)!.title,
    }));

  return (
    <CommandPaletteProvider suggestions={suggestions}>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </CommandPaletteProvider>
  );
}
