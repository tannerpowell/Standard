import { Skeleton } from "@/components/ui/skeleton";

export default function ServicesLoading() {
  return (
    <div className="min-h-screen pt-24">
      {/* Hero skeleton */}
      <section className="py-16 sm:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl space-y-4 text-center">
            <Skeleton className="mx-auto h-12 w-3/4 rounded-lg" />
            <Skeleton className="mx-auto h-6 w-full max-w-xl rounded" />
            <Skeleton className="mx-auto h-6 w-2/3 rounded" />
          </div>
        </div>
      </section>

      {/* Grid skeleton */}
      <section className="py-16 section-alt">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-72 rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
