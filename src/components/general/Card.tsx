import { ImageProps } from "@/types";

import Link from "next/link";
import { AppImage } from "./AppImage";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { cn } from "@/lib/utils";

export interface CardProps {
  documentId: string;
  className?: string;
  name: string;
  code: string;
  description: string;
  specification: string;
  slug: string;
  image: ImageProps;
  price?: number;
  startDate?: string;
  createdAt: string;
  basePath: string;
  showSpecification?: boolean;
  itemImageClassName?: string;
}

export function Card({
  className,
  name,
  code,
  description,
  specification,
  slug,
  image,
  price,
  basePath,
  showSpecification,
  itemImageClassName,
}: Readonly<CardProps>) {
  return (
    <Link
      href={`/${basePath}/${slug}`}
      className={cn(
        "wrapper items-center justify-start sm:justify-around xl:h-[28.125rem] w-full gap-4 sm:gap-8 pb-0",
        className
      )}
    >
      <div className="sm:hidden relative flex flex-col items-start md:items-start justify-center gap-2 sm:gap-4 max-w-[17.375rem] sm:max-w-[30rem] md:max-w-[34.375rem]">
        <div className="relative flex flex-col items-center justify-center sm:gap-2">
          <h2 className="h2 text-center sm:text-left">{name}</h2>
          <span className="text-muted-foreground">{code}</span>
        </div>
      </div>
      <AppImage
        src={image.url}
        alt={image.alternativeText || "No alternative text provided"}
        width={1080}
        height={1080}
        className={cn(
          "image-responsive rounded-brand max-w-[17.375rem] lg:max-w-[25.375rem] xl:max-w-[29.375rem]",
          itemImageClassName
        )}
      />
      <div className="relative flex flex-col items-start md:items-start justify-center gap-2 sm:gap-4 max-w-[17.375rem] sm:max-w-[30rem] md:max-w-[34.375rem]">
        <div className="relative hidden sm:flex flex-col items-start justify-start sm:gap-2">
          <h2 className="h2">{name}</h2>
          <span className="text-neutral-500">{code}</span>
        </div>

        <div className="w-full text-center sm:text-justify">
          <p>{description}</p>
          <br />
          {price && (
            <p>
              <span>Harga: </span>
              {price}
            </p>
          )}
          <br />
          <div className="w-full hidden sm:block ">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeSanitize]}
              components={{
                ul: (props) => <ul className="list-disc pl-6" {...props} />,
                ol: (props) => <ol className="list-decimal pl-6" {...props} />,
                li: (props) => <li className="mb-1" {...props} />,
              }}
            >
              {showSpecification
                ? specification.replace(/\n\n/g, "\n<br><br>\n")
                : ""}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </Link>
  );
}
