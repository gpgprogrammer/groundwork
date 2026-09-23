import Link from "next/link";
import { getCatalog } from "@/lib/catalog";
import { LogoMark } from "./logo";

export async function SiteFooter() {
  const catalog = await getCatalog();
  const cols = [
    {
      title: "Courses",
      links: catalog.courses.map((c) => ({ href: `/courses/${c.slug}`, label: c.title })),
    },
    {
      title: "Product",
      links: [
        { href: "/courses", label: "Browse all courses" },
        { href: "/search", label: "Search" },
        { href: "/pricing", label: "Pricing" },
        { href: "/how-ranking-works", label: "How ranking works" },
      ],
    },
    {
      title: "Educators",
      links: [
        { href: "/educators", label: "Find a tutor" },
        { href: "/creator/join", label: "Teach on Groundwork" },
        { href: "/creator", label: "Creator studio" },
      ],
    },
  ];
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <div className="flex items-center gap-2">
            <LogoMark />
            <span className="text-[15px] font-semibold tracking-[-0.02em]">Groundwork</span>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
            Short, excellent lessons for AP and SAT, ranked by how well they teach.
          </p>
        </div>
        {cols.map((col) => (
          <div key={col.title}>
            <p className="text-[13px] font-medium text-ink">{col.title}</p>
            <ul className="mt-3 space-y-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[13px] text-muted transition-colors hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-2 border-t border-line px-5 py-6 text-xs text-faint sm:px-8">
        <span>© {new Date().getFullYear()} Groundwork Learning, Inc.</span>
        <span>AP® and SAT® are trademarks of the College Board, which is not affiliated with Groundwork.</span>
      </div>
    </footer>
  );
}
