interface Column {
  width?: string;
  align?: "left" | "center" | "right";
  thumbnail?: boolean;
}

interface ListSkeletonProps {
  titleWidth?: string;
  selectCount?: number;
  hasAddButton?: boolean;
  columns: Column[];
  rows?: number;
}

const alignClass = {
  left: "",
  center: "mx-auto",
  right: "ml-auto",
};

/* Mirrors the shared list-page shape: title, sticky search/filter toolbar, table on desktop / cards on mobile */
export function ListSkeleton({
  titleWidth = "w-56",
  selectCount = 2,
  hasAddButton = true,
  columns,
  rows = 8,
}: ListSkeletonProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className={`h-7 ${titleWidth} animate-pulse rounded bg-neutral-300`} />
        {hasAddButton && (
          <div className="h-10 w-36 shrink-0 animate-pulse rounded-lg bg-neutral-300" />
        )}
      </div>

      <div className="flex flex-col gap-3 border-b border-neutral-200 pb-3 sm:flex-row sm:items-center">
        <div className="h-10 flex-1 animate-pulse rounded bg-neutral-300" />
        <div className="h-10 w-20 shrink-0 animate-pulse rounded bg-neutral-300" />
        {Array.from({ length: selectCount }).map((_, i) => (
          <div
            key={i}
            className="h-10 w-32 shrink-0 animate-pulse rounded bg-neutral-300"
          />
        ))}
      </div>

      <div className="overflow-hidden rounded-brand border border-neutral-200 bg-white shadow-sm">
        {/* desktop table shape */}
        <div className="hidden md:block">
          <div className="flex items-center gap-4 border-b border-neutral-200 bg-neutral-50 px-6 py-4">
            {columns.map((col, i) => (
              <div
                key={i}
                className={`h-3 animate-pulse rounded bg-neutral-300 ${col.width ?? "w-20"} ${alignClass[col.align ?? "left"]}`}
              />
            ))}
          </div>
          <div className="divide-y divide-neutral-100">
            {Array.from({ length: rows }).map((_, r) => (
              <div key={r} className="flex items-center gap-4 px-6 py-4">
                {columns.map((col, c) => (
                  <div
                    key={c}
                    className={`flex items-center gap-3 ${col.width ?? "w-20"}`}
                  >
                    {col.thumbnail && (
                      <div className="h-10 w-10 shrink-0 animate-pulse rounded bg-neutral-300" />
                    )}
                    <div
                      className={`h-3.5 flex-1 animate-pulse rounded bg-neutral-300 ${alignClass[col.align ?? "left"]}`}
                      style={{ width: `${55 + ((r + c) % 4) * 10}%` }}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* mobile card shape */}
        <div className="flex flex-col gap-2 bg-neutral-50 p-2 md:hidden">
          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg border border-neutral-100 bg-white p-3"
            >
              {columns.some((c) => c.thumbnail) && (
                <div className="h-10 w-10 shrink-0 animate-pulse rounded bg-neutral-300" />
              )}
              <div className="flex flex-1 flex-col gap-2">
                <div
                  className="h-4 animate-pulse rounded bg-neutral-300"
                  style={{ width: `${60 - (i % 4) * 8}%` }}
                />
                <div
                  className="h-3 animate-pulse rounded bg-neutral-300"
                  style={{ width: `${35 - (i % 3) * 6}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
