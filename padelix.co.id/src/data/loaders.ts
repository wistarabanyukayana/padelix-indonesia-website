import qs from "qs";
import { getStrapiURL } from "@/utils/get-strapi-url";
import { fetchAPI } from "@/utils/fetch-api";

const BASE_URL = getStrapiURL();
const CONTENT_LIST_SIZE = 6;

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
        "sections.portofolio-section": {
          populate: {
            portofolios: {
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

export async function getContentCarousel(path: string) {
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

export async function getFeaturedContentCarousel(path: string) {
  const url = new URL(path, BASE_URL);

  url.search = qs.stringify({
    sort: ["createdAt:asc"],
    filters: { featured: { $eq: true } },
    populate: {
      image: {
        fields: ["url", "alternativeText"],
      },
    },
  });

  return fetchAPI(url.href, { method: "GET" });
}

export async function getContentList(
  path: string,
  featured?: boolean,
  query?: string,
  page?: string
) {
  const url = new URL(path, BASE_URL);

  url.search = qs.stringify({
    sort: ["createdAt:asc"],
    filters: {
      $or: [
        {
          name: {
            $containsi: query,
          },
        },
        {
          code: {
            $containsi: query,
          },
        },
        {
          description: {
            $containsi: query,
          },
        },
        {
          specification: {
            $containsi: query,
          },
        },
      ],
      ...(featured && { featured: { $eq: featured } }),
    },
    pagination: {
      pageSize: CONTENT_LIST_SIZE,
      page: parseInt(page || "1"),
    },
    populate: {
      image: {
        fields: ["url", "alternativeText"],
      },
    },
  });

  return fetchAPI(url.href, { method: "GET" });
}

const slugProductQuery = (slug: string) =>
  qs.stringify({
    filters: {
      slug: {
        $eq: slug,
      },
    },
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

export async function getSlugProduct(slug: string) {
  const path = `/api/products`;

  const pageDataURL = new URL(path, BASE_URL);

  pageDataURL.search = slugProductQuery(slug);

  return await fetchAPI(pageDataURL.href, {
    method: "GET",
  });
}
