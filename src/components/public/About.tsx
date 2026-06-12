import { AppImage } from "@/components/general/AppImage";
import { Reveal } from "@/components/general/Reveal";
import { AboutProps } from "@/types";

export function About({
  subheading,
  heading,
  description,
  image,
  steps,
}: AboutProps) {
  return (
    <section
      id="about"
      className="section relative overflow-hidden bg-court-900 text-white"
    >
      <div className="bg-mesh absolute inset-0" aria-hidden />

      <div className="wrapper relative gap-16">
        <div className="flex flex-col items-center gap-12 lg:flex-row-reverse lg:gap-20">
          {/* Image with offset lime frame */}
          <Reveal className="flex w-full justify-center lg:w-1/2" delay={150}>
            <div className="relative">
              <div className="absolute -inset-3 translate-x-5 translate-y-5 rounded-brand border-2 border-brand-green/50" />
              <AppImage
                src={image}
                alt="Tentang Padelix Indonesia"
                width={384}
                height={384}
                disableLoadingAnimation
                className="relative h-64 w-64 rounded-brand shadow-2xl sm:h-80 sm:w-80 lg:h-96 lg:w-96"
              />
            </div>
          </Reveal>

          {/* Text */}
          <div className="flex w-full flex-col items-start gap-6 lg:w-1/2">
            <Reveal>
              <span className="kicker text-brand-green">{subheading}</span>
            </Reveal>
            <Reveal delay={100}>
              <h2 className="display-2 text-white">{heading}</h2>
            </Reveal>
            {description.map((paragraph, index) => (
              <Reveal key={index} delay={150 + index * 75}>
                <p className="text-lg leading-relaxed text-pretty text-neutral-400">
                  {paragraph}
                </p>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Process steps */}
        {steps && steps.length > 0 && (
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-brand border border-white/10 bg-white/10 sm:grid-cols-3">
            {steps.map((step, index) => (
              <Reveal
                key={step.title}
                delay={index * 120}
                className="flex h-full"
              >
                <div className="group flex h-full w-full flex-col gap-3 bg-court-900 p-8 transition-colors duration-300 hover:bg-court-800">
                  <span className="font-display text-4xl text-brand-green/50 transition-colors duration-300 group-hover:text-brand-green">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="display-3 text-white">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-neutral-400">
                    {step.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
