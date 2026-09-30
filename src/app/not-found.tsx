import Link from "next/link";
import { LogoMark } from "@/components/logo";
import { buttonClass } from "@/components/ui";

export default function RootNotFound() {
  return (
    <div className="flex min-h-[70vh] flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <div className="rise relative">
        <LogoMark className="size-14" />
        <span className="tabular absolute -right-5 -top-2 rounded-full bg-surface px-2 py-0.5 text-[12px] font-bold text-muted ring-1 ring-line">404</span>
      </div>
      <h1 className="rise headline mt-7 text-[26px] text-ink sm:text-[32px]" style={{ ["--i" as string]: 1 }}>
        We couldn&apos;t find that page
      </h1>
      <p className="rise mt-2 text-[15px] text-muted" style={{ ["--i" as string]: 2 }}>
        It may have moved, or the link might be mistyped.
      </p>
      <div className="rise mt-8 flex flex-wrap justify-center gap-2" style={{ ["--i" as string]: 3 }}>
        <Link href="/" className={buttonClass("primary")}>
          Go home
        </Link>
        <Link href="/courses" className={buttonClass("secondary")}>
          Browse courses
        </Link>
      </div>
    </div>
  );
}
