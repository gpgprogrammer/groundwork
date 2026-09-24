import type { ReactNode } from "react";
import { env } from "@/lib/env";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
      <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">{title}</h1>
      <p className="mt-3 text-sm text-muted">Last updated: {updated}</p>
      <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-ink-2">{children}</div>
    </div>
  );
}

export function Clause({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <div className="mt-2 space-y-2">{children}</div>
    </section>
  );
}

export function Contact() {
  return env.contactEmail ? (
    <>
      email{" "}
      <a href={`mailto:${env.contactEmail}`} className="font-medium text-ink underline underline-offset-2">
        {env.contactEmail}
      </a>
    </>
  ) : (
    <>contact the Merit team from your account settings</>
  );
}
