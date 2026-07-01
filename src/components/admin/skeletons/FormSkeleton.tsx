interface FormSkeletonProps {
  /** row counts for each stacked field-group card (each row = one label+input pair in a 2-col grid) */
  fieldSections: number[];
  hasMediaGrid?: boolean;
  hasChecklist?: boolean;
}

function FieldCard({ rows }: { rows: number }) {
  return (
    <div className="rounded-brand border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="mb-4 h-5 w-40 animate-pulse rounded bg-neutral-300" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: rows * 2 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="h-3 w-20 animate-pulse rounded bg-neutral-300" />
            <div className="h-10 w-full animate-pulse rounded bg-neutral-300" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* Mirrors the shared form-page shape: stacked field-group cards + optional media picker/checklist + submit bar */
export function FormSkeleton({
  fieldSections,
  hasMediaGrid = false,
  hasChecklist = false,
}: FormSkeletonProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-7 w-64 animate-pulse rounded bg-neutral-300" />

      {fieldSections.map((rows, i) => (
        <FieldCard key={i} rows={rows} />
      ))}

      {hasMediaGrid && (
        <div className="rounded-brand border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="mb-4 h-5 w-32 animate-pulse rounded bg-neutral-300" />
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square animate-pulse rounded-lg bg-neutral-300"
              />
            ))}
          </div>
        </div>
      )}

      {hasChecklist && (
        <div className="rounded-brand border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="mb-4 h-5 w-32 animate-pulse rounded bg-neutral-300" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-4 w-4 shrink-0 animate-pulse rounded bg-neutral-300" />
                <div
                  className="h-3 animate-pulse rounded bg-neutral-300"
                  style={{ width: `${40 + (i % 3) * 10}%` }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <div className="h-10 w-24 animate-pulse rounded-lg bg-neutral-300" />
        <div className="h-10 w-32 animate-pulse rounded-lg bg-neutral-300" />
      </div>
    </div>
  );
}
