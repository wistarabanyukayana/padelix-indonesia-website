import { AppImage } from "@/components/general/AppImage";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { HeroProps } from "@/types";

export function Hero({ heading, subHeading, backgroundImage, primaryCta, secondaryCta }: HeroProps) {
  return (
    <section className="relative w-full h-[80vh] min-h-150 flex items-center justify-center bg-brand-dark overflow-hidden">
      {/* Background Image */}
      <AppImage
        src={backgroundImage}
        alt="Hero Background"
        fill
        priority
        className="opacity-60"
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl px-6 text-center text-white flex flex-col items-center gap-6">
        <h1 className="h1">{heading}</h1>
        <p className="text-lg sm:text-xl opacity-90 max-w-2xl">
          {subHeading}
        </p>
        <div className="flex flex-wrap justify-center gap-4 mt-4">
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
