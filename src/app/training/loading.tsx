import { Skeleton } from "@/components/ui/skeleton"

export default function TrainingLoading() {
  return (
    <div className="min-h-screen pt-24">
      {/* Hero skeleton */}
      <section className="py-16 sm:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl space-y-4 text-center">
            <Skeleton className="mx-auto h-6 w-32 rounded-full" />
            <Skeleton className="mx-auto h-12 w-3/4 rounded-lg" />
            <Skeleton className="mx-auto h-6 w-full max-w-xl" />
          </div>
        </div>
      </section>

      {/* Categories skeleton */}
      <section className="py-16 section-alt">
        <div className="container space-y-16">
          {[1, 2, 3].map((category) => (
            <div key={category}>
              <div className="mb-8 space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-5 w-72" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-44 rounded-xl" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
