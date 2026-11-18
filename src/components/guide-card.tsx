import { FileText, Star } from "lucide-react";
import Link from "next/link";
import { CourseIcon } from "@/components/course-icon";
import { cn, panelLink } from "@/components/ui";
import { usd } from "@/lib/billing/plans";
import type { MarketGuide } from "@/lib/market";

const rating = (g: MarketGuide) => (g.ratingCount ? g.ratingSum / g.ratingCount : null);

/** A study guide in the marketplace grid. */
export function GuideCard({ g, courseTitle }: { g: MarketGuide; courseTitle: string }) {
  const r = rating(g);
  return (
    <Link href={`/study-guides/${g.id}`} className={cn(panelLink, "group flex h-full flex-col p-5")}>
      <div className="flex items-start gap-3">
        <CourseIcon id={g.courseId} size={40} />
        <div className="min-w-0 flex-1">
          <p className="font-brand text-[12.5px] font-extrabold text-muted">{courseTitle}</p>
          <p className="line-clamp-2 font-brand text-[17px] font-extrabold leading-snug text-ink group-hover:underline">{g.title}</p>
        </div>
        <span className={cn("tabular shrink-0 rounded-full px-2.5 py-1 font-brand text-[13px] font-black", g.price ? "bg-accent-soft text-accent-ink" : "bg-positive-soft text-positive")}>{g.price ? usd(g.price) : "Free"}</span>
      </div>
      <p className="mt-3 line-clamp-3 flex-1 text-[14px] leading-relaxed text-ink-2">{g.description}</p>
      <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] font-semibold text-muted">
        <span>by {g.sellerName}</span>
        {r ? (
          <span className="tabular inline-flex items-center gap-0.5">
            <Star className="size-3.5 fill-[#f59e0b] text-[#f59e0b]" /> {r.toFixed(1)} ({g.ratingCount})
          </span>
        ) : null}
        <span className="tabular">{g.downloads.toLocaleString()} {g.downloads === 1 ? "student" : "students"}</span>
        {g.file ? (
          <span className="inline-flex items-center gap-0.5">
            <FileText className="size-3.5" /> {g.file.type === "application/pdf" ? "PDF" : "Image"}
          </span>
        ) : null}
      </p>
    </Link>
  );
}
