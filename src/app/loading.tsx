export default function Loading() {
  return (
    <div className="min-h-screen">
      {/* Hero skeleton */}
      <div className="relative min-h-screen animate-pulse bg-muted/20">
        <div className="container flex min-h-screen flex-col justify-center py-32">
          <div className="max-w-3xl space-y-6">
            <div className="h-8 w-64 rounded-full bg-muted/40" />
            <div className="h-16 w-full max-w-xl rounded-lg bg-muted/40" />
            <div className="h-16 w-full max-w-lg rounded-lg bg-muted/40" />
            <div className="h-6 w-full max-w-md rounded bg-muted/40" />
            <div className="flex gap-4 pt-4">
              <div className="h-12 w-36 rounded-lg bg-muted/40" />
              <div className="h-12 w-40 rounded-lg bg-muted/40" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
