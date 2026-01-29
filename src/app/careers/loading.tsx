export default function CareersLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Hero skeleton */}
      <section className="bg-[#d51f26] pt-12 pb-6">
        <div className="container">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
            <div className="h-[72px] w-[320px] rounded bg-white/10 sm:h-[100px] sm:w-[460px]" />
            <div className="h-[40px] w-[260px] rounded bg-white/10" />
          </div>
          <div className="mt-10 flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-[36px] w-[110px] rounded-full bg-white/10"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Count skeleton */}
      <section className="bg-[#fafafa] py-14 dark:bg-slate-800/20">
        <div className="container">
          <div className="mb-2 h-4 w-32 rounded bg-slate-200" />
          <div className="h-12 w-80 rounded bg-slate-200" />
        </div>
      </section>

      {/* Cards skeleton */}
      <section className="py-14">
        <div className="container">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-[4px] border border-[#d5d7db] bg-[#eef0f2] p-[5px]"
              >
                <div className="rounded-[3px] border border-[#e2e4e8] bg-[#fafafa] p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="h-6 w-28 rounded-full bg-slate-200" />
                    <div className="h-4 w-20 rounded bg-slate-200" />
                  </div>
                  <div className="mb-2 h-6 w-3/4 rounded bg-slate-200" />
                  <div className="mb-6 h-4 w-1/3 rounded bg-slate-200" />
                  <div className="h-9 w-32 rounded-full bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
