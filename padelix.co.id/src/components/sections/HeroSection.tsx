import { StrapiImage } from "@/components/StrapiImage";
import { HeroSectionProps } from "@/types";

export function HeroSection({
  heading,
  content,
  image,
}: Readonly<HeroSectionProps>) {
  return (
    <section className="relative w-full px-13 py-7 bg-white flex justify-center">
      {/* Centered, rounded image "card" */}
      <div className="relative w-full max-w-[1440px] overflow-hidden flex items-center justify-center">
        <StrapiImage
          src={image.url}
          alt={image.alternativeText || "No alternative text provided"}
          width={1331}
          height={700}
          className="w-full object-cover object-center rounded-[30px]"
        />
        {/* Centered text on top of the image */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-white text-center drop-shadow-lg">
          <h1 className="text-[64px] leading-[70px] max-w-[738px]">
            {heading}
          </h1>
          <p className="font-light text-[18px] leading-none text-center max-w-[768px]">
            {content}
          </p>
        </div>
      </div>
    </section>
  );
}
