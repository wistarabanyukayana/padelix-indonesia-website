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
      className="carrier items-start justify-around xl:h-[450px] w-full"
    >
      <StrapiImage
        src={image.url}
        alt={image.alternativeText || "No alternative text provided"}
        width={400}
        height={400}
        className=" object-cover object-center rounded-[30px] xl:w-[470px]"
      />
      <div className="relative flex flex-col items-start justify-center gap-4">
        <div className="relative flex flex-col items-start justify-start gap-2">
          <h2 className="h2">{name}</h2>
          <span className="text-neutral-500">{code}</span>
        </div>
        {price && (
          <p>
            <span>Price: </span>
            {price}
          </p>
        )}
        <div className="max-w-[550px]">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              ul: ({ node, ...props }) => (
                <ul className="list-disc pl-6" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="list-decimal pl-6" {...props} />
              ),
              li: ({ node, ...props }) => <li className="mb-1" {...props} />,
            }}
          >
            {description.replace(/\n\n/g, "\n<br><br>\n")}
          </ReactMarkdown>
        </div>
      </div>
    </Link>
  );
}
