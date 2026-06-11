import { AppImage } from "@/components/general/AppImage";
import { Button } from "@/components/ui/Button";
import { HeroProps } from "@/types";
import Link from "next/link";

export function Hero({
  heading,
  subHeading,
  backgroundImage,
  primaryCta,
  secondaryCta,
}: HeroProps) {
  return (
    <section className="relative flex h-[85vh] min-h-150 w-full items-center justify-center overflow-hidden bg-brand-dark">
      {/* Background Image */}
      <AppImage
        src={backgroundImage}
        alt="Hero Background"
        fill
        preload
        fetchPriority="high"
        loading="eager"
        disableLoadingAnimation
        sizes="100vw"
        className="object-cover"
      />

      {/* Overlay: directional gradient reads better than a flat dim */}
      <div className="absolute inset-0 bg-linear-to-b from-brand-dark/70 via-brand-dark/40 to-brand-dark/80" />

      {/* Content */}
      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center gap-6 px-6 text-center text-white">
        <span className="rounded-full border border-brand-green/40 bg-brand-dark/40 px-4 py-1.5 text-xs font-bold tracking-[0.25em] text-brand-green uppercase backdrop-blur-sm">
          Padel Starts Here
        </span>
        <h1 className="h1 drop-shadow-lg">{heading}</h1>
        <p className="max-w-2xl text-lg text-pretty text-white/85 sm:text-xl">
          {subHeading}
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          {primaryCta && (
            <Link href={primaryCta.href}>
              <Button
                variant="primary"
                size="md"
                className="shadow-lg shadow-lime-400/20 hover:shadow-xl hover:shadow-lime-400/30 sm:px-8 sm:py-4 sm:text-lg sm:font-bold"
              >
                {primaryCta.text}
              </Button>
            </Link>
          )}
          {secondaryCta && (
            <Link href={secondaryCta.href}>
              <Button
                variant="outline"
                size="md"
                className="border-white/80 text-white backdrop-blur-sm hover:border-white hover:bg-white hover:text-brand-dark sm:px-8 sm:py-4 sm:text-lg sm:font-bold"
              >
                {secondaryCta.text}
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Fade into the next section */}
      <div className="absolute right-0 bottom-0 left-0 h-24 bg-linear-to-t from-white/10 to-transparent" />
    </section>
  );
}
