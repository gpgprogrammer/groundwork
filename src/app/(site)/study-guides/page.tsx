import { FileText, Plus, Store } from "lucide-react";
import { GuideCard } from "@/components/guide-card";
import type { Metadata } from "next";
import Link from "next/link";
import { heroBtn, heroBtnGhost, HeroKicker, WORLD_ON_WHITE, WorldHero } from "@/components/marketing";
import { SubjectSelect } from "@/components/tutoring-client";
import { cn, panel, SegmentedLinks } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";
import { listGuides, rating } from "@/lib/market";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = {
  title: "Study guides",
  description: "Math study guides made by students and tutors: cheat sheets, worked examples, and unit reviews from Algebra 1 to AP Calculus. Free or for sale.",
};

const PRICES = { all: "All", free: "Free", paid: "Paid" } as const;
const SORTS = { popular: "Popular", new: "Newest", rated: "Top rated" } as const;

export default async function StudyGuidesPage({ searchParams }: PageProps<"/study-guides">) {
  const [sp, catalog, viewer, all] = await Promise.all([searchParams, getCatalog(), getViewer(), listGuides()]);
  const course = typeof sp.course === "string" ? (catalog.course(sp.course) ?? null) : null;
  const price = typeof sp.price === "string" && sp.price in PRICES ? (sp.price as keyof typeof PRICES) : "all";
  const sort = typeof sp.sort === "string" && sp.sort in SORTS ? (sp.sort as keyof typeof SORTS) : "popular";
  const guides = all
    .filter((g) => catalog.course(g.courseId) && (!course || g.courseId === course.id) && (price === "all" || (price === "free" ? g.price === 0 : g.price > 0)))
    .sort((a, b) => (sort === "new" ? b.createdAt.localeCompare(a.createdAt) : sort === "rated" ? (rating(b) ?? 0) - (rating(a) ?? 0) || b.ratingCount - a.ratingCount : b.downloads - a.downloads || b.createdAt.localeCompare(a.createdAt)));
  const qs = (over: Record<string, string>) => new URLSearchParams({ ...(course ? { course: course.id } : {}), price, sort, ...over }).toString();

  return (
    <div className="pb-20">
      <WorldHero world="accent" inner="pb-12 pt-8 lg:pb-14 lg:pt-10">
        <HeroKicker>
          <Store className="size-4" /> Study guide marketplace
        </HeroKicker>
        <h1 className="display rise mt-4 max-w-3xl text-[38px] sm:text-5xl lg:text-[58px]">Study guides from students who just aced it.</h1>
        <p className="rise mt-4 max-w-2xl text-[16.5px] leading-relaxed text-white/90" style={{ ["--i" as string]: 1 }}>
          Cheat sheets, worked examples, and unit reviews for every math class, made by students and tutors. Share yours free, or set a price.
        </p>
        <div className="rise mt-7 flex flex-wrap gap-3" style={{ ["--i" as string]: 2 }}>
          <Link href={viewer ? "/study-guides/new" : "/login?next=%2Fstudy-guides%2Fnew"} className={cn(heroBtn, WORLD_ON_WHITE.accent)}>
            <Plus className="size-4" /> Sell or share a guide
          </Link>
          {viewer ? (
            <Link href="/study-guides/mine" className={heroBtnGhost}>
              My guides
            </Link>
          ) : null}
        </div>
      </WorldHero>

      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SubjectSelect courses={catalog.courses.map((c) => ({ id: c.id, title: c.title, category: c.category }))} value={course?.id ?? ""} />
          <div className="flex flex-wrap gap-2">
            <SegmentedLinks label="Price" active={price} items={(Object.keys(PRICES) as (keyof typeof PRICES)[]).map((k) => ({ key: k, label: PRICES[k], href: `/study-guides?${qs({ price: k })}` }))} />
            <SegmentedLinks label="Sort" active={sort} items={(Object.keys(SORTS) as (keyof typeof SORTS)[]).map((k) => ({ key: k, label: SORTS[k], href: `/study-guides?${qs({ sort: k })}` }))} />
          </div>
        </div>

        {guides.length ? (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((g) => (
              <li key={g.id}>
                <GuideCard g={g} courseTitle={catalog.course(g.courseId)!.shortTitle} />
              </li>
            ))}
          </ul>
        ) : (
          <div className={cn(panel, "mt-6 flex flex-col items-center p-8 text-center sm:p-12")}>
            <span className="flex size-14 items-center justify-center rounded-2xl bg-accent-soft text-accent-ink">
              <FileText className="size-7" />
            </span>
            <p className="headline mt-4 text-[22px] text-ink">{all.length ? "No guides match those filters yet." : "Be the first to share a guide."}</p>
            <p className="mt-1 max-w-md text-[15px] text-muted">
              {course ? `Nobody has posted a ${course.shortTitle} guide yet. ` : ""}Made notes that got you an A? Post them free or for a price, and help the next student.
            </p>
            <Link href={viewer ? "/study-guides/new" : "/login?next=%2Fstudy-guides%2Fnew"} className={cn(heroBtn, "mt-6 bg-accent text-white [--ledge:var(--accent-press)]")}>
              <Plus className="size-4" /> Post a guide
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
