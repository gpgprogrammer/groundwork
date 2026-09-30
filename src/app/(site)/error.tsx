"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { reportClientError } from "@/components/tracker";
import { Button, Container, buttonClass } from "@/components/ui";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
    reportClientError(error);
  }, [error]);
  return (
    <Container size="sm" className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <span className="rise flex size-14 items-center justify-center rounded-2xl bg-warn-soft text-warn">
        <TriangleAlert className="size-7" />
      </span>
      <h1 className="rise headline mt-6 text-[26px] text-ink sm:text-[30px]" style={{ ["--i" as string]: 1 }}>
        Something went wrong
      </h1>
      <p className="rise mt-2 max-w-md text-[15px] leading-relaxed text-muted" style={{ ["--i" as string]: 2 }}>
        We&apos;ve logged the problem. Try again, and if it keeps happening, reload the page.
      </p>
      <div className="rise mt-8 flex flex-wrap justify-center gap-2" style={{ ["--i" as string]: 3 }}>
        <Button onClick={reset}>
          <RotateCcw className="size-4" /> Try again
        </Button>
        <Link href="/" className={buttonClass("secondary")}>
          Go home
        </Link>
      </div>
      {error.digest ? <p className="mt-8 font-mono text-xs text-faint">Ref: {error.digest}</p> : null}
    </Container>
  );
}
