import { SectionRenderer } from "@/components/general/SectionRenderer";
import { getSlugProduct } from "@/data/loaders";
import { ProductProps } from "@/types";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function loadData(slug: string) {
  const {data} = await getSlugProduct(slug);

  console.log("This is the data", data);

  return data;
}

export default async function SingleProductRoute({ params }: PageProps) {
  const slug = (await params).slug;

  const data = await loadData(slug);

  const product : ProductProps = data[0];

  if (!product) notFound();

  

  return <SectionRenderer sections={product?.sections} />;
}
