/* Mirrors the media library: breadcrumb, toolbar (search/new folder/upload), thumbnail grid */
export function MediaGridSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-7 w-40 animate-pulse rounded bg-neutral-300" />

      <div className="h-4 w-52 animate-pulse rounded bg-neutral-300" />

      <div className="flex flex-col gap-3 border-b border-neutral-200 pb-3 sm:flex-row sm:items-center">
        <div className="h-10 flex-1 animate-pulse rounded bg-neutral-300" />
        <div className="h-10 w-32 shrink-0 animate-pulse rounded-lg bg-neutral-300" />
        <div className="h-10 w-32 shrink-0 animate-pulse rounded-lg bg-neutral-300" />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <div className="aspect-square animate-pulse rounded-xl bg-neutral-300" />
            <div
              className="h-3 animate-pulse rounded bg-neutral-300"
              style={{ width: `${50 + (i % 4) * 12}%` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
