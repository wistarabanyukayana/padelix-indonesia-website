import { StrapiImage } from "@/components/StrapiImage";
import ReactMarkdown from "react-markdown";

import { InfoSectionProps } from "@/types";

export function InfoSection({
  reversed,
  title,
  headline,
  content,
  image,
}: Readonly<InfoSectionProps>) {
  return (
    <section className={`${reversed}`}>
      <StrapiImage
        src={image.url}
        alt={image.alternativeText || "No alternative text provided"}
        height={100}
        width={100}
      />
      <div>
        <h2>{title}</h2>
        <h3>{headline}</h3>
        <div>
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </section>
  );
}
