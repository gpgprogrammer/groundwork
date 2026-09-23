import { Container } from "@/components/ui";

export default function Loading() {
  return (
    <Container size="xl" className="py-12" aria-busy="true" aria-label="Loading">
      <div className="h-8 w-64 animate-pulse rounded-lg bg-bg-subtle" />
      <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-bg-subtle" />
      <div className="mt-12 grid gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-video animate-pulse rounded-[10px] bg-bg-subtle" />
            <div className="mt-3 h-4 w-4/5 animate-pulse rounded bg-bg-subtle" />
            <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-bg-subtle" />
          </div>
        ))}
      </div>
    </Container>
  );
}
