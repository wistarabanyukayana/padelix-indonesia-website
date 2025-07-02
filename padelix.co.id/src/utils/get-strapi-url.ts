export function getStrapiURL() {
  return process.env.NODE_ENV === "development"
    ? process.env.STRAPI_API_URL_LOCAL
    : process.env.STRAPI_API_URL_PUBLIC;
}
