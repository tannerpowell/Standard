import { Skeleton } from "@/components/ui/skeleton";

export default function EnvironmentalLoading() {
  return (
    <div className="min-h-screen pt-24">
      {/* Hero skeleton */}
      <section className="py-16 sm:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl space-y-4 text-center">
            <Skeleton className="mx-auto h-6 w-40 rounded-full" />
            <Skeleton className="mx-auto h-12 w-3/4 rounded-lg" />
            <Skeleton className="mx-auto h-6 w-full max-w-xl" />
          </div>
        </div>
      </section>

      {/* Banner skeleton */}
      <Skeleton className="h-20 rounded-none" />

      {/* Grid skeleton */}
      <section className="py-16 section-alt">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-80 rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
