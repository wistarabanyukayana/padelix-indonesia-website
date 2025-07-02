import qs from "qs";
import { getStrapiURL } from "@/utils/get-strapi-url";
import { fetchAPI } from "@/utils/fetch-api";

const homePageQuery = qs.stringify({
  populate: {
    sections: {
      on: {
        "sections.hero-section": {
          populate: {
            image: {
              fields: ["url", "alternativeText"],
            },
          },
        },
        "sections.info-section": {
          populate: {
            image: {
              fields: ["url", "alternativeText"],
            },
          },
        },
      },
    },
  },
});

export async function getHomePage() {
  const path = `/api/home-page`;
  const BASE_URL = getStrapiURL();

  const pageDataURL = new URL(path, BASE_URL);

  pageDataURL.search = homePageQuery;

  return await fetchAPI(pageDataURL.href, {
    method: "GET",
  });
}
