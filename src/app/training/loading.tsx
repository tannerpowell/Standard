export default function TrainingLoading() {
  return (
    <div className="min-h-screen pt-24">
      {/* Hero skeleton */}
      <section className="py-16 sm:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl space-y-4 text-center">
            <div className="mx-auto h-6 w-32 animate-pulse rounded-full bg-muted/40" />
            <div className="mx-auto h-12 w-3/4 animate-pulse rounded-lg bg-muted/40" />
            <div className="mx-auto h-6 w-full max-w-xl animate-pulse rounded bg-muted/40" />
          </div>
        </div>
      </section>

      {/* Categories skeleton */}
      <section className="py-16 section-alt">
        <div className="container space-y-16">
          {[1, 2, 3].map((category) => (
            <div key={category}>
              <div className="mb-8 space-y-2">
                <div className="h-8 w-48 animate-pulse rounded bg-muted/40" />
                <div className="h-5 w-72 animate-pulse rounded bg-muted/40" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-44 animate-pulse rounded-xl bg-muted/40"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
