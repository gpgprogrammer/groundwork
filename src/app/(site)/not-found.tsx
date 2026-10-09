import { BookOpen, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { LogoMark } from "@/components/logo";
import { Container, LinkButton } from "@/components/ui";

const LINKS = [
  { href: "/courses", Icon: BookOpen, title: "Courses", body: "High school classes, AP, and the SAT" },
  { href: "/search", Icon: Search, title: "Search", body: "Find a topic or lesson" },
  { href: "/ask", Icon: Sparkles, title: "Merit AI", body: "Ask what you're looking for" },
];

export default function NotFound() {
  return (
    <Container size="sm" className="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center sm:py-20">
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
      <ul className="rise mt-8 grid w-full gap-2 text-left sm:grid-cols-3" style={{ ["--i" as string]: 3 }}>
        {LINKS.map(({ href, Icon, title, body }) => (
          <li key={href}>
            <Link href={href} className="group flex h-full items-center gap-3 rounded-2xl bg-surface p-4 ring-2 ring-line transition-[box-shadow,transform] duration-200 ease-out hover:ring-line-strong hover:shadow-soft active:scale-[0.98] sm:flex-col sm:items-start">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-ink">
                <Icon className="size-[18px]" />
              </span>
              <span className="min-w-0">
                <span className="block text-[14.5px] font-semibold text-ink">{title}</span>
                <span className="block text-[13px] text-muted">{body}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <LinkButton href="/" variant="ghost" className="rise mt-6" style={{ ["--i" as string]: 4 }}>
        Go home
      </LinkButton>
    </Container>
  );
}
