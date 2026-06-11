import { AppImage } from "@/components/general/AppImage";
import { AboutProps } from "@/types";

export function About({ subheading, heading, description, image }: AboutProps) {
  return (
    <section id="about" className="section bg-brand-dark text-white">
      <div className="wrapper items-center gap-12 lg:flex-row-reverse lg:gap-20">
        {/* Image */}
        <div className="flex w-full justify-center lg:w-1/2">
          <div className="relative">
            {/* Offset accent frame behind the photo */}
            <div className="absolute -inset-3 translate-x-4 translate-y-4 rounded-brand border-2 border-brand-green/40" />
            <AppImage
              src={image}
              alt="About Padelix Indonesia"
              width={384}
              height={384}
              disableLoadingAnimation
              className="relative h-64 w-64 rounded-brand shadow-2xl sm:h-80 sm:w-80 lg:h-96 lg:w-96"
            />
          </div>
        </div>

        {/* Text */}
        <div className="flex w-full flex-col gap-6 text-center lg:w-1/2 lg:text-left">
          <span className="subheading text-brand-green">{subheading}</span>
          <h2 className="h2 text-white">{heading}</h2>
          {description.map((paragraph, index) => (
            <p
              key={index}
              className="text-lg leading-relaxed text-pretty text-neutral-400"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
