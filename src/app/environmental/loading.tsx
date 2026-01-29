export default function EnvironmentalLoading() {
  return (
    <div className="min-h-screen pt-24">
      {/* Hero skeleton */}
      <section className="py-16 sm:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl space-y-4 text-center">
            <div className="mx-auto h-6 w-40 animate-pulse rounded-full bg-muted/40" />
            <div className="mx-auto h-12 w-3/4 animate-pulse rounded-lg bg-muted/40" />
            <div className="mx-auto h-6 w-full max-w-xl animate-pulse rounded bg-muted/40" />
          </div>
        </div>
      </section>

      {/* Banner skeleton */}
      <div className="h-20 animate-pulse bg-muted/40" />

      {/* Grid skeleton */}
      <section className="py-16 section-alt">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-80 animate-pulse rounded-xl bg-muted/40"
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
