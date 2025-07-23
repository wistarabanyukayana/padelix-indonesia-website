import { getStrapiURL } from "@/utils/get-strapi-url";
import { MetadataRoute } from "next";

const BASE_URL = getStrapiURL();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/cms.padelix.co.id", "privacy"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
