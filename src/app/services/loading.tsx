export default function ServicesLoading() {
  return (
    <div className="min-h-screen pt-24">
      {/* Hero skeleton */}
      <section className="py-16 sm:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl space-y-4 text-center">
            <div className="mx-auto h-12 w-3/4 animate-pulse rounded-lg bg-muted/40" />
            <div className="mx-auto h-6 w-full max-w-xl animate-pulse rounded bg-muted/40" />
            <div className="mx-auto h-6 w-2/3 animate-pulse rounded bg-muted/40" />
          </div>
        </div>
      </section>

      {/* Grid skeleton */}
      <section className="py-16 section-alt">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-72 animate-pulse rounded-xl bg-muted/40"
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
