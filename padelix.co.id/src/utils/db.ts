export const API_URL =
  process.env.NODE_ENV === "development"
    ? process.env.API_URL_LOCAL
    : process.env.API_URL_PUBLIC;
