import { Container } from "@/components/ui";

/** Skeleton that matches the video grid most pages open with. */
export default function Loading() {
  return (
    <Container size="xl" className="fade py-8 sm:py-10">
      <div aria-busy="true" aria-live="polite">
        <span className="sr-only">Loading</span>
        <div className="skeleton h-8 w-56 max-w-[70%] rounded-full" />
        <div className="skeleton mt-3 h-4 w-96 max-w-full rounded-full" />
        <div className="mt-6 flex gap-2 overflow-hidden">
          {[88, 72, 96, 80, 64].map((w, i) => (
            <div key={i} className="skeleton h-8 shrink-0 rounded-full" style={{ width: w }} />
          ))}
        </div>
        <div className="mt-8 grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={i >= 4 ? "hidden sm:block" : undefined}>
              <div className="skeleton aspect-video rounded-xl" />
              <div className="mt-3 flex gap-3">
                <div className="skeleton size-9 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1">
                  <div className="skeleton h-4 w-[90%] rounded-full" />
                  <div className="skeleton mt-2 h-3.5 w-3/5 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
