import { SectionRenderer } from "@/components/general/SectionRenderer";
import { getSlugProduct } from "@/data/loaders";
import { ProductProps } from "@/types";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getData(slug: string) {
  const { data } = await getSlugProduct(slug);

  const product = data[0];

  if (!product) notFound();

  return { product: product as ProductProps, sections: product?.sections };
}

export default async function SingleProductRoute({ params }: PageProps) {
  const slug = (await params).slug;

  const { product, sections } = await getData(slug);

  console.log(product, sections);

  return <SectionRenderer sections={sections} />;
}
