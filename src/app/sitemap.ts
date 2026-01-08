import { getProductList } from "@/data/loaders";
import { ProductProps } from "@/types";
import { getClientUrl } from "@/utils/get-client-url";
import type { MetadataRoute } from "next";

const BASE_URL = getClientUrl();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data } = await getProductList("/api/products");

  const products: ProductProps[] = await data;

  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${BASE_URL}/products/${product.slug}`,
    lastModified: new Date(product.updatedAt),
    priority: 0.5,
  }));

  return [
    {
      url: "https://padelix.co.id",
      lastModified: new Date(),
      priority: 1,
    },
    {
      url: "https://padelix.co.id/product",
      lastModified: new Date(),
      priority: 0.8,
    },
    ...productEntries,
  ];
}
