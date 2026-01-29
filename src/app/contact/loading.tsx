export default function ContactLoading() {
  return (
    <div className="min-h-screen pt-24">
      {/* Hero skeleton */}
      <section className="py-16 sm:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl space-y-4 text-center">
            <div className="mx-auto h-12 w-64 animate-pulse rounded-lg bg-muted/40" />
            <div className="mx-auto h-6 w-full max-w-xl animate-pulse rounded bg-muted/40" />
          </div>
        </div>
      </section>

      {/* Form skeleton */}
      <section className="py-16 section-alt">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <div className="h-8 w-48 animate-pulse rounded bg-muted/40 mb-6" />
              <div className="h-[500px] animate-pulse rounded-xl bg-muted/40" />
            </div>
            <div className="lg:col-span-2">
              <div className="h-8 w-40 animate-pulse rounded bg-muted/40 mb-6" />
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-24 animate-pulse rounded-xl bg-muted/40"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
