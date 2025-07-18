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
      className={`section p-0 sm:px-13 sm:py-7 ${getBackgroundColor(
        backgroundColor
      )}`}
    >
      <div className="wrapper items-center justify-center h-auto">
        <div className="relative w-full">
          <StrapiImage
            src={image.url}
            alt={image.alternativeText || "No alternative text provided"}
            width={1280}
            height={720}
            className="image-responsive sm:rounded-[1.875rem] h-[calc(100svh-4.75rem)] sm:max-h-[43.75rem]"
            priority={true}
            loading="eager"
          />

          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10 text-slate-50 text-center">
            <h1 className="h1 max-w-[22.125rem] sm:max-w-[46.125rem]">
              {heading}
            </h1>
            <div className="max-w-[22.125rem] sm:max-w-[46.125rem]">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
