import { Container, LinkButton } from "@/components/ui";

export default function NotFound() {
  return (
    <Container size="md" className="py-32 text-center">
      <p className="font-serif text-6xl italic text-faint">404</p>
      <h1 className="headline mt-6 text-2xl text-ink">We couldn&apos;t find that page</h1>
      <p className="mt-2 text-[15px] text-muted">It may have moved, or the link might be mistyped.</p>
      <div className="mt-8 flex justify-center gap-2">
        <LinkButton href="/courses">Browse courses</LinkButton>
        <LinkButton href="/search" variant="secondary">
          Search
        </LinkButton>
      </div>
    </Container>
  );
}
