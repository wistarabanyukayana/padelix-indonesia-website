import { StrapiImage } from "@/components/general/StrapiImage";
import ReactMarkdown from "react-markdown";

import { InfoSectionProps } from "@/types";
import { getBackgroundColor } from "@/utils/get-backgrounColor";

export function InfoSection({
  reversed,
  subheading,
  heading,
  content,
  image,
  backgroundColor,
}: Readonly<InfoSectionProps>) {
  const id = subheading?.toLocaleLowerCase().replace(" ", "-");

  return (
    <section
      id={id}
      className={`section ${getBackgroundColor(
        backgroundColor
      )} justify-center items-center scroll-mt-[4.75rem] sm:scroll-mt-[6.25rem] h-[calc(100svh-4.75rem)] sm:h-auto`}
    >
      <div
        className={`carrier items-center justify-center md:justify-between ${
          !reversed
            ? "flex-col md:flex-row"
            : "flex-col-reverse md:flex-row-reverse"
        } gap-8 sm:gap-8 h-full sm:h-auto`}
      >
        <div className="relative w-full text-slate-50 flex flex-col items-start justify-center gap-2 sm:gap-6 sm:hidden">
          <div className="max-w-[32.813rem]">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
        <StrapiImage
          src={image.url}
          alt={image.alternativeText || "No alternative text provided"}
          width={600}
          height={600}
          className="w-full object-cover object-center rounded-[1.875rem] max-w-[32.625rem] md:max-w-[22.625rem] lg:max-w-[32.625rem] xl:max-w-[42.625rem]"
        />
        <div className="relative w-full text-slate-50 flex flex-col items-start justify-center gap-2 sm:gap-6">
          <h3 className="subheading">{subheading}</h3>
          <h2 className="h2">{heading}</h2>
          <div className="hidden sm:block max-w-[32.813rem]">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
      </div>
    </section>
  );
}
