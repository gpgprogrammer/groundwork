import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { updateMyGuide } from "@/app/actions/market";
import { CourseIcon } from "@/components/course-icon";
import { buttonClass, cn, EmptyState, panel } from "@/components/ui";
import { usd } from "@/lib/billing/plans";
import { getCatalog } from "@/lib/catalog";
import { getStore } from "@/lib/data/store";
import { GUIDE_COMMISSION, GUIDES, MAX_PRICE, PURCHASES, type GuidePurchase, type MarketGuide } from "@/lib/market";
import { requireViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "My study guides" };

/** A seller's listings and earnings, plus the guides they've gotten. */
export default async function MyGuidesPage() {
  const [viewer, catalog, store] = await Promise.all([requireViewer("/study-guides/mine"), getCatalog(), getStore()]);
  const [listed, got] = await Promise.all([
    store.listDocs<MarketGuide>(GUIDES, { owner: viewer.user.id }).then((gs) => gs.filter((g) => g.status === "published").sort((a, b) => b.createdAt.localeCompare(a.createdAt))),
    store.listDocs<GuidePurchase>(PURCHASES, { owner: viewer.user.id }),
  ]);
  const gross = listed.reduce((s, g) => s + g.revenue, 0);
  const net = Math.round(gross * (1 - GUIDE_COMMISSION) * 100) / 100;
  const gotGuides = (await Promise.all(got.map((p) => store.getDoc<MarketGuide>(GUIDES, p.guideId)))).filter((g): g is MarketGuide => Boolean(g && g.status === "published"));

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-[34px] text-ink sm:text-[44px]">My study guides</h1>
          <p className="mt-1 text-[15px] text-muted">Guides you&apos;ve posted, what they&apos;ve earned, and guides you&apos;ve gotten.</p>
        </div>
        <Link href="/study-guides/new" className={buttonClass("primary", "md")}>
          <Plus className="size-4" /> Post a guide
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {[
          { n: listed.length, l: "listed" },
          { n: listed.reduce((s, g) => s + g.downloads, 0), l: "students reached" },
          { n: usd(net), l: "earned after fees" },
        ].map((s) => (
          <div key={s.l} className={cn(panel, "p-4")}>
            <p className="tabular display text-[28px] leading-none text-ink sm:text-[34px]">{s.n}</p>
            <p className="mt-1 text-[13px] font-semibold text-muted">{s.l}</p>
          </div>
        ))}
      </div>
      {gross > 0 ? <p className="mt-3 text-[13px] text-muted">Earnings are tracked here as guides sell. Merit keeps {Math.round(GUIDE_COMMISSION * 100)}% of each sale. Payouts open when Merit&apos;s payment system launches.</p> : null}

      <section className="mt-10">
        <h2 className="headline text-[22px] text-ink">Your listings</h2>
        {listed.length ? (
          <ul className="mt-4 space-y-3">
            {listed.map((g) => (
              <li key={g.id} className={cn(panel, "flex flex-col gap-4 p-4 sm:flex-row sm:items-center")}>
                <Link href={`/study-guides/${g.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                  <CourseIcon id={g.courseId} size={40} />
                  <span className="min-w-0">
                    <span className="block truncate font-brand text-[16px] font-extrabold text-ink hover:underline">{g.title}</span>
                    <span className="tabular block text-[13px] text-muted">
                      {catalog.course(g.courseId)?.shortTitle} · {g.downloads} {g.downloads === 1 ? "student" : "students"} · {g.sales} sold · {usd(g.revenue)} gross
                    </span>
                  </span>
                </Link>
                <form action={updateMyGuide.bind(null, g.id)} className="flex shrink-0 items-center gap-2">
                  <label className="flex h-10 items-center gap-1 rounded-xl bg-bg-subtle px-3 ring-2 ring-line">
                    <span className="text-[13px] font-bold text-muted">$</span>
                    <input name="price" type="number" min={0} max={MAX_PRICE} step="0.5" defaultValue={g.price} className="w-16 bg-transparent text-[14px] font-bold text-ink outline-none" aria-label="Price (0 for free)" />
                  </label>
                  <button className={buttonClass("secondary", "sm")}>Save</button>
                  <button name="remove" value="1" className={buttonClass("ghost", "sm", "text-danger")}>
                    Unlist
                  </button>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4">
            <EmptyState title="You haven't posted a guide yet." body="Notes that helped you on a test can help someone else tonight." action={<Link href="/study-guides/new" className={buttonClass("primary", "md")}>Post your first guide</Link>} />
          </div>
        )}
      </section>

      {gotGuides.length ? (
        <section className="mt-10">
          <h2 className="headline text-[22px] text-ink">Guides you&apos;ve gotten</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {gotGuides.map((g) => (
              <li key={g.id}>
                <Link href={`/study-guides/${g.id}`} className={cn(panel, "flex items-center gap-3 p-4 hover:bg-bg-subtle")}>
                  <CourseIcon id={g.courseId} size={36} />
                  <span className="min-w-0 truncate font-brand text-[15px] font-extrabold text-ink">{g.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
