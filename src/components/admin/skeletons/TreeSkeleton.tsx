/* Mirrors the categories page's nested tree list (indented rows, no table) */
export function TreeSkeleton() {
  const rows = [0, 1, 1, 2, 0, 1, 1, 0, 1];
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="h-7 w-56 animate-pulse rounded bg-neutral-300" />
        <div className="h-10 w-40 shrink-0 animate-pulse rounded-lg bg-neutral-300" />
      </div>

      <div className="flex flex-col gap-3 border-b border-neutral-200 pb-3 sm:flex-row sm:items-center">
        <div className="h-10 flex-1 animate-pulse rounded bg-neutral-300" />
        <div className="h-10 w-20 shrink-0 animate-pulse rounded bg-neutral-300" />
        <div className="h-10 w-32 shrink-0 animate-pulse rounded bg-neutral-300" />
        <div className="h-10 w-32 shrink-0 animate-pulse rounded bg-neutral-300" />
      </div>

      <div className="flex flex-col gap-1 rounded-brand border border-neutral-200 bg-white p-3 shadow-sm">
        {rows.map((depth, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg p-2"
            style={{ paddingLeft: `${depth * 24 + 8}px` }}
          >
            <div className="h-4 w-4 shrink-0 animate-pulse rounded bg-neutral-300" />
            <div
              className="h-4 animate-pulse rounded bg-neutral-300"
              style={{ width: `${45 - depth * 8}%` }}
            />
            <div className="ml-auto h-6 w-16 shrink-0 animate-pulse rounded bg-neutral-300" />
          </div>
        ))}
      </div>
    </div>
  );
}
