export function getClientUrl() {
  return process.env.NODE_ENV === "development"
    ? process.env.NEXT_PUBLIC_URL_LOCAL
    : process.env.NEXT_PUBLIC_URL_PUBLIC;
}
