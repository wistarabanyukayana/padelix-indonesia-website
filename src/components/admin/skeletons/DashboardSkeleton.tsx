/* Mirrors the dashboard home: greeting, 3 stat cards, activity feed + quick actions */
export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <div className="h-7 w-40 animate-pulse rounded bg-neutral-300" />
        <div className="h-4 w-64 animate-pulse rounded bg-neutral-300" />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-brand border border-neutral-200 bg-white p-6 shadow-sm"
          >
            <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-neutral-300" />
            <div className="flex flex-col gap-2">
              <div className="h-3 w-20 animate-pulse rounded bg-neutral-300" />
              <div className="h-8 w-14 animate-pulse rounded bg-neutral-300" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.25fr_1fr]">
        <div className="flex flex-col gap-4 rounded-brand border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="h-5 w-40 animate-pulse rounded bg-neutral-300" />
          <div className="flex flex-col divide-y divide-neutral-100">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4 py-3">
                <div className="flex flex-col gap-2">
                  <div className="h-3.5 w-40 animate-pulse rounded bg-neutral-300" />
                  <div className="h-3 w-56 animate-pulse rounded bg-neutral-300" />
                </div>
                <div className="h-3 w-16 shrink-0 animate-pulse rounded bg-neutral-300" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-brand border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="mb-4 h-5 w-28 animate-pulse rounded bg-neutral-300" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-16 w-full animate-pulse rounded-lg border-2 border-dashed border-neutral-200 bg-neutral-100"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
