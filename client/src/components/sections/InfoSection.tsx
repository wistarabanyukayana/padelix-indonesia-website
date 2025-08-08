import { StrapiImage } from "@/components/general/StrapiImage";
import ReactMarkdown from "react-markdown";

import { InfoSectionProps } from "@/types";
import { getBackgroundColor } from "@/utils/get-backgrounColor";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

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
      className={`section ${getBackgroundColor(backgroundColor)}`}
    >
      <div
        className={`wrapper items-center justify-center md:justify-between ${
          !reversed
            ? "flex-col-reverse sm:flex-col md:flex-row"
            : "flex-col-reverse md:flex-row-reverse"
        } gap-8 sm:gap-8 h-full sm:h-auto`}
      >
        <div className="relative w-full text-slate-50 flex flex-col items-start justify-center gap-2 sm:gap-6 sm:hidden">
          <div className="max-w-[32.813rem]">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                ul: (props) => <ul className="list-disc pl-6" {...props} />,
                ol: (props) => <ol className="list-decimal pl-6" {...props} />,
                li: (props) => <li className="mb-1" {...props} />,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
        <StrapiImage
          src={image.url}
          alt={image.alternativeText || "No alternative text provided"}
          width={1080}
          height={1080}
          className="w-full object-cover object-center rounded-[1.875rem] max-w-[32.625rem] md:max-w-[22.625rem] lg:max-w-[32.625rem] xl:max-w-[42.625rem]"
        />
        <div className="relative w-full text-slate-50 flex flex-col items-start justify-center gap-2 sm:gap-6">
          <h3 className="subheading">{subheading}</h3>
          <h2 className="h2">{heading}</h2>
          <div className="hidden sm:block max-w-[32.813rem]">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                ul: (props) => <ul className="list-disc pl-6" {...props} />,
                ol: (props) => <ol className="list-decimal pl-6" {...props} />,
                li: (props) => <li className="mb-1" {...props} />,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </section>
  );
}
