import { AppImage } from "@/components/general/AppImage";
import { Reveal } from "@/components/general/Reveal";
import { CourtLines } from "@/components/public/CourtLines";
import { Button } from "@/components/ui/Button";
import { HeroProps } from "@/types";
import Link from "next/link";

export function Hero({
  kicker,
  heading,
  headingAccent,
  subHeading,
  backgroundImage,
  primaryCta,
  secondaryCta,
  stats,
}: HeroProps) {
  return (
    <section className="relative flex min-h-[90vh] w-full items-center overflow-hidden bg-court-950">
      {/* Background image, pushed right and dimmed so the type owns the left */}
      <AppImage
        src={backgroundImage}
        alt="Lapangan padel Padelix Indonesia"
        fill
        preload
        fetchPriority="high"
        loading="eager"
        disableLoadingAnimation
        sizes="100vw"
        className="object-cover opacity-50"
      />
      <div className="absolute inset-0 bg-linear-to-r from-court-950 via-court-950/80 to-court-950/30" />
      <div className="absolute inset-0 bg-linear-to-t from-court-950 via-transparent to-court-950/60" />
      <div className="bg-mesh absolute inset-0" />
      <CourtLines />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-28 sm:px-12 md:px-20 lg:px-32">
        <div className="flex max-w-3xl flex-col items-start gap-6">
          <Reveal>
            <span className="kicker text-brand-green">{kicker}</span>
          </Reveal>

          <Reveal delay={100}>
            <h1 className="display-1 text-white">
              {heading}{" "}
              {headingAccent && (
                <span className="text-brand-green">{headingAccent}</span>
              )}
            </h1>
          </Reveal>

          <Reveal delay={200}>
            <p className="max-w-xl text-lg leading-relaxed text-pretty text-white/75 sm:text-xl">
              {subHeading}
            </p>
          </Reveal>

          <Reveal delay={300}>
            <div className="mt-4 flex flex-wrap gap-4">
              {primaryCta && (
                <Link href={primaryCta.href}>
                  <Button
                    variant="primary"
                    size="lg"
                    className="shadow-lg shadow-lime-400/25 hover:shadow-xl hover:shadow-lime-400/35"
                  >
                    {primaryCta.text}
                  </Button>
                </Link>
              )}
              {secondaryCta && (
                <Link href={secondaryCta.href}>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white/70 text-white backdrop-blur-sm hover:border-white hover:bg-white hover:text-neutral-900"
                  >
                    {secondaryCta.text}
                  </Button>
                </Link>
              )}
            </div>
          </Reveal>
        </div>

        {/* Stats strip: real counts from the database */}
        {stats && stats.length > 0 && (
          <Reveal delay={400}>
            <dl className="mt-16 grid w-full max-w-3xl grid-cols-2 gap-x-8 gap-y-6 border-t border-white/15 pt-8 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col gap-1">
                  <dd className="font-display text-4xl text-brand-green sm:text-5xl">
                    {stat.value}
                  </dd>
                  <dt className="text-xs font-bold tracking-widest text-white/60 uppercase">
                    {stat.label}
                  </dt>
                </div>
              ))}
            </dl>
          </Reveal>
        )}
      </div>
    </section>
  );
}
