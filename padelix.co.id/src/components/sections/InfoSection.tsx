import { StrapiImage } from "@/components/StrapiImage";
import ReactMarkdown from "react-markdown";

import { InfoSectionProps } from "@/types";

export function InfoSection({
  reversed,
  subheading,
  headline,
  content,
  image,
}: Readonly<InfoSectionProps>) {
  return (
    <section
      className={`section bg-black items-center justify-between ${
        !reversed ? "flex-row" : "flex-row-reverse"
      } gap`}
    >
      <StrapiImage
        src={image.url}
        alt={image.alternativeText || "No alternative text provided"}
        height={600}
        width={600}
        className="w-full object-cover object-center rounded-[30px] max-w-[682px]"
      />
      <div className="relative w-full h-full text-white flex flex-col items-start justify-center gap-6">
        <h3 className="subheading">{subheading}</h3>
        <h2 className="h2">{headline}</h2>
        <div className="max-w-[525px]">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </section>
  );
}
