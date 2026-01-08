import { getClientUrl } from "@/utils/get-client-url";
import { MetadataRoute } from "next";

const BASE_URL = getClientUrl();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
