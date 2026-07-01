/* Mirrors the real homepage section order (Hero, Marquee, About,
   FeaturedProducts, Portfolio, Certifications, Contact) so the pulse shell
   doesn't jump around once the real content streams in. */
export default function HomeLoading() {
  return (
    <main className="flex w-full flex-col">
      {/* Hero */}
      <section className="flex min-h-[90vh] w-full flex-col justify-end bg-court-950 px-6 py-28 sm:px-12 md:px-20 lg:px-32">
        <div className="h-4 w-32 animate-pulse rounded bg-white/20" />
        <div className="mt-6 h-10 w-full max-w-xl animate-pulse rounded bg-white/20 sm:h-14" />
        <div className="mt-3 h-10 w-2/3 max-w-md animate-pulse rounded bg-white/20 sm:h-14" />
        <div className="mt-6 h-4 w-full max-w-lg animate-pulse rounded bg-white/10" />
        <div className="mt-2 h-4 w-2/3 max-w-md animate-pulse rounded bg-white/10" />
        <div className="mt-8 flex gap-4">
          <div className="h-12 w-40 animate-pulse rounded-full bg-brand-green/40" />
          <div className="h-12 w-36 animate-pulse rounded-full bg-white/10" />
        </div>
        <dl className="mt-16 grid w-full max-w-3xl grid-cols-2 gap-x-8 gap-y-6 border-t border-white/15 pt-8 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="h-9 w-14 animate-pulse rounded bg-white/20" />
              <div className="h-3 w-20 animate-pulse rounded bg-white/10" />
            </div>
          ))}
        </dl>
      </section>

      {/* Marquee */}
      <div className="w-full bg-brand-green py-4">
        <div className="h-4 w-full" />
      </div>

      {/* About */}
      <section className="section bg-court-900">
        <div className="wrapper grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="aspect-square w-full animate-pulse rounded bg-white/10" />
          <div className="flex flex-col justify-center gap-4">
            <div className="h-4 w-24 animate-pulse rounded bg-brand-green/40" />
            <div className="h-8 w-48 animate-pulse rounded bg-white/20" />
            <div className="h-3 w-full animate-pulse rounded bg-white/10" />
            <div className="h-3 w-full animate-pulse rounded bg-white/10" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-white/10" />
          </div>
        </div>
        <div className="wrapper mt-12 grid grid-cols-1 gap-px sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3 bg-court-800 p-8">
              <div className="h-9 w-10 animate-pulse rounded bg-brand-green/30" />
              <div className="h-5 w-32 animate-pulse rounded bg-white/20" />
              <div className="h-3 w-full animate-pulse rounded bg-white/10" />
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="section bg-white">
        <div className="wrapper flex flex-col gap-10">
          <div className="flex flex-col items-center gap-3">
            <div className="h-4 w-28 animate-pulse rounded bg-neutral-200" />
            <div className="h-8 w-64 animate-pulse rounded bg-neutral-300" />
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <div className="aspect-square w-full animate-pulse rounded-lg bg-neutral-200" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-neutral-200" />
                <div className="h-4 w-1/3 animate-pulse rounded bg-neutral-200" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio */}
      <section className="section bg-court-950">
        <div className="wrapper flex flex-col gap-10">
          <div className="flex flex-col items-center gap-3">
            <div className="h-4 w-28 animate-pulse rounded bg-white/10" />
            <div className="h-8 w-64 animate-pulse rounded bg-white/20" />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            <div className="col-span-2 row-span-2 aspect-square animate-pulse rounded bg-white/10 sm:aspect-auto" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-video animate-pulse rounded bg-white/10"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="section bg-white">
        <div className="wrapper flex flex-col gap-10">
          <div className="flex flex-col items-center gap-3">
            <div className="h-4 w-28 animate-pulse rounded bg-neutral-200" />
            <div className="h-8 w-56 animate-pulse rounded bg-neutral-300" />
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-3 border border-neutral-100 p-8"
              >
                <div className="h-16 w-16 animate-pulse rounded bg-neutral-200" />
                <div className="h-3 w-20 animate-pulse rounded bg-neutral-200" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="section bg-court-900">
        <div className="wrapper flex flex-col gap-10">
          <div className="flex flex-col items-center gap-3">
            <div className="h-4 w-24 animate-pulse rounded bg-white/10" />
            <div className="h-8 w-48 animate-pulse rounded bg-white/20" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 bg-court-800 p-6"
              >
                <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-white/20" />
                <div className="flex flex-1 flex-col gap-2">
                  <div className="h-3 w-16 animate-pulse rounded bg-white/10" />
                  <div className="h-4 w-24 animate-pulse rounded bg-white/20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
