/**
 * Shown the instant you click a link, while the next page loads, so the site never looks frozen.
 * A hero band and a few content blocks: the shape most Merit pages open with.
 */
export default function Loading() {
  return (
    <div aria-busy="true" aria-live="polite" className="fade">
      <span className="sr-only">Loading</span>
      <div className="bg-bg-subtle">
        <div className="mx-auto max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8 lg:pb-14 lg:pt-10">
          <div className="skeleton h-8 w-36 rounded-full" />
          <div className="skeleton mt-5 h-12 w-[min(36rem,90%)] rounded-2xl" />
          <div className="skeleton mt-3 h-12 w-[min(24rem,70%)] rounded-2xl" />
          <div className="skeleton mt-5 h-5 w-[min(32rem,85%)] rounded-full" />
        </div>
      </div>
      <div className="mx-auto grid max-w-6xl gap-4 px-4 pt-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={i >= 3 ? "hidden sm:block" : undefined}>
            <div className="skeleton h-36 rounded-3xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
