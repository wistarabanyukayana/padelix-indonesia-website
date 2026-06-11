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
    <section className="relative flex h-[80vh] min-h-150 w-full items-center justify-center overflow-hidden bg-brand-dark">
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
        className="opacity-60"
      />

      {/* Content */}
      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center gap-6 px-6 text-center text-white">
        <h1 className="h1">{heading}</h1>
        <p className="max-w-2xl text-lg opacity-90 sm:text-xl">{subHeading}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          {primaryCta && (
            <Link href={primaryCta.href}>
              <Button
                variant="outline"
                size="md"
                className="border-lime-400 text-white hover:bg-lime-400 hover:text-brand-dark sm:px-8 sm:py-4 sm:text-lg sm:font-bold"
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
                className="border-white text-white hover:bg-white hover:text-brand-dark sm:px-8 sm:py-4 sm:text-lg sm:font-bold"
              >
                {secondaryCta.text}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
