export function getStrapiURL() {
  return process.env.NODE_ENV === "development"
    ? process.env.NEXT_PUBLIC_STRAPI_API_URL_LOCAL
    : process.env.NEXT_PUBLIC_STRAPI_API_URL_PUBLIC;
}
