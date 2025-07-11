import { StrapiImage } from "@/components/general/StrapiImage";
import { HeroSectionProps } from "@/types";
import { getBackgroundColor } from "@/utils/get-backgrounColor";
import ReactMarkdown from "react-markdown";

export function HeroSection({
  heading,
  content,
  image,
  backgroundColor,
}: Readonly<HeroSectionProps>) {
  return (
    <section
      className={`section ${getBackgroundColor(
        backgroundColor
      )} justify-center items-center`}
    >
      {/* Centered, rounded image "card" */}
      <div className="carrier items-center justify-center">
        <StrapiImage
          src={image.url}
          alt={image.alternativeText || "No alternative text provided"}
          width={1920}
          height={1080}
          className="w-full object-cover object-center rounded-[1.875rem] max-h-[43.75rem]"
          priority
        />
        {/* Centered text on top of the image */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10 text-slate-50 text-center">
          <h1 className="h1 max-w-[46.125rem]">{heading}</h1>
          <div className="max-w-[46.125rem]">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
      </div>
    </section>
  );
}
