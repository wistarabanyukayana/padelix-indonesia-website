import { StrapiImage } from "@/components/StrapiImage";
import { HeroSectionProps } from "@/types";
import ReactMarkdown from "react-markdown";

export function HeroSection({
  heading,
  content,
  image,
}: Readonly<HeroSectionProps>) {
  return (
    <section className="section bg-white justify-center">
      {/* Centered, rounded image "card" */}
      <div className="relative w-full max-w-[1440px] overflow-hidden flex items-center justify-center">
        <StrapiImage
          src={image.url}
          alt={image.alternativeText || "No alternative text provided"}
          width={1331}
          height={700}
          className="w-full object-cover object-center rounded-[30px] max-h-[700px]"
        />
        {/* Centered text on top of the image */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10 text-white text-center">
          <h1 className="h1 max-w-[738px]">{heading}</h1>
          <div className="max-w-[738px]">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
      </div>
    </section>
  );
}
