import { ImageProps } from "@/types";

import Link from "next/link";
import { StrapiImage } from "./StrapiImage";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

export interface CardProps {
  documentId: string;
  name: string;
  code: string;
  description: string;
  slug: string;
  image: ImageProps;
  price?: number;
  startDate?: string;
  createdAt: string;
  basePath: string;
}

export function Card({
  name,
  code,
  description,
  slug,
  image,
  price,
  basePath,
}: Readonly<CardProps>) {
  return (
    <Link
      href={`/${basePath}/${slug}`}
      className="carrier items-center justify-start sm:justify-around xl:h-[28.125rem] w-full sm:gap-8"
    >
      <StrapiImage
        src={image.url}
        alt={image.alternativeText || "No alternative text provided"}
        width={400}
        height={400}
        className="w-full object-cover object-center rounded-[1.875rem] max-w-[17.375rem]  lg:max-w-[25.375rem] xl:max-w-[29.375rem]"
      />
      <div className="relative flex flex-col items-start md:items-start justify-center gap-2 sm:gap-4 max-w-[17.375rem] sm:max-w-[30rem] md:max-w-[34.375rem]">
        <div className="relative flex flex-col items-start justify-start sm:gap-2  ">
          <h2 className="h2">{name}</h2>
          <span className="text-neutral-500">{code}</span>
        </div>
        {price && (
          <p>
            <span>Price: </span>
            {price}
          </p>
        )}
        <div className="w-full">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              ul: (props) => <ul className="list-disc pl-6" {...props} />,
              ol: (props) => <ol className="list-decimal pl-6" {...props} />,
              li: (props) => <li className="mb-1" {...props} />,
            }}
          >
            {description.replace(/\n\n/g, "\n<br><br>\n")}
          </ReactMarkdown>
        </div>
      </div>
    </Link>
  );
}
