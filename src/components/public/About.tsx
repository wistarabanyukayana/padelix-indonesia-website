import { AppImage } from "@/components/general/AppImage";
import { AboutProps } from "@/types";

export function About({ subheading, heading, description, image }: AboutProps) {
  return (
    <section id="about" className="section bg-brand-dark text-white">
      <div className="wrapper items-center gap-12 lg:flex-row-reverse lg:gap-20">
        {/* Image */}
        <div className="flex w-full justify-center lg:w-1/2">
          <AppImage
            src={image}
            alt="About Padelix Indonesia"
            width={384}
            height={384}
            disableLoadingAnimation
            className="h-64 w-64 rounded-brand shadow-2xl sm:h-80 sm:w-80 lg:h-96 lg:w-96"
          />
        </div>

        {/* Text */}
        <div className="flex w-full flex-col gap-6 text-center lg:w-1/2 lg:text-left">
          <span className="subheading text-brand-green">{subheading}</span>
          <h2 className="h2 text-white">{heading}</h2>
          {description.map((paragraph, index) => (
            <p key={index} className="text-lg leading-relaxed text-neutral-400">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
