import { getStrapiURL } from "@/utils/get-strapi-url";

const BASE_URL = getStrapiURL();

export interface ContactSignupProps {
  name: string;
  contact: string;
  message: string;
}

export async function contactSignupService(data: ContactSignupProps) {
  const url = new URL("/api/contact-signups", BASE_URL);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: { ...data } }),
    });

    return await response.json();
  } catch (error) {
    console.error("Error Layanan Mengirim Kontak:", error);
  }
}
