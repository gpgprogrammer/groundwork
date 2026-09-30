import Link from "next/link";
import { WorldBand } from "@/components/learn-band";
import { Children, isValidElement, type ReactElement, type ReactNode } from "react";
import { env } from "@/lib/env";

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Legal documents: a comfortable reading column with an on-this-page index on wide screens. */
export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  const sections = Children.toArray(children)
    .filter((c): c is ReactElement<{ title: string }> => isValidElement(c) && c.type === Clause)
    .map((c) => c.props.title);
  const other = title === "Privacy Policy" ? { href: "/terms", label: "Terms of Service" } : { href: "/privacy", label: "Privacy Policy" };

  return (
    <>
    <WorldBand kicker="Merit Learning" title={title} />
    <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-10 sm:px-6 sm:pt-14 lg:px-8">
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-16">
        <article className="min-w-0 max-w-[68ch]">
          <p className="text-sm font-semibold text-muted">Last updated: {updated}</p>
          <div className="rise mt-10 space-y-10 text-[15.5px] leading-[1.75] text-ink-2 [&_a]:underline-offset-2" style={{ ["--i" as string]: 1 }}>
            {children}
          </div>
          <p className="mt-14 border-t border-line pt-6 text-sm text-muted">
            See also the{" "}
            <Link href={other.href} className="font-medium text-accent-ink hover:underline">
              {other.label}
            </Link>
            .
          </p>
        </article>
        {sections.length ? (
          <nav aria-label="On this page" className="hidden lg:block">
            <div className="sticky top-24">
              <p className="text-[12px] font-semibold text-muted">On this page</p>
              <ol className="mt-3 space-y-0.5 border-l border-line">
                {sections.map((s) => (
                  <li key={s}>
                    <a href={`#${slug(s)}`} className="-ml-px block border-l border-transparent py-1 pl-4 text-[13.5px] text-muted transition-colors hover:border-line-strong hover:text-ink">
                      {s}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>
        ) : null}
      </div>
    </div>
    </>
  );
}

export function Clause({ title, children }: { title: string; children: ReactNode }) {
  const id = slug(title);
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-24">
      <h2 id={`${id}-h`} className="headline group flex items-baseline gap-2 text-[19px] text-ink">
        {title}
        <a href={`#${id}`} aria-label={`Link to ${title}`} className="text-[15px] font-medium text-faint opacity-0 transition-opacity duration-150 hover:text-accent-ink focus-visible:opacity-100 group-hover:opacity-100">
          #
        </a>
      </h2>
      <div className="mt-3 space-y-3">{children}</div>
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
