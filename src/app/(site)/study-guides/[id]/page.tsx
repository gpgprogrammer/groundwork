import { ArrowLeft, Check, Download, FileText, Lock, Star } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CourseIcon } from "@/components/course-icon";
import { GetGuideButton, RateGuide } from "@/components/market-client";
import { ReportButton } from "@/components/report-button";
import { buttonClass, cn, Notice, panel } from "@/components/ui";
import { usd } from "@/lib/billing/plans";
import { getCatalog } from "@/lib/catalog";
import { paymentsMode } from "@/lib/env";
import { getGuide, getPurchase, listGuides, previewOf, rating } from "@/lib/market";
import { getViewer } from "@/lib/viewer";
import { GuideCard } from "@/components/guide-card";

export async function generateMetadata({ params }: PageProps<"/study-guides/[id]">): Promise<Metadata> {
  const g = await getGuide((await params).id);
  return g ? { title: g.title, description: g.description.slice(0, 160) } : { title: "Study guide" };
}

export default async function StudyGuidePage({ params, searchParams }: PageProps<"/study-guides/[id]">) {
  const [{ id }, sp, catalog, viewer] = await Promise.all([params, searchParams, getCatalog(), getViewer()]);
  const g = await getGuide(id);
  if (!g) notFound();
  const course = catalog.course(g.courseId);
  const topic = g.topicId ? catalog.topic(g.topicId) : undefined;
  const mine = viewer?.user.id === g.sellerId;
  const purchase = viewer && !mine ? await getPurchase(g.id, viewer.user.id) : null;
  const has = Boolean(mine || purchase || viewer?.isAdmin);
  const open = has || g.price === 0;
  const r = rating(g);
  const more = (await listGuides()).filter((x) => x.id !== g.id && (x.sellerId === g.sellerId || x.courseId === g.courseId)).slice(0, 3);
  const buyLabel = g.price === 0 ? "Get it free" : paymentsMode === "test" ? `Get it (test mode: ${usd(g.price)} not charged)` : `Buy for ${usd(g.price)}`;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
      <Link href={`/study-guides${course ? `?course=${course.id}` : ""}`} className="inline-flex items-center gap-1.5 font-brand text-[14px] font-extrabold text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> Study guides
      </Link>
      {sp.new === "1" ? (
        <Notice tone="success" className="mt-4">
          Your guide is live. Share the link with classmates, or find it under My guides.
        </Notice>
      ) : null}
      {sp.got === "1" || sp.checkout === "success" ? (
        <Notice tone="success" className="mt-4">
          It&apos;s yours. {g.file ? "Download it any time from this page." : "The full guide is below."}
        </Notice>
      ) : null}
      {sp.file === "unavailable" ? (
        <Notice tone="warn" className="mt-4">
          The file couldn&apos;t be opened right now. Try again in a minute.
        </Notice>
      ) : null}

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="min-w-0">
          <p className="flex items-center gap-2.5 font-brand text-[14px] font-extrabold text-muted">
            {course ? <CourseIcon id={course.id} size={28} /> : null}
            {course?.title}
            {topic ? ` · ${topic.title}` : ""}
          </p>
          <h1 className="display mt-3 text-[34px] leading-tight text-ink sm:text-[44px]">{g.title}</h1>
          <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px] font-semibold text-muted">
            <span>by {g.sellerName}</span>
            {r ? (
              <span className="tabular inline-flex items-center gap-1">
                <Star className="size-4 fill-[#f59e0b] text-[#f59e0b]" /> {r.toFixed(1)} · {g.ratingCount} {g.ratingCount === 1 ? "rating" : "ratings"}
              </span>
            ) : null}
            <span className="tabular">{g.downloads.toLocaleString()} {g.downloads === 1 ? "student has it" : "students have it"}</span>
          </p>
          <p className="mt-6 whitespace-pre-line text-[16.5px] leading-relaxed text-ink">{g.description}</p>

          {g.body ? (
            <section className={cn(panel, "relative mt-8 overflow-hidden p-5 sm:p-7")}>
              <h2 className="font-brand text-[14px] font-extrabold text-muted">{open ? "The guide" : "Preview"}</h2>
              <div className="mt-3 whitespace-pre-wrap font-mono text-[14.5px] leading-relaxed text-ink">{open ? g.body : previewOf(g.body)}</div>
              {!open ? (
                <div className="absolute inset-x-0 bottom-0 flex h-32 items-end justify-center bg-gradient-to-t from-surface via-surface/90 to-transparent pb-5">
                  <span className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 font-brand text-[13.5px] font-extrabold text-bg">
                    <Lock className="size-4" /> Get the guide to read the rest
                  </span>
                </div>
              ) : null}
            </section>
          ) : null}

          {open && has ? (
            <div className="mt-8 flex items-center gap-4">
              <p className="font-brand text-[14px] font-extrabold text-ink-2">{mine ? "Your guide" : "Rate it for other students:"}</p>
              {!mine && purchase ? <RateGuide id={g.id} initial={purchase.rating ?? 0} /> : null}
            </div>
          ) : null}
        </article>

        <aside className="space-y-4 lg:sticky lg:top-32 lg:self-start">
          <div className={cn(panel, "p-5")}>
            <p className="tabular display text-[40px] leading-none text-ink">{g.price ? usd(g.price) : "Free"}</p>
            <ul className="mt-4 space-y-2 text-[14px] text-ink-2">
              {g.file ? (
                <li className="flex items-center gap-2">
                  <FileText className="size-4 text-muted" /> {g.file.type === "application/pdf" ? "PDF" : "Image"} · {(g.file.bytes / 1024 / 1024).toFixed(1)} MB
                </li>
              ) : null}
              {g.body ? (
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-muted" /> Written guide, readable on Merit
                </li>
              ) : null}
            </ul>
            <div className="mt-5 space-y-2">
              {has || (g.price === 0 && viewer) ? (
                g.file ? (
                  <a href={`/api/study-guides/${g.id}/file`} className={buttonClass("primary", "lg", "w-full")}>
                    <Download className="size-4" /> Download
                  </a>
                ) : has ? (
                  <p className="rounded-2xl bg-positive-soft px-4 py-3 text-center font-brand text-[14px] font-extrabold text-positive">{mine ? "You posted this guide" : "It's in your library"}</p>
                ) : (
                  <GetGuideButton id={g.id} label="Save it free" />
                )
              ) : viewer ? (
                paymentsMode === "paused" && g.price > 0 ? (
                  <p className="rounded-2xl bg-bg-subtle px-4 py-3 text-center text-[14px] text-ink-2">Buying paid guides opens soon. Free guides work now.</p>
                ) : (
                  <GetGuideButton id={g.id} label={buyLabel} />
                )
              ) : (
                <Link href={`/login?next=${encodeURIComponent(`/study-guides/${g.id}`)}`} className={buttonClass("primary", "lg", "w-full")}>
                  Sign in to get it
                </Link>
              )}
              {mine ? (
                <Link href="/study-guides/mine" className={buttonClass("outline", "md", "w-full")}>
                  Manage my guides
                </Link>
              ) : null}
            </div>
            {g.price > 0 && !has ? <p className="mt-3 text-[12.5px] leading-relaxed text-muted">One-time purchase. You keep access for good.</p> : null}
          </div>
          {topic && course ? (
            <Link href={`/practice/${course.slug}/${topic.slug}`} className={cn(panel, "block p-4 text-[14px] font-bold text-ink hover:bg-bg-subtle")}>
              Practice {topic.title} problems →
            </Link>
          ) : null}
          {!mine ? <ReportButton kind="market-guide" targetId={g.id} /> : null}
        </aside>
      </div>

      {more.length ? (
        <section className="mt-14">
          <h2 className="headline text-[22px] text-ink">More guides</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((x) => (
              <li key={x.id}>
                <GuideCard g={x} courseTitle={catalog.course(x.courseId)?.shortTitle ?? ""} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
