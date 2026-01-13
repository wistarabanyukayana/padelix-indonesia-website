import { AppImage } from "@/components/general/AppImage";
import { AboutProps } from "@/types";

export function About({ subheading, heading, description, image }: AboutProps) {
  return (
    <section id="about" className="section bg-brand-dark text-white">
      <div className="wrapper lg:flex-row-reverse items-center gap-12 lg:gap-20">
        {/* Image */}
        <div className="w-full lg:w-1/2 flex justify-center">
          <AppImage
            src={image}
            alt="About Padelix Indonesia"
            width={600}
            height={450}
            className="rounded-brand w-full max-w-xl shadow-2xl"
          />
        </div>

        {/* Text */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6 text-center lg:text-left">
          <span className="subheading text-brand-green">{subheading}</span>
          <h2 className="h2 text-white">{heading}</h2>
          {description.map((paragraph, index) => (
            <p key={index} className="text-neutral-400 leading-relaxed text-lg">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
