import qs from "qs";
import { getStrapiURL } from "@/utils/get-strapi-url";
import { fetchAPI } from "@/utils/fetch-api";

const BASE_URL = getStrapiURL();

const globalSettingQuery = qs.stringify({
  populate: {
    header: {
      populate: {
        logo: {
          populate: {
            image: {
              fields: ["url", "alternativeText"],
            },
          },
        },
        navigation: true,
        moreOptionIcon: {
          populate: {
            image: {
              fields: ["url", "alternativeText"],
            },
          },
        },
      },
    },
    footer: true,
  },
});

export async function getGlobalSettings() {
  const path = "/api/global";
  const url = new URL(path, BASE_URL);
  url.search = globalSettingQuery;
  return fetchAPI(url.href, { method: "GET" });
}

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
        "sections.product-section": true,
        "sections.certificate-section": {
          populate: {
            certificates: {
              populate: {
                image: {
                  fields: ["url", "alternativeText"],
                },
              },
            },
          },
        },
        "sections.contact-section": {
          populate: {
            contactForm: true,
            contactInfo: {
              populate: {
                logoLink: {
                  populate: {
                    logo: {
                      populate: {
                        image: {
                          fields: ["url", "alternativeText"],
                        },
                      },
                    },
                    link: true,
                  },
                },
              },
            },
          },
        },
      },
    },
  },
});

export async function getHomePage() {
  const path = `/api/home-page`;

  const pageDataURL = new URL(path, BASE_URL);

  pageDataURL.search = homePageQuery;

  return await fetchAPI(pageDataURL.href, {
    method: "GET",
  });
}

export async function getContent(path: string) {
  const url = new URL(path, BASE_URL);

  url.search = qs.stringify({
    sort: ["createdAt:asc"],
    populate: {
      image: {
        fields: ["url", "alternativeText"],
      },
    },
  });

  return fetchAPI(url.href, { method: "GET" });
}
