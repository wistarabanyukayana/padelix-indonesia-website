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
  return (
    <section
      className={`section ${getBackgroundColor(
        backgroundColor
      )} justify-center items-center`}
    >
      <div
        className={`carrier items-center justify-between ${
          !reversed ? "flex-row" : "flex-row-reverse"
        }`}
      >
        <StrapiImage
          src={image.url}
          alt={image.alternativeText || "No alternative text provided"}
          height={600}
          width={600}
          className="w-full object-cover object-center rounded-[1.875rem] max-w-[42.625rem]"
        />
        <div className="relative w-full h-full text-slate-50 flex flex-col items-start justify-center gap-6">
          <h3 className="subheading">{subheading}</h3>
          <h2 className="h2">{heading}</h2>
          <div className="max-w-[32.813rem]">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
      </div>
    </section>
  );
}
