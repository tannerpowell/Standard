import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen">
      {/* Hero skeleton */}
      <div className="relative min-h-screen bg-muted/20">
        <div className="container flex min-h-screen flex-col justify-center py-32">
          <div className="max-w-3xl space-y-6">
            <Skeleton className="h-8 w-64 rounded-full" />
            <Skeleton className="h-16 w-full max-w-xl rounded-lg" />
            <Skeleton className="h-16 w-full max-w-lg rounded-lg" />
            <Skeleton className="h-6 w-full max-w-md rounded" />
            <div className="flex gap-4 pt-4">
              <Skeleton className="h-12 w-36 rounded-lg" />
              <Skeleton className="h-12 w-40 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
