import { Skeleton } from "@/components/ui/skeleton"

export default function ContactLoading() {
  return (
    <div className="min-h-screen pt-24">
      {/* Hero skeleton */}
      <section className="py-16 sm:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl space-y-4 text-center">
            <Skeleton className="mx-auto h-12 w-64 rounded-lg" />
            <Skeleton className="mx-auto h-6 w-full max-w-xl rounded" />
          </div>
        </div>
      </section>

      {/* Form skeleton */}
      <section className="py-16 section-alt">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <Skeleton className="h-8 w-48 rounded mb-6" />
              <Skeleton className="h-[500px] rounded-xl" />
            </div>
            <div className="lg:col-span-2">
              <Skeleton className="h-8 w-40 rounded mb-6" />
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
