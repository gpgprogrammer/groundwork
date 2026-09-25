"use client";

import { useEffect } from "react";
import { reportClientError } from "@/components/tracker";
import { Button, Container } from "@/components/ui";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
    reportClientError(error);
  }, [error]);
  return (
    <Container size="md" className="py-32 text-center">
      <h1 className="headline text-2xl text-ink">Something went wrong</h1>
      <p className="mt-2 text-[15px] text-muted">We&apos;ve logged the problem. Try again, and if it keeps happening, reload the page.</p>
      {error.digest ? <p className="mt-4 font-mono text-xs text-faint">Ref: {error.digest}</p> : null}
      <Button className="mt-8" onClick={reset}>
        Try again
      </Button>
    </Container>
  );
}
